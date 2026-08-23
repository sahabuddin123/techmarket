<?php

namespace Tests\Feature;

use App\Models\Cctv\CctvEstimate;
use App\Models\Cctv\CctvEstimateItem;
use App\Models\Cctv\CctvProject;
use App\Models\Cctv\CctvProjectBuilding;
use App\Models\Cctv\CctvProjectChangeRequest;
use App\Models\Cctv\CctvProjectSite;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvEnterpriseProjectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function createAdminUser(): User
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'Super Admin'],
            ['display_name' => 'Super Administrator']
        );
        $admin->roles()->attach($superAdminRole->id);

        $permissions = \App\Models\Permission::all();
        $superAdminRole->permissions()->sync($permissions->pluck('id'));

        return $admin;
    }

    public function test_customer_can_create_enterprise_project_and_add_sites(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        // 1. Customer creates enterprise project
        $res = $this->actingAs($customer)->postJson('/account/cctv-projects', [
            'name' => 'Apex Group Nationwide Surveillance',
            'organization_name' => 'Apex Holdings Ltd',
            'project_type' => 'factory',
            'industry' => 'Garments & Manufacturing',
            'priority' => 'urgent',
            'budget' => 1200000.00,
            'sites' => [
                [
                    'name' => 'Gazipur Garment Factory',
                    'address' => 'Plot 42, Gazipur Industrial Area',
                    'district' => 'Gazipur',
                    'site_type' => 'factory',
                ],
            ],
        ]);

        $res->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $project = CctvProject::where('user_id', $customer->id)->first();
        $this->assertNotNull($project);
        $this->assertEquals('Apex Group Nationwide Surveillance', $project->name);
        $this->assertEquals('urgent', $project->priority);
        $this->assertEquals(1, $project->sites()->count());

        // 2. Customer adds another site
        $siteRes = $this->actingAs($customer)->postJson("/account/cctv-projects/{$project->id}/sites", [
            'name' => 'Chittagong Warehouse Hub',
            'address' => 'Agrabad C/A, Chittagong',
            'district' => 'Chittagong',
            'site_type' => 'warehouse',
        ]);

        $siteRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertEquals(2, $project->fresh()->sites()->count());
    }

    public function test_project_authoritatively_aggregates_multisite_estimates(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $project = CctvProject::create([
            'user_id' => $customer->id,
            'name' => 'Square Pharmaceuticals Campus Security',
            'project_type' => 'industrial',
            'budget' => 2000000.00,
        ]);

        $site1 = CctvProjectSite::create([
            'project_id' => $project->id,
            'name' => 'Production Plant A',
            'address' => 'Pabna Plant',
            'district' => 'Pabna',
        ]);

        $site2 = CctvProjectSite::create([
            'project_id' => $project->id,
            'name' => 'R&D Labs B',
            'address' => 'Dhaka Tech Park',
            'district' => 'Dhaka',
        ]);

        // Create Estimate 1 for Site 1 (30 Cameras, ৳450,000)
        $estimate1 = CctvEstimate::create([
            'project_id' => $project->id,
            'site_id' => $site1->id,
            'estimate_number' => 'EST-SITE1-001',
            'project_name' => 'Plant A CCTV',
            'subtotal_amount' => 400000.00,
            'installation_amount' => 50000.00,
            'grand_total' => 450000.00,
        ]);

        CctvEstimateItem::create([
            'estimate_id' => $estimate1->id,
            'item_type' => 'selected_camera',
            'item_role' => 'camera',
            'product_name_snapshot' => '5MP AI Bullet Camera',
            'product_sku_snapshot' => 'CAM-5MP-01',
            'quantity' => 30,
            'unit_price' => 5000.00,
            'total_price' => 150000.00,
        ]);

        // Create Estimate 2 for Site 2 (10 Cameras, ৳180,000)
        $estimate2 = CctvEstimate::create([
            'project_id' => $project->id,
            'site_id' => $site2->id,
            'estimate_number' => 'EST-SITE2-002',
            'project_name' => 'Labs B CCTV',
            'subtotal_amount' => 160000.00,
            'installation_amount' => 20000.00,
            'grand_total' => 180000.00,
        ]);

        CctvEstimateItem::create([
            'estimate_id' => $estimate2->id,
            'item_type' => 'selected_camera',
            'item_role' => 'camera',
            'product_name_snapshot' => '4MP Dome Camera',
            'product_sku_snapshot' => 'CAM-4MP-02',
            'quantity' => 10,
            'unit_price' => 4000.00,
            'total_price' => 40000.00,
        ]);

        // Authoritative aggregation check
        $metrics = $project->aggregated_metrics;
        $this->assertEquals(2, $metrics['sites_count']);
        $this->assertEquals(2, $metrics['estimates_count']);
        $this->assertEquals(40, $metrics['total_cameras']);
        $this->assertEquals(630000.00, $metrics['total_project_value']);
        $this->assertEquals(1370000.00, $metrics['budget_variance']);
    }

    public function test_customer_can_submit_change_request_and_admin_manage_project(): void
    {
        $admin = $this->createAdminUser();
        $customer = User::factory()->create(['role' => 'customer']);

        $project = CctvProject::create([
            'user_id' => $customer->id,
            'name' => 'Beximco Industrial Park',
            'project_type' => 'industrial',
            'budget' => 5000000.00,
            'status' => 'approved',
        ]);

        // 1. Customer submits Change Request
        $crRes = $this->actingAs($customer)->postJson("/account/cctv-projects/{$project->id}/change-requests", [
            'title' => 'Add Perimeter Thermal Cameras',
            'description' => 'Expand scope to include 4 thermal cameras on boundary wall.',
            'cost_impact' => 240000.00,
        ]);

        $crRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $cr = CctvProjectChangeRequest::where('project_id', $project->id)->first();
        $this->assertNotNull($cr);
        $this->assertEquals('Add Perimeter Thermal Cameras', $cr->title);
        $this->assertEquals(240000.00, (float) $cr->cost_impact);

        // 2. Admin inspects and updates project status
        $this->actingAs($admin)
            ->post("/admin/cctv/projects/{$project->id}/status", [
                'status' => 'installation',
                'priority' => 'critical',
                'project_manager_id' => $admin->id,
                'budget' => 5240000.00,
            ])
            ->assertSessionHas('success');

        $this->assertEquals('installation', $project->fresh()->status);
        $this->assertEquals('critical', $project->fresh()->priority);
        $this->assertEquals(5240000.00, (float) $project->fresh()->budget);
    }
}
