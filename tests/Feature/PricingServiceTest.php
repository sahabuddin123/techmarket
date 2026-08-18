<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Coupon;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PricingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resolves_standard_sale_price_and_coupon_discount(): void
    {
        $category = Category::create(['name' => 'Laptop', 'slug' => 'laptop']);
        $brand = Brand::create(['name' => 'Asus', 'slug' => 'asus']);

        $product = Product::create([
            'title' => 'Asus ROG Gaming Laptop',
            'slug' => 'asus-rog-laptop',
            'sku' => 'LAP-ASUS-01',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 100000.00,
            'regular_price' => 120000.00,
            'stock' => 10,
        ]);

        $coupon = Coupon::create([
            'code' => 'SAVE1000',
            'type' => 'fixed',
            'value' => 1000.00,
            'min_spend' => 50000.00,
            'is_active' => true,
        ]);

        $cartPayload = [
            ['product_id' => $product->id, 'quantity' => 1]
        ];

        $pricing = PricingService::calculateOrderTotal($cartPayload, 'SAVE1000', 60.00);

        $this->assertEquals(100000.00, $pricing['subtotal']);
        $this->assertEquals(1000.00, $pricing['discount']);
        $this->assertEquals(60.00, $pricing['shipping_cost']);
        $this->assertEquals(99060.00, $pricing['total']);
    }
}
