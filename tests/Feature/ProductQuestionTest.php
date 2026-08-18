<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use App\Models\ProductQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductQuestionTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_submit_question_and_admin_answers_it(): void
    {
        $category = Category::create(['name' => 'Storage', 'slug' => 'storage']);
        $brand = Brand::create(['name' => 'Samsung', 'slug' => 'samsung']);

        $product = Product::create([
            'title' => 'Samsung 990 PRO 2TB NVMe SSD',
            'slug' => 'samsung-990-pro-2tb',
            'sku' => 'SSD-SAM-990P2T',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'price' => 24500.00,
            'stock' => 20,
        ]);

        $customer = User::create([
            'name' => 'Inquiring Customer',
            'email' => 'inquire@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $admin = User::create([
            'name' => 'Tech Support Admin',
            'email' => 'support.admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Customer submits question
        $response = $this->actingAs($customer)->post('/questions', [
            'product_id' => $product->id,
            'question' => 'Does this SSD come with heatsink?',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('product_questions', [
            'product_id' => $product->id,
            'question' => 'Does this SSD come with heatsink?',
            'status' => 'pending',
        ]);

        $question = ProductQuestion::first();

        // Admin answers and publishes question
        $adminResponse = $this->actingAs($admin)->post("/admin/questions/{$question->id}/answer", [
            'answer' => 'Yes, this model includes the official Samsung aluminum heatsink.',
            'status' => 'approved',
        ]);

        $adminResponse->assertRedirect();
        $this->assertDatabaseHas('product_questions', [
            'id' => $question->id,
            'answer' => 'Yes, this model includes the official Samsung aluminum heatsink.',
            'status' => 'approved',
        ]);
    }
}
