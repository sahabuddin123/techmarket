<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use App\Models\LandingPage;
use App\Models\LandingPageSection;
use App\Models\LandingPageEvent;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LandingPageSystemTest extends TestCase
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

        $perm = Permission::firstOrCreate(['name' => 'marketing.manage'], ['group' => 'marketing', 'display_name' => 'Manage Marketing']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Administrator']);
        $adminRole->permissions()->sync([$perm->id]);

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->admin->roles()->sync([$adminRole->id]);

        $this->customer = User::factory()->create(['role' => 'customer']);

        $this->category = Category::create([
            'name' => 'Gaming Hardware',
            'slug' => 'gaming-hardware',
        ]);

        $this->brand = Brand::create([
            'name' => 'Logitech',
            'slug' => 'logitech',
        ]);

        $this->product = Product::create([
            'title' => 'Logitech F310 USB Wired Gamepad',
            'slug' => 'logitech-f310-usb-wired-gamepad',
            'sku' => 'GP-F310',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 1899.00,
            'regular_price' => 2450.00,
            'stock' => 15,
            'is_active' => true,
            'image' => 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08',
            'key_specs' => ['Dual Vibration Feedback', '10 Programmable Buttons', 'Standard D-Pad'],
            'short_description' => 'Reliable USB PC gamepad with ergonomic layout and vibration feedback.',
            'description' => 'Detailed product overview.',
        ]);
    }

    /** @test */
    public function admin_can_view_landing_page_list_and_metrics()
    {
        $landingPage = LandingPage::create([
            'name' => 'Logitech F310 Mega Offer',
            'slug' => 'logitech-f310-offer',
            'status' => 'published',
            'product_id' => $this->product->id,
            'campaign_name' => 'Facebook Gaming Campaign 2026',
            'view_count' => 120,
            'order_count' => 15,
            'revenue_total' => 28485.00,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/marketing/landing-pages');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Marketing/LandingPages/Index')
            ->has('pages.data', 1)
            ->where('pages.data.0.slug', 'logitech-f310-offer')
            ->where('metrics.total_pages', 1)
        );
    }

    /** @test */
    public function admin_can_create_landing_page_with_default_sections()
    {
        $payload = [
            'name' => 'Summer AC Discount Deal',
            'slug' => 'summer-ac-discount-deal',
            'product_id' => $this->product->id,
            'status' => 'published',
            'campaign_name' => 'Summer Eid Campaign',
            'campaign_code' => 'EID_AC_2026',
            'theme_color' => '#f59e0b',
            'show_header' => true,
            'show_footer' => true,
            'show_sticky_order_btn' => true,
            'show_whatsapp_btn' => true,
            'show_call_btn' => true,
            'inside_dhaka_charge' => 60,
            'outside_dhaka_charge' => 120,
            'is_free_delivery' => false,
            'payment_methods' => ['cod', 'bkash', 'nagad'],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/marketing/landing-pages', $payload);

        $this->assertDatabaseHas('landing_pages', [
            'slug' => 'summer-ac-discount-deal',
            'campaign_code' => 'EID_AC_2026',
        ]);

        $createdPage = LandingPage::where('slug', 'summer-ac-discount-deal')->first();
        $this->assertNotNull($createdPage);
        $this->assertGreaterThan(0, $createdPage->sections()->count());

        $response->assertRedirect(route('admin.landingPages.edit', $createdPage->id));
    }

    /** @test */
    public function admin_can_update_landing_page_sections_and_settings()
    {
        $landingPage = LandingPage::create([
            'name' => 'Initial Name',
            'slug' => 'initial-slug',
            'status' => 'draft',
            'product_id' => $this->product->id,
        ]);

        $updatePayload = [
            'name' => 'Updated Campaign Name',
            'slug' => 'updated-campaign-slug',
            'product_id' => $this->product->id,
            'status' => 'published',
            'campaign_name' => 'Meta Flash Promo',
            'campaign_code' => 'META_FLASH',
            'theme_color' => '#10b981',
            'show_header' => true,
            'show_footer' => true,
            'show_sticky_order_btn' => true,
            'show_whatsapp_btn' => false,
            'show_call_btn' => true,
            'inside_dhaka_charge' => 50,
            'outside_dhaka_charge' => 100,
            'is_free_delivery' => false,
            'payment_methods' => ['cod', 'bkash'],
            'sections' => [
                [
                    'section_type' => 'hero',
                    'title' => 'Updated Hero Headline',
                    'subtitle' => 'Updated Subtitle',
                    'is_visible' => true,
                    'settings' => ['badge' => '🔥 SUPER SALE'],
                ],
                [
                    'section_type' => 'quick_order',
                    'title' => 'Quick Order Title',
                    'subtitle' => 'Quick Order Subtitle',
                    'is_visible' => true,
                    'settings' => ['order_btn_text' => 'Order Now!'],
                ]
            ]
        ];

        $response = $this->actingAs($this->admin)->put("/admin/marketing/landing-pages/{$landingPage->id}", $updatePayload);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('landing_pages', [
            'id' => $landingPage->id,
            'name' => 'Updated Campaign Name',
            'slug' => 'updated-campaign-slug',
            'status' => 'published',
        ]);

        $landingPage->refresh();
        $this->assertEquals(2, $landingPage->sections()->count());
        $this->assertEquals('Updated Hero Headline', $landingPage->sections->first()->title);
    }

    /** @test */
    public function admin_can_duplicate_landing_page_and_clone_sections()
    {
        $landingPage = LandingPage::create([
            'name' => 'Master Template Page',
            'slug' => 'master-template-page',
            'status' => 'published',
            'product_id' => $this->product->id,
        ]);
        $landingPage->generateDefaultSections();
        $originalSectionsCount = $landingPage->sections()->count();

        $response = $this->actingAs($this->admin)->post("/admin/marketing/landing-pages/{$landingPage->id}/duplicate");

        $duplicatedPage = LandingPage::where('slug', 'master-template-page-copy')->first();
        $this->assertNotNull($duplicatedPage);
        $this->assertEquals('Master Template Page (Copy)', $duplicatedPage->name);
        $this->assertEquals('draft', $duplicatedPage->status);
        $this->assertEquals($originalSectionsCount, $duplicatedPage->sections()->count());

        $response->assertRedirect(route('admin.landingPages.edit', $duplicatedPage->id));
    }

    /** @test */
    public function admin_can_toggle_landing_page_status()
    {
        $landingPage = LandingPage::create([
            'name' => 'Live Page',
            'slug' => 'live-page',
            'status' => 'published',
            'product_id' => $this->product->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/admin/marketing/landing-pages/{$landingPage->id}/toggle");

        $landingPage->refresh();
        $this->assertEquals('paused', $landingPage->status);
    }

    /** @test */
    public function public_customer_can_view_published_landing_page_with_authoritative_data()
    {
        $landingPage = LandingPage::create([
            'name' => 'Logitech F310 Special Offer',
            'slug' => 'logitech-f310-special',
            'status' => 'published',
            'product_id' => $this->product->id,
            'campaign_name' => 'Facebook Summer Sale',
            'campaign_code' => 'FB_SUMMER',
        ]);
        $landingPage->generateDefaultSections();

        $response = $this->get('/l/logitech-f310-special?utm_source=facebook&utm_campaign=summer_promo&fbclid=fb_click_123');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('LandingPages/Show')
            ->where('landingPage.slug', 'logitech-f310-special')
            ->where('product.id', $this->product->id)
            ->where('pricing.final_price', 1899)
            ->where('campaignParams.utm_source', 'facebook')
            ->where('campaignParams.fbclid', 'fb_click_123')
            ->has('sections')
        );

        $landingPage->refresh();
        $this->assertEquals(1, $landingPage->view_count);

        // Verify page_view event logged in database
        $this->assertDatabaseHas('landing_page_events', [
            'landing_page_id' => $landingPage->id,
            'event_name' => 'page_view',
            'utm_source' => 'facebook',
            'fbclid' => 'fb_click_123',
        ]);
    }

    /** @test */
    public function draft_or_paused_landing_page_is_inaccessible_to_guests()
    {
        $landingPage = LandingPage::create([
            'name' => 'Draft Page',
            'slug' => 'draft-promo-page',
            'status' => 'draft',
            'product_id' => $this->product->id,
        ]);

        $response = $this->get('/l/draft-promo-page');
        $response->assertStatus(404);
    }

    /** @test */
    public function customer_can_place_one_click_quick_order_with_authoritative_price_and_inventory_deduction()
    {
        $landingPage = LandingPage::create([
            'name' => 'Gamepad Flash Offer',
            'slug' => 'gamepad-flash-offer',
            'status' => 'published',
            'product_id' => $this->product->id,
            'inside_dhaka_charge' => 60,
            'outside_dhaka_charge' => 120,
            'campaign_name' => 'Meta Gamers Fest',
            'campaign_code' => 'META_GAME_2026',
        ]);

        $initialStock = $this->product->stock;

        $orderPayload = [
            'customer_name' => 'Tanvir Ahmed',
            'customer_phone' => '01712345678',
            'customer_email' => 'tanvir@gmail.com',
            'district' => 'Dhaka',
            'area' => 'Mirpur-10',
            'shipping_address' => 'House 14, Road 5, Block C',
            'payment_method' => 'cod',
            'quantity' => 2,
            'variant' => 'Standard USB',
            'utm_source' => 'facebook',
            'utm_campaign' => 'gamers_fest',
            'fbclid' => 'fb_lead_999888',
        ];

        $response = $this->postJson('/l/gamepad-flash-offer/order', $orderPayload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'total' => (1899.00 * 2) + 60.00, // 3798 + 60 = 3858
        ]);

        // Assert Order Created
        $this->assertDatabaseHas('orders', [
            'landing_page_id' => $landingPage->id,
            'customer_name' => 'Tanvir Ahmed',
            'customer_phone' => '01712345678',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'total' => 3858.00,
            'source_type' => 'landing_page',
            'utm_source' => 'facebook',
            'fbclid' => 'fb_lead_999888',
        ]);

        // Assert Inventory Decremented
        $this->product->refresh();
        $this->assertEquals($initialStock - 2, $this->product->stock);

        // Assert Landing Page Performance Counters
        $landingPage->refresh();
        $this->assertEquals(1, $landingPage->order_count);
        $this->assertEquals(3858.00, $landingPage->revenue_total);

        // Assert Purchase Event Logged
        $this->assertDatabaseHas('landing_page_events', [
            'landing_page_id' => $landingPage->id,
            'event_name' => 'purchase',
            'value' => 3858.00,
            'utm_source' => 'facebook',
        ]);
    }

    /** @test */
    public function quick_order_validates_outside_dhaka_delivery_rates_correctly()
    {
        $landingPage = LandingPage::create([
            'name' => 'Chittagong Campaign',
            'slug' => 'chittagong-campaign',
            'status' => 'published',
            'product_id' => $this->product->id,
            'inside_dhaka_charge' => 60,
            'outside_dhaka_charge' => 150, // custom outside rate
        ]);

        $orderPayload = [
            'customer_name' => 'Shafiqul Islam',
            'customer_phone' => '01812345678',
            'district' => 'Chattogram',
            'shipping_address' => 'GEC Circle, Nasirabad',
            'payment_method' => 'cod',
            'quantity' => 1,
        ];

        $response = $this->postJson('/l/chittagong-campaign/order', $orderPayload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'total' => 1899.00 + 150.00, // 2049.00
        ]);

        $this->assertDatabaseHas('orders', [
            'customer_phone' => '01812345678',
            'shipping_cost' => 150.00,
            'total' => 2049.00,
        ]);
    }

    /** @test */
    public function quick_order_prevents_out_of_stock_purchases()
    {
        $this->product->update(['stock' => 0]);

        $landingPage = LandingPage::create([
            'name' => 'Out of Stock Campaign',
            'slug' => 'out-of-stock-campaign',
            'status' => 'published',
            'product_id' => $this->product->id,
        ]);

        $orderPayload = [
            'customer_name' => 'Buyer',
            'customer_phone' => '01912345678',
            'district' => 'Dhaka',
            'shipping_address' => 'Dhanmondi',
            'payment_method' => 'cod',
            'quantity' => 1,
        ];

        $response = $this->postJson('/l/out-of-stock-campaign/order', $orderPayload);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
    }

    /** @test */
    public function quick_order_anti_bot_honeypot_rejects_spammers()
    {
        $landingPage = LandingPage::create([
            'name' => 'Protected Campaign',
            'slug' => 'protected-campaign',
            'status' => 'published',
            'product_id' => $this->product->id,
        ]);

        $spamPayload = [
            'website_url_hp' => 'http://spam-bot.com', // Honeypot filled by bot
            'customer_name' => 'Spam Bot',
            'customer_phone' => '01700000000',
            'district' => 'Dhaka',
            'shipping_address' => 'Spam St',
            'payment_method' => 'cod',
        ];

        $response = $this->postJson('/l/protected-campaign/order', $spamPayload);

        $response->assertStatus(422);
        $this->assertEquals(0, Order::count());
    }

    /** @test */
    public function non_blocking_event_tracking_and_funnel_analytics_work()
    {
        $landingPage = LandingPage::create([
            'name' => 'Analytics Test Page',
            'slug' => 'analytics-test-page',
            'status' => 'published',
            'product_id' => $this->product->id,
        ]);

        $trackPayload = [
            'event_name' => 'initiate_checkout',
            'event_id' => 'INIT_12345',
            'value' => 1899.00,
            'utm_source' => 'meta_ads',
            'utm_campaign' => 'eid_promo',
        ];

        $response = $this->postJson('/l/analytics-test-page/track', $trackPayload);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('landing_page_events', [
            'landing_page_id' => $landingPage->id,
            'event_name' => 'initiate_checkout',
            'event_id' => 'INIT_12345',
            'utm_source' => 'meta_ads',
        ]);

        // View Admin Analytics
        $analyticsResponse = $this->actingAs($this->admin)->get("/admin/marketing/landing-pages/analytics/{$landingPage->id}");
        $analyticsResponse->assertStatus(200);
        $analyticsResponse->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Marketing/LandingPages/Analytics')
            ->where('funnel.initiate_checkout', 1)
        );
    }
}
