<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Setting;
use App\Http\Controllers\FeedController;
use App\Services\MetaConversionsApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductFeedTest extends TestCase
{
    use RefreshDatabase;

    protected Category $category;
    protected Brand $brand;
    protected Product $activeProduct;
    protected Product $inactiveProduct;
    protected Product $productWithMissingImage;
    protected Product $productWithSpecialChars;

    protected function setUp(): void
    {
        parent::setUp();

        Setting::set('meta_feed_enabled', '1', 'marketing');
        Setting::set('feed_include_out_of_stock', '1', 'marketing');
        Setting::set('feed_default_brand', 'TechLand BD', 'marketing');
        Setting::set('feed_currency', 'BDT', 'marketing');

        $this->category = Category::create([
            'name' => 'Laptops & Ultrabooks & Accessories',
            'slug' => 'laptops-ultrabooks',
        ]);

        $this->brand = Brand::create([
            'name' => 'Apple & Beats',
            'slug' => 'apple-beats',
        ]);

        // Standard active product
        $this->activeProduct = Product::create([
            'title' => 'Apple MacBook Pro 16" M3 Max <Special Edition>',
            'slug' => 'apple-macbook-pro-16-m3-max',
            'sku' => 'MBP16-M3MAX-01',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 385000.00,
            'regular_price' => 410000.00,
            'stock' => 15,
            'is_active' => true,
            'image' => 'products/mbp16.jpg',
            'gallery' => ['products/mbp16-side.jpg', 'products/mbp16-ports.jpg', null, ''],
            'description' => 'Flagship MacBook with 16-core CPU & 40-core GPU. High dynamic range screen.',
        ]);

        // Inactive / draft product
        $this->inactiveProduct = Product::create([
            'title' => 'Secret Prototype Device (Unpublished)',
            'slug' => 'secret-prototype-device',
            'sku' => 'SECRET-001',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 999999.00,
            'stock' => 5,
            'is_active' => false,
        ]);

        // Product with missing image and missing gallery
        $this->productWithMissingImage = Product::create([
            'title' => 'Budget USB-C Cable (No Image)',
            'slug' => 'budget-usbc-cable-no-image',
            'sku' => 'CAB-USBC-01',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 450.00,
            'stock' => 50,
            'is_active' => true,
            'image' => null,
            'gallery' => null,
            'description' => null,
        ]);

        // Product with special characters, HTML, and ampersands
        $this->productWithSpecialChars = Product::create([
            'title' => 'Razer Blade 18" "Extreme" & 100% sRGB <Gaming Rig>',
            'slug' => 'razer-blade-18-extreme',
            'sku' => 'RZ-BLADE-18',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 495000.00,
            'stock' => 2,
            'is_active' => true,
            'image' => 'https://cdn.example.com/razer-18.png',
            'description' => '<p>Massive 18" QHD+ 300Hz display & ultra-fast cooling! <b>No lag!</b></p>',
        ]);
    }

    public function test_meta_xml_endpoint_returns_http_200(): void
    {
        $response = $this->get('/feeds/meta-products.xml');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');
    }

    public function test_meta_xml_has_valid_xml_structure(): void
    {
        $response = $this->get('/feeds/meta-products.xml');
        $xmlContent = $response->getContent();

        // Must be parsed cleanly by SimpleXML without errors
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlContent);
        $errors = libxml_get_errors();
        libxml_clear_errors();

        $this->assertEmpty($errors, 'XML feed contains formatting syntax errors.');
        $this->assertNotFalse($xml, 'Failed to parse Meta XML feed.');
        $this->assertEquals('rss', $xml->getName());
        $this->assertNotNull($xml->channel);
    }

    public function test_meta_xml_contains_product_records_and_canonical_id(): void
    {
        $response = $this->get('/feeds/meta-products.xml');
        $content = $response->getContent();

        $canonicalId = MetaConversionsApiService::canonicalContentId($this->activeProduct->id);
        $this->assertStringContainsString("<g:id>{$canonicalId}</g:id>", $content);
        $this->assertStringContainsString('385000.00 BDT', $content);
        $this->assertStringContainsString('410000.00 BDT', $content);
        $this->assertStringContainsString('<g:availability>in stock</g:availability>', $content);
        $this->assertStringContainsString('<g:condition>new</g:condition>', $content);
    }

    public function test_product_and_image_urls_are_absolute_strings(): void
    {
        $resolvedProductUrl = FeedController::resolveProductUrl($this->activeProduct);
        $resolvedImageUrl = FeedController::resolveImageUrl($this->activeProduct->image);

        $this->assertIsString($resolvedProductUrl);
        $this->assertIsString($resolvedImageUrl);

        $this->assertMatchesRegularExpression('/^https?:\/\//i', $resolvedProductUrl);
        $this->assertMatchesRegularExpression('/^https?:\/\//i', $resolvedImageUrl);
        $this->assertStringNotContainsString('UrlGenerator', $resolvedImageUrl);
        $this->assertStringNotContainsString('Object', $resolvedImageUrl);
    }

    public function test_missing_image_and_gallery_do_not_crash_feed_and_return_placeholder(): void
    {
        $resolved = FeedController::resolveImageUrl(null);
        $this->assertIsString($resolved);
        $this->assertStringContainsString('placeholder.png', $resolved);

        $resolvedEmpty = FeedController::resolveImageUrl('');
        $this->assertIsString($resolvedEmpty);
        $this->assertStringContainsString('placeholder.png', $resolvedEmpty);

        $response = $this->get('/feeds/meta-products.xml');
        $response->assertStatus(200);

        $content = $response->getContent();
        $this->assertStringContainsString('Budget USB-C Cable (No Image)', $content);
    }

    public function test_special_characters_and_html_are_safely_escaped_in_xml(): void
    {
        $response = $this->get('/feeds/meta-products.xml');
        $content = $response->getContent();

        $this->assertStringContainsString('Razer Blade 18', $content);
        $this->assertStringNotContainsString('<p>Massive', $content); // HTML stripped
        $this->assertStringContainsString('Massive 18" QHD+ 300Hz display & ultra-fast cooling! No lag!', $content);
    }

    public function test_google_merchant_endpoints_return_valid_xml(): void
    {
        $this->get('/feeds/google-products.xml')->assertOk()->assertHeader('Content-Type', 'application/xml');
        $this->get('/feeds/google-merchant.xml')->assertOk()->assertHeader('Content-Type', 'application/xml');
    }

    public function test_csv_endpoint_returns_http_200_with_correct_headers(): void
    {
        $response = $this->get('/feeds/products.csv');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $metaCsvResponse = $this->get('/feeds/meta-products.csv');
        $metaCsvResponse->assertStatus(200);
        $metaCsvResponse->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_csv_has_header_row_and_product_rows(): void
    {
        $response = $this->get('/feeds/products.csv');
        $content = $response->getContent();

        $this->assertStringContainsString('id,title,description,availability,condition,price,sale_price,link,image_link,brand,product_type,google_product_category,sku', $content);
        $this->assertStringContainsString('Apple MacBook Pro 16', $content);
        $this->assertStringContainsString('385000.00 BDT', $content);
        $this->assertStringContainsString('MBP16-M3MAX-01', $content);
    }

    public function test_inactive_products_are_not_exposed_in_xml_or_csv(): void
    {
        $xmlResponse = $this->get('/feeds/meta-products.xml');
        $this->assertStringNotContainsString('Secret Prototype Device (Unpublished)', $xmlResponse->getContent());

        $csvResponse = $this->get('/feeds/products.csv');
        $this->assertStringNotContainsString('Secret Prototype Device (Unpublished)', $csvResponse->getContent());
    }

    public function test_feed_can_be_disabled_via_setting(): void
    {
        Setting::set('meta_feed_enabled', '0', 'marketing');

        $xmlResponse = $this->get('/feeds/meta-products.xml');
        $xmlResponse->assertStatus(403);
        $this->assertStringContainsString('disabled', $xmlResponse->getContent());

        $csvResponse = $this->get('/feeds/products.csv');
        $csvResponse->assertStatus(403);
        $this->assertStringContainsString('disabled', $csvResponse->getContent());
    }

    public function test_no_urlgenerator_object_is_in_output(): void
    {
        $xmlContent = $this->get('/feeds/meta-products.xml')->getContent();
        $this->assertStringNotContainsString('Illuminate\Routing\UrlGenerator', $xmlContent);
        $this->assertStringNotContainsString('Object of class', $xmlContent);

        $csvContent = $this->get('/feeds/products.csv')->getContent();
        $this->assertStringNotContainsString('Illuminate\Routing\UrlGenerator', $csvContent);
        $this->assertStringNotContainsString('Object of class', $csvContent);
    }
}
