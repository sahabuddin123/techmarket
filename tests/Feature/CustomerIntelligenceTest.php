<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Order;
use App\Models\LoyaltyTransaction;
use App\Models\Referral;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

class CustomerIntelligenceTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $perm = Permission::create(['name' => 'reports.customers', 'group' => 'reports', 'display_name' => 'View Customer Reports']);
        $role->permissions()->attach($perm);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($role);
    }

    public function test_customer_retention_and_repeat_purchase_metrics(): void
    {
        $userA = User::create([
            'name' => 'Repeat Buyer Alice',
            'email' => 'alice@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $userB = User::create([
            'name' => 'One Time Buyer Bob',
            'email' => 'bob@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $userC = User::create([
            'name' => 'Prospect Charlie',
            'email' => 'charlie@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        // Alice orders twice
        Order::create([
            'order_number' => 'ORD-A1',
            'user_id' => $userA->id,
            'customer_name' => 'Repeat Buyer Alice',
            'customer_email' => 'alice@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 25000,
            'total' => 25000,
            'status' => 'Delivered',
        ]);

        Order::create([
            'order_number' => 'ORD-A2',
            'user_id' => $userA->id,
            'customer_name' => 'Repeat Buyer Alice',
            'customer_email' => 'alice@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 15000,
            'total' => 15000,
            'status' => 'Delivered',
        ]);

        // Bob orders once
        Order::create([
            'order_number' => 'ORD-B1',
            'user_id' => $userB->id,
            'customer_name' => 'One Time Buyer Bob',
            'customer_email' => 'bob@test.com',
            'customer_phone' => '01799887766',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'COD',
            'payment_status' => 'paid',
            'subtotal' => 10000,
            'total' => 10000,
            'status' => 'Delivered',
        ]);

        // Loyalty & Referral events
        LoyaltyTransaction::create([
            'user_id' => $userA->id,
            'type' => 'earned',
            'points' => 250,
            'notes' => 'Earned on order',
        ]);

        Referral::create([
            'referrer_id' => $userA->id,
            'referred_id' => $userB->id,
            'referral_code' => 'ALICE-REF',
            'status' => 'rewarded',
            'reward_points' => 100,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/customers');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Customers')
            ->has('reportData.overview')
            ->where('reportData.overview.total_customers', 3)
            ->where('reportData.overview.purchasing_customers', 2)
            ->where('reportData.overview.returning_customers', 1)
            ->where('reportData.overview.repeat_purchase_rate', 50) // 1 out of 2 = 50%
            ->where('reportData.overview.zero_purchase_customers', 1) // Charlie has 0 orders
            ->has('reportData.top_spenders', 2)
            ->where('reportData.top_spenders.0.email', 'alice@test.com')
            ->where('reportData.top_spenders.0.total_spent', 40000)
            ->has('reportData.referral_stats')
            ->has('reportData.loyalty_stats')
        );
    }
}
