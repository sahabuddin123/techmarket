<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Order;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BulkPriceUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Product $product1;
    protected Product $product2;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'admin_price@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->customer = User::factory()->create([
            'email' => 'customer_price@gmail.com',
            'role' => 'customer',
        ]);

        $category = Category::create([
            'name' => 'Graphics Cards',
            'slug' => 'graphics-cards',
        ]);

        $brand = Brand::create([
            'name' => 'NVIDIA',
            'slug' => 'nvidia',
        ]);

        $this->product1 = Product::create([
            'title' => 'GeForce RTX 4070 Ti Super',
            'slug' => 'geforce-rtx-4070-ti-super',
            'sku' => 'GPU-NV-4070TIS',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 95000.00,
            'regular_price' => 105000.00,
            'stock' => 15,
        ]);

        $this->product2 = Product::create([
            'title' => 'GeForce RTX 4080 Super',
            'slug' => 'geforce-rtx-4080-super',
            'sku' => 'GPU-NV-4080S',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 135000.00,
            'regular_price' => 145000.00,
            'stock' => 8,
        ]);
    }

    public function test_unauthorized_user_cannot_perform_bulk_price_updates(): void
    {
        $payload = [
            'updates' => [
                [
                    'product_id' => $this->product1->id,
                    'regular_price' => 110000,
                    'selling_price' => 99000,
                ],
            ],
        ];

        // Guest
        $this->postJson(route('admin.products.bulkPrices'), $payload)
            ->assertUnauthorized();

        // Normal Customer
        $this->actingAs($this->customer)
            ->postJson(route('admin.products.bulkPrices'), $payload)
            ->assertForbidden();
    }

    public function test_admin_can_update_single_product_prices(): void
    {
        $payload = [
            'updates' => [
                [
                    'product_id' => $this->product1->id,
                    'regular_price' => 110000.00,
                    'selling_price' => 98000.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.products.bulkPrices'), $payload);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'updated_count' => 1,
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $this->product1->id,
            'price' => 98000.00,
            'regular_price' => 110000.00,
            'stock' => 15, // Stock unaffected
        ]);
    }

    public function test_admin_can_update_multiple_products_atomically(): void
    {
        $payload = [
            'updates' => [
                [
                    'product_id' => $this->product1->id,
                    'regular_price' => 112000.00,
                    'selling_price' => 100000.00,
                ],
                [
                    'product_id' => $this->product2->id,
                    'regular_price' => 150000.00,
                    'selling_price' => 140000.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.products.bulkPrices'), $payload);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'updated_count' => 2,
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $this->product1->id,
            'price' => 100000.00,
            'regular_price' => 112000.00,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $this->product2->id,
            'price' => 140000.00,
            'regular_price' => 150000.00,
        ]);
    }

    public function test_selling_price_cannot_exceed_regular_price(): void
    {
        $payload = [
            'updates' => [
                [
                    'product_id' => $this->product1->id,
                    'regular_price' => 90000.00,
                    'selling_price' => 95000.00, // Invalid: selling price > regular price
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.products.bulkPrices'), $payload);

        $response->assertStatus(422);

        // Product in DB remains unchanged
        $this->assertDatabaseHas('products', [
            'id' => $this->product1->id,
            'price' => 95000.00,
            'regular_price' => 105000.00,
        ]);
    }

    public function test_negative_price_is_rejected(): void
    {
        $payload = [
            'updates' => [
                [
                    'product_id' => $this->product1->id,
                    'regular_price' => -100,
                    'selling_price' => 90000,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson(route('admin.products.bulkPrices'), $payload);

        $response->assertStatus(422);
    }

    public function test_audit_log_is_recorded_for_bulk_price_updates(): void
    {
        $payload = [
            'updates' => [
                [
                    'product_id' => $this->product1->id,
                    'regular_price' => 108000.00,
                    'selling_price' => 97000.00,
                ],
            ],
        ];

        $this->actingAs($this->admin)
            ->postJson(route('admin.products.bulkPrices'), $payload)
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'products.bulk_price_updated',
            'entity_type' => Product::class,
            'entity_id' => $this->product1->id,
            'user_id' => $this->admin->id,
        ]);
    }
}
