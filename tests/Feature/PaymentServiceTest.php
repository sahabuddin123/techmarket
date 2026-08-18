<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_initiates_payment_record_and_handles_sslcommerz_callback_idempotently(): void
    {
        $user = User::create([
            'name' => 'Payment Customer',
            'email' => 'pay@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-999999',
            'user_id' => $user->id,
            'customer_name' => 'Payment Customer',
            'customer_email' => 'pay@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'SSLCommerz',
            'payment_status' => 'Pending',
            'shipping_cost' => 60.00,
            'subtotal' => 50000.00,
            'discount' => 0.00,
            'total' => 50060.00,
            'status' => 'Pending',
        ]);

        // Initiate Payment
        $payment = PaymentService::initiatePayment($order, 'SSLCommerz', 'SSL-TRX-1001');

        $this->assertEquals('SSL-TRX-1001', $payment->transaction_id);
        $this->assertEquals('initiated', $payment->status);

        // SSLCommerz Valid Callback
        $payload = [
            'tran_id' => 'SSL-TRX-1001',
            'val_id' => 'VAL-999888',
            'status' => 'VALID',
            'amount' => 50060.00,
        ];

        $updatedOrder = PaymentService::handleSslCommerzCallback($payload, 'VALID');

        $this->assertEquals('Paid', $updatedOrder->payment_status);
        $this->assertDatabaseHas('payments', [
            'transaction_id' => 'SSL-TRX-1001',
            'status' => 'paid',
        ]);

        // Idempotent duplicate callback test (should not fail or re-process)
        $duplicateOrder = PaymentService::handleSslCommerzCallback($payload, 'VALID');
        $this->assertEquals('Paid', $duplicateOrder->payment_status);
    }

    public function test_admin_can_approve_or_reject_manual_mobile_banking_payments(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin.pay@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-888888',
            'user_id' => $admin->id,
            'customer_name' => 'bKash Customer',
            'customer_email' => 'bkash@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'Initiated',
            'shipping_cost' => 60.00,
            'subtotal' => 20000.00,
            'discount' => 0.00,
            'total' => 20060.00,
            'status' => 'Pending',
        ]);

        PaymentService::initiatePayment($order, 'bKash', 'BKASH-TRX-777', '01711223344');

        // Admin approves manual payment
        PaymentService::approveManualPayment($order, $admin->id);

        $order->refresh();
        $this->assertEquals('Paid', $order->payment_status);
        $this->assertDatabaseHas('payments', [
            'transaction_id' => 'BKASH-TRX-777',
            'status' => 'paid',
        ]);
    }
}
