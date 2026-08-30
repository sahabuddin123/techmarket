<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Media;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PlatformProductionReadinessAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $customerUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::create([
            'name' => 'Platform Admin',
            'email' => 'platform.admin@techmarket.com.bd',
            'password' => bcrypt('AdminPassword123!'),
            'role' => 'admin',
            'is_admin' => true,
        ]);

        $this->customerUser = User::create([
            'name' => 'Fahim Hasan',
            'email' => 'fahim.hasan@gmail.com',
            'password' => bcrypt('CustomerSecret123!'),
            'role' => 'customer',
            'is_admin' => false,
        ]);
    }

    public function test_admin_product_management_reflects_on_live_storefront(): void
    {
        $this->actingAs($this->adminUser);

        $category = Category::create(['name' => 'Graphics Card', 'slug' => 'graphics-card']);
        $brand = Brand::create(['name' => 'NVIDIA', 'slug' => 'nvidia']);

        // 1. Admin creates product with SEO metadata
        $response = $this->post(route('admin.products.store'), [
            'title' => 'GeForce RTX 4080 Super Gaming Edition',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'sku' => 'GPU-NV-4080S-01',
            'price' => 145000.00,
            'regular_price' => 155000.00,
            'stock' => 12,
            'is_active' => true,
            'seo_title' => 'GeForce RTX 4080 Super Price in Bangladesh | TechMarket',
            'meta_description' => 'Buy original GeForce RTX 4080 Super Graphics Card at the best price in BD with official warranty.',
            'focus_keyword' => 'RTX 4080 Super',
        ]);

        $response->assertRedirect(route('admin.products'));

        $product = Product::where('sku', 'GPU-NV-4080S-01')->first();
        $this->assertNotNull($product);
        $this->assertEquals('geforce-rtx-4080-super-gaming-edition', $product->slug);

        // 2. Public Storefront Catalog & Product Detail
        $detailResponse = $this->get("/product/{$product->slug}");
        $detailResponse->assertOk();
        $detailResponse->assertSee('RTX 4080 Super');
    }

    public function test_admin_category_management_reflects_in_catalog(): void
    {
        $this->actingAs($this->adminUser);

        $response = $this->post(route('admin.categories.store'), [
            'name' => 'Custom Liquid Cooling',
            'slug' => 'custom-liquid-cooling',
            'icon' => 'Zap',
            'is_featured' => true,
            'is_nav_visible' => true,
        ]);

        $response->assertRedirect(route('admin.categories'));

        $category = Category::where('slug', 'custom-liquid-cooling')->first();
        $this->assertNotNull($category);

        $publicResponse = $this->get("/category/{$category->slug}");
        $publicResponse->assertOk();
        $publicResponse->assertSee('Custom Liquid Cooling');
    }

    public function test_centralized_media_library_upload_and_validation(): void
    {
        Storage::fake('public');
        $this->actingAs($this->adminUser);

        // 1. Upload valid image
        $file = UploadedFile::fake()->image('banner_hero.jpg', 1200, 400)->size(500);
        $response = $this->post('/admin/media/upload', [
            'file' => $file,
            'alt_text' => 'Hero Homepage Banner',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('media', [
            'original_name' => 'banner_hero.jpg',
            'alt_text' => 'Hero Homepage Banner',
        ]);

        // 2. Reject disallowed file type
        $badFile = UploadedFile::fake()->create('malicious.exe', 100, 'application/x-msdownload');
        $badResponse = $this->post('/admin/media/upload', [
            'file' => $badFile,
        ]);
        $badResponse->assertSessionHasErrors('file');
    }

    public function test_dynamic_meta_and_google_feeds_generate_valid_products(): void
    {
        $category = Category::create(['name' => 'Processors', 'slug' => 'processors']);
        $product = Product::create([
            'title' => 'AMD Ryzen 7 7800X3D Gaming Processor',
            'slug' => 'amd-ryzen-7-7800x3d',
            'category_id' => $category->id,
            'sku' => 'CPU-AMD-7800X3D',
            'price' => 46000.00,
            'regular_price' => 49000.00,
            'stock' => 15,
            'is_active' => true,
            'image' => '/images/products/ryzen7800.jpg',
            'description' => 'Ultimate gaming desktop processor with 3D V-Cache technology.',
        ]);

        // 1. Meta CSV Feed
        $csvResponse = $this->get('/feeds/meta-products.csv');
        $csvResponse->assertOk();
        $csvResponse->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('AMD Ryzen 7 7800X3D', $csvResponse->getContent());
        $this->assertStringContainsString('46000.00 BDT', $csvResponse->getContent());
        $this->assertStringContainsString('PRODUCT_' . $product->id, $csvResponse->getContent());

        // 2. Meta XML Feed
        $xmlResponse = $this->get('/feeds/meta-products.xml');
        $xmlResponse->assertOk();
        $xmlResponse->assertHeader('Content-Type', 'application/xml');
        $this->assertStringContainsString('<g:id>PRODUCT_' . $product->id . '</g:id>', $xmlResponse->getContent());
        $this->assertStringContainsString('<g:price>49000.00 BDT</g:price>', $xmlResponse->getContent());
        $this->assertStringContainsString('<g:sale_price>46000.00 BDT</g:sale_price>', $xmlResponse->getContent());
    }

    public function test_global_settings_persistence_and_cache_invalidation(): void
    {
        $this->actingAs($this->adminUser);

        $response = $this->post(route('admin.settings.update'), [
            'site_name' => 'TechMarket Bangladesh Flagship',
            'hotline_phone' => '09678123456',
            'free_shipping_min_amount' => '10000',
        ]);

        $response->assertRedirect();
        $this->assertEquals('TechMarket Bangladesh Flagship', Setting::get('site_name'));
        $this->assertEquals('09678123456', Setting::get('hotline_phone'));
        $this->assertEquals('10000', Setting::get('free_shipping_min_amount'));
    }

    public function test_inventory_reservation_and_release_consistency(): void
    {
        $category = Category::create(['name' => 'Memory', 'slug' => 'memory']);
        $product = Product::create([
            'title' => 'Kingston Fury Beast 16GB DDR5',
            'slug' => 'kingston-fury-beast-16gb',
            'category_id' => $category->id,
            'sku' => 'RAM-KF-D5-16G',
            'price' => 7500.00,
            'stock' => 20,
            'is_active' => true,
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260818-INV01',
            'user_id' => $this->customerUser->id,
            'customer_name' => 'Fahim Hasan',
            'customer_email' => 'fahim.hasan@gmail.com',
            'customer_phone' => '01711000000',
            'shipping_address' => 'Mirpur DOHS, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 15000.00,
            'total' => 15060.00,
            'status' => 'Pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->title,
            'price' => $product->price,
            'quantity' => 2,
            'total' => 15000.00,
        ]);

        // 1. Reserve 2 units
        InventoryService::reserveStock($product->id, 2, $order->id);
        $product->refresh();
        $this->assertEquals(18, $product->stock);

        // 2. Release 2 units on cancellation
        InventoryService::releaseStock($product->id, 2, $order->id);
        $product->refresh();
        $this->assertEquals(20, $product->stock);
    }
}
