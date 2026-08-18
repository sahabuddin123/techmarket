<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductQuestion;
use App\Models\ProductReview;
use App\Models\SpecificationAttribute;
use App\Models\SpecificationGroup;
use App\Models\ProductSpecificationValue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductDetailShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_detail_page_renders_cleanly_with_all_structured_data()
    {
        $parentCat = Category::create([
            'name' => 'Laptops',
            'slug' => 'laptops',
            'is_active' => true,
        ]);

        $category = Category::create([
            'name' => 'Asus Laptop',
            'slug' => 'asus-laptop',
            'parent_id' => $parentCat->id,
            'is_active' => true,
        ]);

        $brand = Brand::create([
            'name' => 'Asus',
            'slug' => 'asus',
            'is_active' => true,
        ]);

        $product = Product::create([
            'title' => 'Asus Vivobook 16 OLED',
            'slug' => 'asus-vivobook-16-oled',
            'sku' => 'M1607GA-01',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 162000,
            'regular_price' => 172000,
            'stock' => 10,
            'key_specs' => ['Processor: Ryzen AI 7', 'Display: 16 inch OLED 3.2K', 'RAM: 24GB LPDDR5X'],
            'description' => '<p>High-end OLED productivity laptop with AI acceleration.</p>',
        ]);

        $group = SpecificationGroup::create(['name' => 'Processor', 'sort_order' => 1]);
        $attr = SpecificationAttribute::create(['specification_group_id' => $group->id, 'name' => 'CPU Model', 'unit' => null, 'sort_order' => 1]);
        ProductSpecificationValue::create(['product_id' => $product->id, 'specification_attribute_id' => $attr->id, 'value' => 'AMD Ryzen AI 7 365']);

        $user = User::factory()->create(['name' => 'John Doe']);
        ProductReview::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => 5,
            'title' => 'Excellent Laptop',
            'comment' => 'Very fast delivery and crisp OLED display.',
            'status' => 'approved',
        ]);

        ProductQuestion::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'question' => 'Is RAM upgradeable?',
            'answer' => 'RAM is soldered 24GB on-board.',
            'status' => 'approved',
        ]);

        // Related product
        Product::create([
            'title' => 'Asus Zenbook 14 OLED',
            'slug' => 'asus-zenbook-14-oled',
            'sku' => 'UX3405-01',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 145000,
            'stock' => 5,
        ]);

        $response = $this->get('/product/' . $product->slug);

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ProductDetail')
            ->has('product')
            ->where('product.title', 'Asus Vivobook 16 OLED')
            ->has('relatedProducts')
            ->has('specifications')
            ->has('breadcrumbs')
            ->has('reviews')
            ->has('ratingSummary')
            ->has('questions')
        );
    }

    public function test_product_detail_page_handles_missing_optional_data_gracefully()
    {
        $category = Category::create([
            'name' => 'Accessories',
            'slug' => 'accessories',
            'is_active' => true,
        ]);

        $product = Product::create([
            'title' => 'Wireless Mouse',
            'slug' => 'wireless-mouse',
            'sku' => 'WM-100',
            'category_id' => $category->id,
            'price' => 1200,
            'regular_price' => null,
            'stock' => 0,
            'key_specs' => null,
            'full_specs' => null,
            'description' => null,
        ]);

        $response = $this->get('/product/' . $product->slug);

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ProductDetail')
            ->has('product')
            ->where('product.title', 'Wireless Mouse')
            ->has('specifications')
            ->has('reviews', 0)
            ->has('questions', 0)
        );
    }

    public function test_product_detail_page_renders_structured_custom_full_specs_cleanly()
    {
        $category = Category::create([
            'name' => 'Gaming Peripherals',
            'slug' => 'gaming-peripherals',
            'is_active' => true,
        ]);

        $product = Product::create([
            'title' => 'Logitech F310 Gamepad',
            'slug' => 'logitech-f310-gamepad',
            'sku' => 'LOGI-F310',
            'category_id' => $category->id,
            'price' => 2400,
            'stock' => 15,
            'full_specs' => [
                [
                    'group' => 'Main Features',
                    'attributes' => [
                        ['name' => 'Model', 'value' => 'F310'],
                        ['name' => 'Connection Type', 'value' => 'Wired USB (1.8m)'],
                        ['name' => 'Buttons', 'value' => 'Standard Layout'],
                    ]
                ],
                [
                    'group' => 'Physical Specifications',
                    'attributes' => [
                        ['name' => 'Cable Length', 'value' => '1.8 Meter'],
                        ['name' => 'Color', 'value' => 'Dark Blue / Black'],
                    ]
                ]
            ],
        ]);

        $response = $this->get('/product/' . $product->slug);

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ProductDetail')
            ->has('specifications', 2)
            ->where('specifications.0.group', 'Main Features')
            ->where('specifications.0.attributes.0.name', 'Model')
            ->where('specifications.0.attributes.0.value', 'F310')
            ->where('specifications.0.attributes.1.name', 'Connection Type')
            ->where('specifications.0.attributes.1.value', 'Wired USB (1.8m)')
            ->where('specifications.1.group', 'Physical Specifications')
            ->where('specifications.1.attributes.0.name', 'Cable Length')
            ->where('specifications.1.attributes.0.value', '1.8 Meter')
        );
    }
}
