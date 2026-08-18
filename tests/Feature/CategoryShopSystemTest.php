<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\CategoryContentSection;
use App\Models\CategoryFaq;
use App\Models\CategoryPriceTable;
use App\Models\SpecificationGroup;
use App\Models\SpecificationAttribute;
use App\Models\ProductSpecificationValue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

class CategoryShopSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Category $category;
    protected Brand $brand;
    protected Product $product1;
    protected Product $product2;

    protected function setUp(): void
    {
        parent::setUp();

        $superAdminRole = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Administrator']);
        $perms = ['categories.manage', 'products.view', 'settings.manage'];
        foreach ($perms as $permName) {
            $p = Permission::create(['name' => $permName, 'group' => 'admin', 'display_name' => $permName]);
            $superAdminRole->permissions()->attach($p);
        }

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@techmarketbd.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($superAdminRole);

        $this->customer = User::create([
            'name' => 'General Customer',
            'email' => 'customer@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $this->brand = Brand::create(['name' => 'Gree', 'slug' => 'gree']);

        $this->category = Category::create([
            'name' => 'Air Conditioner',
            'slug' => 'air-conditioner',
            'page_title' => 'Air Conditioner Price in Bangladesh 2026',
            'subtitle' => 'Latest AC models from Gree and General',
            'seo_title' => 'Air Conditioner Price in Bangladesh 2026 | TechMarket BD',
            'meta_description' => 'Explore the best AC prices in Bangladesh.',
            'seo_intro' => '<p>Air conditioners are essential for Bangladesh summers.</p>',
            'sidebar_visible' => true,
            'default_sort' => 'latest',
            'is_nav_visible' => true,
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        $this->product1 = Product::create([
            'title' => 'Gree GS-18XPUV32 1.5 Ton Inverter AC',
            'slug' => 'gree-gs-18xpuv32-1-5-ton-inverter-ac',
            'sku' => 'GREE-18X',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 65000,
            'regular_price' => 70000,
            'stock' => 10,
            'is_featured' => true,
            'key_specs' => ['1.5 Ton', 'Inverter', '5 Star'],
        ]);

        $this->product2 = Product::create([
            'title' => 'Gree GS-24XPUV32 2.0 Ton Inverter AC',
            'slug' => 'gree-gs-24xpuv32-2-0-ton-inverter-ac',
            'sku' => 'GREE-24X',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 85000,
            'regular_price' => 90000,
            'stock' => 5,
            'is_featured' => false,
            'key_specs' => ['2.0 Ton', 'Inverter', '5 Star'],
        ]);

        $this->category->contentSections()->create([
            'heading' => 'Air Conditioner Price in Bangladesh',
            'section_type' => 'rich_text',
            'content' => '<p>Detailed AC price breakdown.</p>',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->category->priceTables()->create([
            'product_id' => $this->product1->id,
            'product_name' => $this->product1->title,
            'price' => (string)$this->product1->price,
            'specs' => '1.5 Ton Inverter',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->category->faqs()->create([
            'question' => 'Which AC brand is best?',
            'answer' => 'Gree is widely popular in Bangladesh.',
            'sort_order' => 1,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function public_category_page_renders_with_products_seo_content_price_table_and_faqs()
    {
        $response = $this->get('/category/air-conditioner');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->has('category')
            ->where('category.name', 'Air Conditioner')
            ->where('category.page_title', 'Air Conditioner Price in Bangladesh 2026')
            ->has('products.data', 2)
            ->has('breadcrumbs')
            ->has('brands')
            ->has('availabilityCounts')
            ->has('contentSections', 1)
            ->has('priceTables', 1)
            ->has('faqs', 1)
            ->where('priceTables.0.price', '65000')
            ->where('faqs.0.question', 'Which AC brand is best?')
        );
    }

    /** @test */
    public function public_catalog_page_renders_cleanly()
    {
        $response = $this->get('/catalog');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->has('products.data', 2)
            ->has('categories')
            ->has('brands')
        );
    }

    /** @test */
    public function category_filtering_by_search_keyword_works()
    {
        $response = $this->get('/category/air-conditioner?search=1.5+Ton');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Gree GS-18XPUV32 1.5 Ton Inverter AC')
        );
    }

    /** @test */
    public function category_filtering_by_price_range_works()
    {
        $response = $this->get('/category/air-conditioner?min_price=60000&max_price=70000');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->has('products.data', 1)
            ->where('products.data.0.price', 65000)
        );
    }

    /** @test */
    public function category_sorting_by_price_asc_and_desc_works()
    {
        $responseAsc = $this->get('/category/air-conditioner?sort=price_asc');
        $responseAsc->assertStatus(200);
        $responseAsc->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->where('products.data.0.price', 65000)
            ->where('products.data.1.price', 85000)
        );

        $responseDesc = $this->get('/category/air-conditioner?sort=price_desc');
        $responseDesc->assertStatus(200);
        $responseDesc->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->where('products.data.0.price', 85000)
            ->where('products.data.1.price', 65000)
        );
    }

    /** @test */
    public function category_dynamic_specification_filtering_works()
    {
        $group = SpecificationGroup::create(['name' => 'AC Specs', 'sort_order' => 1]);
        $attr = SpecificationAttribute::create([
            'name' => 'Cooling Capacity',
            'unit' => 'Ton',
            'specification_group_id' => $group->id,
            'sort_order' => 1,
        ]);

        ProductSpecificationValue::create([
            'product_id' => $this->product1->id,
            'specification_attribute_id' => $attr->id,
            'value' => '1.5 Ton',
        ]);
        ProductSpecificationValue::create([
            'product_id' => $this->product2->id,
            'specification_attribute_id' => $attr->id,
            'value' => '2.0 Ton',
        ]);

        $response = $this->get("/category/air-conditioner?specs[spec_{$attr->id}]=2.0+Ton");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->has('products.data', 1)
            ->where('products.data.0.id', $this->product2->id)
        );
    }

    /** @test */
    public function empty_category_renders_cleanly_without_errors()
    {
        $emptyCat = Category::create([
            'name' => 'Empty Category',
            'slug' => 'empty-cat',
            'is_nav_visible' => true,
        ]);

        $response = $this->get('/category/empty-cat');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->where('category.slug', 'empty-cat')
            ->has('products.data', 0)
        );
    }

    /** @test */
    public function admin_can_create_category_with_seo_content_price_table_and_faqs()
    {
        $response = $this->actingAs($this->admin)->post('/admin/categories', [
            'name' => 'Gaming Laptop',
            'slug' => 'gaming-laptop',
            'page_title' => 'Gaming Laptop Price in Bangladesh 2026',
            'subtitle' => 'Top ROG, Legion, and Predator laptops',
            'seo_title' => 'Best Gaming Laptop Price in BD',
            'meta_description' => 'Buy gaming laptops at best price.',
            'seo_intro' => '<p>Gaming laptops offer ultimate mobile performance.</p>',
            'sidebar_visible' => true,
            'default_sort' => 'bestseller',
            'is_featured' => true,
            'is_nav_visible' => true,
            'sort_order' => 2,
            'content_sections' => [
                [
                    'heading' => 'Top Gaming Laptops',
                    'section_type' => 'rich_text',
                    'content' => '<p>High FPS gaming laptop guide.</p>',
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            ],
            'price_tables' => [
                [
                    'product_name' => 'ASUS ROG Strix G16',
                    'price' => '195000',
                    'specs' => 'i9 14th Gen, RTX 4070',
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            ],
            'faqs' => [
                [
                    'question' => 'Is 16GB RAM enough for gaming?',
                    'answer' => 'Yes, 16GB is the modern sweet spot.',
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            ]
        ]);

        $response->assertRedirect('/admin/categories');

        $this->assertDatabaseHas('categories', [
            'slug' => 'gaming-laptop',
            'page_title' => 'Gaming Laptop Price in Bangladesh 2026',
        ]);

        $createdCat = Category::where('slug', 'gaming-laptop')->first();
        $this->assertCount(1, $createdCat->contentSections);
        $this->assertCount(1, $createdCat->priceTables);
        $this->assertCount(1, $createdCat->faqs);
    }

    /** @test */
    public function admin_can_update_category_content_and_seo()
    {
        $response = $this->actingAs($this->admin)->put("/admin/categories/{$this->category->id}", [
            'name' => 'Air Conditioner BD',
            'slug' => 'air-conditioner',
            'page_title' => 'Updated AC Price in Bangladesh 2026',
            'subtitle' => 'Updated AC description',
            'sidebar_visible' => true,
            'default_sort' => 'price_asc',
            'is_featured' => true,
            'is_nav_visible' => true,
            'sort_order' => 1,
            'content_sections' => [
                [
                    'heading' => 'Updated AC Guide',
                    'section_type' => 'rich_text',
                    'content' => '<p>Updated content.</p>',
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            ],
            'price_tables' => [
                [
                    'product_id' => $this->product1->id,
                    'product_name' => 'Updated Gree Model',
                    'price' => '67000',
                    'specs' => '1.5 Ton',
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            ],
            'faqs' => [
                [
                    'question' => 'Updated FAQ Question?',
                    'answer' => 'Updated answer.',
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            ]
        ]);

        $response->assertRedirect('/admin/categories');

        $this->assertDatabaseHas('categories', [
            'id' => $this->category->id,
            'name' => 'Air Conditioner BD',
            'page_title' => 'Updated AC Price in Bangladesh 2026',
        ]);

        $this->category->refresh();
        $this->assertEquals('Updated AC Guide', $this->category->contentSections->first()->heading);
        $this->assertEquals('Updated FAQ Question?', $this->category->faqs->first()->question);
    }

    /** @test */
    public function unauthorized_customer_cannot_manage_categories()
    {
        $response = $this->actingAs($this->customer)->post('/admin/categories', [
            'name' => 'Hacked Category',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function catalog_flash_sale_filter_only_returns_active_flash_sale_products()
    {
        $flashSale = \App\Models\FlashSale::create([
            'title' => 'Monsoon Flash Sale',
            'start_time' => \Carbon\Carbon::now()->subHour(),
            'end_time' => \Carbon\Carbon::now()->addDay(),
            'is_active' => true,
        ]);

        \App\Models\FlashSaleItem::create([
            'flash_sale_id' => $flashSale->id,
            'product_id' => $this->product1->id,
            'flash_price' => 59000,
            'quantity_limit' => 5,
            'sold_quantity' => 0,
        ]);

        // Access catalog with flash_sale=true
        $response = $this->get('/catalog?flash_sale=true');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog')
            ->where('isFlashSale', true)
            ->where('flashSaleTitle', 'Monsoon Flash Sale')
            ->has('products.data', 1)
            ->where('products.data.0.id', $this->product1->id)
            ->where('products.data.0.flash_price', 59000)
        );
    }
}
