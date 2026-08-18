<?php

namespace Tests\Feature;

use App\Models\FraudCheck;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Shipment;
use App\Models\User;
use App\Services\Courier\CourierManager;
use App\Services\Courier\PathaoCourierService;
use App\Services\Courier\SteadfastCourierService;
use App\Services\CourierService;
use App\Services\Fraud\FraudDetectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CourierAndFraudDetectionIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $customerUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::create([
            'name' => 'Admin Officer',
            'email' => 'admin.courier@techlandbd.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $this->customerUser = User::create([
            'name' => 'Tanvir Ahmed',
            'email' => 'tanvir@gmail.com',
            'phone' => '01711223344',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
    }

    public function test_steadfast_courier_service_mock_and_live_api(): void
    {
        $order = Order::create([
            'order_number' => 'TMB-20260818-SF01',
            'user_id' => $this->customerUser->id,
            'customer_name' => 'Tanvir Ahmed',
            'customer_email' => 'tanvir@gmail.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'House 12, Road 4, Dhanmondi',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 15000.00,
            'total' => 15060.00,
            'status' => 'Pending',
        ]);

        $steadfast = new SteadfastCourierService();
        $this->assertEquals('steadfast', $steadfast->getIdentifier());

        // Test unconfigured mock creation
        $res = $steadfast->createParcel($order);
        $this->assertTrue($res['success']);
        $this->assertNotEmpty($res['consignment_id']);

        // Test Mocked HTTP Response for Steadfast API
        Setting::set('steadfast_api_key', 'sf_test_key', 'courier');
        Setting::set('steadfast_secret_key', 'sf_test_secret', 'courier');
        Setting::set('steadfast_base_url', 'https://portal.steadfast.com.bd/api/v1', 'courier');

        Http::fake([
            'https://portal.steadfast.com.bd/api/v1/get_balance' => Http::response([
                'status' => 200,
                'current_balance' => 4500.50,
            ], 200),
            'https://portal.steadfast.com.bd/api/v1/create_order' => Http::response([
                'status' => 200,
                'message' => 'Order created successfully',
                'consignment' => [
                    'consignment_id' => 'SF-2026-9999',
                    'tracking_code' => 'SFTRK8888',
                    'status' => 'in_review',
                ],
            ], 200),
            'https://portal.steadfast.com.bd/api/v1/status_by_cid/*' => Http::response([
                'status' => 200,
                'delivery_status' => 'delivered',
            ], 200),
        ]);

        $configuredSteadfast = new SteadfastCourierService();
        $this->assertTrue($configuredSteadfast->isConfigured());

        $testConn = $configuredSteadfast->testConnection();
        $this->assertTrue($testConn['success']);
        $this->assertStringContainsString('4500.5', $testConn['message']);

        $parcelRes = $configuredSteadfast->createParcel($order);
        $this->assertTrue($parcelRes['success']);
        $this->assertEquals('SF-2026-9999', $parcelRes['consignment_id']);
        $this->assertEquals('SFTRK8888', $parcelRes['tracking_code']);
    }

    public function test_pathao_courier_service_oauth_and_parcel_booking(): void
    {
        $order = Order::create([
            'order_number' => 'TMB-20260818-PT01',
            'user_id' => $this->customerUser->id,
            'customer_name' => 'Tanvir Ahmed',
            'customer_email' => 'tanvir@gmail.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'House 5, Gulshan 1',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 25000.00,
            'total' => 25060.00,
            'status' => 'Pending',
        ]);

        Setting::set('pathao_client_id', 'pt_client_123', 'courier');
        Setting::set('pathao_client_secret', 'pt_secret_456', 'courier');
        Setting::set('pathao_username', 'merchant@techmarket.com', 'courier');
        Setting::set('pathao_password', 'secretpass123', 'courier');
        Setting::set('pathao_base_url', 'https://api-hermes.pathao.com', 'courier');

        Http::fake([
            'https://api-hermes.pathao.com/aladdin/api/v1/issue-token' => Http::response([
                'access_token' => 'mock_pathao_jwt_token_xyz',
                'token_type' => 'Bearer',
                'expires_in' => 86400,
            ], 200),
            'https://api-hermes.pathao.com/aladdin/api/v1/stores' => Http::response([
                'data' => [
                    ['store_id' => 1, 'store_name' => 'TechMarket Central Hub'],
                ],
            ], 200),
            'https://api-hermes.pathao.com/aladdin/api/v1/orders' => Http::response([
                'data' => [
                    'consignment_id' => 'PT-CON-1001',
                    'order_status' => 'Pending',
                    'delivery_fee' => 80.00,
                ],
            ], 200),
        ]);

        $pathao = new PathaoCourierService();
        $this->assertTrue($pathao->isConfigured());

        $testRes = $pathao->testConnection();
        $this->assertTrue($testRes['success']);

        $bookingRes = $pathao->createParcel($order);
        $this->assertTrue($bookingRes['success']);
        $this->assertEquals('PT-CON-1001', $bookingRes['consignment_id']);
    }

    public function test_courier_manager_books_and_tracks_shipment(): void
    {
        $order = Order::create([
            'order_number' => 'TMB-20260818-MGR01',
            'user_id' => $this->customerUser->id,
            'customer_name' => 'Tanvir Ahmed',
            'customer_email' => 'tanvir@gmail.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Uttara Sector 3, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 8000.00,
            'total' => 8060.00,
            'status' => 'Pending',
        ]);

        $manager = app(CourierManager::class);
        $res = $manager->bookShipment($order, 'steadfast', [
            'parcel_weight' => 1.2,
            'cod_amount' => 8060.00,
            'special_instructions' => 'Fragile GPU',
        ]);

        $this->assertTrue($res['success']);
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'courier_provider' => 'steadfast',
            'parcel_weight' => 1.2,
        ]);

        $order->refresh();
        $this->assertEquals('steadfast', $order->courier_provider);
        $this->assertEquals('Processing', $order->status);

        $shipment = Shipment::where('order_id', $order->id)->first();
        $this->assertNotNull($shipment);

        // Test Live Tracking Call
        $trackRes = $manager->trackShipment($shipment);
        $this->assertTrue($trackRes['success']);

        // Test Cancellation
        $cancelRes = $manager->cancelShipment($shipment);
        $this->assertTrue($cancelRes['success']);
        $this->assertEquals('cancelled', $shipment->fresh()->internal_status);
    }

    public function test_fraud_detection_engine_scores_and_flags_signals(): void
    {
        // 1. Clean first-time low-value order
        $cleanOrder = Order::create([
            'order_number' => 'TMB-20260818-CLEAN',
            'customer_name' => 'Good Buyer',
            'customer_email' => 'goodbuyer@test.com',
            'customer_phone' => '01899990001',
            'shipping_address' => 'Banani, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 2000.00,
            'total' => 2060.00,
            'status' => 'Pending',
        ]);

        $check1 = FraudDetectionService::analyzeOrder($cleanOrder);
        $this->assertLessThan(25, $check1->risk_score);
        $this->assertEquals('low', $check1->risk_level);
        $this->assertEquals('passed', $check1->status);

        // 2. Suspicious High-Value COD + Multi Duplicate Order Scenario
        // Create duplicate order 10 mins apart with same phone
        $dupOrder = Order::create([
            'order_number' => 'TMB-20260818-DUP01',
            'customer_name' => 'Suspicious Buyer',
            'customer_email' => 'suspicious@test.com',
            'customer_phone' => '01899990001',
            'shipping_address' => 'Banani, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 65000.00,
            'total' => 65060.00,
            'status' => 'Pending',
        ]);

        $check2 = FraudDetectionService::analyzeOrder($dupOrder);
        $this->assertGreaterThanOrEqual(40, $check2->risk_score);
        $this->assertTrue($check2->is_duplicate);
        $this->assertNotEmpty($check2->reasons);

        // 3. Customer Profile Instant Lookup
        $profile = FraudDetectionService::analyzeCustomer('01899990001');
        $this->assertEquals('01899990001', $profile['phone']);
        $this->assertGreaterThanOrEqual(2, $profile['total_orders']);
    }

    public function test_admin_fraud_review_override_workflow(): void
    {
        $order = Order::create([
            'order_number' => 'TMB-20260818-REV01',
            'customer_name' => 'Flagged Customer',
            'customer_email' => 'flagged@test.com',
            'customer_phone' => '01900001122',
            'shipping_address' => 'Mirpur 10, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 55000.00,
            'total' => 55060.00,
            'status' => 'Pending',
        ]);

        $this->actingAs($this->adminUser);

        // Trigger fraud review approval
        $response = $this->post(route('admin.orders.fraudReview', $order->id), [
            'action' => 'approve',
            'notes' => 'Customer called from registered phone, verified National ID and confirmed order delivery.',
        ]);

        $response->assertRedirect();
        $order->refresh();

        $this->assertEquals('approved', $order->fraud_status);
        $this->assertDatabaseHas('fraud_review_logs', [
            'action' => 'approve',
            'notes' => 'Customer called from registered phone, verified National ID and confirmed order delivery.',
        ]);
    }

    public function test_admin_courier_and_fraud_routes_accessible_to_admin(): void
    {
        $this->actingAs($this->adminUser);

        // Shipments Ledger Page
        $this->get(route('admin.shipments'))->assertOk();

        // Courier Settings Page
        $this->get(route('admin.settings.courier'))->assertOk();

        // Fraud Checker Page
        $this->get(route('admin.customers.fraudChecker', ['phone' => '01711223344']))->assertOk();

        // Fraud Review Queue Page
        $this->get(route('admin.customers.fraudReviews'))->assertOk();

        // Fraud Settings Page
        $this->get(route('admin.settings.fraud'))->assertOk();
    }

    public function test_courier_manager_prevents_duplicate_booking_and_cancelled_orders(): void
    {
        $order = Order::create([
            'order_number' => 'TMB-20260818-GD01',
            'user_id' => $this->customerUser->id,
            'customer_name' => 'Tanvir Ahmed',
            'customer_email' => 'tanvir@gmail.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Uttara Sector 3, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 8000.00,
            'total' => 8060.00,
            'status' => 'Pending',
        ]);

        $manager = app(CourierManager::class);

        // 1. Initial Booking
        $res1 = $manager->bookShipment($order, 'steadfast', ['parcel_weight' => 1.0]);
        $this->assertTrue($res1['success']);

        // 2. Attempt duplicate booking while active
        $res2 = $manager->bookShipment($order, 'steadfast', ['parcel_weight' => 1.0]);
        $this->assertFalse($res2['success']);
        $this->assertStringContainsString('already exists', $res2['message']);

        // 3. Attempt booking on cancelled order
        $cancelledOrder = Order::create([
            'order_number' => 'TMB-20260818-CAN01',
            'user_id' => $this->customerUser->id,
            'customer_name' => 'Tanvir Ahmed',
            'customer_email' => 'tanvir@gmail.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Uttara Sector 3, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 8000.00,
            'total' => 8060.00,
            'status' => 'Cancelled',
        ]);

        $res3 = $manager->bookShipment($cancelledOrder, 'steadfast', ['parcel_weight' => 1.0]);
        $this->assertFalse($res3['success']);
        $this->assertStringContainsString('cancelled order', $res3['message']);
    }

    public function test_fraud_settings_change_dynamically_alters_risk_scoring(): void
    {
        $order = Order::create([
            'order_number' => 'TMB-20260818-DYN01',
            'customer_name' => 'Test Customer',
            'customer_email' => 'dyn@test.com',
            'customer_phone' => '01799887766',
            'shipping_address' => 'Dhanmondi, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 30000.00,
            'total' => 30060.00,
            'status' => 'Pending',
        ]);

        // Standard settings: threshold 40000 -> 30000 is below COD threshold
        Setting::set('fraud_high_value_cod_threshold', '40000', 'fraud');
        Setting::set('fraud_high_value_cod_weight', '20', 'fraud');
        $check1 = FraudDetectionService::analyzeOrder($order);
        $this->assertEquals(0, $check1->risk_score);

        // Update settings dynamically to lower threshold to 25000
        Setting::set('fraud_high_value_cod_threshold', '25000', 'fraud');
        $check2 = FraudDetectionService::analyzeOrder($order);
        $this->assertEquals(20, $check2->risk_score);
        $this->assertStringContainsString('High-Value Cash on Delivery', $check2->reasons[0]);
    }

    public function test_courier_settings_update_preserves_blank_secrets_and_handles_booleans(): void
    {
        $this->actingAs($this->adminUser);

        Setting::set('steadfast_api_key', 'initial_key', 'courier');
        Setting::set('steadfast_secret_key', 'pre_configured_secret', 'courier');

        // Admin updates base URL and leaves secret blank
        $response = $this->post(route('admin.settings.courier.update'), [
            'steadfast_enabled' => true,
            'steadfast_base_url' => 'https://portal.steadfast.com.bd/api/v1',
            'steadfast_api_key' => 'updated_api_key',
            'steadfast_secret_key' => '', // Blank should NOT overwrite existing secret
        ]);

        $response->assertRedirect();
        $this->assertEquals('updated_api_key', Setting::get('steadfast_api_key'));
        $this->assertEquals('pre_configured_secret', Setting::get('steadfast_secret_key'));
        $this->assertTrue(Setting::getBool('steadfast_enabled'));
    }
}
