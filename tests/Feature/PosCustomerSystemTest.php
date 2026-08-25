<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Sale;
use App\Models\Warehouse;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\AuditLog;
use App\Services\Pos\PosCustomerService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PosCustomerSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Warehouse $warehouse;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'pos_manager@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $category = Category::create(['name' => 'Monitors', 'slug' => 'monitors']);
        $brand = Brand::create(['name' => 'LG Electronics', 'slug' => 'lg']);

        $this->warehouse = Warehouse::create([
            'name' => 'Central Showroom Warehouse',
            'code' => 'CENTRAL-POS-01',
            'is_default' => true,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'title' => 'LG UltraGear 27GP850-B 27" QHD Nano IPS 165Hz',
            'slug' => 'lg-ultragear-27gp850-b',
            'sku' => 'MON-LG-27GP850',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 45000.00,
            'regular_price' => 48000.00,
            'cost_price' => 38000.00,
            'stock' => 15,
            'is_active' => true,
        ]);
    }

    public function test_default_canonical_walk_in_customer_is_idempotent_and_returned(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/admin/pos/customers/default-walkin');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'customer' => [
                    'name' => 'Walk-in Customer',
                    'email' => 'walkin@pos.internal',
                    'is_walk_in' => true,
                ],
            ]);

        // Second call should return the exact same canonical record without duplication
        $this->actingAs($this->admin)->getJson('/admin/pos/customers/default-walkin');
        $this->assertEquals(1, User::where('email', 'walkin@pos.internal')->count());
    }

    public function test_search_customers_by_name_phone_email_and_code(): void
    {
        $c1 = User::factory()->create([
            'name' => 'Tanvir Ahmed Shanto',
            'phone' => '01711223344',
            'email' => 'tanvir@gmail.com',
            'customer_code' => 'CUST-000101',
            'city' => 'Dhaka',
            'credit_limit' => 100000.00,
        ]);

        $c2 = User::factory()->create([
            'name' => 'Mahmudul Hasan Joy',
            'phone' => '01899887766',
            'email' => 'mahmudul@corp.bd',
            'customer_code' => 'CUST-000102',
            'city' => 'Chittagong',
            'credit_limit' => 50000.00,
        ]);

        // Search by partial Name
        $res1 = $this->actingAs($this->admin)->getJson('/admin/pos/customers/search?q=Tanvir');
        $res1->assertStatus(200)->assertJsonPath('customers.0.id', $c1->id);

        // Search by Phone
        $res2 = $this->actingAs($this->admin)->getJson('/admin/pos/customers/search?q=0189988');
        $res2->assertStatus(200)->assertJsonPath('customers.0.id', $c2->id);

        // Search by Customer Code
        $res3 = $this->actingAs($this->admin)->getJson('/admin/pos/customers/search?q=CUST-000101');
        $res3->assertStatus(200)->assertJsonPath('customers.0.id', $c1->id);

        // Search by Email
        $res4 = $this->actingAs($this->admin)->getJson('/admin/pos/customers/search?q=corp.bd');
        $res4->assertStatus(200)->assertJsonPath('customers.0.id', $c2->id);
    }

    public function test_customer_creation_from_pos_with_auto_code_and_profile_data(): void
    {
        $payload = [
            'name' => 'Sabbir Rahman Tech Ltd',
            'phone' => '01977665544',
            'email' => 'sabbir@techltd.com',
            'address' => 'Floor 6, Concord Tower, Banani',
            'city' => 'Dhaka',
            'state' => 'Dhaka Division',
            'postal_code' => '1213',
            'country' => 'Bangladesh',
            'tax_number' => 'BIN-9944882211',
            'credit_limit' => 75000.00,
            'notes' => 'Corporate IT Procurement Client',
        ];

        $response = $this->actingAs($this->admin)->postJson('/admin/pos/customers', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'customer' => [
                    'name' => 'Sabbir Rahman Tech Ltd',
                    'phone' => '01977665544',
                    'email' => 'sabbir@techltd.com',
                    'city' => 'Dhaka',
                    'credit_limit' => 75000.00,
                ],
            ]);

        $created = User::where('email', 'sabbir@techltd.com')->first();
        $this->assertNotNull($created);
        $this->assertStringStartsWith('CUST-', $created->customer_code);
        $this->assertEquals(75000.00, (float) $created->credit_limit);
        $this->assertEquals('Corporate IT Procurement Client', $created->notes);
    }

    public function test_customer_creation_with_opening_balance_receivable_creates_balanced_journal(): void
    {
        $payload = [
            'name' => 'Rahim Enterprise',
            'phone' => '01755443322',
            'email' => 'rahim@enterprise.com',
            'opening_balance' => 25000.00,
            'opening_balance_type' => 'receivable',
            'credit_limit' => 50000.00,
        ];

        $response = $this->actingAs($this->admin)->postJson('/admin/pos/customers', $payload);

        $response->assertStatus(201);
        $customer = User::where('email', 'rahim@enterprise.com')->first();

        $this->assertEquals(25000.00, (float) $customer->opening_balance);
        $this->assertEquals('receivable', $customer->opening_balance_type);
        $this->assertEquals(25000.00, $customer->current_due);
        $this->assertEquals(25000.00, $customer->available_credit); // 50000 - 25000 = 25000

        // Verify Double-Entry Financial Transaction & Journal Entries
        $tx = \App\Models\FinancialTransaction::where('source_module', 'pos')
            ->where('source_id', $customer->id)
            ->first();

        $this->assertNotNull($tx);
        $this->assertEquals(25000.00, (float) $tx->total_amount);

        // Accounts Receivable (1004) Debit, Owner Equity (3001) Credit
        $arEntry = $tx->journalEntries()->whereHas('account', fn($q) => $q->where('code', '1004'))->first();
        $equityEntry = $tx->journalEntries()->whereHas('account', fn($q) => $q->where('code', '3001'))->first();

        $this->assertNotNull($arEntry);
        $this->assertNotNull($equityEntry);
        $this->assertEquals('debit', $arEntry->type);
        $this->assertEquals(25000.00, (float) $arEntry->amount);
        $this->assertEquals('credit', $equityEntry->type);
        $this->assertEquals(25000.00, (float) $equityEntry->amount);
    }

    public function test_customer_creation_with_opening_balance_payable_creates_balanced_journal(): void
    {
        $payload = [
            'name' => 'Advance Deposit Client',
            'phone' => '01611223344',
            'email' => 'advance@client.com',
            'opening_balance' => 15000.00,
            'opening_balance_type' => 'payable',
        ];

        $response = $this->actingAs($this->admin)->postJson('/admin/pos/customers', $payload);
        $response->assertStatus(201);

        $customer = User::where('email', 'advance@client.com')->first();

        // Verify Journal: Owner Equity (3001) Debit, Accounts Payable (2001) Credit
        $tx = \App\Models\FinancialTransaction::where('source_module', 'pos')
            ->where('source_id', $customer->id)
            ->first();

        $this->assertNotNull($tx);
        $this->assertEquals(15000.00, (float) $tx->total_amount);

        $equityEntry = $tx->journalEntries()->whereHas('account', fn($q) => $q->where('code', '3001'))->first();
        $apEntry = $tx->journalEntries()->whereHas('account', fn($q) => $q->where('code', '2001'))->first();

        $this->assertNotNull($equityEntry);
        $this->assertNotNull($apEntry);
        $this->assertEquals('debit', $equityEntry->type);
        $this->assertEquals(15000.00, (float) $equityEntry->amount);
        $this->assertEquals('credit', $apEntry->type);
        $this->assertEquals(15000.00, (float) $apEntry->amount);
    }

    public function test_customer_creation_duplicate_phone_or_email_returns_informative_422(): void
    {
        User::factory()->create([
            'name' => 'Existing Customer',
            'phone' => '01799001122',
            'email' => 'existing@gmail.com',
        ]);

        $payload = [
            'name' => 'Duplicate Attempt',
            'phone' => '01799001122',
            'email' => 'existing@gmail.com',
        ];

        $response = $this->actingAs($this->admin)->postJson('/admin/pos/customers', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone', 'email']);
    }

    public function test_update_customer_details_from_pos(): void
    {
        $customer = User::factory()->create([
            'name' => 'Old Customer Name',
            'phone' => '01700112233',
            'email' => 'old@customer.com',
            'credit_limit' => 20000.00,
        ]);

        $updatePayload = [
            'name' => 'Updated Customer Name Ltd',
            'phone' => '01700112233',
            'email' => 'new@customer.com',
            'credit_limit' => 150000.00,
            'address' => 'Gulshan 2, Dhaka',
        ];

        $response = $this->actingAs($this->admin)->putJson("/admin/pos/customers/{$customer->id}", $updatePayload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'customer' => [
                    'name' => 'Updated Customer Name Ltd',
                    'email' => 'new@customer.com',
                    'credit_limit' => 150000.00,
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $customer->id,
            'name' => 'Updated Customer Name Ltd',
            'email' => 'new@customer.com',
            'credit_limit' => 150000.00,
        ]);
    }

    public function test_get_customer_details_with_financials_and_sales_history(): void
    {
        $customer = User::factory()->create([
            'name' => 'VIP Gamer',
            'phone' => '01788776655',
            'email' => 'vip@gamer.bd',
            'credit_limit' => 100000.00,
        ]);

        // Add 2 past sales
        Sale::create([
            'sale_number' => 'POS-2026-9901',
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'subtotal' => 45000.00,
            'grand_total' => 45000.00,
            'paid_amount' => 45000.00,
            'due_amount' => 0.00,
            'payment_status' => 'paid',
            'status' => 'completed',
        ]);

        Sale::create([
            'sale_number' => 'POS-2026-9902',
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'subtotal' => 30000.00,
            'grand_total' => 30000.00,
            'paid_amount' => 10000.00,
            'due_amount' => 20000.00,
            'payment_status' => 'partial',
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->admin)->getJson("/admin/pos/customers/{$customer->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'customer' => [
                    'id' => $customer->id,
                    'name' => 'VIP Gamer',
                    'sales_count' => 2,
                    'total_purchases' => 75000.00,
                    'current_due' => 20000.00,
                    'available_credit' => 80000.00, // 100000 - 20000 = 80000
                ],
            ]);
    }

    public function test_walk_in_customer_cannot_be_used_for_due_or_credit_sales(): void
    {
        $walkIn = PosCustomerService::getCanonicalWalkInCustomer();

        $payload = [
            'customer_id' => $walkIn->id,
            'customer_name' => 'Walk-in Customer',
            'warehouse_id' => $this->warehouse->id,
            'subtotal' => 45000.00,
            'grand_total' => 45000.00,
            'paid_amount' => 0.00,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 45000.00,
                    'line_discount' => 0,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'due',
                    'amount' => 0,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->postJson('/admin/pos/checkout', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertStringContainsString('Due / credit sale is not permitted for Walk-in Customer', $response->json('message'));
    }

    public function test_registered_customer_can_complete_due_sale_within_credit_limit(): void
    {
        $customer = User::factory()->create([
            'name' => 'Approved Credit Client',
            'phone' => '01711998877',
            'email' => 'approved@credit.com',
            'credit_limit' => 100000.00,
        ]);

        $payload = [
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_phone' => $customer->phone,
            'warehouse_id' => $this->warehouse->id,
            'subtotal' => 45000.00,
            'grand_total' => 45000.00,
            'paid_amount' => 15000.00,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 45000.00,
                    'line_discount' => 0,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => 15000.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->postJson('/admin/pos/checkout', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'sale' => [
                    'customer_id' => $customer->id,
                    'payment_status' => 'partially_paid',
                ],
            ]);

        // Customer due dynamically recalculated
        $customer->refresh();
        $this->assertEquals(30000.00, $customer->current_due);
        $this->assertEquals(70000.00, $customer->available_credit);
    }

    public function test_registered_customer_cannot_exceed_credit_limit(): void
    {
        $customer = User::factory()->create([
            'name' => 'Strict Limit Client',
            'phone' => '01822334455',
            'email' => 'strict@limit.com',
            'credit_limit' => 20000.00, // 20k limit
            'opening_balance' => 10000.00, // 10k already owed
            'opening_balance_type' => 'receivable',
        ]);

        // Attempting to buy with 45k due (Total due would become 10k + 45k = 55k > 20k)
        $payload = [
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_phone' => $customer->phone,
            'warehouse_id' => $this->warehouse->id,
            'subtotal' => 45000.00,
            'grand_total' => 45000.00,
            'paid_amount' => 0.00,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 45000.00,
                    'line_discount' => 0,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'due',
                    'amount' => 0,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->postJson('/admin/pos/checkout', $payload);

        $response->assertStatus(422);
        $this->assertStringContainsString('Credit limit exceeded', $response->json('message'));
    }

    public function test_pos_hold_and_resume_with_registered_customer(): void
    {
        $customer = User::factory()->create([
            'name' => 'Hold Cart Client',
            'phone' => '01511223344',
            'email' => 'hold@client.com',
        ]);

        $payload = [
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_phone' => $customer->phone,
            'subtotal' => 45000.00,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'grand_total' => 45000.00,
            'notes' => 'Hold for 30 minutes',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 45000.00,
                    'line_discount' => 0,
                ],
            ],
        ];

        $res = $this->actingAs($this->admin)->postJson('/admin/pos/hold', $payload);
        $res->assertStatus(200)->assertJson(['success' => true]);

        $heldSale = Sale::where('status', 'draft')->where('customer_id', $customer->id)->first();
        $this->assertNotNull($heldSale);
        $this->assertEquals('Hold Cart Client', $heldSale->customer_name);
        $this->assertEquals($customer->id, $heldSale->customer_id);
    }
}
