<?php

namespace Tests\Feature;

use App\Models\Cctv\CctvEstimate;
use App\Models\Cctv\CctvInstallationJob;
use App\Models\Cctv\CctvInstalledEquipment;
use App\Models\Cctv\CctvQuote;
use App\Models\Cctv\CctvSavedReport;
use App\Models\Cctv\CctvServiceRequest;
use App\Models\Cctv\CctvWarranty;
use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use App\Services\Cctv\CctvAnalyticsService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvEnterpriseAnalyticsTest extends TestCase
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

    public function test_executive_kpis_reflect_real_database_records(): void
    {
        $admin = $this->createAdminUser();
        $customer = User::factory()->create(['role' => 'customer']);

        // 1. Create CCTV Estimate & Quote (৳120,000)
        $estimate = CctvEstimate::create([
            'user_id' => $customer->id,
            'estimate_number' => 'EST-ANALYTICS-001',
            'project_name' => 'HQ CCTV Setup',
            'grand_total' => 120000.00,
            'status' => 'ordered',
        ]);

        $quote = CctvQuote::create([
            'quote_number' => 'QUO-ANALYTICS-001',
            'estimate_id' => $estimate->id,
            'user_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_phone' => '01711223344',
            'customer_email' => $customer->email,
            'subtotal' => 120000.00,
            'grand_total' => 120000.00,
            'status' => 'converted_to_order',
            'valid_until' => now()->addDays(7),
        ]);

        // 2. Create Order for this Quote (৳120,000)
        Order::create([
            'order_number' => 'ORD-CCTV-001',
            'user_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_phone' => '01711223344',
            'customer_email' => $customer->email,
            'shipping_address' => 'Dhaka Bangladesh',
            'cctv_quote_id' => $quote->id,
            'total' => 120000.00,
            'subtotal' => 120000.00,
            'payment_method' => 'cod',
            'status' => 'completed',
        ]);

        // 3. Register Installed Camera
        CctvInstalledEquipment::create([
            'user_id' => $customer->id,
            'product_name_snapshot' => 'Hikvision 4MP Camera',
            'serial_number' => 'CAM-REAL-101',
            'device_type' => 'camera',
            'status' => 'operational',
        ]);

        // Query Analytics Dashboard
        $res = $this->actingAs($admin)->get('/admin/cctv/analytics?range=this_year');
        $res->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Cctv/AnalyticsDashboard')
                ->where('kpis.quote_value', 120000)
                ->where('kpis.cctv_revenue', 120000)
                ->where('kpis.cctv_orders_count', 1)
                ->where('kpis.installed_cameras', 1)
            );
    }

    public function test_alert_center_detects_real_critical_operational_conditions(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        // 1. Create Expiring Warranty
        $equipment = CctvInstalledEquipment::create([
            'user_id' => $customer->id,
            'product_name_snapshot' => 'Dahua 8CH NVR',
            'serial_number' => 'NVR-ALERT-001',
            'device_type' => 'recorder',
            'status' => 'operational',
        ]);

        CctvWarranty::create([
            'installed_equipment_id' => $equipment->id,
            'user_id' => $customer->id,
            'serial_number' => $equipment->serial_number,
            'warranty_type' => 'manufacturer',
            'warranty_start' => now()->subYear(),
            'warranty_end' => now()->addDays(5), // Expiring in 5 days
            'status' => 'active',
        ]);

        // 2. Create Urgent Service Ticket
        CctvServiceRequest::create([
            'user_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_phone' => '01711000000',
            'customer_address' => 'Tejgaon, Dhaka',
            'problem_category' => 'recording',
            'problem_description' => 'Storage disk damaged during power outage.',
            'priority' => 'urgent',
            'status' => 'submitted',
        ]);

        // 3. Create Unassigned Installation Job
        CctvInstallationJob::create([
            'job_number' => 'JOB-ALERT-001',
            'user_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_phone' => '01711000000',
            'customer_address' => 'Dhanmondi 27',
            'camera_count' => 16,
            'status' => 'scheduled',
        ]);

        $service = app(CctvAnalyticsService::class);
        $alerts = $service->getSystemAlerts();

        $this->assertCount(3, $alerts);
        $types = array_column($alerts, 'type');
        $this->assertContains('warranty_expiring', $types);
        $this->assertContains('urgent_tickets', $types);
        $this->assertContains('unassigned_installations', $types);
    }

    public function test_admin_can_save_custom_report_template(): void
    {
        $admin = $this->createAdminUser();

        $this->actingAs($admin)
            ->post('/admin/cctv/reports/save', [
                'name' => 'Monthly Commercial Sales Audit',
                'report_type' => 'sales',
                'description' => 'Comprehensive monthly CCTV orders breakdown.',
                'columns' => ['order_number', 'customer_name', 'total_amount', 'created_at'],
                'sort_by' => 'created_at',
                'sort_direction' => 'desc',
            ])
            ->assertSessionHas('success');

        $report = CctvSavedReport::where('name', 'Monthly Commercial Sales Audit')->first();
        $this->assertNotNull($report);
        $this->assertEquals('sales', $report->report_type);
        $this->assertEquals($admin->id, $report->created_by_user_id);
    }
}
