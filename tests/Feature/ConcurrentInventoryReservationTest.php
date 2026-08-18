<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Order;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ConcurrentInventoryReservationTest extends TestCase
{
    use RefreshDatabase;

    public function test_concurrent_inventory_reservations_lock_stock_safely(): void
    {
        $category = Category::create(['name' => 'RAM', 'slug' => 'ram']);
        $brand = Brand::create(['name' => 'Corsair', 'slug' => 'corsair']);

        $product = Product::create([
            'title' => 'Corsair Vengeance 32GB DDR5',
            'slug' => 'corsair-vengeance-32gb-ddr5',
            'sku' => 'RAM-COR-32G5',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 14500.00,
            'stock' => 5,
        ]);

        $order1 = Order::create([
            'order_number' => 'TMB-20260817-RACE1',
            'customer_name' => 'Buyer 1',
            'customer_email' => 'b1@test.com',
            'customer_phone' => '01700000001',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 14500.00,
            'total' => 14560.00,
            'status' => 'Pending',
        ]);

        $order2 = Order::create([
            'order_number' => 'TMB-20260817-RACE2',
            'customer_name' => 'Buyer 2',
            'customer_email' => 'b2@test.com',
            'customer_phone' => '01700000002',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 14500.00,
            'total' => 14560.00,
            'status' => 'Pending',
        ]);

        // Buyer 1 reserves 3 units
        InventoryService::reserveStock($product->id, 3, $order1->id);
        $this->assertEquals(2, $product->fresh()->stock);

        // Buyer 2 reserves remaining 2 units
        InventoryService::reserveStock($product->id, 2, $order2->id);
        $this->assertEquals(0, $product->fresh()->stock);
    }
}
