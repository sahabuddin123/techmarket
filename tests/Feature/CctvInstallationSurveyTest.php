<?php

namespace Tests\Feature;

use App\Models\Cctv\CctvInstallationJob;
use App\Models\Cctv\CctvServiceType;
use App\Models\Cctv\CctvSiteSurvey;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvInstallationSurveyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_customer_can_submit_site_survey_request(): void
    {
        $response = $this->postJson('/site-survey', [
            'customer_name' => 'Engr. Rafiqul Islam',
            'customer_phone' => '01712345678',
            'customer_email' => 'rafiq@example.com',
            'project_name' => 'Factory Surveillance Audit',
            'project_address' => 'Plot 45, Tejgaon I/A, Dhaka',
            'district' => 'Dhaka',
            'preferred_date' => now()->addDays(2)->format('Y-m-d'),
            'preferred_time' => 'Morning (10:00 AM - 1:00 PM)',
            'floors_count' => 3,
            'estimated_camera_count' => 16,
            'notes' => 'Need outdoor PTZ cameras for perimeter fence.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('cctv_site_surveys', [
            'customer_name' => 'Engr. Rafiqul Islam',
            'customer_phone' => '01712345678',
            'district' => 'Dhaka',
            'estimated_camera_count' => 16,
            'status' => 'requested',
        ]);
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

    public function test_admin_can_manage_surveys_and_record_reports(): void
    {
        $admin = $this->createAdminUser();

        $survey = CctvSiteSurvey::create([
            'customer_name' => 'Dr. Hasan',
            'customer_phone' => '01811223344',
            'project_address' => 'Gulshan 2, Dhaka',
            'district' => 'Dhaka',
            'estimated_camera_count' => 8,
            'status' => 'requested',
        ]);

        // 1. Admin updates survey status and assigns technician
        $this->actingAs($admin)
            ->post("/admin/cctv/surveys/{$survey->id}/status", [
                'status' => 'assigned',
                'assigned_technician_id' => $admin->id,
            ])
            ->assertSessionHas('success');

        $this->assertEquals('assigned', $survey->fresh()->status);
        $this->assertEquals($admin->id, $survey->fresh()->assigned_technician_id);

        // 2. Admin records site survey report
        $this->actingAs($admin)
            ->post("/admin/cctv/surveys/{$survey->id}/report", [
                'actual_camera_count' => 10,
                'indoor_cameras' => 6,
                'outdoor_cameras' => 4,
                'ptz_cameras' => 1,
                'recommended_system_type' => 'ip',
                'cable_length_meters' => 250,
                'power_requirement_watts' => 120,
                'installation_difficulty' => 'standard',
                'special_materials' => '250m Cat6 UTP, 10 waterproof junction boxes',
                'technician_notes' => 'Customer requested mobile app viewing on 3 devices.',
            ])
            ->assertSessionHas('success');

        $this->assertEquals('completed', $survey->fresh()->status);
        $this->assertDatabaseHas('cctv_site_survey_reports', [
            'survey_id' => $survey->id,
            'actual_camera_count' => 10,
            'recommended_system_type' => 'ip',
        ]);
    }

    public function test_admin_can_manage_service_types_and_dynamic_pricing(): void
    {
        $admin = $this->createAdminUser();

        $this->actingAs($admin)
            ->post('/admin/cctv/services', [
                'name' => 'Standard Camera Mounting & Cabling',
                'code' => 'cam_install_std',
                'pricing_type' => 'per_camera',
                'base_rate' => 500,
                'unit_rate' => 350,
                'description' => 'Wall mount, RJ45 termination, camera focus alignment',
                'is_active' => true,
            ])
            ->assertSessionHas('success');

        $service = CctvServiceType::where('code', 'cam_install_std')->first();
        $this->assertNotNull($service);

        // 4 cameras installation fee: 500 base + (350 * 4) = 1900 BDT
        $calculatedFee = $service->calculateServiceFee(cameraCount: 4);
        $this->assertEquals(1900.0, $calculatedFee);
    }

    public function test_admin_can_update_installation_job_and_testing_checklist(): void
    {
        $admin = $this->createAdminUser();

        $job = CctvInstallationJob::create([
            'customer_name' => 'Mr. Farhad',
            'customer_phone' => '01911887766',
            'customer_address' => 'Banani, Dhaka',
            'camera_count' => 8,
            'status' => 'in_progress',
        ]);

        $this->actingAs($admin)
            ->post("/admin/cctv/installations/{$job->id}/status", [
                'status' => 'completed',
                'assigned_technician_id' => $admin->id,
                'installed_camera_count' => 8,
                'testing_checklist' => [
                    'camera_test' => 'passed',
                    'night_vision_test' => 'passed',
                    'recording_test' => 'passed',
                    'mobile_app_test' => 'passed',
                ],
                'technician_notes' => 'Installed all 8 cameras and trained client on mobile app.',
            ])
            ->assertSessionHas('success');

        $this->assertEquals('completed', $job->fresh()->status);
        $this->assertEquals(8, $job->fresh()->installed_camera_count);
        $this->assertNotNull($job->fresh()->actual_end_at);
    }
}
