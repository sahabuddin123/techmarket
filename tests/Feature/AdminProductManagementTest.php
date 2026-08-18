<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductSpecificationValue;
use App\Models\SpecificationAttribute;
use App\Models\SpecificationGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Category $category;
    protected Brand $brand;
    protected SpecificationGroup $specGroup;
    protected SpecificationAttribute $specAttrCores;
    protected SpecificationAttribute $specAttrBoost;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin Officer',
            'email' => 'admin@techmarket.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->customer = User::create([
            'name' => 'Customer User',
            'email' => 'customer@techmarket.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $this->category = Category::create(['name' => 'Processors', 'slug' => 'processors']);
        $this->brand = Brand::create(['name' => 'Intel', 'slug' => 'intel']);

        $this->specGroup = SpecificationGroup::create(['name' => 'CPU Core Architecture', 'sort_order' => 1]);
        $this->specAttrCores = SpecificationAttribute::create([
            'specification_group_id' => $this->specGroup->id,
            'name' => 'Total Cores',
            'sort_order' => 1,
        ]);
        $this->specAttrBoost = SpecificationAttribute::create([
            'specification_group_id' => $this->specGroup->id,
            'name' => 'Max Turbo Frequency',
            'unit' => 'GHz',
            'sort_order' => 2,
        ]);
    }

    public function test_admin_can_view_product_create_workspace(): void
    {
        $this->actingAs($this->admin);

        $response = $this->get('/admin/products/create');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Products/Form')
            ->has('categories')
            ->has('brands')
            ->has('specGroups')
            ->has('componentTypes')
        );
    }

    public function test_admin_can_create_product_with_structured_specs_and_inventory(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/admin/products', [
            'title' => 'Intel Core i9-14900K Flagship Processor',
            'sku' => 'CPU-INT-14900K',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 72000.00,
            'regular_price' => 76000.00,
            'cost_price' => 64000.00,
            'stock' => 15,
            'low_stock_threshold' => 4,
            'is_featured' => true,
            'is_deal_of_day' => false,
            'is_active' => true,
            'component_type' => 'processor',
            'key_specs' => ['24 Cores (8P + 16E)', '6.0 GHz Max Boost', 'Intel Smart Cache: 36MB'],
            'pc_builder_specs' => [
                'socket' => 'LGA1700',
                'ram_gen' => 'DDR5',
                'wattage' => 125,
            ],
            'gallery' => [
                'https://images.unsplash.com/photo-1?w=800',
                'https://images.unsplash.com/photo-2?w=800',
            ],
            'description' => '14th Gen Intel desktop powerhouse processor.',
            'warranty' => '3 Years Official Intel Warranty',
            'meta_title' => 'Intel Core i9-14900K Price in BD | TechMarket BD',
            'meta_description' => 'Buy 14th Gen Intel Core i9-14900K Processor at best price in Bangladesh with official warranty.',
            'focus_keyword' => 'intel i9 14900k price in bd',
            'specification_values' => [
                $this->specAttrCores->id => '24 Cores (8P + 16E)',
                $this->specAttrBoost->id => '6.0',
            ],
        ]);

        $response->assertRedirect('/admin/products');
        $response->assertSessionHas('success');

        $product = Product::where('sku', 'CPU-INT-14900K')->first();
        $this->assertNotNull($product);
        $this->assertEquals(72000.00, $product->price);
        $this->assertEquals(64000.00, $product->cost_price);
        $this->assertEquals(15, $product->stock);
        $this->assertEquals(4, $product->low_stock_threshold);
        $this->assertEquals('processor', $product->component_type);
        $this->assertEquals('LGA1700', $product->pc_builder_specs['socket']);
        $this->assertCount(2, $product->gallery);

        // Verify relational specification values created
        $specVal1 = ProductSpecificationValue::where('product_id', $product->id)
            ->where('specification_attribute_id', $this->specAttrCores->id)
            ->first();
        $this->assertNotNull($specVal1);
        $this->assertEquals('24 Cores (8P + 16E)', $specVal1->value);

        // Verify inventory ledger movement logged
        $movement = InventoryMovement::where('product_id', $product->id)->first();
        $this->assertNotNull($movement);
        $this->assertEquals(15, $movement->quantity);
        $this->assertEquals('purchase', $movement->type);
    }

    public function test_admin_can_update_product_and_adjust_stock_with_ledger(): void
    {
        $this->actingAs($this->admin);

        $product = Product::create([
            'title' => 'Intel Core i5-14600K',
            'slug' => 'intel-core-i5-14600k',
            'sku' => 'CPU-INT-14600K',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 38000.00,
            'regular_price' => 41000.00,
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->put("/admin/products/{$product->id}", [
            'title' => 'Intel Core i5-14600K Desktop CPU',
            'sku' => 'CPU-INT-14600K',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'price' => 37500.00,
            'regular_price' => 40000.00,
            'stock' => 18, // +8 units adjustment
            'specification_values' => [
                $this->specAttrCores->id => '14 Cores (6P + 8E)',
            ],
        ]);

        $response->assertRedirect('/admin/products');
        $response->assertSessionHas('success');

        $product->refresh();
        $this->assertEquals('Intel Core i5-14600K Desktop CPU', $product->title);
        $this->assertEquals(37500.00, $product->price);
        $this->assertEquals(18, $product->stock);

        // Verify adjustment logged in inventory ledger
        $movement = InventoryMovement::where('product_id', $product->id)
            ->where('type', 'adjustment')
            ->first();
        $this->assertNotNull($movement);
        $this->assertEquals(8, $movement->quantity);
    }

    public function test_admin_can_delete_product(): void
    {
        $this->actingAs($this->admin);

        $product = Product::create([
            'title' => 'Obsolete CPU',
            'slug' => 'obsolete-cpu',
            'sku' => 'OBS-01',
            'category_id' => $this->category->id,
            'price' => 5000.00,
            'stock' => 2,
        ]);

        $response = $this->delete("/admin/products/{$product->id}");
        $response->assertRedirect('/admin/products');
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_unauthorized_customer_cannot_manage_products(): void
    {
        $this->actingAs($this->customer);

        $response = $this->get('/admin/products');
        $response->assertStatus(403);

        $postResponse = $this->post('/admin/products', [
            'title' => 'Hacked Item',
            'sku' => 'HACK-01',
            'category_id' => $this->category->id,
            'price' => 10,
            'stock' => 1,
        ]);
        $postResponse->assertStatus(403);
    }
}
