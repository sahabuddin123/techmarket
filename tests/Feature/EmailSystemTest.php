<?php

namespace Tests\Feature;

use App\Jobs\ProcessEmailCampaignJob;
use App\Jobs\SendEmailJob;
use App\Models\EmailCampaign;
use App\Models\EmailGateway;
use App\Models\EmailLog;
use App\Models\EmailPreference;
use App\Models\EmailTemplate;
use App\Models\EmailUnsubscribe;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Email\EmailCampaignService;
use App\Services\Email\EmailManager;
use App\Services\Email\EmailNotificationService;
use App\Services\Email\EmailPreferenceService;
use App\Services\Email\EmailTemplateService;
use App\Services\Notification\NotificationManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class EmailSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected EmailGateway $primaryGateway;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@techmarketbd.com',
        ]);

        $this->customer = User::factory()->create([
            'role' => 'customer',
            'email' => 'customer@example.com',
            'name' => 'Fahim Hasan',
        ]);

        $this->primaryGateway = EmailGateway::create([
            'name' => 'Primary Test SMTP',
            'driver' => 'smtp',
            'is_active' => true,
            'is_default' => true,
            'is_fallback' => false,
            'from_name' => 'TechMarket BD',
            'from_email' => 'noreply@techmarketbd.com',
            'config' => [
                'host' => '127.0.0.1',
                'port' => 2525,
                'username' => 'test_user',
                'password' => 'super_secret_smtp_pass',
                'encryption' => 'tls',
            ],
        ]);

        // Seed default templates
        $this->seed(\Database\Seeders\EmailTemplateSeeder::class);
    }

    public function test_email_gateway_creation_and_credential_encryption()
    {
        $gw = EmailGateway::find($this->primaryGateway->id);

        $this->assertNotNull($gw);
        $this->assertEquals('smtp', $gw->driver);
        $this->assertEquals('super_secret_smtp_pass', $gw->config['password']);

        // Check raw DB column is encrypted and not plain text
        $rawConfig = \DB::table('email_gateways')->where('id', $gw->id)->value('config');
        $this->assertStringNotContainsString('super_secret_smtp_pass', $rawConfig);

        // Check masked credentials for UI
        $masked = $gw->masked_config;
        $this->assertEquals('••••••••', $masked['password']);
    }

    public function test_gateway_credential_preservation_on_update()
    {
        $this->actingAs($this->admin);

        // Submit update with masked password
        $response = $this->post(route('admin.email.gateways.update', $this->primaryGateway->id), [
            'name' => 'Updated SMTP Name',
            'driver' => 'smtp',
            'is_active' => true,
            'is_default' => true,
            'is_fallback' => false,
            'from_name' => 'TechMarket BD New',
            'from_email' => 'noreply@techmarketbd.com',
            'config' => [
                'host' => 'smtp.newhost.com',
                'port' => 587,
                'username' => 'new_user',
                'password' => '••••••••', // Masked, must preserve existing password
            ],
        ]);

        $response->assertRedirect();
        $this->primaryGateway->refresh();

        $this->assertEquals('Updated SMTP Name', $this->primaryGateway->name);
        $this->assertEquals('smtp.newhost.com', $this->primaryGateway->config['host']);
        $this->assertEquals('super_secret_smtp_pass', $this->primaryGateway->config['password']);
    }

    public function test_template_variable_interpolation_and_missing_tags()
    {
        $templateService = new EmailTemplateService();

        $text = 'Hello {{customer_name}}, your order #{{order_number}} is {{order_status}}. Unknown: {{non_existent_tag}}';
        $rendered = $templateService->render($text, [
            'customer_name' => 'Tanvir Ahmed',
            'order_number' => 'TMB-2026-991',
            'order_status' => 'Confirmed',
        ]);

        $this->assertEquals('Hello Tanvir Ahmed, your order #TMB-2026-991 is Confirmed. Unknown: ', $rendered);
    }

    public function test_visual_email_builder_schema_compilation()
    {
        $templateService = new EmailTemplateService();

        $schema = [
            'blocks' => [
                ['type' => 'heading', 'props' => ['content' => 'Order Received', 'level' => 'h1', 'color' => '#ffffff']],
                ['type' => 'text', 'props' => ['content' => 'Thank you for shopping.']],
                ['type' => 'button', 'props' => ['label' => 'View Invoice', 'url' => 'http://localhost/invoice/123']],
                ['type' => 'coupon', 'props' => ['code' => 'TECHSALE20', 'discount' => '20% OFF']],
                ['type' => 'order_summary', 'props' => []],
                ['type' => 'footer', 'props' => ['text' => 'TechMarket BD Team', 'include_unsubscribe' => true]],
            ],
        ];

        $html = $templateService->compileEditorSchema($schema);

        $this->assertStringContainsString('Order Received', $html);
        $this->assertStringContainsString('View Invoice', $html);
        $this->assertStringContainsString('TECHSALE20', $html);
        $this->assertStringContainsString('{{order_number}}', $html);
        $this->assertStringContainsString('{{unsubscribe_url}}', $html);
    }

    public function test_transactional_order_created_email_dispatch()
    {
        $order = Order::create([
            'order_number' => 'TMB-TEST-5501',
            'customer_name' => 'Rahim Chowdhury',
            'customer_email' => 'rahim@example.com',
            'customer_phone' => '01712345678',
            'shipping_address' => 'Mirpur 10',
            'district' => 'Dhaka',
            'subtotal' => 25000,
            'total' => 25000,
            'status' => 'Pending',
            'payment_method' => 'Cash on Delivery',
        ]);

        $emailNotifService = app(EmailNotificationService::class);
        $log = $emailNotifService->sendOrderCreated($order, forceSync: true);

        $this->assertNotNull($log);
        $this->assertEquals('rahim@example.com', $log->recipient_email);
        $this->assertEquals('order.created', $log->event_key);
        $this->assertDatabaseHas('email_logs', [
            'id' => $log->id,
            'recipient_email' => 'rahim@example.com',
            'event_key' => 'order.created',
        ]);
    }

    public function test_courier_dispatched_and_tracking_email()
    {
        $order = Order::create([
            'order_number' => 'TMB-COURIER-99',
            'customer_name' => 'Anisur Rahman',
            'customer_email' => 'anisur@example.com',
            'customer_phone' => '01812345678',
            'shipping_address' => 'Agrabad, Chattogram',
            'district' => 'Chattogram',
            'subtotal' => 15000,
            'total' => 15000,
            'status' => 'Shipped',
            'payment_method' => 'bKash',
        ]);

        $emailNotifService = app(EmailNotificationService::class);
        $log = $emailNotifService->sendCourierDispatched($order, 'Steadfast Courier', 'ST-99881122', forceSync: true);

        $this->assertNotNull($log);
        $this->assertEquals('anisur@example.com', $log->recipient_email);
        $this->assertEquals('courier.booked', $log->event_key);
    }

    public function test_admin_fraud_critical_alert_email()
    {
        $order = Order::create([
            'order_number' => 'TMB-FRAUD-007',
            'customer_name' => 'Suspicious Buyer',
            'customer_email' => 'suspect@example.com',
            'customer_phone' => '01912345678',
            'shipping_address' => 'Unknown address',
            'district' => 'Dhaka',
            'subtotal' => 120000,
            'total' => 120000,
            'status' => 'Pending',
            'payment_method' => 'Credit Card',
        ]);

        $emailNotifService = app(EmailNotificationService::class);
        $log = $emailNotifService->sendFraudAlert(
            $this->admin,
            $order,
            riskScore: 92,
            signals: ['Multiple cards failed', 'IP geolocation proxy mismatch'],
            forceSync: true
        );

        $this->assertNotNull($log);
        $this->assertEquals($this->admin->email, $log->recipient_email);
        $this->assertEquals('fraud.critical_risk', $log->event_key);
    }

    public function test_queue_dispatch_and_idempotency_duplicate_prevention()
    {
        $manager = app(EmailManager::class);

        // Send first email
        $log1 = $manager->send(
            toEmail: 'duplicate.test@example.com',
            subject: 'Order Update',
            htmlBody: '<p>Test</p>',
            eventKey: 'order.created',
            relatedType: 'Order',
            relatedId: 999,
            forceSync: true
        );

        $this->assertNotNull($log1);

        // Attempt second identical send within 60s window
        $log2 = $manager->send(
            toEmail: 'duplicate.test@example.com',
            subject: 'Order Update',
            htmlBody: '<p>Test</p>',
            eventKey: 'order.created',
            relatedType: 'Order',
            relatedId: 999,
            forceSync: true
        );

        // Must be suppressed by deduplication cache
        $this->assertNull($log2);
    }

    public function test_campaign_audience_resolution_and_unsubscribe_filtering()
    {
        $unsubscribedUser = User::factory()->create([
            'role' => 'customer',
            'email' => 'unsubscribed@example.com',
        ]);

        EmailPreference::create([
            'email' => 'unsubscribed@example.com',
            'user_id' => $unsubscribedUser->id,
            'marketing_enabled' => false,
            'promotional_enabled' => false,
            'unsubscribed_at' => now(),
        ]);

        $campaignService = app(EmailCampaignService::class);
        $audience = $campaignService->resolveAudience('all_customers');

        $emails = $audience->pluck('email')->toArray();
        $this->assertContains('customer@example.com', $emails);
        $this->assertNotContains('unsubscribed@example.com', $emails);
    }

    public function test_public_unsubscribe_flow_and_preference_management()
    {
        $prefService = app(EmailPreferenceService::class);
        $unsubUrl = $prefService->getUnsubscribeUrl('customer@example.com', 'marketing');

        $token = basename($unsubUrl);
        $this->assertNotEmpty($token);

        // Visit public unsubscribe page
        $response = $this->get(route('email.unsubscribe.show', $token));
        $response->assertOk();

        // Submit unsubscribe
        $postResponse = $this->post(route('email.unsubscribe.process', $token), [
            'category' => 'all',
            'reason' => 'Too many emails',
            'preferences' => [
                'marketing' => false,
                'promotional' => false,
                'product_updates' => true,
                'order_updates' => true,
            ],
        ]);

        $postResponse->assertRedirect();

        // Verify customer cannot receive marketing email now, but can receive transactional
        $this->assertFalse($prefService->canReceiveEmail('customer@example.com', 'marketing'));
        $this->assertTrue($prefService->canReceiveEmail('customer@example.com', 'transactional'));
    }

    public function test_central_notification_system_email_channel_integration()
    {
        $notifManager = app(NotificationManager::class);

        $result = $notifManager->dispatch(
            eventKey: 'fraud.critical_risk',
            context: [
                'order' => (object) [
                    'id' => 101,
                    'order_number' => 'TMB-RISK-101',
                    'customer_name' => 'Bad Actor',
                    'customer_phone' => '01700000000',
                    'total' => 95000,
                ],
                'fraud_check' => (object) [
                    'risk_score' => 95,
                ],
            ],
            overrides: [
                'recipients' => [$this->admin],
                'channels' => ['in_app', 'email'],
            ]
        );

        $this->assertEquals('dispatched', $result['status']);
        $this->assertDatabaseHas('notification_logs', [
            'event_key' => 'fraud.critical_risk',
            'channel' => 'email',
        ]);
    }

    public function test_admin_routes_authorization_protection()
    {
        // 1. Unauthenticated / Customer is forbidden
        $this->actingAs($this->customer);
        $response = $this->get(route('admin.email.dashboard'));
        $response->assertStatus(403);

        $response = $this->get(route('admin.email.templates'));
        $response->assertStatus(403);

        $response = $this->get(route('admin.email.settings'));
        $response->assertStatus(403);

        // 2. Admin can access all workspaces
        $this->actingAs($this->admin);

        $this->get(route('admin.email.dashboard'))->assertOk();
        $this->get(route('admin.email.campaigns'))->assertOk();
        $this->get(route('admin.email.templates'))->assertOk();
        $this->get(route('admin.email.logs'))->assertOk();
        $this->get(route('admin.email.settings'))->assertOk();
    }
}
