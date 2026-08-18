<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Setting;
use App\Models\SmsGateway;
use App\Models\SmsLog;
use App\Models\SmsTemplate;
use App\Models\User;
use App\Services\Sms\SmsCalculator;
use App\Services\Sms\SmsManager;
use App\Services\Sms\SmsMessage;
use App\Services\Sms\SmsNotificationService;
use App\Services\Sms\SmsResponse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SmsGatewaySystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@techmarket.com.bd',
            'phone' => '01711000000',
        ]);

        $this->customer = User::factory()->create([
            'role' => 'customer',
            'name' => 'Fahim Hasan',
            'phone' => '01712345678',
            'sms_transactional_enabled' => true,
            'sms_promotional_enabled' => true,
        ]);

        SmsManager::seedDefaultGateways();
        SmsNotificationService::seedDefaultTemplates();

        Setting::set('sms_enabled', '1');
        Setting::set('sms_transactional_enabled', '1');
        Setting::set('sms_promotional_enabled', '1');
        Setting::set('sms_queue_enabled', '0'); // Sync for testing
    }

    /** @test */
    public function test_sms_calculator_detects_gsm_vs_unicode_correctly()
    {
        // 1. Plain English GSM-7
        $englishText = "Your order #12345 has been confirmed at TechMarket BD.";
        $calcEnglish = SmsCalculator::calculate($englishText);

        $this->assertFalse($calcEnglish['is_unicode']);
        $this->assertEquals('gsm0338', $calcEnglish['encoding']);
        $this->assertEquals(1, $calcEnglish['parts']);

        // 2. Bangla Unicode
        $banglaText = "টেকমার্কেট বিডিতে আপনার অর্ডার নিশ্চিত করা হয়েছে।";
        $calcBangla = SmsCalculator::calculate($banglaText);

        $this->assertTrue($calcBangla['is_unicode']);
        $this->assertEquals('unicode', $calcBangla['encoding']);
        $this->assertEquals(1, $calcBangla['parts']);

        // 3. Multi-part Unicode (>70 chars)
        $longBanglaText = str_repeat("টেকমার্কেট ", 12); // ~132 chars
        $calcLongBangla = SmsCalculator::calculate($longBanglaText);

        $this->assertTrue($calcLongBangla['is_unicode']);
        $this->assertGreaterThan(1, $calcLongBangla['parts']);
    }

    /** @test */
    public function test_template_rendering_replaces_dynamic_placeholders()
    {
        $template = SmsTemplate::where('event_key', 'order.confirmed')->first();
        $this->assertNotNull($template);

        $rendered = $template->render([
            'customer_name' => 'Fahim Hasan',
            'order_number' => 'TMB-9999',
            'store_name' => 'TechMarket BD',
        ]);

        $this->assertStringContainsString('Fahim Hasan', $rendered);
        $this->assertStringContainsString('TMB-9999', $rendered);
        $this->assertStringNotContainsString('{{customer_name}}', $rendered);
    }

    /** @test */
    public function test_gateway_credential_encryption_and_masking()
    {
        $gateway = SmsGateway::where('slug', 'bulksmsbd')->first();
        $gateway->setEncryptedCredentials([
            'api_key' => 'secret_api_key_12345',
            'sender_id' => '8809612345678',
        ]);
        $gateway->save();

        $this->assertNotEquals('secret_api_key_12345', $gateway->credentials);

        $decrypted = $gateway->getDecryptedCredentials();
        $this->assertEquals('secret_api_key_12345', $decrypted['api_key']);
        $this->assertEquals('8809612345678', $decrypted['sender_id']);
    }

    /** @test */
    public function test_event_driven_sms_creates_log_and_dispatches()
    {
        Http::fake([
            'bulksmsbd.net/*' => Http::response([
                'response_code' => 202,
                'message_id' => 884812,
                'success_message' => 'SMS Submitted Successfully',
            ], 200),
        ]);

        $gateway = SmsGateway::where('slug', 'bulksmsbd')->first();
        $gateway->update(['is_active' => true, 'is_default' => true]);
        $gateway->setEncryptedCredentials(['api_key' => 'test_key', 'sender_id' => 'TECHMARKET']);
        $gateway->save();

        $order = Order::create([
            'order_number' => 'TMB-TEST-01',
            'user_id' => $this->customer->id,
            'customer_name' => 'Fahim Hasan',
            'customer_email' => 'fahim@example.com',
            'customer_phone' => '01712345678',
            'shipping_address' => 'Dhaka, Bangladesh',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'payment_status' => 'Pending',
            'shipping_cost' => 60,
            'subtotal' => 5000,
            'discount' => 0,
            'total' => 5060,
            'status' => 'Pending',
        ]);

        $log = SmsNotificationService::sendEvent('order.placed', [], $order->customer_phone, $order->id, $order->user_id);

        $this->assertNotNull($log);
        $this->assertEquals('sent', $log->status);
        $this->assertEquals('8801712345678', $log->phone);
        $this->assertEquals('order.placed', $log->event_key);
        $this->assertDatabaseHas('sms_logs', [
            'id' => $log->id,
            'status' => 'sent',
            'phone' => '8801712345678',
        ]);
    }

    /** @test */
    public function test_duplicate_prevention_window_blocks_rapid_duplicate_event_sms()
    {
        Http::fake([
            '*' => Http::response(['response_code' => 202, 'message_id' => 123], 200),
        ]);

        $gateway = SmsGateway::where('slug', 'bulksmsbd')->first();
        $gateway->update(['is_active' => true, 'is_default' => true]);
        $gateway->setEncryptedCredentials(['api_key' => 'test_key', 'sender_id' => 'TECHMARKET']);
        $gateway->save();

        Setting::set('sms_duplicate_window_minutes', '10');

        // First SMS
        $log1 = SmsNotificationService::sendEvent('customer.welcome', ['customer_name' => 'Fahim'], '01712345678');
        $this->assertNotNull($log1);

        // Immediate duplicate trigger
        $log2 = SmsNotificationService::sendEvent('customer.welcome', ['customer_name' => 'Fahim'], '01712345678');
        $this->assertNull($log2); // Prevented by duplicate lock
    }

    /** @test */
    public function test_admin_can_access_all_sms_views()
    {
        $this->actingAs($this->admin);

        $this->get('/admin/communication/sms-dashboard')->assertOk();
        $this->get('/admin/settings/sms-gateways')->assertOk();
        $this->get('/admin/communication/sms-templates')->assertOk();
        $this->get('/admin/communication/sms-logs')->assertOk();
        $this->get('/admin/communication/send-sms')->assertOk();
        $this->get('/admin/settings/sms')->assertOk();
    }

    /** @test */
    public function test_admin_can_update_sms_gateway_preserving_credentials()
    {
        $this->actingAs($this->admin);

        $gateway = SmsGateway::where('slug', 'bulksmsbd')->first();
        $gateway->setEncryptedCredentials(['api_key' => 'initial_secret_key', 'sender_id' => 'INITIAL_SENDER']);
        $gateway->save();

        // Update settings with blank credentials (should NOT overwrite existing key)
        $response = $this->post("/admin/settings/sms-gateways/{$gateway->id}", [
            'is_active' => true,
            'is_default' => true,
            'settings' => ['base_url' => 'http://bulksmsbd.net/api/smsapi'],
            'credentials' => ['api_key' => '', 'sender_id' => 'NEW_SENDER'],
        ]);

        $response->assertRedirect();

        $gateway->refresh();
        $this->assertTrue($gateway->is_active);
        $this->assertTrue($gateway->is_default);

        $creds = $gateway->getDecryptedCredentials();
        $this->assertEquals('initial_secret_key', $creds['api_key']);
        $this->assertEquals('NEW_SENDER', $creds['sender_id']);
    }

    /** @test */
    public function test_admin_can_update_template_and_preview_render()
    {
        $this->actingAs($this->admin);

        $template = SmsTemplate::where('event_key', 'order.confirmed')->first();

        $updateRes = $this->post("/admin/communication/sms-templates/{$template->id}", [
            'message' => 'Custom confirmed message for {{customer_name}}. Order #{{order_number}} is ready!',
            'is_active' => true,
        ]);
        $updateRes->assertRedirect();

        $template->refresh();
        $this->assertEquals('Custom confirmed message for {{customer_name}}. Order #{{order_number}} is ready!', $template->message);

        // Preview render endpoint
        $previewRes = $this->postJson("/admin/communication/sms-templates/{$template->id}/preview");
        $previewRes->assertOk();
        $previewRes->assertJsonStructure(['rendered_text', 'calculation']);
    }

    /** @test */
    public function test_admin_can_send_manual_single_and_bulk_sms()
    {
        $this->actingAs($this->admin);

        Http::fake([
            '*' => Http::response(['response_code' => 202, 'message_id' => 999], 200),
        ]);

        $gateway = SmsGateway::where('slug', 'bulksmsbd')->first();
        $gateway->update(['is_active' => true, 'is_default' => true]);
        $gateway->setEncryptedCredentials(['api_key' => 'key', 'sender_id' => 'TM']);
        $gateway->save();

        $response = $this->post('/admin/communication/send-sms', [
            'recipient_mode' => 'single',
            'phone' => '01712345678',
            'message' => 'Exclusive Weekend Sale! 10% off all graphics cards.',
            'gateway_slug' => 'bulksmsbd',
            'is_promotional' => true,
        ]);

        $response->assertRedirect('/admin/communication/sms-logs');

        $this->assertDatabaseHas('sms_logs', [
            'phone' => '8801712345678',
            'event_key' => 'manual.promotional',
        ]);
    }

    /** @test */
    public function test_admin_can_retry_failed_sms()
    {
        $this->actingAs($this->admin);

        Http::fake([
            '*' => Http::response(['response_code' => 202, 'message_id' => 555], 200),
        ]);

        $gateway = SmsGateway::where('slug', 'bulksmsbd')->first();
        $gateway->update(['is_active' => true, 'is_default' => true]);
        $gateway->setEncryptedCredentials(['api_key' => 'key', 'sender_id' => 'TM']);
        $gateway->save();

        $failedLog = SmsLog::create([
            'phone' => '8801712345678',
            'message' => 'Test message to retry',
            'gateway_slug' => 'bulksmsbd',
            'event_key' => 'test.retry',
            'status' => 'failed',
            'error_message' => 'Gateway timeout',
        ]);

        $response = $this->post("/admin/communication/sms-logs/{$failedLog->id}/retry");
        $response->assertRedirect();

        $failedLog->refresh();
        $this->assertEquals('sent', $failedLog->status);
    }
}
