<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Setting;
use App\Models\Shipment;
use App\Models\User;
use App\Services\Courier\SteadfastCourierService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SteadfastWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Order $order;
    protected Shipment $shipment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Steadfast Customer',
            'email' => 'sf.customer@test.com',
            'password' => bcrypt('secret123'),
            'role' => 'customer',
        ]);

        $this->order = Order::create([
            'order_number' => 'TMB-2026-SF01',
            'user_id' => $this->user->id,
            'customer_name' => 'Steadfast Customer',
            'customer_email' => 'sf.customer@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'House 12, Road 4, Dhanmondi',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'payment_status' => 'Pending',
            'subtotal' => 1500.00,
            'total' => 1600.00,
            'status' => 'Processing',
        ]);

        $this->shipment = Shipment::create([
            'order_id' => $this->order->id,
            'courier_provider' => 'steadfast',
            'consignment_id' => '123456',
            'tracking_code' => 'SF-TRK-123456',
            'invoice_id' => $this->order->order_number,
            'recipient_name' => $this->order->customer_name,
            'recipient_phone' => $this->order->customer_phone,
            'recipient_address' => $this->order->shipping_address,
            'parcel_weight' => 1.0,
            'cod_amount' => 1600.00,
            'delivery_charge' => 100.00,
            'courier_status' => 'in_review',
            'internal_status' => 'booked',
        ]);
    }

    public function test_delivery_status_webhook_marks_order_and_shipment_as_delivered(): void
    {
        $payload = [
            'notification_type' => 'delivery_status',
            'consignment_id' => 123456,
            'invoice' => 'TMB-2026-SF01',
            'cod_amount' => 1600.00,
            'status' => 'Delivered',
            'delivery_charge' => 100.00,
            'tracking_message' => 'Your package has been delivered successfully.',
            'updated_at' => '2026-09-10 14:30:00',
        ];

        $response = $this->postJson('/api/v1/courier/webhook/steadfast', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Webhook received successfully.',
            ]);

        $this->shipment->refresh();
        $this->assertEquals('Delivered', $this->shipment->courier_status);
        $this->assertEquals('delivered', $this->shipment->internal_status);
        $this->assertNotNull($this->shipment->delivered_at);

        $this->order->refresh();
        $this->assertEquals('Delivered', $this->order->status);
        $this->assertEquals('Paid', $this->order->payment_status);

        $this->assertDatabaseHas('shipment_status_histories', [
            'shipment_id' => $this->shipment->id,
            'courier_status' => 'Delivered',
            'internal_status' => 'delivered',
            'notes' => 'Your package has been delivered successfully.',
        ]);

        $this->assertDatabaseHas('order_histories', [
            'order_id' => $this->order->id,
            'status' => 'Delivered',
        ]);
    }

    public function test_tracking_update_webhook_logs_transit_history(): void
    {
        $payload = [
            'notification_type' => 'tracking_update',
            'consignment_id' => 123456,
            'invoice' => 'TMB-2026-SF01',
            'tracking_message' => 'Package arrived at Dhanmondi sorting center.',
            'updated_at' => '2026-09-10 10:15:00',
        ];

        $response = $this->postJson('/api/v1/courier/webhook/steadfast', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Webhook received successfully.',
            ]);

        $this->assertDatabaseHas('shipment_status_histories', [
            'shipment_id' => $this->shipment->id,
            'notes' => 'Steadfast Tracking: Package arrived at Dhanmondi sorting center.',
        ]);
    }

    public function test_webhook_enforces_bearer_token_authorization_when_configured(): void
    {
        Setting::set('steadfast_webhook_token', 'super-secret-sf-token-999', 'courier');

        $payload = [
            'notification_type' => 'tracking_update',
            'consignment_id' => 123456,
            'invoice' => 'TMB-2026-SF01',
            'tracking_message' => 'Out for delivery.',
            'updated_at' => '2026-09-10 11:00:00',
        ];

        // 1. Without Bearer token -> 401
        $res1 = $this->postJson('/api/v1/courier/webhook/steadfast', $payload);
        $res1->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Unauthorized: Invalid or missing Bearer token.',
            ]);

        // 2. With wrong Bearer token -> 401
        $res2 = $this->withHeaders([
            'Authorization' => 'Bearer wrong-token',
        ])->postJson('/api/v1/courier/webhook/steadfast', $payload);
        $res2->assertStatus(401);

        // 3. With correct Bearer token -> 200
        $res3 = $this->withHeaders([
            'Authorization' => 'Bearer super-secret-sf-token-999',
        ])->postJson('/api/v1/courier/webhook/steadfast', $payload);
        $res3->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);
    }

    public function test_webhook_returns_error_response_for_non_existent_consignment(): void
    {
        $payload = [
            'notification_type' => 'delivery_status',
            'consignment_id' => 9999999,
            'invoice' => 'UNKNOWN-INV',
            'status' => 'Delivered',
        ];

        $response = $this->postJson('/api/v1/courier/webhook/steadfast', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid consignment ID.',
            ]);
    }

    public function test_service_aliases_dead_portal_steadfast_domain_to_portal_packzy(): void
    {
        Setting::set('steadfast_base_url', 'https://portal.steadfast.com.bd/api/v1', 'courier');
        $service = new SteadfastCourierService();

        // Reflection to inspect baseUrl
        $ref = new \ReflectionClass($service);
        $prop = $ref->getProperty('baseUrl');
        $prop->setAccessible(true);
        $resolvedBaseUrl = $prop->getValue($service);

        $this->assertEquals('https://portal.packzy.com/api/v1', $resolvedBaseUrl);
    }
}
