<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Models\StockTransfer;
use App\Models\StockCount;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InventoryAndWarehouseTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Warehouse $warehouseA;
    protected Warehouse $warehouseB;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'inv_admin@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->warehouseA = Warehouse::create([
            'name' => 'Dhaka Main Warehouse',
            'code' => 'WH-DHK-01',
            'is_default' => true,
        ]);

        $this->warehouseB = Warehouse::create([
            'name' => 'Chittagong Hub',
            'code' => 'WH-CTG-01',
        ]);

        $category = \App\Models\Category::create(['name' => 'RAM', 'slug' => 'ram']);

        $this->product = Product::create([
            'title' => 'Kingston FURY Beast 32GB DDR5',
            'slug' => 'kingston-fury-beast-32gb-ddr5',
            'sku' => 'RAM-KF-32G-DDR5',
            'category_id' => $category->id,
            'price' => 14500.00,
            'cost_price' => 11000.00,
            'stock' => 50,
        ]);

        WarehouseStock::create([
            'warehouse_id' => $this->warehouseA->id,
            'product_id' => $this->product->id,
            'stock' => 50,
        ]);
    }

    public function test_admin_can_adjust_stock_with_specific_reason(): void
    {
        $payload = [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouseA->id,
            'quantity' => -3,
            'type' => 'damaged',
            'notes' => 'Damaged during transit box dropped',
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.inventory.adjust'), $payload)
            ->assertRedirect();

        $this->assertEquals(47, $this->product->fresh()->stock);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'type' => 'damaged',
            'quantity' => -3,
            'resulting_stock' => 47,
        ]);
    }

    public function test_admin_can_transfer_stock_between_warehouses(): void
    {
        $payload = [
            'from_warehouse_id' => $this->warehouseA->id,
            'to_warehouse_id' => $this->warehouseB->id,
            'notes' => 'Transfer to CTG branch for customer demand',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 15,
                ],
            ],
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.inventory.transfers.store'), $payload)
            ->assertRedirect();

        $whAStock = WarehouseStock::where('warehouse_id', $this->warehouseA->id)->where('product_id', $this->product->id)->first()->stock;
        $whBStock = WarehouseStock::where('warehouse_id', $this->warehouseB->id)->where('product_id', $this->product->id)->first()->stock;

        $this->assertEquals(35, $whAStock);
        $this->assertEquals(15, $whBStock);
        // Total global stock unchanged
        $this->assertEquals(50, $this->product->fresh()->stock);
    }

    public function test_stock_count_cycle_audit_and_reconciliation_approval(): void
    {
        // Physical count reports 48 units (variance = -2)
        $countPayload = [
            'warehouse_id' => $this->warehouseA->id,
            'notes' => 'Physical cycle count Q3',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'physical_quantity' => 48,
                ],
            ],
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.inventory.counts.store'), $countPayload)
            ->assertRedirect();

        $stockCount = StockCount::latest()->first();
        $this->assertEquals('draft', $stockCount->status);

        $countItem = $stockCount->items->first();
        $this->assertEquals(50, $countItem->system_quantity);
        $this->assertEquals(48, $countItem->physical_quantity);
        $this->assertEquals(-2, $countItem->variance_quantity);

        // Approve and reconcile
        $this->actingAs($this->admin)
            ->post(route('admin.inventory.counts.approve', $stockCount->id))
            ->assertRedirect();

        $this->assertEquals('approved', $stockCount->fresh()->status);
        $this->assertEquals(48, $this->product->fresh()->stock);
    }

    public function test_inventory_index_page_loads_with_eager_loaded_warehouse_relationship(): void
    {
        // Create an inventory movement with warehouse
        \App\Models\InventoryMovement::create([
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouseA->id,
            'user_id' => $this->admin->id,
            'type' => 'purchase',
            'quantity' => 10,
            'resulting_stock' => 60,
            'notes' => 'Initial stock intake',
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.inventory.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Inventory/Index')
                ->has('products.data')
                ->has('warehouses')
                ->has('valuation')
                ->has('movements', 1)
                ->where('movements.0.warehouse.name', 'Dhaka Main Warehouse')
                ->where('movements.0.product.title', 'Kingston FURY Beast 32GB DDR5')
                ->where('movements.0.user.name', $this->admin->name)
        );
    }

    public function test_inventory_movement_relationships_and_inverse_relationships(): void
    {
        $movement = \App\Models\InventoryMovement::create([
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouseA->id,
            'user_id' => $this->admin->id,
            'type' => 'adjustment',
            'quantity' => 5,
            'resulting_stock' => 55,
            'notes' => 'Found in back store',
        ]);

        // BelongsTo tests
        $this->assertInstanceOf(Warehouse::class, $movement->warehouse);
        $this->assertEquals($this->warehouseA->id, $movement->warehouse->id);

        $this->assertInstanceOf(Product::class, $movement->product);
        $this->assertEquals($this->product->id, $movement->product->id);

        $this->assertInstanceOf(User::class, $movement->user);
        $this->assertEquals($this->admin->id, $movement->user->id);

        // Inverse HasMany tests
        $this->assertTrue($this->warehouseA->inventoryMovements->contains($movement));
        $this->assertTrue($this->product->inventoryMovements->contains($movement));
        $this->assertTrue($this->admin->inventoryMovements->contains($movement));
    }

    public function test_unauthorized_user_cannot_access_inventory(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->get(route('admin.inventory.index'))
            ->assertForbidden();
    }
}
