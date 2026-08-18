<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

class MegaMenuNavigationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $superAdminRole = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Administrator']);
        $perms = ['homepage.manage', 'settings.manage', 'products.view'];
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
    }

    /** @test */
    public function top_navigation_displays_only_active_menu_items()
    {
        $activeCat = Category::create([
            'name' => 'Active Category',
            'slug' => 'active-cat',
            'is_nav_visible' => true,
            'sort_order' => 1,
        ]);

        $hiddenCat = Category::create([
            'name' => 'Hidden Category',
            'slug' => 'hidden-cat',
            'is_nav_visible' => false,
            'sort_order' => 2,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->has('categories', 1)
            ->where('categories.0.name', 'Active Category')
        );
    }

    /** @test */
    public function category_ordering_is_respected_in_navigation()
    {
        Category::create(['name' => 'Second Cat', 'slug' => 'second', 'is_nav_visible' => true, 'sort_order' => 2]);
        Category::create(['name' => 'First Cat', 'slug' => 'first', 'is_nav_visible' => true, 'sort_order' => 1]);

        $response = $this->get('/');
        $response->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.name', 'First Cat')
            ->where('categories.1.name', 'Second Cat')
        );
    }

    /** @test */
    public function automatic_mega_menu_correctly_loads_category_hierarchy()
    {
        $parent = Category::create([
            'name' => 'Components',
            'slug' => 'components',
            'is_nav_visible' => true,
            'mega_menu_enabled' => true,
            'mega_menu_type' => 'auto',
            'sort_order' => 1,
        ]);

        $child = Category::create([
            'name' => 'Processor',
            'slug' => 'processor',
            'parent_id' => $parent->id,
            'is_nav_visible' => true,
            'sort_order' => 1,
        ]);

        $grandChild = Category::create([
            'name' => 'Intel Core Ultra',
            'slug' => 'intel-core-ultra',
            'parent_id' => $child->id,
            'is_nav_visible' => true,
            'sort_order' => 1,
        ]);

        $response = $this->get('/');
        $response->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.name', 'Components')
            ->where('categories.0.children.0.name', 'Processor')
            ->where('categories.0.children.0.children.0.name', 'Intel Core Ultra')
        );
    }

    /** @test */
    public function manual_mega_menu_displays_configured_custom_groups()
    {
        $gamingCat = Category::create([
            'name' => 'Gaming Gear',
            'slug' => 'gaming-gear',
            'is_nav_visible' => true,
            'mega_menu_enabled' => true,
            'mega_menu_type' => 'manual',
            'mega_menu_layout' => '3_columns',
            'mega_menu_config' => [
                'promo_enabled' => false,
                'manual_groups' => [
                    [
                        'title' => 'Esports Series',
                        'items' => [
                            ['title' => 'ROG Strix', 'url' => '/catalog?brand=asus'],
                            ['title' => 'AORUS Master', 'url' => '/catalog?brand=gigabyte'],
                        ]
                    ]
                ]
            ],
            'sort_order' => 1,
        ]);

        $response = $this->get('/');
        $response->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.mega_menu_type', 'manual')
            ->where('categories.0.mega_menu_config.manual_groups.0.title', 'Esports Series')
            ->where('categories.0.mega_menu_config.manual_groups.0.items.0.title', 'ROG Strix')
        );
    }

    /** @test */
    public function promotional_banner_appears_in_category_configuration()
    {
        Category::create([
            'name' => 'Laptops',
            'slug' => 'laptops',
            'is_nav_visible' => true,
            'mega_menu_enabled' => true,
            'mega_menu_config' => [
                'promo_enabled' => true,
                'promo_title' => 'Blackwell AI Laptops',
                'promo_btn_text' => 'Shop Now',
                'promo_btn_url' => '/catalog?ai=true',
            ],
            'sort_order' => 1,
        ]);

        $response = $this->get('/');
        $response->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.mega_menu_config.promo_enabled', true)
            ->where('categories.0.mega_menu_config.promo_title', 'Blackwell AI Laptops')
        );
    }

    /** @test */
    public function unauthorized_users_cannot_manage_admin_navigation()
    {
        $response = $this->actingAs($this->customer)->get('/admin/navigation');
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_update_mega_menu_configuration()
    {
        $cat = Category::create([
            'name' => 'Monitors',
            'slug' => 'monitors',
            'is_nav_visible' => true,
            'mega_menu_enabled' => false,
            'mega_menu_type' => 'auto',
            'sort_order' => 1,
        ]);

        $updateResponse = $this->actingAs($this->admin)->put("/admin/navigation/mega-menu/{$cat->id}", [
            'mega_menu_enabled' => true,
            'mega_menu_type' => 'manual',
            'mega_menu_layout' => '4_columns',
            'mega_menu_config' => [
                'promo_enabled' => true,
                'promo_title' => 'OLED 360Hz Gaming Monitors',
                'promo_subtitle' => 'Unbeatable speed and infinite contrast.',
                'promo_btn_text' => 'Explore Displays',
                'promo_btn_url' => '/category/monitors',
            ],
            'is_nav_visible' => true,
            'sort_order' => 1,
        ]);

        $updateResponse->assertSessionHasNoErrors();
        $this->assertDatabaseHas('categories', [
            'id' => $cat->id,
            'mega_menu_enabled' => true,
            'mega_menu_type' => 'manual',
            'mega_menu_layout' => '4_columns',
        ]);
    }

    /** @test */
    public function navigation_cache_invalidates_after_category_update()
    {
        // 1. Initial cached state
        Category::create(['name' => 'Old Title', 'slug' => 'old-title', 'is_nav_visible' => true, 'sort_order' => 1]);
        $this->get('/');
        $this->assertTrue(Cache::has('navigation.categories'));

        // 2. Update category
        $cat = Category::where('slug', 'old-title')->first();
        $cat->update(['name' => 'Brand New Title']);

        // Cache must be forgotten automatically by model boot event
        $this->assertFalse(Cache::has('navigation.categories'));

        // 3. Next request caches updated title
        $response = $this->get('/');
        $response->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.name', 'Brand New Title')
        );
    }

    /** @test */
    public function admin_can_reorder_categories()
    {
        $cat1 = Category::create(['name' => 'Cat 1', 'slug' => 'cat-1', 'sort_order' => 1]);
        $cat2 = Category::create(['name' => 'Cat 2', 'slug' => 'cat-2', 'sort_order' => 2]);

        $response = $this->actingAs($this->admin)->post('/admin/navigation/categories/reorder', [
            'categories' => [
                ['id' => $cat1->id, 'sort_order' => 10],
                ['id' => $cat2->id, 'sort_order' => 5],
            ]
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals(10, $cat1->fresh()->sort_order);
        $this->assertEquals(5, $cat2->fresh()->sort_order);
    }
}
