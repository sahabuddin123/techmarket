<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ImmutableOrderSnapshotsTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_items_preserve_immutable_snapshots_when_product_changes(): void
    {
        $category = Category::create(['name' => 'Motherboards', 'slug' => 'motherboards']);
        $brand = Brand::create(['name' => 'Gigabyte', 'slug' => 'gigabyte']);

        $product = Product::create([
            'title' => 'Gigabyte Z790 AORUS ELITE AX',
            'slug' => 'gigabyte-z790-aorus',
            'sku' => 'MB-GIG-Z790A',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 38000.00,
            'stock' => 10,
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-SNAP1',
            'customer_name' => 'Snapshot Customer',
            'customer_email' => 'snap@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 38000.00,
            'total' => 38060.00,
            'status' => 'Pending',
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->title,
            'sku_snapshot' => $product->sku,
            'price' => $product->price,
            'quantity' => 1,
            'total' => 38000.00,
        ]);

        // Product title & price are updated later by admin
        $product->update([
            'title' => 'Gigabyte Z790 AORUS ELITE AX V2 (REVISED)',
            'price' => 42000.00,
        ]);

        // Historical order item snapshot remains unchanged!
        $item->refresh();
        $this->assertEquals('Gigabyte Z790 AORUS ELITE AX', $item->product_name);
        $this->assertEquals(38000.00, $item->price);
        $this->assertEquals('MB-GIG-Z790A', $item->sku_snapshot);
    }
}
