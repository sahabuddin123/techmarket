<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentStateMachineTest extends TestCase
{
    use RefreshDatabase;

    public function test_enforces_valid_payment_state_transitions_and_prevents_invalid_transitions(): void
    {
        $user = User::create([
            'name' => 'State Customer',
            'email' => 'state@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-STATE1',
            'user_id' => $user->id,
            'customer_name' => 'State Customer',
            'customer_email' => 'state@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'SSLCommerz',
            'payment_status' => 'Pending',
            'subtotal' => 10000.00,
            'total' => 10060.00,
            'status' => 'Pending',
        ]);

        $payment = PaymentService::initiatePayment($order, 'SSLCommerz', 'TRX-STATE-01');

        $this->assertEquals('initiated', $payment->status);

        // Valid transition: initiated -> paid
        $payment = PaymentService::transitionState($payment, 'paid', null, 'Payment validated');
        $this->assertEquals('paid', $payment->status);

        // Invalid transition: paid -> initiated (should throw InvalidArgumentException)
        $this->expectException(\InvalidArgumentException::class);
        PaymentService::transitionState($payment, 'initiated', null, 'Invalid backward transition');
    }

    public function test_processes_refund_and_prevents_duplicate_or_excess_refunds(): void
    {
        $admin = User::create([
            'name' => 'Refund Admin',
            'email' => 'refund.admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-REFUND',
            'user_id' => $admin->id,
            'customer_name' => 'Refund Customer',
            'customer_email' => 'refund@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'Paid',
            'subtotal' => 5000.00,
            'total' => 5060.00,
            'status' => 'Confirmed',
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $admin->id,
            'payment_method' => 'bKash',
            'transaction_id' => 'TRX-REFUND-01',
            'amount' => 5060.00,
            'currency' => 'BDT',
            'status' => 'paid',
        ]);

        // Process refund
        $refund = PaymentService::processRefund($order, 5060.00, 'Customer requested cancellation', $admin->id);

        $this->assertEquals('completed', $refund->status);
        $this->assertEquals('refunded', $payment->fresh()->status);

        // Duplicate refund attempt must throw Exception
        $this->expectException(\InvalidArgumentException::class);
        PaymentService::processRefund($order, 5060.00, 'Duplicate refund attempt', $admin->id);
    }
}
