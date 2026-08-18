<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerSupportWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_search_and_view_customer_support_profile(): void
    {
        $admin = User::create(['name' => 'Support Admin', 'email' => 'admin.support@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);
        $customer = User::create(['name' => 'Support Target', 'email' => 'target.supp@test.com', 'phone' => '01799887766', 'password' => bcrypt('password'), 'role' => 'customer']);

        Order::create([
            'order_number' => 'TMB-20260817-SUPP1',
            'user_id' => $customer->id,
            'customer_name' => 'Support Target',
            'customer_email' => 'target.supp@test.com',
            'customer_phone' => '01799887766',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 15000.00,
            'total' => 15060.00,
            'status' => 'Delivered',
        ]);

        $this->actingAs($admin);

        $response = $this->get('/admin/support?search=01799887766');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Support/Index')->has('customerData'));
    }
}
