<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminSearchSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_global_search_returns_grouped_results(): void
    {
        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $perm = Permission::create(['name' => 'admin.search', 'group' => 'search', 'display_name' => 'Search']);
        $role->permissions()->attach($perm);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $admin->roles()->attach($role);

        $category = Category::create(['name' => 'Laptops', 'slug' => 'laptops']);
        Product::create([
            'title' => 'Asus ROG Strix Laptop',
            'slug' => 'asus-rog-strix',
            'sku' => 'LAP-ROG-01',
            'category_id' => $category->id,
            'price' => 185000,
            'stock' => 5,
        ]);

        Order::create([
            'order_number' => 'ORD-ROG-999',
            'customer_name' => 'Gamers Den ROG',
            'customer_email' => 'rog@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 185000,
            'total' => 185000,
            'status' => 'Processing',
        ]);

        $response = $this->actingAs($admin)->getJson('/admin/search?q=ROG');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'query',
            'total_results',
            'results' => [
                'orders',
                'products',
            ],
        ]);
        $this->assertGreaterThan(0, $response->json('total_results'));
    }

    public function test_customer_is_forbidden_from_admin_search(): void
    {
        $customer = User::create([
            'name' => 'Regular Customer',
            'email' => 'customer@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer)->getJson('/admin/search?q=ROG');
        $response->assertStatus(403);
    }

    public function test_short_query_returns_empty_results_safely(): void
    {
        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $perm = Permission::create(['name' => 'admin.search', 'group' => 'search', 'display_name' => 'Search']);
        $role->permissions()->attach($perm);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $admin->roles()->attach($role);

        $response = $this->actingAs($admin)->getJson('/admin/search?q=a');
        $response->assertStatus(200);
        $this->assertEquals(0, $response->json('total_results'));
    }
}
