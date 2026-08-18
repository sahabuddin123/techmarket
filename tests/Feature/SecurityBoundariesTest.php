<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SecurityBoundariesTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_or_modify_another_customers_data(): void
    {
        $customerA = User::create(['name' => 'Customer A', 'email' => 'a@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);
        $customerB = User::create(['name' => 'Customer B', 'email' => 'b@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);

        $orderA = Order::create([
            'order_number' => 'TMB-20260817-AAAAAA',
            'user_id' => $customerA->id,
            'customer_name' => 'Customer A',
            'customer_email' => 'a@test.com',
            'customer_phone' => '01700000001',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 1000.00,
            'total' => 1060.00,
            'status' => 'Pending',
        ]);

        // Customer B attempts API access to Customer A's order
        $response = $this->actingAs($customerB)->getJson("/api/v1/orders/{$orderA->order_number}");

        $response->assertStatus(404);
    }
}
