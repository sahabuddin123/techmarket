<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

class ProductPerformanceReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $perm = Permission::create(['name' => 'reports.products', 'group' => 'reports', 'display_name' => 'View Product Reports']);
        $role->permissions()->attach($perm);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($role);
    }

    public function test_product_performance_best_sellers_and_zero_sales(): void
    {
        $category = Category::create(['name' => 'Graphics Cards', 'slug' => 'gpu']);

        $gpu1 = Product::create([
            'title' => 'RTX 4070 Super',
            'slug' => 'rtx-4070-super',
            'sku' => 'GPU-4070S',
            'category_id' => $category->id,
            'price' => 75000,
            'stock' => 5,
        ]);

        $gpu2 = Product::create([
            'title' => 'RTX 5090 GDDR7',
            'slug' => 'rtx-5090',
            'sku' => 'GPU-5090',
            'category_id' => $category->id,
            'price' => 320000,
            'stock' => 2,
        ]);

        // Zero sales product
        $gpuZero = Product::create([
            'title' => 'GTX 1650 Legacy',
            'slug' => 'gtx-1650',
            'sku' => 'GPU-1650',
            'category_id' => $category->id,
            'price' => 18000,
            'stock' => 15,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-GPU-1',
            'customer_name' => 'Gamer One',
            'customer_email' => 'gamer@test.com',
            'customer_phone' => '01711111111',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 395000,
            'total' => 395000,
            'status' => 'Delivered',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $gpu1->id,
            'product_name' => 'RTX 4070 Super (Original)',
            'sku_snapshot' => 'GPU-4070S',
            'price' => 75000,
            'quantity' => 1,
            'total' => 75000,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $gpu2->id,
            'product_name' => 'RTX 5090 GDDR7 (Original)',
            'sku_snapshot' => 'GPU-5090',
            'price' => 320000,
            'quantity' => 1,
            'total' => 320000,
        ]);

        // Modify product title and SKU after order to verify historical reporting stability
        $gpu1->update(['title' => 'RTX 4070 Super V2 (Renamed)', 'sku' => 'GPU-4070S-V2']);

        $response = $this->actingAs($this->admin)->get('/admin/reports/products');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Products')
            ->has('reportData.best_selling', 2)
            ->has('reportData.highest_revenue', 2)
            ->has('reportData.zero_sales_products', 1)
            ->where('reportData.zero_sales_products.0.sku', 'GPU-1650')
        );
    }
}
