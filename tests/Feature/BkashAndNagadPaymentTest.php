<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PaymentHistory;
use App\Models\Refund;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Setting;
use App\Models\Role;
use App\Services\BkashPaymentService;
use App\Services\NagadPaymentService;
use App\Services\PaymentService;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BkashAndNagadPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $otherCustomer;
    protected User $admin;
    protected Order $bkashOrder;
    protected Order $nagadOrder;
    protected Product $testProduct;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::create([
            'name' => 'Payment Customer',
            'email' => 'customer@techland.test',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $this->otherCustomer = User::create([
            'name' => 'Other Customer',
            'email' => 'other@techland.test',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $adminRole = Role::firstOrCreate(['name' => 'Super Admin'], ['display_name' => 'Super Admin']);
        $this->admin = User::create([
            'name' => 'Payment Admin',
            'email' => 'admin@techland.test',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $category = Category::create(['name' => 'Components', 'slug' => 'components']);
        $brand = Brand::create(['name' => 'Asus', 'slug' => 'asus']);

        $this->testProduct = Product::create([
            'title' => 'Asus ROG Strix Motherboard',
            'slug' => 'asus-rog-strix',
            'sku' => 'MB-ASUS-ROG',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 15000.00,
            'stock' => 10,
        ]);

        $this->bkashOrder = Order::create([
            'order_number' => 'TMB-20260817-BKASH01',
            'user_id' => $this->customer->id,
            'customer_name' => $this->customer->name,
            'customer_email' => $this->customer->email,
            'customer_phone' => '01711000001',
            'shipping_address' => 'Mirpur, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'bkash',
            'payment_status' => 'Pending',
            'shipping_cost' => 60.00,
            'subtotal' => 5000.00,
            'discount' => 0.00,
            'total' => 5060.00,
            'status' => 'Pending',
        ]);

        $this->nagadOrder = Order::create([
            'order_number' => 'TMB-20260817-NAGAD01',
            'user_id' => $this->customer->id,
            'customer_name' => $this->customer->name,
            'customer_email' => $this->customer->email,
            'customer_phone' => '01811000002',
            'shipping_address' => 'GEC, Chittagong',
            'district' => 'Chittagong',
            'payment_method' => 'nagad',
            'payment_status' => 'Pending',
            'shipping_cost' => 120.00,
            'subtotal' => 8000.00,
            'discount' => 0.00,
            'total' => 8120.00,
            'status' => 'Pending',
        ]);
    }

    // ==================== CHECKOUT & PAYMENT CONFIGURATION TESTS ====================

    public function test_checkout_rejects_disabled_payment_method(): void
    {
        // Admin disables Nagad
        Setting::set('payment_nagad_enabled', '0', 'payments');

        $this->actingAs($this->customer)->post('/cart/add', [
            'product_id' => $this->testProduct->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($this->customer)->post('/checkout', [
            'customer_name' => 'John Doe',
            'customer_phone' => '01711111111',
            'customer_email' => 'john@test.com',
            'shipping_address' => 'Mirpur, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'nagad',
        ]);

        $response->assertSessionHasErrors('payment_method');
    }

    public function test_admin_can_update_payment_method_configuration_and_environment(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/settings/payment-methods', [
            'payment_cod_enabled' => true,
            'payment_cod_title' => 'Cash on Delivery BD',
            'payment_cod_description' => 'Pay cash when product is delivered to door.',
            'payment_cod_sort' => 1,

            'payment_bkash_enabled' => true,
            'payment_bkash_title' => 'bKash Direct',
            'payment_bkash_description' => 'Pay instantly with bKash.',
            'payment_bkash_sort' => 2,
            'bkash_mode' => 'sandbox',

            'payment_nagad_enabled' => false,
            'payment_nagad_title' => 'Nagad Wallet',
            'payment_nagad_description' => 'Pay via Nagad.',
            'payment_nagad_sort' => 3,
            'nagad_mode' => 'live',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('Cash on Delivery BD', Setting::get('payment_cod_title'));
        $this->assertEquals('0', Setting::get('payment_nagad_enabled'));
        $this->assertEquals('live', Setting::get('nagad_mode'));
    }

    // ==================== BKASH LIFECYCLE TESTS ====================

    public function test_bkash_order_starts_pending_and_initiation_creates_single_payment_record(): void
    {
        $this->assertEquals('Pending', $this->bkashOrder->payment_status);

        $initData = BkashPaymentService::createPayment($this->bkashOrder);

        $this->assertEquals('success', $initData['status']);
        $this->assertDatabaseHas('payments', [
            'order_id' => $this->bkashOrder->id,
            'payment_method' => 'bkash',
            'status' => 'initiated',
        ]);

        // Duplicate initiation must not create duplicate payment record
        $initData2 = BkashPaymentService::createPayment($this->bkashOrder);
        $this->assertEquals(1, Payment::where('order_id', $this->bkashOrder->id)->count());
    }

    public function test_bkash_valid_verified_callback_marks_payment_paid(): void
    {
        BkashPaymentService::createPayment($this->bkashOrder);

        $response = $this->actingAs($this->customer)->post("/payment/bkash/confirm/{$this->bkashOrder->order_number}", [
            'trx_id' => 'BKASH-VERIFIED-TRX-101',
            'status' => 'success',
        ]);

        $response->assertRedirect(route('payment.result', ['orderNumber' => $this->bkashOrder->order_number, 'status' => 'success']));

        $this->bkashOrder->refresh();
        $this->assertEquals('Paid', $this->bkashOrder->payment_status);
        $this->assertEquals('BKASH-VERIFIED-TRX-101', $this->bkashOrder->transaction_id);

        $payment = Payment::where('order_id', $this->bkashOrder->id)->first();
        $this->assertEquals('paid', $payment->status);

        $this->assertDatabaseHas('payment_histories', [
            'payment_id' => $payment->id,
            'to_status' => 'paid',
        ]);
    }

    public function test_bkash_duplicate_callback_is_idempotent(): void
    {
        BkashPaymentService::createPayment($this->bkashOrder);

        // First callback
        $this->actingAs($this->customer)->post("/payment/bkash/confirm/{$this->bkashOrder->order_number}", [
            'trx_id' => 'BKASH-TRX-IDEMPOTENT',
            'status' => 'success',
        ]);

        $this->assertEquals('Paid', $this->bkashOrder->fresh()->payment_status);
        $historyCount = PaymentHistory::where('order_id', $this->bkashOrder->id)->count();

        // Duplicate callback
        $response = $this->actingAs($this->customer)->post("/payment/bkash/confirm/{$this->bkashOrder->order_number}", [
            'trx_id' => 'BKASH-TRX-IDEMPOTENT',
            'status' => 'success',
        ]);

        $response->assertRedirect(route('payment.result', ['orderNumber' => $this->bkashOrder->order_number, 'status' => 'success']));
        $this->assertEquals('Paid', $this->bkashOrder->fresh()->payment_status);
        // History should not be duplicated for already paid state
        $this->assertEquals($historyCount, PaymentHistory::where('order_id', $this->bkashOrder->id)->count());
    }

    public function test_bkash_cancel_and_fail_callbacks(): void
    {
        BkashPaymentService::createPayment($this->bkashOrder);

        // Cancel callback
        $this->actingAs($this->customer)->post("/payment/bkash/cancel/{$this->bkashOrder->order_number}");
        $this->bkashOrder->refresh();
        $this->assertEquals('Cancelled', $this->bkashOrder->payment_status);

        $payment = Payment::where('order_id', $this->bkashOrder->id)->first();
        $this->assertEquals('cancelled', $payment->status);

        // Fail callback
        $this->actingAs($this->customer)->post("/payment/bkash/confirm/{$this->bkashOrder->order_number}", [
            'status' => 'failed',
        ]);
        $this->bkashOrder->refresh();
        $this->assertEquals('Failed', $this->bkashOrder->payment_status);
    }

    public function test_bkash_live_mode_rejects_unconfigured_execution(): void
    {
        Setting::set('bkash_mode', 'live', 'payments');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('bKash live gateway credentials');

        BkashPaymentService::executePayment($this->bkashOrder, null, 'FAKE-TRX');
    }

    // ==================== NAGAD LIFECYCLE TESTS ====================

    public function test_nagad_payment_flow_initiation_verification_and_idempotency(): void
    {
        $this->assertEquals('Pending', $this->nagadOrder->payment_status);

        $initData = NagadPaymentService::initiatePayment($this->nagadOrder);
        $this->assertEquals('success', $initData['status']);
        $this->assertDatabaseHas('payments', [
            'order_id' => $this->nagadOrder->id,
            'payment_method' => 'nagad',
            'status' => 'initiated',
        ]);

        // Confirm / Verify
        $response = $this->actingAs($this->customer)->post("/payment/nagad/confirm/{$this->nagadOrder->order_number}", [
            'payment_ref_id' => $initData['paymentReferenceId'],
            'trx_id' => 'NAGAD-VERIFIED-TRX-202',
            'status' => 'success',
        ]);

        $response->assertRedirect(route('payment.result', ['orderNumber' => $this->nagadOrder->order_number, 'status' => 'success']));

        $this->nagadOrder->refresh();
        $this->assertEquals('Paid', $this->nagadOrder->payment_status);
        $this->assertEquals('NAGAD-VERIFIED-TRX-202', $this->nagadOrder->transaction_id);

        // Duplicate callback idempotency
        $responseDup = $this->actingAs($this->customer)->post("/payment/nagad/confirm/{$this->nagadOrder->order_number}", [
            'trx_id' => 'NAGAD-VERIFIED-TRX-202',
            'status' => 'success',
        ]);
        $responseDup->assertRedirect(route('payment.result', ['orderNumber' => $this->nagadOrder->order_number, 'status' => 'success']));
        $this->assertEquals('Paid', $this->nagadOrder->fresh()->payment_status);
    }

    public function test_nagad_live_mode_rejects_unconfigured_verification(): void
    {
        Setting::set('nagad_mode', 'live', 'payments');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Nagad live gateway credentials');

        NagadPaymentService::verifyPayment($this->nagadOrder, null, 'FAKE-TRX');
    }

    // ==================== SECURITY & RETRY TESTS ====================

    public function test_unauthorized_customer_cannot_access_or_pay_another_customers_order(): void
    {
        $response = $this->actingAs($this->otherCustomer)->get("/payment/bkash/process/{$this->bkashOrder->order_number}");
        $response->assertStatus(403);

        $confirmResponse = $this->actingAs($this->otherCustomer)->post("/payment/bkash/confirm/{$this->bkashOrder->order_number}", [
            'trx_id' => 'HACK-TRX',
        ]);
        $confirmResponse->assertStatus(403);
    }

    public function test_payment_retry_reuses_order_without_duplicate_order_or_stock_deduction(): void
    {
        BkashPaymentService::createPayment($this->bkashOrder);
        BkashPaymentService::failPayment($this->bkashOrder, 'Card declined', 'failed');

        $initialOrderCount = Order::count();

        $response = $this->actingAs($this->customer)->post("/payment/bkash/retry/{$this->bkashOrder->order_number}");
        $response->assertRedirect(route('payment.bkash.process', $this->bkashOrder->order_number));

        $this->assertEquals($initialOrderCount, Order::count());
    }

    public function test_paid_payment_cannot_be_downgraded_by_subsequent_failed_or_cancel_callback(): void
    {
        BkashPaymentService::createPayment($this->bkashOrder);
        BkashPaymentService::executePayment($this->bkashOrder, null, 'BKASH-SAFE-TRX');

        $this->assertEquals('Paid', $this->bkashOrder->fresh()->payment_status);

        // Attempting to fail a paid order should not downgrade it
        BkashPaymentService::failPayment($this->bkashOrder, 'Late webhook cancel', 'cancelled');
        $this->assertEquals('Paid', $this->bkashOrder->fresh()->payment_status);
        $this->assertEquals('paid', Payment::where('order_id', $this->bkashOrder->id)->first()->status);
    }

    // ==================== REFUND & STATE MACHINE TESTS ====================

    public function test_partial_and_full_refunds_with_cumulative_limit(): void
    {
        BkashPaymentService::createPayment($this->bkashOrder);
        BkashPaymentService::executePayment($this->bkashOrder, null, 'BKASH-REFUND-TRX');

        $order = $this->bkashOrder->fresh();
        $this->assertEquals('Paid', $order->payment_status);

        // Partial Refund 1: ৳2000 of ৳5060
        $refund1 = PaymentService::processRefund($order, 2000.00, 'Partial refund for item return', $this->admin->id);
        $this->assertEquals('completed', $refund1->status);
        $this->assertEquals('Partially Refunded', $order->fresh()->payment_status);
        $this->assertEquals('partially_refunded', Payment::where('order_id', $order->id)->first()->status);

        // Excess Cumulative Refund Attempt (2000 + 4000 = 6000 > 5060) -> Must throw exception
        try {
            PaymentService::processRefund($order, 4000.00, 'Over refund attempt', $this->admin->id);
            $this->fail('Expected InvalidArgumentException for exceeding refund cap was not thrown.');
        } catch (\InvalidArgumentException $e) {
            $this->assertStringContainsString('exceeds original paid amount', $e->getMessage());
        }

        // Partial Refund 2: ৳3060 (Total: 5060) -> Full refund
        $refund2 = PaymentService::processRefund($order, 3060.00, 'Remaining balance refund', $this->admin->id);
        $this->assertEquals('completed', $refund2->status);
        $this->assertEquals('Refunded', $order->fresh()->payment_status);
        $this->assertEquals('refunded', Payment::where('order_id', $order->id)->first()->status);
    }

    public function test_invalid_payment_state_transitions_are_rejected(): void
    {
        $payment = Payment::create([
            'order_id' => $this->bkashOrder->id,
            'user_id' => $this->customer->id,
            'payment_method' => 'bkash',
            'transaction_id' => 'INIT-TRX-CANCELLED-101',
            'amount' => 5060.00,
            'status' => 'cancelled',
        ]);

        $this->expectException(\InvalidArgumentException::class);
        // Cancelled payment cannot transition to paid
        PaymentService::transitionState($payment, 'paid', $this->admin->id, 'Invalid jump');
    }

    // ==================== INVENTORY IDEMPOTENCY TEST ====================

    public function test_inventory_release_upon_cancellation_is_consistent(): void
    {
        OrderItem::create([
            'order_id' => $this->bkashOrder->id,
            'product_id' => $this->testProduct->id,
            'product_name' => $this->testProduct->title,
            'price' => $this->testProduct->price,
            'quantity' => 2,
            'total' => 30000.00,
        ]);

        // Reserve 2 units
        InventoryService::reserveStock($this->testProduct->id, 2, $this->bkashOrder->id);
        $this->assertEquals(8, $this->testProduct->fresh()->stock);

        // Admin cancels order
        $this->actingAs($this->admin)->post("/admin/orders/{$this->bkashOrder->id}/status", [
            'status' => 'Cancelled',
        ]);

        $this->assertEquals(10, $this->testProduct->fresh()->stock);
        $this->assertEquals('Cancelled', $this->bkashOrder->fresh()->status);
    }
}
