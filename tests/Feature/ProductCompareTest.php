<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use App\Models\SpecificationAttribute;
use App\Models\SpecificationGroup;
use App\Models\ProductSpecificationValue;
use App\Models\User;
use App\Services\ComparisonService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCompareTest extends TestCase
{
    use RefreshDatabase;

    protected Category $laptopCat;
    protected Category $gamingLaptopCat;
    protected Category $acCat;
    protected Brand $asusBrand;
    protected Brand $lenovoBrand;
    protected Product $laptop1;
    protected Product $laptop2;
    protected Product $acProduct;
    protected SpecificationGroup $specGroupPerf;
    protected SpecificationAttribute $specAttrCpu;

    protected function setUp(): void
    {
        parent::setUp();

        $this->laptopCat = Category::create(['name' => 'Laptops', 'slug' => 'laptops', 'is_active' => true]);
        $this->gamingLaptopCat = Category::create([
            'name' => 'Gaming Laptops',
            'slug' => 'gaming-laptops',
            'parent_id' => $this->laptopCat->id,
            'is_active' => true,
        ]);
        $this->acCat = Category::create(['name' => 'Air Conditioners', 'slug' => 'air-conditioners', 'is_active' => true]);

        $this->asusBrand = Brand::create(['name' => 'ASUS', 'slug' => 'asus', 'is_active' => true]);
        $this->lenovoBrand = Brand::create(['name' => 'Lenovo', 'slug' => 'lenovo', 'is_active' => true]);

        $this->laptop1 = Product::create([
            'title' => 'ASUS ROG Strix G16 Gaming Laptop',
            'slug' => 'asus-rog-strix-g16',
            'sku' => 'G614JVR',
            'category_id' => $this->gamingLaptopCat->id,
            'brand_id' => $this->asusBrand->id,
            'price' => 265000.00,
            'regular_price' => 280000.00,
            'stock' => 5,
            'warranty' => '2 Years Official Warranty',
            'is_active' => true,
            'key_specs' => ['Processor: Intel Core i9-14900HX', 'RAM: 16GB DDR5', 'Storage: 1TB NVMe Gen4'],
        ]);

        $this->laptop2 = Product::create([
            'title' => 'Lenovo Legion Pro 5 Gaming Laptop',
            'slug' => 'lenovo-legion-pro-5',
            'sku' => 'LEGION-PRO-5',
            'category_id' => $this->gamingLaptopCat->id,
            'brand_id' => $this->lenovoBrand->id,
            'price' => 195000.00,
            'regular_price' => 210000.00,
            'stock' => 8,
            'warranty' => '2 Years Lenovo Warranty',
            'is_active' => true,
            'key_specs' => ['Processor: Intel Core i7-14650HX', 'RAM: 16GB DDR5', 'Storage: 1TB NVMe Gen4'],
        ]);

        $this->acProduct = Product::create([
            'title' => 'Gree 1.5 Ton Inverter AC',
            'slug' => 'gree-1-5-ton-inverter-ac',
            'sku' => 'GREE-15-INV',
            'category_id' => $this->acCat->id,
            'price' => 65000.00,
            'stock' => 10,
            'is_active' => true,
        ]);

        // Create relational specification groups
        $this->specGroupPerf = SpecificationGroup::create(['name' => 'Processor & Graphics', 'sort_order' => 1]);
        $this->specAttrCpu = SpecificationAttribute::create([
            'specification_group_id' => $this->specGroupPerf->id,
            'name' => 'Processor Model',
            'unit' => null,
            'sort_order' => 1,
        ]);

        ProductSpecificationValue::create([
            'product_id' => $this->laptop1->id,
            'specification_attribute_id' => $this->specAttrCpu->id,
            'value' => 'Intel Core i9-14900HX (24 Cores, 32 Threads)',
        ]);

        ProductSpecificationValue::create([
            'product_id' => $this->laptop2->id,
            'specification_attribute_id' => $this->specAttrCpu->id,
            'value' => 'Intel Core i7-14650HX (16 Cores, 24 Threads)',
        ]);
    }

    public function test_compare_page_renders_empty_state_when_no_items(): void
    {
        $response = $this->get('/compare');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Compare')
            ->has('products', 0)
            ->where('compareCount', 0)
        );
    }

    public function test_add_product_to_comparison_session(): void
    {
        $response = $this->post('/compare/add', [
            'product_id' => $this->laptop1->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals([$this->laptop1->id], session('compare_items'));

        $comparePage = $this->get('/compare');
        $comparePage->assertStatus(200);
        $comparePage->assertInertia(fn ($page) => $page
            ->component('Compare')
            ->has('products', 1)
            ->where('products.0.id', $this->laptop1->id)
            ->where('products.0.title', 'ASUS ROG Strix G16 Gaming Laptop')
            ->where('products.0.price', 265000)
            ->where('products.0.savings', 15000)
        );
    }

    public function test_prevent_duplicate_products_in_comparison(): void
    {
        $this->withSession(['compare_items' => [$this->laptop1->id]]);

        $response = $this->post('/compare/add', [
            'product_id' => $this->laptop1->id,
        ]);

        $response->assertSessionHas('error');
        $this->assertCount(1, session('compare_items'));
    }

    public function test_max_comparison_limit_is_enforced(): void
    {
        $p3 = Product::create(['title' => 'Laptop 3', 'slug' => 'laptop-3', 'sku' => 'L3', 'category_id' => $this->gamingLaptopCat->id, 'price' => 150000, 'stock' => 5, 'is_active' => true]);
        $p4 = Product::create(['title' => 'Laptop 4', 'slug' => 'laptop-4', 'sku' => 'L4', 'category_id' => $this->gamingLaptopCat->id, 'price' => 160000, 'stock' => 5, 'is_active' => true]);
        $p5 = Product::create(['title' => 'Laptop 5', 'slug' => 'laptop-5', 'sku' => 'L5', 'category_id' => $this->gamingLaptopCat->id, 'price' => 170000, 'stock' => 5, 'is_active' => true]);

        // Max limit default is 4
        $this->withSession(['compare_items' => [$this->laptop1->id, $this->laptop2->id, $p3->id, $p4->id]]);

        // Attempt to add 5th item
        $response = $this->post('/compare/add', [
            'product_id' => $p5->id,
        ]);

        $response->assertSessionHas('error');
        $this->assertStringContainsString('maximum of 4 products', session('error'));
        $this->assertCount(4, session('compare_items'));
    }

    public function test_category_compatibility_rule_prevents_incompatible_products(): void
    {
        $this->withSession(['compare_items' => [$this->laptop1->id]]);

        // Attempt to compare Air Conditioner with Gaming Laptop
        $response = $this->post('/compare/add', [
            'product_id' => $this->acProduct->id,
        ]);

        $response->assertSessionHas('error');
        $this->assertStringContainsString('Cannot compare', session('error'));
        $this->assertEquals([$this->laptop1->id], session('compare_items'));
    }

    public function test_compatible_child_and_parent_categories_can_be_compared(): void
    {
        $parentCatLaptop = Product::create([
            'title' => 'ASUS Zenbook 14 OLED',
            'slug' => 'asus-zenbook-14-oled',
            'sku' => 'ZEN-14',
            'category_id' => $this->laptopCat->id, // Parent Laptops category
            'price' => 145000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $this->withSession(['compare_items' => [$this->laptop1->id]]); // Child Gaming Laptops

        $response = $this->post('/compare/add', [
            'product_id' => $parentCatLaptop->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertCount(2, session('compare_items'));
    }

    public function test_remove_product_from_comparison(): void
    {
        $this->withSession(['compare_items' => [$this->laptop1->id, $this->laptop2->id]]);

        $response = $this->post("/compare/remove/{$this->laptop1->id}");
        $response->assertSessionHas('success');
        $this->assertEquals([$this->laptop2->id], array_values(session('compare_items')));
    }

    public function test_clear_all_products_from_comparison(): void
    {
        $this->withSession(['compare_items' => [$this->laptop1->id, $this->laptop2->id]]);

        $response = $this->post('/compare/clear');
        $response->assertRedirect('/compare');
        $response->assertSessionHas('success');
        $this->assertEmpty(session('compare_items'));
    }

    public function test_stale_or_deleted_products_are_pruned_cleanly(): void
    {
        $this->withSession(['compare_items' => [999999, $this->laptop1->id]]);

        $response = $this->get('/compare');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Compare')
            ->has('products', 1)
            ->where('products.0.id', $this->laptop1->id)
        );
    }

    public function test_specification_matrix_renders_real_database_and_json_specs(): void
    {
        $this->withSession(['compare_items' => [$this->laptop1->id, $this->laptop2->id]]);

        $response = $this->get('/compare');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Compare')
            ->has('specMatrix')
            ->where('specMatrix.0.group_name', 'General Overview')
            ->where('specMatrix.1.group_name', 'Processor & Graphics')
            ->where('specMatrix.1.rows.0.label', 'Processor Model')
            ->where('specMatrix.1.rows.0.values.0', 'Intel Core i9-14900HX (24 Cores, 32 Threads)')
            ->where('specMatrix.1.rows.0.values.1', 'Intel Core i7-14650HX (16 Cores, 24 Threads)')
            ->where('specMatrix.1.rows.0.has_difference', true)
        );
    }

    public function test_add_compared_product_to_cart_preserves_live_pricing(): void
    {
        $response = $this->post('/cart/add', [
            'product_id' => $this->laptop1->id,
            'quantity' => 1,
        ]);

        $response->assertSessionHasNoErrors();
        $cart = session('cart');
        $this->assertArrayHasKey($this->laptop1->id, $cart);
        $this->assertEquals(265000, $cart[$this->laptop1->id]['price']);
    }

    public function test_nonexistent_or_deleted_product_cannot_be_added_to_compare(): void
    {
        $response = $this->post('/compare/add', [
            'product_id' => 999999,
        ]);

        $response->assertSessionHas('error');
        $this->assertEmpty(session('compare_items', []));
    }
}
