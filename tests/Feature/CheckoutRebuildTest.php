<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CheckoutRebuildTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_page_renders_cleanly_with_cart_items_and_districts()
    {
        $brand = Brand::create(['name' => 'Asus', 'slug' => 'asus', 'is_active' => true]);
        $category = Category::create(['name' => 'Laptops', 'slug' => 'laptops', 'is_active' => true]);

        $product = Product::create([
            'title' => 'Asus Vivobook 16 M1607GA',
            'slug' => 'asus-vivobook-16-m1607ga',
            'sku' => 'VIVO-M1607GA',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 162000,
            'regular_price' => 172000,
            'stock' => 10,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->get('/checkout');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Checkout')
            ->has('cart', 1)
            ->has('districts')
            ->has('summary')
            ->where('summary.total', 162060) // 162,000 + 60 shipping
        );
    }

    public function test_checkout_order_placement_with_cod()
    {
        $category = Category::create(['name' => 'TV', 'slug' => 'tv', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Haier 65 Inch TV',
            'slug' => 'haier-65-inch-tv',
            'sku' => '65P7-PRO',
            'category_id' => $category->id,
            'price' => 92500,
            'regular_price' => 99900,
            'stock' => 5,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->post('/checkout', [
            'customer_name' => 'Sahab Uddin',
            'customer_phone' => '01951413828',
            'district' => 'Faridpur',
            'area' => 'Madhukhali',
            'shipping_address' => 'House 12, Road 3, Madhukhali',
            'payment_method' => 'cod',
            'terms' => true,
        ]);

        $order = Order::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals('cod', $order->payment_method);
        $this->assertEquals('Cash on Delivery', $order->payment_method_label);
        $this->assertEquals('Pending', $order->payment_status);
        $this->assertEquals('Sahab Uddin', $order->customer_name);
        $this->assertEquals(4, $product->fresh()->stock); // Inventory deducted

        $response->assertRedirect(route('checkout.invoice', $order->order_number));
    }

    public function test_checkout_order_placement_with_bkash()
    {
        $category = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Gaming Mouse',
            'slug' => 'gaming-mouse',
            'sku' => 'GM-01',
            'category_id' => $category->id,
            'price' => 2500,
            'regular_price' => 3000,
            'stock' => 8,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 2]);

        $response = $this->post('/checkout', [
            'customer_name' => 'Farhan Ahmed',
            'customer_phone' => '01711223344',
            'district' => 'Dhaka',
            'shipping_address' => 'Dhanmondi 27',
            'payment_method' => 'bkash',
            'terms' => true,
        ]);

        $order = Order::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals('bkash', $order->payment_method);
        $this->assertEquals('bKash', $order->payment_method_label);
        $this->assertEquals('Pending', $order->payment_status);

        $response->assertRedirect(route('payment.bkash.process', $order->order_number));
    }

    public function test_checkout_order_placement_with_nagad()
    {
        $category = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Mechanical Keyboard',
            'slug' => 'mechanical-keyboard',
            'sku' => 'KB-01',
            'category_id' => $category->id,
            'price' => 4500,
            'stock' => 10,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->post('/checkout', [
            'customer_name' => 'Tanvir Hasan',
            'customer_phone' => '01811223344',
            'district' => 'Chittagong',
            'shipping_address' => 'GEC Circle',
            'payment_method' => 'nagad',
            'terms' => true,
        ]);

        $order = Order::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals('nagad', $order->payment_method);
        $this->assertEquals('Nagad', $order->payment_method_label);
        $this->assertEquals('Pending', $order->payment_status);

        $response->assertRedirect(route('payment.nagad.process', $order->order_number));
    }

    public function test_checkout_rejects_legacy_and_invalid_payment_methods()
    {
        $category = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Flash Drive',
            'slug' => 'flash-drive',
            'sku' => 'FD-01',
            'category_id' => $category->id,
            'price' => 800,
            'stock' => 10,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

        $disallowedMethods = [
            'bank_transfer',
            'online_payment',
            'sslcommerz',
            'cash_pickup',
            'Rocket',
            'Card',
            'paypal',
            'stripe',
            'random_value',
        ];

        foreach ($disallowedMethods as $invalidMethod) {
            $response = $this->post('/checkout', [
                'customer_name' => 'Test User',
                'customer_phone' => '01700000000',
                'district' => 'Dhaka',
                'shipping_address' => 'Test Address',
                'payment_method' => $invalidMethod,
                'terms' => true,
            ]);

            $response->assertSessionHasErrors('payment_method');
        }
    }

    public function test_checkout_fails_when_payment_method_is_missing()
    {
        $category = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Headset',
            'slug' => 'headset',
            'sku' => 'HS-01',
            'category_id' => $category->id,
            'price' => 1500,
            'stock' => 5,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->post('/checkout', [
            'customer_name' => 'User',
            'customer_phone' => '01711111111',
            'district' => 'Dhaka',
            'shipping_address' => 'Mirpur 10',
            'payment_method' => '',
        ]);

        $response->assertSessionHasErrors('payment_method');
    }

    public function test_checkout_fails_when_phone_or_name_missing()
    {
        $category = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'is_active' => true]);
        $product = Product::create([
            'title' => 'Headset',
            'slug' => 'headset',
            'sku' => 'HS-01',
            'category_id' => $category->id,
            'price' => 1500,
            'stock' => 5,
        ]);

        $this->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->post('/checkout', [
            'customer_name' => '',
            'customer_phone' => '',
            'district' => 'Dhaka',
            'shipping_address' => 'Mirpur 10',
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors(['customer_name', 'customer_phone']);
    }

    public function test_order_history_displays_saved_payment_method_correctly()
    {
        $user = User::factory()->create();
        $orderCod = Order::create([
            'order_number' => 'TMB-20260817-111111',
            'user_id' => $user->id,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '01951413828',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'payment_status' => 'Pending',
            'shipping_cost' => 60,
            'subtotal' => 1000,
            'discount' => 0,
            'total' => 1060,
            'status' => 'Pending',
        ]);

        $this->assertEquals('Cash on Delivery', $orderCod->payment_method_label);

        $orderBkash = Order::create([
            'order_number' => 'TMB-20260817-222222',
            'user_id' => $user->id,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '01951413828',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'bkash',
            'payment_status' => 'Pending',
            'shipping_cost' => 60,
            'subtotal' => 2000,
            'discount' => 0,
            'total' => 2060,
            'status' => 'Pending',
        ]);

        $this->assertEquals('bKash', $orderBkash->payment_method_label);

        $orderNagad = Order::create([
            'order_number' => 'TMB-20260817-333333',
            'user_id' => $user->id,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '01951413828',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'nagad',
            'payment_status' => 'Pending',
            'shipping_cost' => 60,
            'subtotal' => 3000,
            'discount' => 0,
            'total' => 3060,
            'status' => 'Pending',
        ]);

        $this->assertEquals('Nagad', $orderNagad->payment_method_label);

        $this->actingAs($user)
            ->get('/account/orders/history')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Account/OrderHistory')
                ->has('orders.data', 3)
            );
    }
}
