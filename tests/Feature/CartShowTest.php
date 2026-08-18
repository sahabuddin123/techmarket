<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use App\Models\LoyaltyTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CartShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_page_renders_cleanly_when_empty()
    {
        $response = $this->get('/cart');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Cart')
            ->has('cart', 0)
            ->has('summary')
            ->where('summary.total', 0)
        );
    }

    public function test_cart_page_renders_with_items_and_authoritative_calculations()
    {
        $brand = Brand::create(['name' => 'Asus', 'slug' => 'asus', 'is_active' => true]);
        $category = Category::create(['name' => 'Laptops', 'slug' => 'laptops', 'is_active' => true]);

        $product1 = Product::create([
            'title' => 'Asus Vivobook 16',
            'slug' => 'asus-vivobook-16',
            'sku' => 'VIVO-16-01',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 162000,
            'regular_price' => 172000,
            'stock' => 5,
        ]);

        $product2 = Product::create([
            'title' => 'Haier 65 Inch TV',
            'slug' => 'haier-65-inch-tv',
            'sku' => '65P7-PRO',
            'category_id' => $category->id,
            'price' => 92500,
            'regular_price' => 99900,
            'stock' => 3,
        ]);

        // Add both to session cart
        $this->post('/cart/add', ['product_id' => $product1->id, 'quantity' => 1]);
        $this->post('/cart/add', ['product_id' => $product2->id, 'quantity' => 1]);

        $response = $this->get('/cart');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Cart')
            ->has('cart', 2)
            ->has('summary')
            ->where('summary.item_count', 2)
            ->where('summary.subtotal', 271900) // 172,000 + 99,900
            ->where('summary.discount', 17400) // 10,000 + 7,400 savings
            ->where('summary.total', 254500) // 162,000 + 92,500
        );
    }

    public function test_cart_quantity_update_and_item_removal()
    {
        $category = Category::create(['name' => 'Monitors', 'slug' => 'monitors', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Gaming Monitor',
            'slug' => 'gaming-monitor',
            'sku' => 'MON-144',
            'category_id' => $category->id,
            'price' => 25000,
            'regular_price' => 28000,
            'stock' => 10,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

        // Update quantity
        $updateResp = $this->post('/cart/update', ['product_id' => $product->id, 'quantity' => 3]);
        $updateResp->assertSessionHas('cart');
        $this->assertEquals(3, session('cart')[$product->id]['quantity']);

        // Remove item
        $removeResp = $this->post('/cart/remove', ['product_id' => $product->id]);
        $this->assertArrayNotHasKey($product->id, session('cart', []));
    }

    public function test_cart_clear_all_action()
    {
        $category = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Mouse Pad',
            'slug' => 'mouse-pad',
            'sku' => 'PAD-01',
            'category_id' => $category->id,
            'price' => 500,
            'stock' => 20,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 2]);
        $this->assertNotEmpty(session('cart'));

        $this->post('/cart/clear');
        $this->assertEmpty(session('cart', []));
    }

    public function test_coupon_application_and_removal()
    {
        $category = Category::create(['name' => 'Laptops', 'slug' => 'laptops', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Office Laptop',
            'slug' => 'office-laptop',
            'sku' => 'LAP-001',
            'category_id' => $category->id,
            'price' => 50000,
            'regular_price' => 50000,
            'stock' => 5,
        ]);

        Coupon::create([
            'code' => 'TECH500',
            'type' => 'fixed',
            'value' => 500,
            'min_spend' => 1000,
            'is_active' => true,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

        // Apply coupon
        $applyResp = $this->post('/cart/coupon', ['code' => 'tech500']);
        $applyResp->assertSessionHas('cart_coupon', 'TECH500');

        // Check cart calculations with coupon
        $response = $this->get('/cart');
        $response->assertInertia(fn (Assert $page) => $page
            ->where('summary.coupon_discount', 500)
            ->where('summary.total', 49500)
        );

        // Remove coupon
        $removeResp = $this->delete('/cart/coupon');
        $removeResp->assertSessionMissing('cart_coupon');
    }
}
