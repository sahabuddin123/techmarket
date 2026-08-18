<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Services\RecommendationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RecommendationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_recommendation_service_calculates_related_and_trending_products(): void
    {
        $category = Category::create(['name' => 'Laptops', 'slug' => 'laptops']);
        $brand = Brand::create(['name' => 'Asus', 'slug' => 'asus']);

        $p1 = Product::create(['title' => 'Asus ZenBook 14', 'slug' => 'asus-zenbook-14', 'sku' => 'LAP-ASU-ZB14', 'category_id' => $category->id, 'brand_id' => $brand->id, 'price' => 115000.00, 'stock' => 10, 'is_featured' => true]);
        $p2 = Product::create(['title' => 'Asus ROG Strix G16', 'slug' => 'asus-rog-g16', 'sku' => 'LAP-ASU-G16', 'category_id' => $category->id, 'brand_id' => $brand->id, 'price' => 185000.00, 'stock' => 5, 'is_featured' => true]);

        $related = RecommendationService::getRelatedProducts($p1, 4);
        $this->assertCount(1, $related);
        $this->assertEquals($p2->id, $related->first()->id);

        $trending = RecommendationService::getTrendingProducts(6);
        $this->assertGreaterThanOrEqual(1, $trending->count());
    }
}
