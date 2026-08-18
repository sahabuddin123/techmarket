<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\InventoryMovement;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InventoryServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_atomically_reserves_and_releases_inventory_with_audit_trail(): void
    {
        $category = Category::create(['name' => 'Components', 'slug' => 'components']);
        $brand = Brand::create(['name' => 'Intel', 'slug' => 'intel']);

        $product = Product::create([
            'title' => 'Intel Core i5-13400 Processor',
            'slug' => 'intel-i5-13400',
            'sku' => 'CPU-INTEL-13400',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 22500.00,
            'regular_price' => 24500.00,
            'stock' => 10,
        ]);

        // Reserve stock for Order #99
        InventoryService::reserveStock($product->id, 2, 99);

        $product->refresh();
        $this->assertEquals(8, $product->stock);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type' => 'reserved',
            'quantity' => -2,
            'resulting_stock' => 8,
        ]);

        // Release reserved stock for cancelled Order #99
        InventoryService::releaseStock($product->id, 2, 99);

        $product->refresh();
        $this->assertEquals(10, $product->stock);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type' => 'released',
            'quantity' => 2,
            'resulting_stock' => 10,
        ]);
    }
}
