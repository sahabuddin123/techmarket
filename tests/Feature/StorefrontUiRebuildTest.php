<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Banner;
use App\Models\QuickAction;
use App\Models\HomepageSection;
use App\Models\FlashSale;
use App\Models\FlashSaleItem;
use App\Models\Setting;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class StorefrontUiRebuildTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles & permissions
        $perm = Permission::firstOrCreate(['name' => 'homepage.manage'], ['group' => 'homepage', 'display_name' => 'Manage Homepage']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Administrator']);
        $adminRole->permissions()->sync([$perm->id]);

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->admin->roles()->sync([$adminRole->id]);

        $this->customer = User::factory()->create(['role' => 'customer']);
    }

    /** @test */
    public function public_homepage_renders_cleanly_with_all_dynamic_sections()
    {
        // 1. Create categories
        $cat = Category::create([
            'name' => 'Gaming Laptops',
            'slug' => 'gaming-laptops',
            'is_featured' => true,
            'is_nav_visible' => true,
            'sort_order' => 1,
        ]);

        $brand = Brand::create(['name' => 'ASUS ROG', 'slug' => 'asus-rog']);

        // 2. Create products
        $product = Product::create([
            'title' => 'ASUS ROG Strix SCAR 18',
            'slug' => 'asus-rog-strix-scar-18',
            'sku' => 'ROG-SCAR-18',
            'category_id' => $cat->id,
            'brand_id' => $brand->id,
            'price' => 385000,
            'regular_price' => 410000,
            'cost_price' => 350000,
            'stock' => 5,
            'is_featured' => true,
        ]);

        // 3. Create hero banner & side banners
        Banner::create([
            'title' => 'MEGA PC BUILDER EXPO',
            'subtitle' => 'Experience next-gen gaming hardware',
            'image' => 'https://example.com/banner.jpg',
            'placement' => 'hero_slider',
            'button_text' => 'Shop Now',
            'button_url' => '/catalog',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Banner::create([
            'title' => 'Corporate Sales',
            'image' => 'https://example.com/corp.jpg',
            'placement' => 'side_banner_top',
            'button_text' => 'Click Here',
            'button_url' => '/page/corporate-sales',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        // 4. Create Quick Actions
        QuickAction::create([
            'title' => 'PC Builder',
            'subtitle' => 'Configure your ideal PC',
            'icon' => 'Cpu',
            'url' => '/pc-builder',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // 5. Create Sections
        HomepageSection::create([
            'section_key' => 'hero_section',
            'title' => 'Hero Banner & Promos',
            'sort_order' => 1,
            'is_enabled' => true,
        ]);

        // Request Homepage
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->has('heroSlides', 1)
            ->has('quickActions', 1)
            ->has('featuredCategories', 1)
            ->has('featuredProducts', 1)
            ->where('featuredProducts.0.title', 'ASUS ROG Strix SCAR 18')
        );
    }

    /** @test */
    public function disabled_homepage_sections_are_flagged_in_data()
    {
        HomepageSection::create([
            'section_key' => 'flash_sale',
            'title' => 'Flash Sale',
            'sort_order' => 4,
            'is_enabled' => false,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->missing('sections.flash_sale')
        );
    }

    /** @test */
    public function flash_sale_products_resolve_live_pricing_and_calculated_savings()
    {
        $cat = Category::create(['name' => 'Keyboards', 'slug' => 'keyboards', 'is_featured' => true]);
        $brand = Brand::create(['name' => 'Logitech', 'slug' => 'logitech']);

        $product = Product::create([
            'title' => 'Logitech G Pro X Superlight',
            'slug' => 'logitech-g-pro-x',
            'sku' => 'LOG-GPX',
            'category_id' => $cat->id,
            'brand_id' => $brand->id,
            'price' => 14000,
            'regular_price' => 17500,
            'cost_price' => 11000,
            'stock' => 10,
        ]);

        $flash = FlashSale::create([
            'title' => 'Midnight Gaming Rush',
            'start_time' => now()->subHour(),
            'end_time' => now()->addDays(5),
            'is_active' => true,
        ]);

        FlashSaleItem::create([
            'flash_sale_id' => $flash->id,
            'product_id' => $product->id,
            'flash_price' => 12500,
            'quantity_limit' => 10,
            'sold_quantity' => 2,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->has('flashSale')
            ->where('flashSale.title', 'Midnight Gaming Rush')
            ->where('flashSale.products.0.flash_price', 12500)
            ->where('flashSale.products.0.savings', 5000) // 17500 - 12500
        );
    }

    /** @test */
    public function admin_can_reorder_and_toggle_homepage_sections()
    {
        $sec1 = HomepageSection::create(['section_key' => 'hero_section', 'title' => 'Hero', 'sort_order' => 1, 'is_enabled' => true]);
        $sec2 = HomepageSection::create(['section_key' => 'featured_products', 'title' => 'Featured', 'sort_order' => 2, 'is_enabled' => true]);

        // Toggle sec1
        $response = $this->actingAs($this->admin)->put("/admin/homepage/sections/{$sec1->id}", [
            'title' => 'Updated Hero Title',
            'subtitle' => 'Updated Subtitle',
            'sort_order' => 1,
            'is_enabled' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('homepage_sections', [
            'id' => $sec1->id,
            'title' => 'Updated Hero Title',
            'is_enabled' => false,
        ]);

        // Reorder
        $reorderResponse = $this->actingAs($this->admin)->post('/admin/homepage/sections/reorder', [
            'sections' => [
                ['id' => $sec2->id, 'sort_order' => 1],
                ['id' => $sec1->id, 'sort_order' => 2],
            ],
        ]);

        $reorderResponse->assertRedirect();
        $this->assertDatabaseHas('homepage_sections', ['id' => $sec2->id, 'sort_order' => 1]);
        $this->assertDatabaseHas('homepage_sections', ['id' => $sec1->id, 'sort_order' => 2]);
    }

    /** @test */
    public function admin_can_create_and_manage_quick_action_cards()
    {
        $response = $this->actingAs($this->admin)->post('/admin/homepage/quick-actions', [
            'title' => 'Custom Watercooling',
            'subtitle' => 'Book custom loop installation',
            'icon' => 'Wrench',
            'url' => '/page/watercooling',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('quick_actions', [
            'title' => 'Custom Watercooling',
            'url' => '/page/watercooling',
        ]);
    }

    /** @test */
    public function unauthorized_users_cannot_access_admin_homepage_management()
    {
        $response = $this->actingAs($this->customer)->get('/admin/homepage');
        $response->assertStatus(403);
    }
}
