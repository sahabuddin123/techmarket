<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Coupon;
use App\Models\Order;
use App\Services\InventoryService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FullCustomerPurchaseJourneyTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_end_to_end_customer_purchase_journey(): void
    {
        $customer = User::create(['name' => 'Journey Customer', 'email' => 'journey@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);
        $category = Category::create(['name' => 'Monitors', 'slug' => 'monitors']);
        $brand = Brand::create(['name' => 'ASUS', 'slug' => 'asus']);

        $product = Product::create([
            'title' => 'ASUS ROG Swift 27" 240Hz',
            'slug' => 'asus-rog-swift-27',
            'sku' => 'MON-ASU-27',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 52000.00,
            'stock' => 8,
        ]);

        $coupon = Coupon::create([
            'code' => 'TECH500',
            'type' => 'fixed',
            'value' => 500.00,
            'is_active' => true,
        ]);

        $this->actingAs($customer);
        $this->session([
            'cart' => [
                $product->id => [
                    'id' => $product->id,
                    'product_id' => $product->id,
                    'title' => $product->title,
                    'price' => 52000.00,
                    'quantity' => 1,
                    'total' => 52000.00,
                ]
            ]
        ]);

        // Submit Checkout
        $response = $this->post('/checkout', [
            'customer_name' => 'Journey Customer',
            'customer_email' => 'journey@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Multiplan Center, Level 4, Shop 402, Elephant Road',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'coupon_code' => 'TECH500',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // Verify order created in DB with server-authoritative totals
        $order = Order::where('customer_email', 'journey@test.com')->first();
        $this->assertNotNull($order);
        $this->assertEquals(51560.00, $order->total); // 52000 - 500 + 60 shipping

        // Verify inventory reserved
        $this->assertEquals(7, $product->fresh()->stock);

        // Verify invoice page accessible
        $invRes = $this->get("/invoice/{$order->order_number}");
        $invRes->assertStatus(200);
    }
}
