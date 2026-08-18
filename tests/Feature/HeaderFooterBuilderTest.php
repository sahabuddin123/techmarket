<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Navigation;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

class HeaderFooterBuilderTest extends TestCase
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
    public function admin_can_access_header_footer_builder_workspace()
    {
        Navigation::create([
            'title' => 'Custom Info Link',
            'url' => '/page/custom-info',
            'location' => 'footer_info',
            'sort_order' => 1,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/header-footer');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/HeaderFooter/Index')
            ->has('settings')
            ->has('footerInfoLinks', 1)
            ->where('footerInfoLinks.0.title', 'Custom Info Link')
        );
    }

    /** @test */
    public function unauthorized_users_cannot_access_or_modify_header_footer()
    {
        $response = $this->actingAs($this->customer)->get('/admin/header-footer');
        $response->assertStatus(403);

        $postResponse = $this->actingAs($this->customer)->post('/admin/header-footer/settings', [
            'settings' => ['site_name' => 'Hacked Site'],
        ]);
        $postResponse->assertStatus(403);
    }

    /** @test */
    public function admin_can_update_announcement_and_branding_settings()
    {
        $response = $this->actingAs($this->admin)->post('/admin/header-footer/settings', [
            'settings' => [
                'header_announcement_enabled' => '1',
                'header_announcement_text' => 'Eid Special Discount 2026',
                'header_announcement_link' => '/offers/eid-2026',
                'header_announcement_bg' => '#b91c1c',
                'hotline' => '01999888777',
            ]
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('settings', [
            'key' => 'header_announcement_text',
            'value' => 'Eid Special Discount 2026',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'hotline',
            'value' => '01999888777',
        ]);
    }

    /** @test */
    public function admin_can_create_and_manage_navigation_links()
    {
        // 1. Create a footer policy link
        $createResponse = $this->actingAs($this->admin)->post('/admin/header-footer/links', [
            'title' => 'E-Commerce Return Policy',
            'url' => '/page/return-policy',
            'location' => 'footer_policies',
            'sort_order' => 1,
            'is_visible' => true,
            'open_new_tab' => false,
        ]);

        $createResponse->assertSessionHasNoErrors();
        $this->assertDatabaseHas('navigations', [
            'title' => 'E-Commerce Return Policy',
            'location' => 'footer_policies',
        ]);

        $nav = Navigation::where('title', 'E-Commerce Return Policy')->first();

        // 2. Update navigation link
        $updateResponse = $this->actingAs($this->admin)->put("/admin/header-footer/links/{$nav->id}", [
            'title' => 'Updated Return & Exchange Policy',
            'url' => '/page/returns',
            'location' => 'footer_policies',
            'sort_order' => 2,
            'is_visible' => true,
            'open_new_tab' => true,
        ]);

        $updateResponse->assertSessionHasNoErrors();
        $this->assertDatabaseHas('navigations', [
            'id' => $nav->id,
            'title' => 'Updated Return & Exchange Policy',
            'url' => '/page/returns',
        ]);

        // 3. Delete navigation link
        $deleteResponse = $this->actingAs($this->admin)->delete("/admin/header-footer/links/{$nav->id}");
        $deleteResponse->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('navigations', ['id' => $nav->id]);
    }

    /** @test */
    public function storefront_receives_dynamic_footer_and_header_navigations()
    {
        Navigation::create([
            'title' => 'Official Brand Stores',
            'url' => '/brands',
            'location' => 'footer_info',
            'sort_order' => 1,
            'is_visible' => true,
        ]);

        Navigation::create([
            'title' => 'Hardware Warranty Policy',
            'url' => '/page/warranty',
            'location' => 'footer_policies',
            'sort_order' => 1,
            'is_visible' => true,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->has('footerNavigations.info', 1)
            ->where('footerNavigations.info.0.title', 'Official Brand Stores')
            ->has('footerNavigations.policies', 1)
            ->where('footerNavigations.policies.0.title', 'Hardware Warranty Policy')
        );
    }
}
