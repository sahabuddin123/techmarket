<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminOrderDetailWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_order_workspace_and_update_status(): void
    {
        $admin = User::create(['name' => 'Admin User', 'email' => 'admin.ws@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);
        $category = Category::create(['name' => 'Power Supply', 'slug' => 'power-supply']);
        $brand = Brand::create(['name' => 'Antec', 'slug' => 'antec']);

        $product = Product::create([
            'title' => 'Antec High Current Gamer 850W',
            'slug' => 'antec-hcg-850w',
            'sku' => 'PSU-ANT-850',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 12500.00,
            'stock' => 15,
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-WS01',
            'customer_name' => 'Workspace Customer',
            'customer_email' => 'ws.cust@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 12500.00,
            'total' => 12560.00,
            'status' => 'Pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->title,
            'sku_snapshot' => $product->sku,
            'price' => $product->price,
            'quantity' => 1,
            'total' => 12500.00,
        ]);

        \App\Models\OrderHistory::create([
            'order_id' => $order->id,
            'status' => 'Pending',
            'notes' => 'Initial checkout',
            'created_by' => $admin->id,
        ]);

        $this->actingAs($admin);

        // View Order Workspace
        $viewRes = $this->get("/admin/orders/{$order->id}");
        $viewRes->assertStatus(200);

        // Update status to Confirmed
        $statusRes = $this->post("/admin/orders/{$order->id}/status", [
            'status' => 'Confirmed',
            'notes' => 'Order verified by phone call.',
        ]);

        $statusRes->assertRedirect();
        $this->assertEquals('Confirmed', $order->fresh()->status);
    }
}
