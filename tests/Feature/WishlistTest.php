<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_toggle_items_in_database_wishlist(): void
    {
        $category = Category::create(['name' => 'Accessories', 'slug' => 'accessories']);
        $brand = Brand::create(['name' => 'Logitech', 'slug' => 'logitech']);

        $product = Product::create([
            'title' => 'Logitech MX Master 3S Mouse',
            'slug' => 'logitech-mx-master-3s',
            'sku' => 'MOU-LOG-MX3S',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 12500.00,
            'stock' => 15,
        ]);

        $user = User::create([
            'name' => 'Wishlist Customer',
            'email' => 'wishlist@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        // Add item to wishlist
        $response = $this->actingAs($user)->post('/wishlist/toggle', [
            'product_id' => $product->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        // Toggle again to remove
        $response2 = $this->actingAs($user)->post('/wishlist/toggle', [
            'product_id' => $product->id,
        ]);

        $response2->assertRedirect();
        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_guest_wishlist_merges_into_authenticated_database_wishlist(): void
    {
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio']);
        $brand = Brand::create(['name' => 'Razer', 'slug' => 'razer']);

        $product1 = Product::create([
            'title' => 'Razer BlackShark V2 Headset',
            'slug' => 'razer-blackshark-v2',
            'sku' => 'AUD-RAZ-BSV2',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 8500.00,
            'stock' => 10,
        ]);

        $user = User::create([
            'name' => 'Merge Customer',
            'email' => 'merge@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        // Post merge endpoint
        $response = $this->actingAs($user)->postJson('/wishlist/merge', [
            'product_ids' => [$product1->id]
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product1->id,
        ]);
    }
}
