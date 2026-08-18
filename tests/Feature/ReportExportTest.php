<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReportExportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $perm = Permission::create(['name' => 'reports.export', 'group' => 'reports', 'display_name' => 'Export Reports Data']);
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

    public function test_authorized_admin_can_export_sales_report_csv(): void
    {
        Order::create([
            'order_number' => 'ORD-EXP-101',
            'customer_name' => 'John Doe, Esq.',
            'customer_email' => 'john@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'House 12, Road 5, Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 25000,
            'discount' => 1000,
            'shipping_cost' => 60,
            'total' => 24060,
            'status' => 'Delivered',
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/export?type=sales&period=last_30_days');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment; filename=', $response->headers->get('Content-Disposition'));

        ob_start();
        $response->sendContent();
        $csvContent = ob_get_clean();

        $this->assertStringContainsString('Order Number', $csvContent);
        $this->assertStringContainsString('Customer Name', $csvContent);
        $this->assertStringContainsString('ORD-EXP-101', $csvContent);
        $this->assertStringContainsString('John Doe, Esq.', $csvContent);
        $this->assertStringContainsString('24060.00', $csvContent);
    }

    public function test_inventory_csv_export(): void
    {
        $category = Category::create(['name' => 'Power Supplies', 'slug' => 'psu']);
        Product::create([
            'title' => 'Corsair RM850x, 850W Gold',
            'slug' => 'corsair-rm850x',
            'sku' => 'PSU-850X',
            'category_id' => $category->id,
            'price' => 16500,
            'cost_price' => 14000,
            'stock' => 8,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/export?type=inventory');

        $response->assertStatus(200);

        ob_start();
        $response->sendContent();
        $csvContent = ob_get_clean();

        $this->assertStringContainsString('Product ID', $csvContent);
        $this->assertStringContainsString('Product Title', $csvContent);
        $this->assertStringContainsString('PSU-850X', $csvContent);
        $this->assertStringContainsString('Corsair RM850x', $csvContent);
    }

    public function test_customer_is_forbidden_from_exporting_reports(): void
    {
        $response = $this->actingAs($this->customer)->get('/admin/reports/export?type=sales');
        $response->assertStatus(403);
    }
}
