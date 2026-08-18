<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Services\LoyaltyService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LoyaltyLedgerTest extends TestCase
{
    use RefreshDatabase;

    public function test_loyalty_service_handles_earning_redemption_reversal_and_balance_calculation(): void
    {
        $customer = User::create([
            'name' => 'Loyalty User',
            'email' => 'loyalty@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-LOYAL1',
            'user_id' => $customer->id,
            'customer_name' => 'Loyalty User',
            'customer_email' => 'loyalty@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 20000.00,
            'total' => 20060.00,
            'status' => 'Delivered',
        ]);

        // Earn Points (1 point per BDT 100 => 200 points)
        $tx = LoyaltyService::earnPoints($customer, $order);

        $this->assertEquals(200, $tx->points);
        $this->assertEquals(200, LoyaltyService::getUserBalance($customer));

        // Deduplication test: re-earning for same order should return null
        $dupTx = LoyaltyService::earnPoints($customer, $order);
        $this->assertNull($dupTx);

        // Redeem 50 points on new order
        $order2 = Order::create([
            'order_number' => 'TMB-20260817-LOYAL2',
            'user_id' => $customer->id,
            'customer_name' => 'Loyalty User',
            'customer_email' => 'loyalty@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 5000.00,
            'total' => 5060.00,
            'status' => 'Pending',
        ]);

        LoyaltyService::redeemPoints($customer, 50, $order2);
        $this->assertEquals(150, LoyaltyService::getUserBalance($customer));

        // Order 1 cancellation -> Reverse earned points
        LoyaltyService::reversePoints($customer, $order);
        $this->assertEquals(-50, LoyaltyService::getUserBalance($customer)); // 200 earned - 50 redeemed - 200 reversed = -50 balance
    }
}
