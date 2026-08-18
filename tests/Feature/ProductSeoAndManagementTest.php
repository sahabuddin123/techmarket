<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSlugRedirect;
use App\Models\User;
use App\Services\ProductSeoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSeoAndManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Category $category;
    protected Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->category = Category::create([
            'name' => 'Graphics Cards',
            'slug' => 'graphics-cards',
            'is_nav_visible' => true,
        ]);

        $this->brand = Brand::create([
            'name' => 'ASUS',
            'slug' => 'asus',
        ]);
    }

    public function test_product_creation_generates_collision_free_clean_slug(): void
    {
        $this->actingAs($this->adminUser);

        // First product
        $response1 = $this->post('/admin/products', [
            'title' => 'ASUS ROG Strix RTX 4080 Super OC',
            'sku' => 'ROG-4080S-01',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 155000,
            'stock' => 10,
            'seo_title' => 'ASUS ROG Strix RTX 4080 Super Price in Bangladesh',
            'meta_description' => 'Buy ASUS ROG Strix RTX 4080 Super at best price in BD with official warranty.',
            'focus_keyword' => 'RTX 4080 Super',
            'is_indexable' => true,
        ]);

        $response1->assertRedirect('/admin/products');
        $p1 = Product::where('sku', 'ROG-4080S-01')->first();
        $this->assertNotNull($p1);
        $this->assertEquals('asus-rog-strix-rtx-4080-super-oc', $p1->slug);
        $this->assertGreaterThan(50, $p1->seo_score);

        // Second product with duplicate name resolves collision cleanly (-2)
        $response2 = $this->post('/admin/products', [
            'title' => 'ASUS ROG Strix RTX 4080 Super OC',
            'sku' => 'ROG-4080S-02',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 155000,
            'stock' => 5,
        ]);

        $response2->assertRedirect('/admin/products');
        $p2 = Product::where('sku', 'ROG-4080S-02')->first();
        $this->assertNotNull($p2);
        $this->assertEquals('asus-rog-strix-rtx-4080-super-oc-2', $p2->slug);
    }

    public function test_slug_modification_registers_301_permanent_redirect(): void
    {
        $this->actingAs($this->adminUser);

        $product = Product::create([
            'title' => 'AMD Ryzen 7 7800X3D Processor',
            'slug' => 'amd-ryzen-7-7800x3d',
            'sku' => 'AMD-7800X3D',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 45000,
            'stock' => 15,
            'is_active' => true,
        ]);

        // Update product with new slug
        $response = $this->put("/admin/products/{$product->id}", [
            'title' => 'AMD Ryzen 7 7800X3D Gaming Processor',
            'seo_slug' => 'amd-ryzen-7-7800x3d-gaming-processor',
            'sku' => 'AMD-7800X3D',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 45000,
            'stock' => 15,
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/products');

        $product->refresh();
        $this->assertEquals('amd-ryzen-7-7800x3d-gaming-processor', $product->slug);

        // Verify redirect registered in database
        $this->assertDatabaseHas('product_slug_redirects', [
            'product_id' => $product->id,
            'old_slug' => 'amd-ryzen-7-7800x3d',
            'new_slug' => 'amd-ryzen-7-7800x3d-gaming-processor',
        ]);

        // Verify accessing old slug issues 301 Permanent Redirect
        $redirectResponse = $this->get('/product/amd-ryzen-7-7800x3d');
        $redirectResponse->assertStatus(301);
        $redirectResponse->assertRedirect('/product/amd-ryzen-7-7800x3d-gaming-processor');
    }

    public function test_seo_fallback_hierarchy_and_structured_data_resolution(): void
    {
        $product = Product::create([
            'title' => 'Gigabyte B650 AORUS Elite AX Motherboard',
            'slug' => 'gigabyte-b650-aorus-elite-ax',
            'sku' => 'GB-B650-ELITE',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 28500,
            'stock' => 8,
            'image' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
            'description' => '<p>High-end AMD AM5 ATX motherboard with DDR5 support.</p>',
            'is_active' => true,
            'is_indexable' => true,
        ]);

        $seo = ProductSeoService::resolveProductSeo($product);

        // Fallback checks with description present
        $this->assertStringContainsString('Gigabyte B650 AORUS Elite AX Motherboard', $seo['title']);
        $this->assertStringContainsString('High-end AMD AM5 ATX motherboard', $seo['description']);
        $this->assertEquals(url('/product/gigabyte-b650-aorus-elite-ax'), $seo['canonical_url']);
        $this->assertEquals('index, follow', $seo['meta_robots']);
        $this->assertEquals('product', $seo['og']['type']);

        // Test fallback when description is also empty
        $pEmpty = Product::create([
            'title' => 'Kingston Fury Beast 16GB DDR5 5600MHz RAM',
            'slug' => 'kingston-fury-beast-16gb-ddr5',
            'sku' => 'KF-DDR5-16GB',
            'category_id' => $this->category->id,
            'price' => 6500,
            'stock' => 20,
            'is_active' => true,
        ]);
        $seoEmpty = ProductSeoService::resolveProductSeo($pEmpty);
        $this->assertStringContainsString('Buy Kingston Fury Beast 16GB DDR5 5600MHz RAM', $seoEmpty['description']);

        // Structured data checks
        $jsonLd = $seo['json_ld'];
        $this->assertEquals('https://schema.org/', $jsonLd['@context']);
        $this->assertEquals('Product', $jsonLd['@type']);
        $this->assertEquals('Gigabyte B650 AORUS Elite AX Motherboard', $jsonLd['name']);
        $this->assertEquals('BDT', $jsonLd['offers']['priceCurrency']);
        $this->assertEquals('28500.00', $jsonLd['offers']['price']);
        $this->assertEquals('https://schema.org/InStock', $jsonLd['offers']['availability']);
    }

    public function test_sitemap_xml_contains_indexable_products_and_excludes_noindex_or_drafts(): void
    {
        // 1. Published and indexable product (should appear)
        $pActive = Product::create([
            'title' => 'LG UltraGear 27GR95QE OLED Gaming Monitor',
            'slug' => 'lg-ultragear-27gr95qe-oled',
            'sku' => 'LG-27GR95QE',
            'category_id' => $this->category->id,
            'price' => 110000,
            'stock' => 4,
            'is_active' => true,
            'is_indexable' => true,
        ]);

        // 2. Draft / Inactive product (should NOT appear)
        $pDraft = Product::create([
            'title' => 'Upcoming RTX 5090 Prototype',
            'slug' => 'rtx-5090-prototype',
            'sku' => 'RTX-5090-PROTO',
            'category_id' => $this->category->id,
            'price' => 300000,
            'stock' => 0,
            'is_active' => false,
            'is_indexable' => true,
        ]);

        // 3. Explicit Noindex product (should NOT appear)
        $pNoindex = Product::create([
            'title' => 'Private Refurbished Unit',
            'slug' => 'private-refurbished-unit',
            'sku' => 'REFURB-001',
            'category_id' => $this->category->id,
            'price' => 12000,
            'stock' => 1,
            'is_active' => true,
            'is_indexable' => false,
            'meta_robots' => 'noindex, nofollow',
        ]);

        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/xml; charset=utf-8');

        $content = $response->getContent();
        $this->assertStringContainsString('/product/lg-ultragear-27gr95qe-oled', $content);
        $this->assertStringContainsString('/category/graphics-cards', $content);
        $this->assertStringNotContainsString('/product/rtx-5090-prototype', $content);
        $this->assertStringNotContainsString('/product/private-refurbished-unit', $content);
    }

    public function test_robots_txt_disallows_private_routes_and_references_sitemap(): void
    {
        $response = $this->get('/robots.txt');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');

        $content = $response->getContent();
        $this->assertStringContainsString('Disallow: /admin/', $content);
        $this->assertStringContainsString('Disallow: /checkout', $content);
        $this->assertStringContainsString('Disallow: /cart', $content);
        $this->assertStringContainsString('Sitemap: ' . url('/sitemap.xml'), $content);
    }

    public function test_bulk_seo_actions_and_health_filters(): void
    {
        $this->actingAs($this->adminUser);

        $p1 = Product::create([
            'title' => 'Corsair RM850e 850W Gold Power Supply',
            'slug' => 'corsair-rm850e-850w',
            'sku' => 'COR-RM850E',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 14500,
            'stock' => 10,
            'is_active' => true,
        ]);

        // Run bulk auto-generation
        $response = $this->post('/admin/products/bulk-seo', [
            'action' => 'generate_missing_meta',
            'product_ids' => [$p1->id],
        ]);

        $response->assertSessionHas('success');

        $p1->refresh();
        $this->assertNotEmpty($p1->seo_title);
        $this->assertNotEmpty($p1->meta_description);
        $this->assertNotEmpty($p1->focus_keyword);
        $this->assertGreaterThan(50, $p1->seo_score);

        // Test filtering by SEO health
        $filterResponse = $this->get('/admin/products?seo_health=good');
        $filterResponse->assertStatus(200);
    }
}
