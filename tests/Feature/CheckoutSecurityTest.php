<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Coupon;
use App\Models\User;
use App\Services\PricingService;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CheckoutSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_calculates_server_authoritative_price_and_ignores_client_tampering(): void
    {
        $category = Category::create(['name' => 'Laptop', 'slug' => 'laptop']);
        $brand = Brand::create(['name' => 'HP', 'slug' => 'hp']);

        $product = Product::create([
            'title' => 'HP Victus 15 Gaming Laptop',
            'slug' => 'hp-victus-15',
            'sku' => 'LAP-HP-VIC15',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 95000.00,
            'regular_price' => 105000.00,
            'stock' => 10,
        ]);

        $user = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'phone' => '01711112222',
        ]);

        // Session cart has item, but client attempts price tampering
        $this->actingAs($user)
            ->withSession([
                'cart' => [
                    $product->id => [
                        'id' => $product->id,
                        'title' => $product->title,
                        'price' => 10.00, // Tampered client price!
                        'quantity' => 1,
                        'total' => 10.00,
                    ]
                ]
            ]);

        $response = $this->post('/checkout', [
            'customer_name' => 'Test Customer',
            'customer_email' => 'customer@test.com',
            'customer_phone' => '01711112222',
            'shipping_address' => 'House 10, Road 5, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
        ]);

        $response->assertRedirect();

        // Database order must reflect server price (95,000 + 60 shipping = 95,060), ignoring client 10.00!
        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Test Customer',
            'subtotal' => 95000.00,
            'shipping_cost' => 60.00,
            'total' => 95060.00,
        ]);

        // Stock must be reserved atomically (10 - 1 = 9)
        $product->refresh();
        $this->assertEquals(9, $product->stock);
    }

    public function test_checkout_rejects_expired_or_invalid_coupons(): void
    {
        $category = Category::create(['name' => 'Components', 'slug' => 'components']);
        $brand = Brand::create(['name' => 'AMD', 'slug' => 'amd']);

        $product = Product::create([
            'title' => 'AMD Ryzen 7 7800X3D',
            'slug' => 'amd-ryzen-7800x3d',
            'sku' => 'CPU-AMD-7800X3D',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 46000.00,
            'stock' => 5,
        ]);

        $coupon = Coupon::create([
            'code' => 'EXPIRED5000',
            'type' => 'fixed',
            'value' => 5000.00,
            'min_spend' => 50000.00,
            'is_active' => false, // Inactive coupon
        ]);

        $cartPayload = [['product_id' => $product->id, 'quantity' => 1]];
        $pricing = PricingService::calculateOrderTotal($cartPayload, 'EXPIRED5000', 120.00);

        // Discount should be 0 since coupon is inactive
        $this->assertEquals(0.00, $pricing['discount']);
        $this->assertEquals(46120.00, $pricing['total']);
    }
}
