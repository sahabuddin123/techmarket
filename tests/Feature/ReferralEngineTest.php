<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Referral;
use App\Services\ReferralService;
use App\Services\LoyaltyService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReferralEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_attributes_referral_prevents_self_referral_and_rewards_on_qualification(): void
    {
        $referrer = User::create(['name' => 'Referrer User', 'email' => 'ref@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);
        $code = ReferralService::getOrCreateReferralCode($referrer);

        $this->assertNotEmpty($code);

        $newCustomer = User::create(['name' => 'New Customer', 'email' => 'new.cust@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);

        // Self-referral rejection
        $selfRef = ReferralService::attributeReferral($referrer, $code);
        $this->assertNull($selfRef);

        // Attribute valid referral
        $referral = ReferralService::attributeReferral($newCustomer, $code);
        $this->assertNotNull($referral);
        $this->assertEquals('pending', $referral->status);

        // Qualify referral upon order completion
        $order = Order::create([
            'order_number' => 'TMB-20260817-REFQUAL',
            'user_id' => $newCustomer->id,
            'customer_name' => 'New Customer',
            'customer_email' => 'new.cust@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 10000.00,
            'total' => 10060.00,
            'status' => 'Delivered',
        ]);

        $qualified = ReferralService::qualifyReferral($order);
        $this->assertEquals('rewarded', $qualified->status);

        // Referrer should have earned loyalty points from order
        $this->assertGreaterThan(0, LoyaltyService::getUserBalance($referrer));
    }
}
