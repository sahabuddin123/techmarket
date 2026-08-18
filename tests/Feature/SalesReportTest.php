<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Order;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

class SalesReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $perm = Permission::create(['name' => 'reports.sales', 'group' => 'reports', 'display_name' => 'View Sales Reports']);
        $role->permissions()->attach($perm);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($role);

        $this->customer = User::create([
            'name' => 'Regular Customer',
            'email' => 'customer@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
    }

    public function test_sales_report_aggregates_revenue_and_payment_methods(): void
    {
        Order::create([
            'order_number' => 'ORD-101',
            'customer_name' => 'Customer A',
            'customer_email' => 'a@test.com',
            'customer_phone' => '01700000001',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 10000,
            'discount' => 500,
            'total' => 9500,
            'status' => 'Delivered',
            'created_at' => Carbon::now(),
        ]);

        Order::create([
            'order_number' => 'ORD-102',
            'customer_name' => 'Customer B',
            'customer_email' => 'b@test.com',
            'customer_phone' => '01700000002',
            'shipping_address' => 'Chattogram',
            'payment_method' => 'COD',
            'payment_status' => 'pending',
            'subtotal' => 5000,
            'discount' => 0,
            'total' => 5000,
            'status' => 'Processing',
            'created_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/sales?period=last_30_days');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Sales')
            ->has('reportData.summary')
            ->where('reportData.summary.gross_revenue', 14500)
            ->where('reportData.summary.total_orders', 2)
            ->where('reportData.summary.total_discount', 500)
            ->has('reportData.payment_methods', 2)
        );
    }

    public function test_unauthorized_customer_cannot_access_sales_report(): void
    {
        $response = $this->actingAs($this->customer)->get('/admin/reports/sales');
        $response->assertStatus(403);
    }
}
