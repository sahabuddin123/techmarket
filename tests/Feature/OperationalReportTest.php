<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Order;
use App\Models\OrderHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

class OperationalReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $perm = Permission::create(['name' => 'reports.operations', 'group' => 'reports', 'display_name' => 'View Operational Reports']);
        $role->permissions()->attach($perm);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($role);
    }

    public function test_operational_pipeline_and_courier_breakdown(): void
    {
        $order1 = Order::create([
            'order_number' => 'ORD-OP-1',
            'customer_name' => 'John',
            'customer_email' => 'john@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 12000,
            'total' => 12000,
            'status' => 'Delivered',
            'courier_provider' => 'Pathao',
            'courier_status' => 'delivered',
            'created_at' => Carbon::now()->subHours(24),
        ]);

        OrderHistory::create([
            'order_id' => $order1->id,
            'status' => 'Delivered',
            'notes' => 'Delivered by Pathao Courier',
            'created_at' => Carbon::now(),
        ]);

        $order2 = Order::create([
            'order_number' => 'ORD-OP-2',
            'customer_name' => 'Jane',
            'customer_email' => 'jane@test.com',
            'customer_phone' => '01799887766',
            'shipping_address' => 'Sylhet',
            'payment_method' => 'COD',
            'payment_status' => 'pending',
            'subtotal' => 8000,
            'total' => 8000,
            'status' => 'Shipped',
            'courier_provider' => 'Steadfast',
            'courier_status' => 'in_transit',
            'created_at' => Carbon::now()->subHours(12),
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/operations');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Operations')
            ->has('reportData.pipeline')
            ->where('reportData.pipeline.Delivered.count', 1)
            ->where('reportData.pipeline.Shipped.count', 1)
            ->has('reportData.fulfillment')
            ->has('reportData.courier_performance', 2)
            ->where('reportData.courier_performance.0.provider', 'Steadfast')
            ->where('reportData.courier_performance.0.pending_in_transit', 1)
            ->where('reportData.courier_performance.1.provider', 'Pathao')
            ->where('reportData.courier_performance.1.delivered', 1)
        );
    }
}
