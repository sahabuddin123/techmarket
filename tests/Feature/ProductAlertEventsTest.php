<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use App\Models\ProductAlert;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductAlertEventsTest extends TestCase
{
    use RefreshDatabase;

    public function test_triggers_back_in_stock_alerts_when_stock_increases_from_zero(): void
    {
        $category = Category::create(['name' => 'GPUs', 'slug' => 'gpus']);
        $brand = Brand::create(['name' => 'MSI', 'slug' => 'msi']);

        $product = Product::create([
            'title' => 'MSI RTX 4090 Gaming X Slim',
            'slug' => 'msi-rtx-4090-slim',
            'sku' => 'GPU-MSI-4090S',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 245000.00,
            'stock' => 0, // Out of stock
        ]);

        $subscriber = User::create([
            'name' => 'GPU Subscriber',
            'email' => 'sub@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $alert = ProductAlert::create([
            'user_id' => $subscriber->id,
            'product_id' => $product->id,
            'type' => 'back_in_stock',
            'status' => 'active',
        ]);

        // Increase inventory stock from 0 to 5 via InventoryService with type 'adjustment'
        InventoryService::adjustStock($product->id, 5, 'adjustment', null, null, null, 'Restocked RTX 4090');

        $alert->refresh();
        $this->assertEquals('triggered', $alert->status);
        $this->assertNotNull($alert->last_notified_at);
    }
}
