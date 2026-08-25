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
use App\Models\FinancialTransaction;
use App\Services\Accounting\AccountingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SupplierAndPurchaseSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $unauthorizedUser;
    protected Warehouse $warehouse;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        AccountingService::seedDefaultAccounts();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'purchases_manager@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $customerRole = Role::firstOrCreate(['name' => 'Customer'], ['display_name' => 'Customer']);
        $this->unauthorizedUser = User::factory()->create([
            'email' => 'customer_user@techmarket.com',
            'role' => 'customer',
        ]);
        $this->unauthorizedUser->roles()->attach($customerRole);

        $this->warehouse = Warehouse::create([
            'name' => 'Central Depot',
            'code' => 'WH-CD-01',
            'is_default' => true,
            'is_active' => true,
        ]);

        $category = Category::create(['name' => 'Graphics Cards', 'slug' => 'graphics-cards']);
        $brand = Brand::create(['name' => 'ASUS', 'slug' => 'asus']);

        $this->product = Product::create([
            'title' => 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER',
            'slug' => 'asus-tuf-rtx-4070-ti-super',
            'sku' => 'GPU-ASUS-4070TIS',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 118000.00,
            'cost_price' => 98000.00,
            'stock' => 8,
        ]);
    }

    public function test_admin_can_search_suppliers_by_name_phone_and_code(): void
    {
        Supplier::create([
            'supplier_code' => 'SUP-UCC01',
            'company_name' => 'UCC Distribution Bangladesh',
            'contact_person' => 'Jamilur Rahman',
            'phone' => '01888112233',
            'email' => 'sales@uccbd.com',
            'status' => 'active',
        ]);

        Supplier::create([
            'supplier_code' => 'SUP-COMPL',
            'company_name' => 'Computer Land Systems',
            'contact_person' => 'Kamal Hossain',
            'phone' => '01777445566',
            'email' => 'kamal@computerland.com',
            'status' => 'active',
        ]);

        // Search by company name
        $response = $this->actingAs($this->admin)
            ->getJson('/admin/suppliers/search?query=UCC');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'suppliers')
            ->assertJsonPath('suppliers.0.company_name', 'UCC Distribution Bangladesh');

        // Search by phone
        $responsePhone = $this->actingAs($this->admin)
            ->getJson('/admin/suppliers/search?query=01777445566');

        $responsePhone->assertOk()
            ->assertJsonCount(1, 'suppliers')
            ->assertJsonPath('suppliers.0.company_name', 'Computer Land Systems');

        // Search by code
        $responseCode = $this->actingAs($this->admin)
            ->getJson('/admin/suppliers/search?query=SUP-UCC01');

        $responseCode->assertOk()
            ->assertJsonCount(1, 'suppliers')
            ->assertJsonPath('suppliers.0.supplier_code', 'SUP-UCC01');
    }

    public function test_admin_can_create_new_supplier_via_json_with_erp_fields(): void
    {
        $payload = [
            'company_name' => 'Excel Technologies Ltd',
            'contact_person' => 'Gias Uddin',
            'phone' => '01999887766',
            'email' => 'orders@excelbd.com',
            'supplier_code' => 'SUP-EXCEL01',
            'tax_number' => 'BIN-77889900',
            'website' => 'https://exceltechnologies.com.bd',
            'address' => 'Multiplan Center, New Elephant Road',
            'city' => 'Dhaka',
            'postal_code' => '1205',
            'country' => 'Bangladesh',
            'credit_limit' => 500000.00,
            'payment_terms' => '15_days',
            'opening_balance' => 0.00,
            'notes' => 'Authorized distributor for Asus and ViewSonic',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/suppliers', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('supplier.company_name', 'Excel Technologies Ltd')
            ->assertJsonPath('supplier.supplier_code', 'SUP-EXCEL01');

        $this->assertDatabaseHas('suppliers', [
            'company_name' => 'Excel Technologies Ltd',
            'supplier_code' => 'SUP-EXCEL01',
            'phone' => '01999887766',
            'credit_limit' => 500000.00,
            'payment_terms' => '15_days',
            'status' => 'active',
        ]);
    }

    public function test_supplier_creation_auto_generates_code_if_left_empty(): void
    {
        $payload = [
            'company_name' => 'Smart Technologies (BD) Ltd',
            'contact_person' => 'Tanvir Hasan',
            'phone' => '01711002233',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/suppliers', $payload);

        $response->assertStatus(201);
        $supplier = Supplier::where('company_name', 'Smart Technologies (BD) Ltd')->first();
        $this->assertNotNull($supplier);
        $this->assertStringStartsWith('SUP-', $supplier->supplier_code);
    }

    public function test_supplier_creation_validates_required_fields_and_uniqueness(): void
    {
        Supplier::create([
            'supplier_code' => 'SUP-UNIQUE01',
            'company_name' => 'Unique Supplies Ltd',
            'phone' => '01711223344',
        ]);

        // Missing company name and phone
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/suppliers', [
                'company_name' => '',
                'phone' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_name']);

        // Duplicate supplier code
        $dupResponse = $this->actingAs($this->admin)
            ->postJson('/admin/suppliers', [
                'company_name' => 'Another Supplier',
                'phone' => '01722334455',
                'supplier_code' => 'SUP-UNIQUE01',
            ]);

        $dupResponse->assertStatus(422)
            ->assertJsonValidationErrors(['supplier_code']);
    }

    public function test_supplier_with_opening_balance_creates_double_entry_accounting_transaction(): void
    {
        $payload = [
            'company_name' => 'Tradex Corporation',
            'phone' => '01811998877',
            'opening_balance' => 75000.00,
            'opening_balance_type' => 'payable',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/suppliers', $payload);

        $response->assertStatus(201);

        $supplier = Supplier::where('company_name', 'Tradex Corporation')->first();
        $this->assertEquals(75000.00, (float)$supplier->current_balance);

        // Verify double entry journal transaction exists
        $transaction = FinancialTransaction::where('source_module', 'purchases')
            ->where('source_id', $supplier->id)
            ->first();

        $this->assertNotNull($transaction);
        $this->assertEquals(75000.00, (float)$transaction->total_amount);

        // Check entries: Debit 3001 (Equity), Credit 2001 (Payable)
        $this->assertDatabaseHas('journal_entries', [
            'financial_transaction_id' => $transaction->id,
            'type' => 'credit',
            'amount' => 75000.00,
        ]);
        $this->assertDatabaseHas('journal_entries', [
            'financial_transaction_id' => $transaction->id,
            'type' => 'debit',
            'amount' => 75000.00,
        ]);
    }

    public function test_purchase_order_can_be_issued_with_newly_created_supplier(): void
    {
        // 1. Create supplier
        $supplier = Supplier::create([
            'supplier_code' => 'SUP-QUICK01',
            'company_name' => 'Quick Restock Distribution',
            'phone' => '01666554433',
            'status' => 'active',
        ]);

        // 2. Issue PO
        $purchasePayload = [
            'supplier_id' => $supplier->id,
            'warehouse_id' => $this->warehouse->id,
            'purchase_date' => now()->toDateString(),
            'expected_delivery_date' => now()->addDays(3)->toDateString(),
            'discount' => 5000.00,
            'shipping_cost' => 1200.00,
            'paid_amount' => 50000.00,
            'notes' => 'Urgent procurement for weekend demand',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity_ordered' => 2,
                    'unit_cost' => 98000.00,
                    'tax_percent' => 0,
                    'line_discount' => 0,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/purchases', $purchasePayload);

        $response->assertRedirect();

        // 2 * 98000 = 196,000 - 5000 (disc) + 1200 (ship) = 192,200 total
        // Paid: 50,000 => Due: 142,200
        $this->assertDatabaseHas('purchases', [
            'supplier_id' => $supplier->id,
            'warehouse_id' => $this->warehouse->id,
            'subtotal' => 196000.00,
            'discount' => 5000.00,
            'shipping_cost' => 1200.00,
            'total' => 192200.00,
            'paid_amount' => 50000.00,
            'due_amount' => 142200.00,
            'payment_status' => 'partially_paid',
        ]);

        // Supplier balance updated with due
        $this->assertEquals(142200.00, (float)$supplier->fresh()->current_balance);
    }

    public function test_unauthorized_user_cannot_access_or_create_suppliers(): void
    {
        $response = $this->actingAs($this->unauthorizedUser)
            ->postJson('/admin/suppliers', [
                'company_name' => 'Hacker Supplier',
                'phone' => '01234567890',
            ]);

        $response->assertForbidden();
    }
}
