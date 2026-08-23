<?php

namespace Tests\Feature;

use App\Models\Cctv\CctvEquipmentReplacement;
use App\Models\Cctv\CctvInstalledEquipment;
use App\Models\Cctv\CctvServiceRequest;
use App\Models\Cctv\CctvWarranty;
use App\Models\Cctv\CctvWarrantyClaim;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvAftersalesWarrantyTest extends TestCase
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

    public function test_admin_can_register_installed_equipment_and_activate_warranty(): void
    {
        $admin = $this->createAdminUser();

        $this->actingAs($admin)
            ->post('/admin/cctv/installed-equipment', [
                'product_name_snapshot' => 'Hikvision 4MP IP Camera',
                'serial_number' => 'HIK-TEST-9901',
                'device_type' => 'camera',
                'camera_name' => 'Main Gate PTZ',
                'location_floor' => 'Ground Floor',
                'warranty_months' => 24,
            ])
            ->assertSessionHas('success');

        $equipment = CctvInstalledEquipment::where('serial_number', 'HIK-TEST-9901')->first();
        $this->assertNotNull($equipment);
        $this->assertEquals('Main Gate PTZ', $equipment->camera_name);

        $warranty = CctvWarranty::where('installed_equipment_id', $equipment->id)->first();
        $this->assertNotNull($warranty);
        $this->assertTrue($warranty->isCovered());
        $this->assertEquals('active', $warranty->status);
    }

    public function test_customer_can_view_equipment_and_submit_service_request(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $equipment = CctvInstalledEquipment::create([
            'user_id' => $customer->id,
            'product_name_snapshot' => 'Dahua 8CH NVR 4K',
            'serial_number' => 'DH-NVR-8822',
            'device_type' => 'recorder',
            'camera_name' => 'Central Server Room NVR',
            'status' => 'operational',
        ]);

        $warranty = CctvWarranty::create([
            'installed_equipment_id' => $equipment->id,
            'user_id' => $customer->id,
            'serial_number' => $equipment->serial_number,
            'warranty_type' => 'manufacturer',
            'warranty_start' => now()->subMonth(),
            'warranty_end' => now()->addMonths(11),
            'status' => 'active',
        ]);

        // 1. Customer views equipment
        $res = $this->actingAs($customer)->get('/account/cctv-equipment');
        $res->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Account/CctvEquipment')
                ->has('equipment')
            );

        // 2. Customer submits service request
        $ticketRes = $this->actingAs($customer)->postJson('/account/cctv-services', [
            'installed_equipment_id' => $equipment->id,
            'customer_name' => $customer->name,
            'customer_phone' => '01799887766',
            'customer_address' => 'Road 12, Banani, Dhaka',
            'problem_category' => 'recording',
            'problem_description' => 'HDD error beep sounding periodically from NVR.',
            'priority' => 'high',
        ]);

        $ticketRes->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.warranty_covered', true);

        $this->assertDatabaseHas('cctv_service_requests', [
            'user_id' => $customer->id,
            'installed_equipment_id' => $equipment->id,
            'warranty_id' => $warranty->id,
            'status' => 'submitted',
        ]);
    }

    public function test_admin_can_manage_service_requests_and_equipment_replacement(): void
    {
        $admin = $this->createAdminUser();
        $customer = User::factory()->create(['role' => 'customer']);

        $equipment = CctvInstalledEquipment::create([
            'user_id' => $customer->id,
            'product_name_snapshot' => 'Defective 2MP Camera',
            'serial_number' => 'OLD-CAM-001',
            'device_type' => 'camera',
            'status' => 'faulty',
        ]);

        $serviceRequest = CctvServiceRequest::create([
            'user_id' => $customer->id,
            'installed_equipment_id' => $equipment->id,
            'customer_name' => $customer->name,
            'customer_phone' => '01711000000',
            'customer_address' => 'Mirpur 10, Dhaka',
            'problem_category' => 'camera',
            'problem_description' => 'Image sensor burnt after lightning surge.',
            'priority' => 'urgent',
            'status' => 'submitted',
        ]);

        // 1. Admin updates status and assigns technician
        $this->actingAs($admin)
            ->post("/admin/cctv/service-requests/{$serviceRequest->id}/status", [
                'status' => 'repairing',
                'assigned_technician_id' => $admin->id,
                'internal_notes' => 'Confirmed lightning surge. Replaced camera unit.',
                'total_service_cost' => 800,
            ])
            ->assertSessionHas('success');

        $this->assertEquals('repairing', $serviceRequest->fresh()->status);
        $this->assertEquals($admin->id, $serviceRequest->fresh()->assigned_technician_id);

        // 2. Record equipment replacement
        $newEquipment = CctvInstalledEquipment::create([
            'user_id' => $customer->id,
            'product_name_snapshot' => 'Replacement 2MP Camera',
            'serial_number' => 'NEW-CAM-002',
            'device_type' => 'camera',
            'status' => 'operational',
        ]);

        $replacement = CctvEquipmentReplacement::create([
            'service_request_id' => $serviceRequest->id,
            'old_equipment_id' => $equipment->id,
            'new_equipment_id' => $newEquipment->id,
            'old_serial_number' => $equipment->serial_number,
            'new_serial_number' => $newEquipment->serial_number,
            'reason' => 'Image sensor burnt out',
            'replaced_by_user_id' => $admin->id,
        ]);

        $this->assertDatabaseHas('cctv_equipment_replacements', [
            'service_request_id' => $serviceRequest->id,
            'old_serial_number' => 'OLD-CAM-001',
            'new_serial_number' => 'NEW-CAM-002',
        ]);
    }
}
