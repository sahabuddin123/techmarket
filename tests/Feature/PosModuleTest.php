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
use App\Models\FinancialAccount;
use App\Models\ChartOfAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PosModuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Product $product;
    protected Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'pos_admin@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->customer = User::factory()->create([
            'email' => 'pos_customer@gmail.com',
            'role' => 'customer',
        ]);

        $category = Category::create(['name' => 'Gaming Keyboards', 'slug' => 'gaming-keyboards']);
        $brand = Brand::create(['name' => 'Razer', 'slug' => 'razer']);

        $this->warehouse = Warehouse::create([
            'name' => 'Main POS Hub',
            'code' => 'POS-HUB-01',
            'is_default' => true,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'title' => 'Razer BlackWidow V4 Pro',
            'slug' => 'razer-blackwidow-v4-pro',
            'sku' => 'KB-RZ-BWV4P',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 22500.00,
            'regular_price' => 25000.00,
            'cost_price' => 18000.00,
            'stock' => 20,
        ]);
    }

    public function test_unauthorized_user_cannot_access_pos_terminal(): void
    {
        $this->get(route('admin.pos'))->assertRedirect('/login');

        $this->actingAs($this->customer)
            ->get(route('admin.pos'))
            ->assertForbidden();
    }

    public function test_admin_can_access_pos_terminal(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.pos'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Pos/Index'));
    }

    public function test_pos_checkout_deducts_inventory_and_records_sale(): void
    {
        $payload = [
            'customer_name' => 'Walk-in Gamer',
            'customer_phone' => '01700000000',
            'warehouse_id' => $this->warehouse->id,
            'subtotal' => 45000.00,
            'discount_amount' => 500.00,
            'grand_total' => 44500.00,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => 44500.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('sales', [
            'customer_name' => 'Walk-in Gamer',
            'grand_total' => 44500.00, // 2 x 22,500 - 500 = 44,500
            'status' => 'completed',
            'sales_channel' => 'pos',
        ]);

        // Inventory deducted from 20 to 18
        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'stock' => 18,
        ]);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'type' => 'pos_sale',
            'quantity' => -2,
            'resulting_stock' => 18,
        ]);
    }

    public function test_pos_checkout_rejects_insufficient_stock(): void
    {
        $payload = [
            'customer_name' => 'Walk-in Gamer',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 999,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => 22500.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_pos_split_payment_records_multiple_payment_rows(): void
    {
        $payload = [
            'customer_name' => 'Tech Enthusiast',
            'customer_phone' => '01711223344',
            'warehouse_id' => $this->warehouse->id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => 10000.00,
                ],
                [
                    'payment_method' => 'card',
                    'amount' => 7500.00,
                    'reference_number' => 'POS-CARD-9912',
                ],
                [
                    'payment_method' => 'bkash',
                    'amount' => 5000.00,
                    'reference_number' => 'BK-TRX-4421',
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $sale = Sale::where('customer_name', 'Tech Enthusiast')->first();
        $this->assertNotNull($sale);
        $this->assertEquals(22500.00, $sale->grand_total);
        $this->assertEquals(22500.00, $sale->paid_amount);
        $this->assertEquals('paid', $sale->payment_status);

        // Verify 3 distinct payment breakdown rows
        $this->assertEquals(3, $sale->payments()->count());
        $this->assertDatabaseHas('sale_payments', [
            'sale_id' => $sale->id,
            'payment_method' => 'cash',
            'amount' => 10000.00,
        ]);
        $this->assertDatabaseHas('sale_payments', [
            'sale_id' => $sale->id,
            'payment_method' => 'card',
            'amount' => 7500.00,
            'reference_number' => 'POS-CARD-9912',
        ]);
        $this->assertDatabaseHas('sale_payments', [
            'sale_id' => $sale->id,
            'payment_method' => 'bkash',
            'amount' => 5000.00,
            'reference_number' => 'BK-TRX-4421',
        ]);
    }

    public function test_cash_full_payment_and_change_calculation(): void
    {
        // Product price is 22,500. Customer hands ৳23,000 cash. Change is ৳500.
        $payload = [
            'customer_name' => 'Walk-in Cash Customer',
            'warehouse_id' => $this->warehouse->id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => 23000.00, // Tendered amount
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('sales', [
            'customer_name' => 'Walk-in Cash Customer',
            'grand_total' => 22500.00,
            'paid_amount' => 22500.00,
            'change_amount' => 500.00,
            'due_amount' => 0.00,
            'payment_status' => 'paid',
        ]);
    }

    public function test_cod_sale_creates_due_without_cash_collection(): void
    {
        $payload = [
            'customer_id' => $this->customer->id,
            'customer_name' => 'COD Customer',
            'warehouse_id' => $this->warehouse->id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cod',
                    'amount' => 0.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertOk()->assertJson(['success' => true]);

        $this->assertDatabaseHas('sales', [
            'customer_name' => 'COD Customer',
            'grand_total' => 22500.00,
            'paid_amount' => 0.00,
            'due_amount' => 22500.00,
            'payment_status' => 'unpaid',
        ]);

        // Sale Payments table should NOT have a collected cash receipt
        $sale = Sale::where('customer_name', 'COD Customer')->first();
        $this->assertEquals(0, $sale->payments()->sum('amount'));

        // Inventory must still be deducted exactly once
        $this->assertEquals(19, $this->product->fresh()->stock);
    }

    public function test_full_due_sale_creates_customer_receivable(): void
    {
        $payload = [
            'customer_id' => $this->customer->id,
            'customer_name' => 'Corporate Credit Client',
            'customer_phone' => '01999887766',
            'warehouse_id' => $this->warehouse->id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'due',
                    'amount' => 0.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertOk()->assertJson(['success' => true]);

        $this->assertDatabaseHas('sales', [
            'customer_name' => 'Corporate Credit Client',
            'grand_total' => 22500.00,
            'paid_amount' => 0.00,
            'due_amount' => 22500.00,
            'payment_status' => 'unpaid',
        ]);
    }

    public function test_partial_payment_with_cash_and_remaining_due(): void
    {
        // Invoice ৳22,500, Paid ৳10,000 cash, Due ৳12,500
        $payload = [
            'customer_id' => $this->customer->id,
            'customer_name' => 'Partial Customer',
            'warehouse_id' => $this->warehouse->id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => 10000.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertOk()->assertJson(['success' => true]);

        $this->assertDatabaseHas('sales', [
            'customer_name' => 'Partial Customer',
            'grand_total' => 22500.00,
            'paid_amount' => 10000.00,
            'due_amount' => 12500.00,
            'payment_status' => 'partially_paid',
        ]);
    }

    public function test_multiple_split_payment_with_cash_bkash_card_and_due(): void
    {
        // Invoice ৳22,500
        // Cash: ৳5,000, bKash: ৳7,500, Card: ৳5,000, Remaining Due: ৳5,000
        $payload = [
            'customer_id' => $this->customer->id,
            'customer_name' => 'Multi Split Customer',
            'warehouse_id' => $this->warehouse->id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => 5000.00,
                ],
                [
                    'payment_method' => 'bkash',
                    'amount' => 7500.00,
                    'reference_number' => 'BK-SPLIT-991',
                ],
                [
                    'payment_method' => 'card',
                    'amount' => 5000.00,
                    'reference_number' => 'POS-SWIPE-554',
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertOk()->assertJson(['success' => true]);

        $sale = Sale::where('customer_name', 'Multi Split Customer')->first();
        $this->assertNotNull($sale);
        $this->assertEquals(22500.00, $sale->grand_total);
        $this->assertEquals(17500.00, $sale->paid_amount);
        $this->assertEquals(5000.00, $sale->due_amount);
        $this->assertEquals('partially_paid', $sale->payment_status);

        // 3 payment rows in sale_payments
        $this->assertEquals(3, $sale->payments()->count());
        $this->assertDatabaseHas('sale_payments', ['payment_method' => 'bkash', 'reference_number' => 'BK-SPLIT-991']);
        $this->assertDatabaseHas('sale_payments', ['payment_method' => 'card', 'reference_number' => 'POS-SWIPE-554']);
    }

    public function test_payment_total_cannot_exceed_invoice_total_for_multiple_methods(): void
    {
        // Invoice ৳22,500, but multi payment allocation is ৳30,000
        $payload = [
            'customer_name' => 'Overpayer',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => 15000.00,
                ],
                [
                    'payment_method' => 'bkash',
                    'amount' => 15000.00,
                    'reference_number' => 'BK-OVER-99',
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertStatus(422);
    }

    public function test_negative_payment_amount_is_rejected(): void
    {
        $payload = [
            'customer_name' => 'Fraudulent Negative',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'cash',
                    'amount' => -500.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertStatus(422);
    }

    public function test_digital_payment_method_requires_transaction_reference(): void
    {
        $payload = [
            'customer_name' => 'Missing Reference',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'bkash',
                    'amount' => 22500.00,
                    'reference_number' => '', // Missing reference
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.checkout'), $payload);

        $response->assertStatus(422);
    }

    public function test_pos_hold_and_clear_cart_lifecycle(): void
    {
        $payload = [
            'customer_name' => 'Customer Holding',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 22500.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.pos.hold'), $payload);

        $response->assertOk();

        $sale = Sale::where('is_held', true)->first();
        $this->assertNotNull($sale);

        // Delete held cart
        $this->actingAs($this->admin)
            ->delete(route('admin.pos.deleteHeld', $sale->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('sales', ['id' => $sale->id]);
    }
}
