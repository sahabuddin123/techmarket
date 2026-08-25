<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\SettingController;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminGlobalSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin Officer',
            'email' => 'admin@techmarket.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->customer = User::create([
            'name' => 'Regular Customer',
            'email' => 'customer@techmarket.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);
    }

    public function test_unauthorized_customer_cannot_access_global_settings(): void
    {
        $this->actingAs($this->customer);

        $response = $this->get('/admin/settings');
        $response->assertStatus(403);

        $updateResponse = $this->post('/admin/settings', [
            'site_name' => 'Hacked Site',
        ]);
        $updateResponse->assertStatus(403);
    }

    public function test_admin_can_view_global_settings_workspace(): void
    {
        $this->actingAs($this->admin);

        Setting::set('site_name', 'TechMarket BD Enterprise', 'general');
        Setting::set('hotline', '09612-888888', 'general');

        $response = $this->get('/admin/settings');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Settings/Index')
            ->has('settings')
            ->has('systemInfo')
            ->where('settings.site_name', 'TechMarket BD Enterprise')
        );
    }

    public function test_admin_can_update_multi_group_settings(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/admin/settings', [
            'site_name' => 'TechMarket BD Official',
            'site_tagline' => 'Next-Gen PC Hardware & Accessories',
            'site_logo' => 'https://images.unsplash.com/logo.png',
            'shipping_inside_dhaka' => '70.00',
            'shipping_outside_dhaka' => '130.00',
            'free_shipping_threshold' => '60000.00',
            'default_meta_title' => 'Best Gaming PC Store in Bangladesh',
            'bkash_number' => '01711-223344',
            'maintenance_mode' => false,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('TechMarket BD Official', Setting::get('site_name'));
        $this->assertEquals('Next-Gen PC Hardware & Accessories', Setting::get('site_tagline'));
        $this->assertEquals('https://images.unsplash.com/logo.png', Setting::get('site_logo'));
        $this->assertEquals('70.00', Setting::get('shipping_inside_dhaka'));
        $this->assertEquals('01711-223344', Setting::get('bkash_number'));
    }

    public function test_admin_can_purge_system_cache_on_demand(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/admin/settings/clear-cache');
        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_admin_can_view_appearance_settings_workspace(): void
    {
        $this->actingAs($this->admin);

        Setting::set('admin_brand_name', 'Custom TechLand OS', 'admin_theme');
        Setting::set('admin_font_family', 'Plus Jakarta Sans', 'admin_theme');

        $response = $this->get('/admin/settings/appearance');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Settings/Appearance')
            ->has('themeSettings')
            ->has('defaultTheme')
            ->where('themeSettings.admin_brand_name', 'Custom TechLand OS')
            ->where('themeSettings.admin_font_family', 'Plus Jakarta Sans')
        );
    }

    public function test_admin_can_update_appearance_settings(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/admin/settings/appearance', [
            'admin_brand_name' => 'Enterprise Commerce HQ',
            'admin_font_family' => 'Manrope',
            'admin_heading_font' => 'Plus Jakarta Sans',
            'admin_primary_color' => '#7c3aed',
            'admin_secondary_color' => '#8b5cf6',
            'admin_border_radius' => '16px',
            'admin_card_style' => 'soft_shadow',
            'admin_density' => 'comfortable',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('Enterprise Commerce HQ', Setting::get('admin_brand_name'));
        $this->assertEquals('Manrope', Setting::get('admin_font_family'));
        $this->assertEquals('Plus Jakarta Sans', Setting::get('admin_heading_font'));
        $this->assertEquals('#7c3aed', Setting::get('admin_primary_color'));
        $this->assertEquals('16px', Setting::get('admin_border_radius'));
    }

    public function test_admin_can_reset_appearance_settings(): void
    {
        $this->actingAs($this->admin);

        // First set custom values
        Setting::set('admin_primary_color', '#123456', 'admin_theme');
        Setting::set('admin_font_family', 'DM Sans', 'admin_theme');

        // Reset
        $response = $this->post('/admin/settings/appearance/reset');
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(SettingController::DEFAULT_ADMIN_THEME['admin_primary_color'], Setting::get('admin_primary_color'));
        $this->assertEquals(SettingController::DEFAULT_ADMIN_THEME['admin_font_family'], Setting::get('admin_font_family'));
    }

    public function test_unauthorized_customer_cannot_access_appearance_settings(): void
    {
        $this->actingAs($this->customer);

        $response = $this->get('/admin/settings/appearance');
        $response->assertStatus(403);

        $updateResponse = $this->post('/admin/settings/appearance', [
            'admin_brand_name' => 'Hacked Brand',
        ]);
        $updateResponse->assertStatus(403);
    }
}
