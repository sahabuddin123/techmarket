<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\BlogPost;
use App\Models\CmsPage;
use App\Models\EmiPartner;
use App\Models\ServiceRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

class DynamicContentPagesTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Brand $brand;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $superAdminRole = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Administrator']);
        $allPerms = [
            'homepage.manage', 'settings.manage', 'products.view', 'products.create',
            'products.update', 'products.delete', 'orders.view', 'orders.update',
        ];
        foreach ($allPerms as $permName) {
            $perm = Permission::create(['name' => $permName, 'group' => 'admin', 'display_name' => $permName]);
            $superAdminRole->permissions()->attach($perm);
        }

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@techmarketbd.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($superAdminRole);

        $this->customer = User::create([
            'name' => 'Regular Customer',
            'email' => 'customer@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $this->category = Category::create([
            'name' => 'Graphics Card',
            'slug' => 'graphics-card',
            'icon' => 'Zap',
            'is_featured' => true,
            'is_nav_visible' => true,
        ]);

        $this->brand = Brand::create([
            'name' => 'ASUS ROG',
            'slug' => 'asus-rog',
            'description' => 'Republic of Gamers hardware and laptops',
            'website_url' => 'https://rog.asus.com',
            'is_featured' => true,
            'is_active' => true,
        ]);

        Product::create([
            'title' => 'ASUS ROG Strix RTX 4080 Super OC Edition',
            'slug' => 'asus-rog-strix-rtx-4080-super',
            'sku' => 'GPU-ROG-4080S',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 165000,
            'regular_price' => 175000,
            'cost_price' => 140000,
            'stock' => 5,
        ]);
    }

    /** @test */
    public function public_about_us_page_renders_cleanly_with_cms_sections()
    {
        CmsPage::create([
            'title' => 'About TechMarket BD',
            'slug' => 'about-us',
            'content' => 'Leading computer retailer in Bangladesh.',
            'is_published' => true,
            'sections' => [
                'hero' => ['title' => 'Custom About Title', 'subtitle' => 'Custom Subtitle'],
            ],
        ]);

        $response = $this->get('/about-us');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AboutUs')
            ->has('page')
            ->has('sections')
            ->where('sections.hero.title', 'Custom About Title')
        );
    }

    /** @test */
    public function public_brands_directory_and_single_brand_showroom_render_correctly()
    {
        // 1. Test Brands Directory
        $response = $this->get('/brands');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Brands/Index')
            ->has('brands')
            ->has('featuredBrands')
        );

        // 2. Test Single Brand Showroom Page
        $showroomResponse = $this->get("/brand/{$this->brand->slug}");
        $showroomResponse->assertStatus(200);
        $showroomResponse->assertInertia(fn (Assert $page) => $page
            ->component('Brands/Show')
            ->where('brand.name', 'ASUS ROG')
            ->has('products.data', 1)
        );
    }

    /** @test */
    public function public_blog_directory_and_single_article_render_correctly()
    {
        $post = BlogPost::create([
            'title' => 'Next-Gen AMD Ryzen 9000 Review',
            'slug' => 'next-gen-amd-ryzen-9000-review',
            'category' => 'Processor Reviews',
            'excerpt' => 'Deep dive into Zen 5 IPC gains and gaming benchmarks.',
            'content' => 'AMD Ryzen 9000 delivers substantial efficiency improvements.',
            'read_time' => '6 min read',
            'is_published' => true,
            'is_featured' => true,
            'author_id' => $this->admin->id,
        ]);

        // 1. Test Blog Directory
        $response = $this->get('/blog');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Blog/Index')
            ->has('posts.data', 1)
            ->has('featuredPosts', 1)
        );

        // 2. Test Single Blog Article
        $articleResponse = $this->get("/blog/{$post->slug}");
        $articleResponse->assertStatus(200);
        $articleResponse->assertInertia(fn (Assert $page) => $page
            ->component('Blog/Show')
            ->where('post.title', 'Next-Gen AMD Ryzen 9000 Review')
        );
    }

    /** @test */
    public function customer_can_submit_service_request_and_admin_can_update_status()
    {
        // 1. View Servicing Page
        $pageResponse = $this->get('/servicing');
        $pageResponse->assertStatus(200);
        $pageResponse->assertInertia(fn (Assert $page) => $page
            ->component('Servicing')
            ->has('serviceCategories')
            ->has('branches')
        );

        // 2. Submit Service Request
        $submitResponse = $this->actingAs($this->customer)->post('/servicing/request', [
            'customer_name' => 'Tanvir Ahmed',
            'customer_phone' => '01719887766',
            'customer_email' => 'tanvir@gmail.com',
            'device_type' => 'Laptop',
            'brand_name' => 'ASUS ROG Zephyrus',
            'issue_description' => 'Keyboard backlight flickering and screen display glitch.',
            'service_branch' => 'Dhaka Multiplan Center',
            'address' => 'Dhanmondi, Dhaka',
        ]);

        $submitResponse->assertSessionHasNoErrors();
        $this->assertDatabaseHas('service_requests', [
            'customer_name' => 'Tanvir Ahmed',
            'device_type' => 'Laptop',
            'status' => 'pending',
        ]);

        $serviceRequest = ServiceRequest::where('customer_name', 'Tanvir Ahmed')->first();
        $this->assertNotNull($serviceRequest->tracking_code);

        // 3. Admin Updates Status & Technician
        $adminResponse = $this->actingAs($this->admin)->put("/admin/service-requests/{$serviceRequest->id}", [
            'status' => 'in_progress',
            'assigned_technician' => 'Engr. Kamal Hossain',
            'admin_notes' => 'Testing display ribbon cable connection.',
        ]);

        $adminResponse->assertSessionHasNoErrors();
        $this->assertDatabaseHas('service_requests', [
            'id' => $serviceRequest->id,
            'status' => 'in_progress',
            'assigned_technician' => 'Engr. Kamal Hossain',
        ]);
    }

    /** @test */
    public function emi_information_page_displays_active_partner_banks()
    {
        EmiPartner::create([
            'bank_name' => 'City Bank (Amex)',
            'min_amount' => 5000,
            'available_tenures' => ['3', '6', '9', '12', '18', '24', '36'],
            'interest_rate_note' => '0% Interest up to 12 months',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $response = $this->get('/emi-info');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('EmiInfo')
            ->has('partners', 1)
            ->where('partners.0.bank_name', 'City Bank (Amex)')
        );
    }

    /** @test */
    public function admin_can_manage_blog_posts()
    {
        $createResponse = $this->actingAs($this->admin)->post('/admin/blog', [
            'title' => 'Top 10 Mechanical Keyboards for Coders in 2026',
            'category' => 'Hardware Guides',
            'excerpt' => 'Best hot-swappable mechanical keyboards in Bangladesh.',
            'content' => 'Detailed switch comparison between Gateron Yellow and Cherry MX Red.',
            'read_time' => '5 min read',
            'is_published' => true,
            'is_featured' => false,
        ]);

        $createResponse->assertRedirect('/admin/blog');
        $this->assertDatabaseHas('blog_posts', [
            'title' => 'Top 10 Mechanical Keyboards for Coders in 2026',
            'category' => 'Hardware Guides',
            'is_published' => true,
        ]);
    }

    /** @test */
    public function admin_can_manage_emi_partners()
    {
        $createResponse = $this->actingAs($this->admin)->post('/admin/emi-partners', [
            'bank_name' => 'BRAC Bank',
            'min_amount' => 5000,
            'available_tenures' => ['3', '6', '9', '12', '24'],
            'interest_rate_note' => '0% Interest on selected credit cards',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $createResponse->assertSessionHasNoErrors();
        $this->assertDatabaseHas('emi_partners', [
            'bank_name' => 'BRAC Bank',
            'min_amount' => 5000,
        ]);
    }
}
