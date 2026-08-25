<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Purchase;
use App\Models\FinancialAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PurchasesModuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Supplier $supplier;
    protected Warehouse $warehouse;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'purchases_admin@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->supplier = Supplier::create([
            'company_name' => 'Global Distribution Ltd',
            'contact_person' => 'Rahim Chowdhury',
            'phone' => '01711223344',
            'email' => 'rahim@globaldist.com',
            'status' => 'active',
        ]);

        $this->warehouse = Warehouse::create([
            'name' => 'Central Hub',
            'code' => 'WH-HUB-01',
            'is_default' => true,
        ]);

        $category = Category::create(['name' => 'CPUs', 'slug' => 'cpus']);
        $brand = Brand::create(['name' => 'AMD', 'slug' => 'amd']);

        $this->product = Product::create([
            'title' => 'AMD Ryzen 7 7800X3D',
            'slug' => 'amd-ryzen-7-7800x3d',
            'sku' => 'CPU-AMD-7800X3D',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 48000.00,
            'cost_price' => 42000.00,
            'stock' => 5,
        ]);
    }

    public function test_admin_can_create_purchase_order(): void
    {
        $payload = [
            'supplier_id' => $this->supplier->id,
            'warehouse_id' => $this->warehouse->id,
            'purchase_date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity_ordered' => 10,
                    'unit_cost' => 42000.00,
                ],
            ],
            'paid_amount' => 100000.00,
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.purchases.store'), $payload)
            ->assertRedirect();

        $this->assertDatabaseHas('purchases', [
            'supplier_id' => $this->supplier->id,
            'total' => 420000.00,
            'paid_amount' => 100000.00,
            'due_amount' => 320000.00,
            'status' => 'ordered',
        ]);

        // Supplier balance updated with due
        $this->assertEquals(320000.00, $this->supplier->fresh()->current_balance);
    }

    public function test_goods_receiving_atomically_increases_inventory(): void
    {
        $purchase = Purchase::create([
            'purchase_number' => 'PO-TEST-001',
            'supplier_id' => $this->supplier->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'ordered',
            'subtotal' => 420000.00,
            'total' => 420000.00,
            'due_amount' => 420000.00,
            'purchase_date' => now()->toDateString(),
            'created_by' => $this->admin->id,
        ]);

        $item = $purchase->items()->create([
            'product_id' => $this->product->id,
            'quantity_ordered' => 10,
            'quantity_received' => 0,
            'unit_cost' => 42000.00,
            'line_total' => 420000.00,
        ]);

        // Receive 6 units partially
        $receivePayload = [
            'received' => [
                $item->id => 6,
            ],
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.purchases.receive', $purchase->id), $receivePayload)
            ->assertRedirect();

        $this->assertDatabaseHas('purchases', [
            'id' => $purchase->id,
            'status' => 'partially_received',
        ]);

        // Product stock increased from 5 to 11
        $this->assertEquals(11, $this->product->fresh()->stock);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'type' => 'purchase',
            'quantity' => 6,
            'resulting_stock' => 11,
        ]);
    }

    public function test_admin_can_record_supplier_payment(): void
    {
        $purchase = Purchase::create([
            'purchase_number' => 'PO-TEST-002',
            'supplier_id' => $this->supplier->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'received',
            'subtotal' => 100000.00,
            'total' => 100000.00,
            'paid_amount' => 20000.00,
            'due_amount' => 80000.00,
            'purchase_date' => now()->toDateString(),
            'created_by' => $this->admin->id,
        ]);
        $this->supplier->update(['current_balance' => 80000.00]);

        $payPayload = [
            'amount' => 50000.00,
            'payment_method' => 'bank_transfer',
            'notes' => 'Part payment for PO-TEST-002',
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.purchases.payment', $purchase->id), $payPayload)
            ->assertRedirect();

        $this->assertDatabaseHas('purchases', [
            'id' => $purchase->id,
            'paid_amount' => 70000.00,
            'due_amount' => 30000.00,
            'payment_status' => 'partially_paid',
        ]);

        $this->assertEquals(30000.00, $this->supplier->fresh()->current_balance);
    }
}
