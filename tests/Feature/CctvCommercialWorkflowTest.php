<?php

namespace Tests\Feature;

use App\Enums\Cctv\CctvQuoteStatus;
use App\Models\Category;
use App\Models\Cctv\CctvEstimate;
use App\Models\Cctv\CctvEstimateItem;
use App\Models\Cctv\CctvQuote;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvCommercialWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_public_quote_view_and_printable_view_render(): void
    {
        $category = Category::create(['name' => 'Surveillance', 'slug' => 'surveillance', 'is_active' => true]);
        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Hikvision 4MP Camera',
            'slug' => 'hikvision-4mp-camera',
            'sku' => 'HIK-4MP',
            'price' => 4500,
            'stock' => 10,
            'is_active' => true,
        ]);

        $estimate = CctvEstimate::create([
            'estimate_number' => 'EST-TEST-001',
            'project_name' => 'Villa Security System',
            'system_type' => 'ip',
            'subtotal_amount' => 18000,
            'grand_total' => 18000,
            'status' => 'calculated',
        ]);

        CctvEstimateItem::create([
            'estimate_id' => $estimate->id,
            'product_id' => $product->id,
            'item_type' => 'selected_camera',
            'product_name_snapshot' => $product->title,
            'product_sku_snapshot' => $product->sku,
            'unit_price_snapshot' => 4500,
            'quantity' => 4,
            'subtotal_price' => 18000,
            'is_required' => true,
        ]);

        $quote = CctvQuote::create([
            'estimate_id' => $estimate->id,
            'quote_number' => 'HB-CCTV-2026-000001',
            'customer_name' => 'Dr. Kamal Hossain',
            'customer_phone' => '01711223344',
            'customer_email' => 'kamal@example.com',
            'valid_until' => now()->addDays(7),
            'status' => CctvQuoteStatus::DRAFT,
            'subtotal' => 18000,
            'grand_total' => 18000,
        ]);

        // 1. Check Public View with Token
        $response = $this->get("/quotes/{$quote->share_token}");
        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('CctvQuoteView')
                ->has('quote')
                ->has('company')
            );

        // 2. Check Printable View
        $printResponse = $this->get("/quotes/{$quote->share_token}/print");
        $printResponse->assertStatus(200)
            ->assertSee('COMMERCIAL QUOTATION')
            ->assertSee('HB-CCTV-2026-000001')
            ->assertSee('Dr. Kamal Hossain');
    }

    public function test_customer_can_approve_quote_and_convert_to_cart(): void
    {
        $category = Category::create(['name' => 'Surveillance', 'slug' => 'surveillance', 'is_active' => true]);
        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Dahua 8CH NVR',
            'slug' => 'dahua-8ch-nvr',
            'sku' => 'DH-NVR-8CH',
            'price' => 7500,
            'stock' => 5,
            'is_active' => true,
        ]);

        $estimate = CctvEstimate::create([
            'estimate_number' => 'EST-TEST-002',
            'project_name' => 'Retail Security',
            'system_type' => 'ip',
            'subtotal_amount' => 7500,
            'grand_total' => 7500,
            'status' => 'saved',
        ]);

        CctvEstimateItem::create([
            'estimate_id' => $estimate->id,
            'product_id' => $product->id,
            'item_type' => 'recording_device',
            'product_name_snapshot' => $product->title,
            'product_sku_snapshot' => $product->sku,
            'unit_price_snapshot' => 7500,
            'quantity' => 1,
            'subtotal_price' => 7500,
            'is_required' => true,
        ]);

        $quote = CctvQuote::create([
            'estimate_id' => $estimate->id,
            'quote_number' => 'HB-CCTV-2026-000002',
            'customer_name' => 'Mr. Jamir Ali',
            'customer_phone' => '01811998877',
            'valid_until' => now()->addDays(10),
            'status' => CctvQuoteStatus::ISSUED,
            'subtotal' => 7500,
            'grand_total' => 7500,
        ]);

        // 1. Approve Quote
        $approveRes = $this->postJson("/quotes/{$quote->share_token}/approve");
        $approveRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertEquals(CctvQuoteStatus::ACCEPTED, $quote->fresh()->status);
        $this->assertNotNull($quote->fresh()->approved_at);

        // 2. Convert to Cart
        $convertRes = $this->postJson("/quotes/{$quote->share_token}/convert-to-cart");
        $convertRes->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $cart = session()->get('cart', []);
        $this->assertArrayHasKey($product->id, $cart);
        $this->assertEquals(1, $cart[$product->id]['quantity']);
        $this->assertTrue($cart[$product->id]['is_cctv_item']);
    }

    public function test_expired_quote_cannot_be_approved_or_converted(): void
    {
        $estimate = CctvEstimate::create([
            'estimate_number' => 'EST-TEST-003',
            'project_name' => 'Expired Test',
            'system_type' => 'ip',
            'subtotal_amount' => 5000,
            'grand_total' => 5000,
            'status' => 'saved',
        ]);

        $quote = CctvQuote::create([
            'estimate_id' => $estimate->id,
            'quote_number' => 'HB-CCTV-2026-000003',
            'customer_name' => 'Expired Customer',
            'customer_phone' => '01911000000',
            'valid_until' => now()->subDay(), // Expired yesterday!
            'status' => CctvQuoteStatus::ISSUED,
            'subtotal' => 5000,
            'grand_total' => 5000,
        ]);

        $response = $this->postJson("/quotes/{$quote->share_token}/approve");
        $response->assertStatus(422)
            ->assertJsonPath('status', 'error');
    }
}
