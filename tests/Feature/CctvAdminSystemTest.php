<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Cctv\CctvProductProfile;
use App\Models\Cctv\CctvRule;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvAdminSystemTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Super Admin User
        $this->adminUser = User::factory()->create(['role' => 'admin']);
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'Super Admin'],
            ['display_name' => 'Super Administrator']
        );
        $this->adminUser->roles()->attach($superAdminRole->id);

        // Attach permissions
        $permissions = Permission::all();
        $superAdminRole->permissions()->sync($permissions->pluck('id'));
    }

    public function test_admin_can_access_cctv_dashboard(): void
    {
        $response = $this->actingAs($this->adminUser)->get('/admin/cctv');

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Cctv/Dashboard')
                ->has('kpis')
            );
    }

    public function test_admin_can_attach_and_delete_cctv_product_profile(): void
    {
        $category = \App\Models\Category::create([
            'name' => 'Security Cameras',
            'slug' => 'security-cameras',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Hikvision 4MP Turret IP Camera',
            'slug' => 'hikvision-4mp-turret-ip-camera',
            'sku' => 'HIK-4MP-TURRET',
            'price' => 4200,
            'stock' => 50,
            'is_active' => true,
        ]);

        $payload = [
            'product_id' => $product->id,
            'product_type' => 'camera',
            'system_type' => 'ip',
            'resolution_mp' => 4.0,
            'camera_form_factor' => 'turret',
            'lens_mm' => 2.8,
            'ir_distance_meters' => 30,
            'low_light_tech' => 'ColorVu',
            'audio_type' => 'built_in_mic',
            'ip_rating' => 'IP67',
            'environment' => 'both',
            'power_source' => 'poe',
            'power_consumption_watts' => 6.5,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser)->post('/admin/cctv/profiles', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('cctv_product_profiles', [
            'product_id' => $product->id,
            'product_type' => 'camera',
            'system_type' => 'ip',
            'resolution_mp' => 4.0,
        ]);

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'cctv.profile_created',
            'user_id' => $this->adminUser->id,
        ]);

        // Delete profile
        $profile = CctvProductProfile::where('product_id', $product->id)->first();
        $deleteResponse = $this->actingAs($this->adminUser)->delete("/admin/cctv/profiles/{$profile->id}");
        $deleteResponse->assertRedirect();

        $this->assertDatabaseMissing('cctv_product_profiles', ['id' => $profile->id]);
    }

    public function test_admin_can_create_toggle_and_delete_cctv_rules(): void
    {
        $payload = [
            'name' => 'Require 16 Port PoE Switch for >8 Cameras',
            'code' => 'RULE_TEST_POE_16',
            'rule_type' => 'recommendation',
            'system_type_scope' => 'ip',
            'description' => 'Test rule description',
            'priority' => 150,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser)->post('/admin/cctv/rules', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('cctv_rules', [
            'code' => 'RULE_TEST_POE_16',
            'priority' => 150,
            'is_active' => 1,
        ]);

        $rule = CctvRule::where('code', 'RULE_TEST_POE_16')->first();

        // Toggle status
        $toggleResponse = $this->actingAs($this->adminUser)->post("/admin/cctv/rules/{$rule->id}/toggle-status");
        $toggleResponse->assertRedirect();
        $this->assertDatabaseHas('cctv_rules', ['id' => $rule->id, 'is_active' => 0]);

        // Delete
        $deleteResponse = $this->actingAs($this->adminUser)->delete("/admin/cctv/rules/{$rule->id}");
        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('cctv_rules', ['id' => $rule->id]);
    }

    public function test_admin_can_update_cctv_calculation_settings(): void
    {
        $payload = [
            'cctv_engine_version' => '2.5.0',
            'cctv_storage_overhead_percent' => 12.5,
            'cctv_cable_waste_percent' => 18.0,
            'cctv_cable_safety_margin_meters' => 25,
            'cctv_default_recording_days' => 30,
            'cctv_default_recording_hours' => 24,
            'cctv_installation_base_charge' => 2000,
            'cctv_installation_per_camera_charge' => 600,
            'cctv_quote_validity_days' => 20,
            'cctv_storefront_version_enabled' => 'v1,v2,v3',
        ];

        $response = $this->actingAs($this->adminUser)->post('/admin/cctv/settings', $payload);

        $response->assertRedirect();
        $this->assertEquals('2.5.0', Setting::get('cctv_engine_version'));
        $this->assertEquals('12.5', Setting::get('cctv_storage_overhead_percent'));
        $this->assertEquals('30', Setting::get('cctv_default_recording_days'));
    }

    public function test_admin_rule_tester_executes_live_calculation(): void
    {
        $payload = [
            'requirements' => [
                'project_name' => 'Warehouse Security',
                'project_type' => 'warehouse_factory',
                'system_type' => 'ip',
                'total_cameras' => 8,
                'recording_days' => 30,
                'recording_hours_per_day' => 24,
                'preferred_codec' => 'H.265+',
                'average_cable_distance_meters' => 40.0,
            ],
            'items' => [],
        ];

        $response = $this->actingAs($this->adminUser)->postJson('/admin/cctv/test/run', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'project_name',
                    'storage_metrics' => ['recommended_hdd_capacity_tb'],
                    'cable_metrics' => ['recommended_rolls_count'],
                    'validation' => ['is_compatible'],
                ],
            ]);
    }
}
