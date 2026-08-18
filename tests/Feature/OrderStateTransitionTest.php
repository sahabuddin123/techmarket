<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use App\Models\Role;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderStateTransitionTest extends TestCase
{
    use RefreshDatabase;

    public function test_cancelling_order_releases_reserved_stock_and_logs_history_timeline(): void
    {
        $adminRole = Role::create(['name' => 'Admin', 'display_name' => 'Admin']);
        $admin = User::create([
            'name' => 'Order Admin',
            'email' => 'admin.orders@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $admin->roles()->attach($adminRole);

        $category = Category::create(['name' => 'Monitor', 'slug' => 'monitor']);
        $brand = Brand::create(['name' => 'Gigabyte', 'slug' => 'gigabyte']);

        $product = Product::create([
            'title' => 'Gigabyte G24F 2 Monitor',
            'slug' => 'gigabyte-g24f-2',
            'sku' => 'MON-G24F2',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 19800.00,
            'stock' => 10,
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-000001',
            'user_id' => $admin->id,
            'customer_name' => 'Customer',
            'customer_email' => 'customer@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'payment_status' => 'Pending',
            'shipping_cost' => 60.00,
            'subtotal' => 19800.00,
            'discount' => 0.00,
            'total' => 19860.00,
            'status' => 'Pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->title,
            'price' => 19800.00,
            'quantity' => 2,
            'total' => 39600.00,
        ]);

        // Reserve 2 units
        InventoryService::reserveStock($product->id, 2, $order->id);

        $product->refresh();
        $this->assertEquals(8, $product->stock);

        // Admin updates status to Cancelled
        $response = $this->actingAs($admin)
            ->post("/admin/orders/{$order->id}/status", [
                'status' => 'Cancelled',
            ]);

        $response->assertRedirect();

        // Order status updated
        $order->refresh();
        $this->assertEquals('Cancelled', $order->status);

        // Stock restored to 10
        $product->refresh();
        $this->assertEquals(10, $product->stock);

        // Order history timeline recorded
        $this->assertDatabaseHas('order_histories', [
            'order_id' => $order->id,
            'status' => 'Cancelled',
        ]);
    }
}
