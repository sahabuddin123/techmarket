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
use App\Models\WarehouseStock;
use App\Models\ChartOfAccount;
use App\Models\FinancialAccount;
use App\Models\Sale;
use App\Models\Purchase;
use App\Services\Accounting\AccountingService;
use App\Services\Purchases\PurchaseService;
use App\Services\Sales\SalesService;
use App\Services\Inventory\WarehouseInventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CrossModuleIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Supplier $supplier;
    protected Warehouse $warehouseMain;
    protected Warehouse $warehouseBranch;
    protected Product $productGpu;
    protected AccountingService $accountingService;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'erp_superadmin@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->accountingService = new AccountingService();
        $this->accountingService->seedDefaultAccounts();

        $category = Category::create(['name' => 'Graphics Cards', 'slug' => 'graphics-cards']);
        $brand = Brand::create(['name' => 'Gigabyte', 'slug' => 'gigabyte']);

        $this->warehouseMain = Warehouse::create([
            'name' => 'Central Dhaka Distribution Facility',
            'code' => 'WH-DHK-MAIN',
            'is_default' => true,
        ]);

        $this->warehouseBranch = Warehouse::create([
            'name' => 'Chittagong Retail Branch',
            'code' => 'WH-CTG-BRANCH',
        ]);

        $this->supplier = Supplier::create([
            'company_name' => 'Smart Technologies (BD) Ltd',
            'contact_person' => 'Jamil Ahmed',
            'phone' => '01712000000',
            'email' => 'sales@smart-bd.com',
            'status' => 'active',
        ]);

        $this->productGpu = Product::create([
            'title' => 'Gigabyte RTX 4070 SUPER Gaming OC 12G',
            'slug' => 'gigabyte-rtx-4070-super-gaming-oc-12g',
            'sku' => 'GPU-GB-4070S-GOC',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 88000.00,
            'regular_price' => 95000.00,
            'cost_price' => 74000.00,
            'stock' => 0, // Starts at zero stock
        ]);
    }

    public function test_complete_enterprise_erp_lifecycle(): void
    {
        // 1. INBOUND: Issue PO for 10 units @ 74,000 BDT each = 740,000 BDT
        $purchase = PurchaseService::createPurchaseOrder(
            data: [
                'supplier_id' => $this->supplier->id,
                'warehouse_id' => $this->warehouseMain->id,
                'purchase_date' => now()->toDateString(),
                'paid_amount' => 200000.00, // 200,000 paid, 540,000 due
            ],
            items: [
                [
                    'product_id' => $this->productGpu->id,
                    'quantity_ordered' => 10,
                    'unit_cost' => 74000.00,
                ],
            ],
            userId: $this->admin->id
        );

        $this->assertEquals(740000.00, $purchase->total);
        $this->assertEquals(540000.00, $purchase->due_amount);
        $this->assertEquals(540000.00, $this->supplier->fresh()->current_balance);

        // 2. GOODS RECEIVING: Receive full 10 units into Central Warehouse
        PurchaseService::receiveItems(
            purchaseId: $purchase->id,
            receivedQuantities: [
                $purchase->items->first()->id => 10,
            ],
            userId: $this->admin->id
        );

        // Stock is now 10
        $this->assertEquals(10, $this->productGpu->fresh()->stock);

        // 3. INTER-WAREHOUSE TRANSFER: Transfer 4 units from Dhaka to Chittagong Branch
        WarehouseInventoryService::transferStock(
            fromWarehouseId: $this->warehouseMain->id,
            toWarehouseId: $this->warehouseBranch->id,
            items: [
                ['product_id' => $this->productGpu->id, 'quantity' => 4],
            ],
            notes: 'Dispatch 4 GPUs to Chittagong branch for customer pre-orders',
            userId: $this->admin->id
        );

        $dhakaStock = WarehouseStock::where('warehouse_id', $this->warehouseMain->id)->where('product_id', $this->productGpu->id)->first()->stock;
        $ctgStock = WarehouseStock::where('warehouse_id', $this->warehouseBranch->id)->where('product_id', $this->productGpu->id)->first()->stock;
        $this->assertEquals(6, $dhakaStock);
        $this->assertEquals(4, $ctgStock);
        $this->assertEquals(10, $this->productGpu->fresh()->stock);

        // 4. POS SALE: Sell 2 GPUs from Dhaka Warehouse via Split Payment (Cash + bKash)
        $cashRegister = FinancialAccount::where('type', 'cash')->first();
        $initialCashBalance = $cashRegister->current_balance;

        $sale = SalesService::createSale(
            data: [
                'customer_name' => 'Corporate Pro Gamer',
                'customer_phone' => '01799887766',
                'warehouse_id' => $this->warehouseMain->id,
                'sales_channel' => 'pos',
                'discount_amount' => 2000.00, // 2 x 88,000 = 176,000 - 2,000 = 174,000 BDT
            ],
            items: [
                [
                    'product_id' => $this->productGpu->id,
                    'quantity' => 2,
                    'unit_price' => 88000.00,
                ],
            ],
            payments: [
                [
                    'payment_method' => 'cash',
                    'amount' => 100000.00,
                    'financial_account_id' => $cashRegister->id,
                ],
                [
                    'payment_method' => 'bkash',
                    'amount' => 74000.00,
                    'reference_number' => 'TRX-BKASH-88190',
                ],
            ],
            userId: $this->admin->id
        );

        $this->assertEquals(174000.00, $sale->grand_total);
        $this->assertEquals('paid', $sale->payment_status);

        // Dhaka stock reduced from 6 to 4; Total stock reduced from 10 to 8
        $this->assertEquals(4, WarehouseStock::where('warehouse_id', $this->warehouseMain->id)->where('product_id', $this->productGpu->id)->first()->stock);
        $this->assertEquals(8, $this->productGpu->fresh()->stock);

        // Cash Register received 100,000 BDT
        $this->assertEquals($initialCashBalance + 100000.00, $cashRegister->fresh()->current_balance);

        // 5. DOUBLE-ENTRY JOURNAL VALIDATION
        $salesRevenueCoa = ChartOfAccount::where('code', '4001')->first();
        $this->assertGreaterThan(0, $salesRevenueCoa->fresh()->current_balance);

        // 6. INVENTORY VALUATION REPORT
        $valuation = WarehouseInventoryService::getValuationSummary();
        $this->assertEquals(8, $valuation['total_units']);
        $this->assertGreaterThan(0, $valuation['total_cost']);
        $this->assertGreaterThan(0, $valuation['potential_retail_value']);
    }
}
