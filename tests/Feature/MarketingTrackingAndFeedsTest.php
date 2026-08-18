<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\InternalEvent;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use App\Services\MetaConversionsApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MarketingTrackingAndFeedsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Category $category;
    protected Brand $brand;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Marketing Admin',
            'email' => 'marketing@techmarket.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->customer = User::create([
            'name' => 'Store Visitor',
            'email' => 'visitor@techmarket.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $this->category = Category::create([
            'name' => 'Graphics Cards',
            'slug' => 'graphics-cards',
            'is_nav_visible' => true,
        ]);

        $this->brand = Brand::create([
            'name' => 'ASUS ROG',
            'slug' => 'asus-rog',
        ]);

        $this->product = Product::create([
            'title' => 'ASUS ROG Strix RTX 4080 Super',
            'slug' => 'asus-rog-strix-rtx-4080-super',
            'sku' => 'ROG-RTX4080S-O16G',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 145000.00,
            'regular_price' => 155000.00,
            'stock' => 12,
            'is_active' => true,
            'image' => 'https://images.unsplash.com/photo-rtx4080.jpg',
            'description' => 'Flagship NVIDIA GeForce graphics card with triple axial fans.',
        ]);
    }

    public function test_unauthorized_customer_cannot_access_analytics_settings(): void
    {
        $this->actingAs($this->customer);

        $response = $this->get('/admin/settings/analytics');
        $response->assertStatus(403);

        $postResponse = $this->post('/admin/settings/analytics', [
            'ga4_measurement_id' => 'G-HACKED123',
        ]);
        $postResponse->assertStatus(403);
    }

    public function test_admin_can_view_analytics_settings_workspace(): void
    {
        $this->actingAs($this->admin);

        Setting::set('ga4_measurement_id', 'G-TECHMARKET99', 'analytics');
        Setting::set('meta_pixel_id', '987654321012345', 'analytics');

        $response = $this->get('/admin/settings/analytics');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Settings/AnalyticsTracking')
            ->has('settings')
            ->has('feedUrl')
            ->where('settings.ga4_measurement_id', 'G-TECHMARKET99')
            ->where('settings.meta_pixel_id', '987654321012345')
        );
    }

    public function test_admin_can_update_tracking_settings_and_sensitive_tokens(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/admin/settings/analytics', [
            'ga4_enabled' => true,
            'ga4_measurement_id' => 'G-ABC1234567',
            'ga4_ecommerce_enabled' => true,
            'ga4_debug_mode' => false,
            'gtm_enabled' => false,
            'meta_pixel_enabled' => true,
            'meta_pixel_id' => '112233445566778',
            'meta_capi_enabled' => true,
            'meta_capi_token' => 'EAAX_SUPER_SECRET_TOKEN_XYZ',
            'meta_capi_test_code' => 'TEST99001',
            'meta_feed_enabled' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('G-ABC1234567', Setting::get('ga4_measurement_id'));
        $this->assertEquals('112233445566778', Setting::get('meta_pixel_id'));
        $this->assertEquals('EAAX_SUPER_SECRET_TOKEN_XYZ', Setting::get('meta_capi_token'));
        $this->assertEquals('TEST99001', Setting::get('meta_capi_test_code'));
    }

    public function test_feed_endpoint_generates_valid_meta_xml_with_canonical_content_ids(): void
    {
        Setting::set('meta_feed_enabled', '1', 'marketing');

        $response = $this->get('/feeds/meta-products.xml');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');

        $content = $response->getContent();
        $canonicalId = MetaConversionsApiService::canonicalContentId($this->product->id);

        $this->assertStringContainsString("<g:id>{$canonicalId}</g:id>", $content);
        $this->assertStringContainsString('ASUS ROG Strix RTX 4080 Super', $content);
        $this->assertStringContainsString('145000.00 BDT', $content);
        $this->assertStringContainsString('<g:availability>in stock</g:availability>', $content);
        $this->assertStringContainsString('ASUS ROG', $content);
    }

    public function test_feed_endpoint_generates_valid_meta_csv_feed(): void
    {
        $response = $this->get('/feeds/meta-products.csv');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $content = $response->getContent();
        $canonicalId = MetaConversionsApiService::canonicalContentId($this->product->id);

        $this->assertStringContainsString($canonicalId, $content);
        $this->assertStringContainsString('ASUS ROG Strix RTX 4080 Super', $content);
    }

    public function test_feed_can_be_disabled_via_admin_setting(): void
    {
        Setting::set('meta_feed_enabled', '0', 'marketing');

        $response = $this->get('/feeds/meta-products.xml');
        $response->assertStatus(403);
        $this->assertStringContainsString('Meta Product Feed is disabled', $response->getContent());
    }

    public function test_public_tracking_api_records_internal_events(): void
    {
        $canonicalId = MetaConversionsApiService::canonicalContentId($this->product->id);

        $response = $this->postJson('/api/tracking/event', [
            'event_name' => 'view_content',
            'event_id' => 'VIEW_TEST_123',
            'content_id' => $canonicalId,
            'product_id' => $this->product->id,
            'value' => 145000.00,
            'metadata' => [
                'title' => $this->product->title,
                'category' => 'Graphics Cards',
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('internal_events', [
            'event_name' => 'view_content',
            'event_id' => 'VIEW_TEST_123',
            'content_id' => $canonicalId,
            'product_id' => $this->product->id,
            'value' => 145000.00,
        ]);
    }

    public function test_admin_can_view_marketing_analytics_funnel_and_debugger(): void
    {
        $this->actingAs($this->admin);

        // Seed an event
        InternalEvent::create([
            'event_name' => 'view_content',
            'event_id' => 'EVT_001',
            'product_id' => $this->product->id,
            'value' => 145000.00,
        ]);

        $analyticsResponse = $this->get('/admin/analytics');
        $analyticsResponse->assertStatus(200);
        $analyticsResponse->assertInertia(fn ($page) => $page
            ->component('Admin/Marketing/AnalyticsDashboard')
            ->has('storePerformance')
            ->has('funnel')
            ->has('topPurchased')
            ->has('topViewed')
        );

        $debugResponse = $this->get('/admin/analytics/debug');
        $debugResponse->assertStatus(200);
        $debugResponse->assertInertia(fn ($page) => $page
            ->component('Admin/Marketing/TrackingDebug')
            ->has('health')
            ->has('recentEvents')
        );
    }
}
