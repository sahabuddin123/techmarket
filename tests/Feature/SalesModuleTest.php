<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Sale;
use App\Services\Sales\SalesService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SalesModuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'sales_admin@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->customer = User::factory()->create([
            'email' => 'sales_cust@gmail.com',
            'role' => 'customer',
        ]);

        $category = Category::create(['name' => 'Monitors', 'slug' => 'monitors']);
        $brand = Brand::create(['name' => 'Dell', 'slug' => 'dell']);

        $this->product = Product::create([
            'title' => 'Dell UltraSharp 27 4K Monitor',
            'slug' => 'dell-ultrasharp-27-4k',
            'sku' => 'MON-DELL-U2723QE',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 78000.00,
            'regular_price' => 85000.00,
            'cost_price' => 65000.00,
            'stock' => 10,
        ]);
    }

    public function test_admin_can_view_sales_list_and_metrics(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.sales'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Sales/Index'));
    }

    public function test_admin_can_view_sale_details(): void
    {
        $sale = SalesService::createSale(
            data: [
                'customer_name' => 'Corporate Client',
                'customer_phone' => '01811111111',
                'sales_channel' => 'corporate_quote',
            ],
            items: [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 78000.00,
                ],
            ],
            payments: [
                [
                    'payment_method' => 'bank_transfer',
                    'amount' => 78000.00,
                    'reference_number' => 'BANK-SLIP-7712',
                ],
            ],
            userId: $this->admin->id
        );

        $this->actingAs($this->admin)
            ->get(route('admin.sales.show', $sale->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Sales/Show'));
    }

    public function test_admin_can_refund_sale_and_restock_product(): void
    {
        $sale = SalesService::createSale(
            data: [
                'customer_name' => 'Refund Customer',
                'sales_channel' => 'pos',
            ],
            items: [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 78000.00,
                ],
            ],
            payments: [
                [
                    'payment_method' => 'cash',
                    'amount' => 156000.00,
                ],
            ],
            userId: $this->admin->id
        );

        // Product stock deducted from 10 to 8
        $this->assertEquals(8, $this->product->fresh()->stock);

        $refundPayload = [
            'refund_amount' => 156000.00,
            'payment_method' => 'cash',
            'reason' => 'Customer changed mind',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity_returned' => 2,
                    'unit_price' => 78000.00,
                ],
            ],
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.sales.refund', $sale->id), $refundPayload)
            ->assertRedirect();

        $this->assertDatabaseHas('sale_returns', [
            'sale_id' => $sale->id,
            'refund_amount' => 156000.00,
        ]);

        // Product stock restored back to 10
        $this->assertEquals(10, $this->product->fresh()->stock);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'type' => 'return',
            'quantity' => 2,
            'resulting_stock' => 10,
        ]);
    }
}
