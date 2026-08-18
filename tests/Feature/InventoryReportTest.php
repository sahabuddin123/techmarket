<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Category;
use App\Models\InventoryMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

class InventoryReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $perm = Permission::create(['name' => 'reports.inventory', 'group' => 'reports', 'display_name' => 'View Inventory Reports']);
        $role->permissions()->attach($perm);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($role);
    }

    public function test_inventory_valuation_and_stock_alerts(): void
    {
        $category = Category::create(['name' => 'CPUs', 'slug' => 'cpu']);

        $cpu1 = Product::create([
            'title' => 'Core i7-14700K',
            'slug' => 'core-i7-14700k',
            'sku' => 'CPU-14700K',
            'category_id' => $category->id,
            'price' => 45000,
            'cost_price' => 38000,
            'stock' => 10,
        ]);

        $cpuLow = Product::create([
            'title' => 'Ryzen 7 7800X3D',
            'slug' => 'ryzen-7-7800x3d',
            'sku' => 'CPU-7800X3D',
            'category_id' => $category->id,
            'price' => 52000,
            'cost_price' => 44000,
            'stock' => 3, // Low stock <= 5
        ]);

        $cpuOut = Product::create([
            'title' => 'Ryzen 9 9950X',
            'slug' => 'ryzen-9-9950x',
            'sku' => 'CPU-9950X',
            'category_id' => $category->id,
            'price' => 78000,
            'cost_price' => 65000,
            'stock' => 0, // Out of stock <= 0
        ]);

        // Record stock movements
        InventoryMovement::create([
            'product_id' => $cpu1->id,
            'type' => 'purchase',
            'quantity' => 10,
            'resulting_stock' => 10,
            'notes' => 'Supplier shipment',
        ]);

        InventoryMovement::create([
            'product_id' => $cpu1->id,
            'type' => 'sale',
            'quantity' => -2,
            'resulting_stock' => 8,
            'notes' => 'Customer order sale',
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/inventory');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Inventory')
            ->has('reportData.catalog_summary')
            ->where('reportData.catalog_summary.total_stock_units', 13) // 10 + 3 + 0
            ->has('reportData.low_stock_products', 1)
            ->where('reportData.low_stock_products.0.sku', 'CPU-7800X3D')
            ->has('reportData.out_of_stock_products', 1)
            ->where('reportData.out_of_stock_products.0.sku', 'CPU-9950X')
            ->has('reportData.movements_by_type')
        );
    }
}
