<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Cctv\CctvProductProfile;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvPublicEstimatorTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_cctv_estimator_page_renders_with_real_catalog_data(): void
    {
        $category = Category::create([
            'name' => 'Surveillance',
            'slug' => 'surveillance',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Dahua 2MP Eyeball Dome IP Camera',
            'slug' => 'dahua-2mp-eyeball-dome-ip-camera',
            'sku' => 'DH-IPC-HDW1230T1',
            'price' => 2800,
            'stock' => 20,
            'is_active' => true,
        ]);

        CctvProductProfile::create([
            'product_id' => $product->id,
            'product_type' => 'camera',
            'system_type' => 'ip',
            'resolution_mp' => 2.0,
            'camera_form_factor' => 'dome',
            'lens_mm' => 2.8,
            'ir_distance_meters' => 30,
            'audio_type' => 'built_in_mic',
            'environment' => 'both',
            'is_active' => true,
        ]);

        $response = $this->get('/cctv-estimator');

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('CctvEstimator')
                ->has('catalogCameras')
                ->has('engineSettings')
            );
    }

    public function test_add_to_cart_revalidates_live_prices_and_pushes_to_session_cart(): void
    {
        $category = Category::create([
            'name' => 'CCTV Accessories',
            'slug' => 'cctv-accessories',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Cat6 UTP 305m Box',
            'slug' => 'cat6-utp-305m-box',
            'sku' => 'CBL-CAT6-305M',
            'price' => 5200,
            'stock' => 15,
            'is_active' => true,
        ]);

        $payload = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'name' => $product->title,
                    'sku' => $product->sku,
                    'unit_price' => 5000, // Price in estimate was 5000, live is 5200
                    'quantity' => 2,
                ]
            ]
        ];

        $response = $this->postJson('/cctv-estimator/add-to-cart', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.cart_count', 2)
            ->assertJsonPath('data.cart_total', 10400); // 2 * 5200 (live price used!)

        // Check price change was recorded
        $this->assertNotEmpty($response->json('data.price_changes'));
    }

    public function test_add_to_cart_blocks_out_of_stock_hardware(): void
    {
        $category = Category::create([
            'name' => 'Recorders',
            'slug' => 'recorders',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Hikvision 8CH NVR',
            'slug' => 'hikvision-8ch-nvr',
            'sku' => 'HIK-NVR-8CH',
            'price' => 8500,
            'stock' => 0, // Out of stock!
            'is_active' => true,
        ]);

        $payload = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'name' => $product->title,
                    'quantity' => 1,
                    'unit_price' => 8500,
                ]
            ]
        ];

        $response = $this->postJson('/cctv-estimator/add-to-cart', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'warning')
            ->assertJsonStructure(['unavailable_items']);
    }
}
