<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Order;
use App\Models\Product;
use App\Models\Notification;
use App\Models\NotificationRule;
use App\Models\NotificationPreference;
use App\Models\NotificationLog;
use App\Services\Notification\NotificationManager;
use App\Services\Notification\NotificationService;
use App\Services\Notification\NotificationPreferenceService;
use App\Services\Notification\NotificationRuleEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

class CentralNotificationSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Role $adminRole;
    protected Role $orderManagerRole;
    protected Role $fraudManagerRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin', 'description' => 'System Administrator']);
        $this->orderManagerRole = Role::firstOrCreate(['name' => 'Order Manager'], ['display_name' => 'Order Manager', 'description' => 'Order Manager']);
        $this->fraudManagerRole = Role::firstOrCreate(['name' => 'Fraud Manager'], ['display_name' => 'Fraud Manager', 'description' => 'Fraud Manager']);

        $this->admin = User::create([
            'name' => 'Executive Admin',
            'email' => 'admin@techmarket.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '01711000000',
        ]);
        $this->admin->roles()->attach($this->adminRole->id);

        $this->customer = User::create([
            'name' => 'Retail Customer',
            'email' => 'customer@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'phone' => '01811000000',
        ]);

        // Seed default notification rules
        $this->seed(\Database\Seeders\NotificationRulesSeeder::class);
    }

    public function test_admin_can_view_notification_center_with_stats_and_filters(): void
    {
        Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'order.created',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->admin->id,
            'user_id' => $this->admin->id,
            'category' => 'ORDER',
            'priority' => 'HIGH',
            'title' => 'Test High Alert',
            'message' => 'Sample test message content',
            'action_url' => '/admin/orders',
            'action_label' => 'View Order',
            'data' => ['test' => true],
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/notifications');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Notifications/Index')
            ->has('notifications.data', 1)
            ->has('stats')
            ->where('stats.total_unread', 1)
            ->where('stats.high_priority_count', 1)
        );
    }

    public function test_topbar_feed_and_unread_count_api_endpoints_work(): void
    {
        Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'fraud.critical_risk',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->admin->id,
            'user_id' => $this->admin->id,
            'category' => 'FRAUD',
            'priority' => 'CRITICAL',
            'title' => '🚨 Critical Alert',
            'message' => 'Fraud score 95 detected',
            'data' => ['risk' => 95],
        ]);

        $feedRes = $this->actingAs($this->admin)->getJson('/admin/notifications/feed');
        $feedRes->assertStatus(200);
        $feedRes->assertJsonStructure(['notifications', 'unread_count']);
        $this->assertEquals(1, $feedRes->json('unread_count'));

        $countRes = $this->actingAs($this->admin)->getJson('/admin/notifications/unread-count');
        $countRes->assertStatus(200);
        $this->assertEquals(1, $countRes->json('unread_count'));
    }

    public function test_notification_manager_dispatches_event_with_dynamic_placeholders(): void
    {
        $order = Order::create([
            'order_number' => 'TMB-20260818-NOTIF1',
            'user_id' => $this->customer->id,
            'customer_name' => 'Tanvir Ahmed',
            'customer_email' => 'tanvir@test.com',
            'customer_phone' => '01799887766',
            'shipping_address' => 'Mirpur, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 45000.00,
            'total' => 45060.00,
            'status' => 'Pending',
        ]);

        $manager = app(NotificationManager::class);
        $result = $manager->dispatch('order.created', ['order' => $order]);

        $this->assertEquals('dispatched', $result['status']);
        $this->assertGreaterThanOrEqual(1, $result['count']);

        $notif = Notification::where('type', 'order.created')->latest()->first();
        $this->assertNotNull($notif);
        $this->assertStringContainsString('TMB-20260818-NOTIF1', $notif->title);
        $this->assertStringContainsString('Tanvir Ahmed', $notif->message);
        $this->assertEquals('ORDER', $notif->category);
    }

    public function test_notification_deduplication_engine_prevents_spamming(): void
    {
        Cache::flush();
        $cat = \App\Models\Category::firstOrCreate(['slug' => 'tech-cat'], ['name' => 'Tech Category']);
        $product = Product::create([
            'title' => 'Test Low Stock Device',
            'slug' => 'test-low-stock-device',
            'sku' => 'TEST-LOW-01',
            'category_id' => $cat->id,
            'price' => 5000,
            'stock' => 2,
            'is_active' => true,
        ]);

        $manager = app(NotificationManager::class);

        // 1st dispatch should succeed
        $first = $manager->dispatch('inventory.low_stock', ['product' => $product]);
        $this->assertEquals('dispatched', $first['status']);

        // 2nd immediate dispatch with same product should be deduplicated
        $second = $manager->dispatch('inventory.low_stock', ['product' => $product]);
        $this->assertEquals('deduplicated', $second['status']);
        $this->assertEquals(0, $second['count']);

        // Verify deduplication log entry
        $this->assertDatabaseHas('notification_logs', [
            'event_key' => 'inventory.low_stock',
            'status' => 'deduplicated',
        ]);
    }

    public function test_preference_filtering_respects_user_channel_settings(): void
    {
        // Disable SMS for orders
        NotificationPreference::create([
            'user_id' => $this->admin->id,
            'notification_type' => 'ORDER',
            'in_app_enabled' => true,
            'browser_enabled' => true,
            'sms_enabled' => false,
            'email_enabled' => false,
        ]);

        $prefService = app(NotificationPreferenceService::class);
        $this->assertTrue($prefService->isChannelEnabled($this->admin->id, 'ORDER', 'in_app', 'NORMAL'));
        $this->assertFalse($prefService->isChannelEnabled($this->admin->id, 'ORDER', 'sms', 'NORMAL'));
        
        // Critical alerts always allow in-app
        $this->assertTrue($prefService->isChannelEnabled($this->admin->id, 'ORDER', 'in_app', 'CRITICAL'));
    }

    public function test_admin_can_mark_as_read_and_mark_all_read(): void
    {
        $n1 = Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'order.created',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->admin->id,
            'user_id' => $this->admin->id,
            'category' => 'ORDER',
            'priority' => 'NORMAL',
            'title' => 'Order 1',
            'message' => 'Desc 1',
            'data' => ['order' => 1],
        ]);

        $n2 = Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'order.created',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->admin->id,
            'user_id' => $this->admin->id,
            'category' => 'ORDER',
            'priority' => 'NORMAL',
            'title' => 'Order 2',
            'message' => 'Desc 2',
            'data' => ['order' => 2],
        ]);

        $this->assertNull($n1->fresh()->read_at);

        // Mark single read
        $res1 = $this->actingAs($this->admin)->postJson("/admin/notifications/{$n1->id}/read");
        $res1->assertStatus(200);
        $this->assertNotNull($n1->fresh()->read_at);

        // Mark all read
        $resAll = $this->actingAs($this->admin)->postJson('/admin/notifications/read-all');
        $resAll->assertStatus(200);
        $this->assertNotNull($n2->fresh()->read_at);
    }

    public function test_admin_can_perform_bulk_actions(): void
    {
        $n1 = Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'order.created',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->admin->id,
            'user_id' => $this->admin->id,
            'category' => 'ORDER',
            'priority' => 'NORMAL',
            'title' => 'Bulk 1',
            'message' => 'Bulk 1',
            'data' => ['order' => 1],
        ]);

        $n2 = Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'order.created',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->admin->id,
            'user_id' => $this->admin->id,
            'category' => 'ORDER',
            'priority' => 'NORMAL',
            'title' => 'Bulk 2',
            'message' => 'Bulk 2',
            'data' => ['order' => 2],
        ]);

        $bulkRes = $this->actingAs($this->admin)->postJson('/admin/notifications/bulk', [
            'ids' => [$n1->id, $n2->id],
            'action' => 'mark_read',
        ]);

        $bulkRes->assertStatus(200);
        $this->assertEquals(2, $bulkRes->json('count'));
        $this->assertNotNull($n1->fresh()->read_at);
        $this->assertNotNull($n2->fresh()->read_at);
    }

    public function test_admin_can_update_notification_preferences(): void
    {
        $postData = [
            'preferences' => [
                'ORDER' => [
                    'in_app_enabled' => true,
                    'browser_enabled' => true,
                    'sms_enabled' => true,
                    'email_enabled' => false,
                ],
                'FRAUD' => [
                    'in_app_enabled' => true,
                    'browser_enabled' => true,
                    'sms_enabled' => true,
                    'email_enabled' => true,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/settings/notifications', $postData);
        $response->assertRedirect();

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $this->admin->id,
            'notification_type' => 'ORDER',
            'sms_enabled' => 1,
        ]);
    }

    public function test_admin_can_create_and_toggle_notification_rules(): void
    {
        $ruleData = [
            'event_key' => 'custom.promo_alert',
            'name' => 'Custom Promo Alert',
            'description' => 'Custom promotion notification rule',
            'category' => 'MARKETING',
            'default_priority' => 'HIGH',
            'enabled' => true,
            'notify_roles' => ['Admin', 'Super Admin'],
            'channels' => ['in_app', 'browser'],
            'template_title' => '🎉 Promo {{promo_code}} Launched',
            'template_message' => 'Campaign {{campaign_name}} active now.',
            'action_url_template' => '/admin/coupons',
        ];

        $res = $this->actingAs($this->admin)->post('/admin/settings/notification-rules', $ruleData);
        $res->assertRedirect();

        $rule = NotificationRule::where('event_key', 'custom.promo_alert')->first();
        $this->assertNotNull($rule);
        $this->assertEquals('Custom Promo Alert', $rule->name);

        // Toggle Rule
        $toggleRes = $this->actingAs($this->admin)->post("/admin/settings/notification-rules/{$rule->id}/toggle");
        $toggleRes->assertRedirect();
        $this->assertFalse($rule->fresh()->enabled);
    }

    public function test_critical_fraud_and_system_events_dispatch_correctly(): void
    {
        $manager = app(NotificationManager::class);

        // 1. Critical Fraud Alert
        $fraudRes = $manager->dispatch('fraud.critical_risk', [
            'order' => (object) [
                'id' => 999,
                'order_number' => 'TMB-FRAUD-999',
                'customer_name' => 'Suspicious User',
                'customer_phone' => '01999999999',
                'total' => 89000,
            ],
            'fraud_check' => (object) ['risk_score' => 92],
        ]);

        $this->assertEquals('dispatched', $fraudRes['status']);
        $fraudNotif = Notification::where('type', 'fraud.critical_risk')->latest()->first();
        $this->assertNotNull($fraudNotif);
        $this->assertEquals('CRITICAL', $fraudNotif->priority);
        $this->assertEquals('FRAUD', $fraudNotif->category);

        // 2. SMS Gateway Down Alert
        $smsRes = $manager->dispatch('sms.gateway_down', [
            'gateway' => 'BulkSMS BD',
        ]);
        $this->assertEquals('dispatched', $smsRes['status']);
        $smsNotif = Notification::where('type', 'sms.gateway_down')->latest()->first();
        $this->assertNotNull($smsNotif);
        $this->assertEquals('CRITICAL', $smsNotif->priority);
        $this->assertEquals('SMS', $smsNotif->category);
    }

    public function test_unauthorized_guests_cannot_access_admin_notifications(): void
    {
        $this->get('/admin/notifications')->assertRedirect('/login');
        $this->actingAs($this->customer)->get('/admin/notifications')->assertStatus(403);
    }
}
