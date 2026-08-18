<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use App\Services\RecentlyViewedService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RecentlyViewedProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_logs_recently_viewed_products_for_authenticated_users_and_guests(): void
    {
        $category = Category::create(['name' => 'Processors', 'slug' => 'processors']);
        $brand = Brand::create(['name' => 'Intel', 'slug' => 'intel']);

        $product = Product::create([
            'title' => 'Intel Core i9-14900K',
            'slug' => 'intel-core-i9-14900k',
            'sku' => 'CPU-INT-14900K',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 68000.00,
            'stock' => 10,
        ]);

        $user = User::create(['name' => 'View User', 'email' => 'view@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);

        $this->actingAs($user);
        RecentlyViewedService::logView($product);

        $recentlyViewed = RecentlyViewedService::getRecentlyViewed(5);
        $this->assertCount(1, $recentlyViewed);
        $this->assertEquals($product->id, $recentlyViewed->first()->id);
    }
}
