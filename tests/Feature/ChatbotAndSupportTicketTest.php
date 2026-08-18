<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CategoryFaq;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\SupportTicket;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ChatbotAndSupportTicketTest extends TestCase
{
    use RefreshDatabase;


    public function test_chatbot_processes_product_query_and_returns_inventory_matches(): void
    {
        $category = Category::create([
            'name' => 'Laptops',
            'slug' => 'laptops',
            'is_active' => true,
        ]);

        $product = Product::create([
            'title' => 'Asus ROG Strix G16 Gaming Laptop',
            'slug' => 'asus-rog-strix-g16',
            'sku' => 'ASUS-ROG-G16',
            'price' => 175000,
            'regular_price' => 185000,
            'stock' => 10,
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/chatbot/message', [
            'message' => 'Show me Asus laptop',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $json = $response->json();
        $this->assertEquals('products', $json['response']['type']);
        $this->assertNotEmpty($json['response']['payload']['products']);
        $this->assertEquals('Asus ROG Strix G16 Gaming Laptop', $json['response']['payload']['products'][0]['title']);
    }

    public function test_chatbot_tracks_order_status_cleanly(): void
    {
        $user = User::factory()->create();
        $order = Order::create([
            'order_number' => 'ORD-20260817-9988',
            'user_id' => $user->id,
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Elephant Road, Dhaka',
            'subtotal' => 15000,
            'total' => 15000,
            'status' => 'shipped',
            'payment_status' => 'paid',
            'courier_name' => 'Steadfast Courier',
            'tracking_number' => 'ST-998822',
        ]);

        $response = $this->postJson('/api/chatbot/message', [
            'message' => 'Track my order ORD-20260817-9988',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $json = $response->json();
        $this->assertEquals('order_status', $json['response']['type']);
        $this->assertEquals('ORD-20260817-9988', $json['response']['payload']['order_number']);
        $this->assertEquals('shipped', $json['response']['payload']['status']);
    }

    public function test_chatbot_returns_warranty_and_shipping_policies(): void
    {
        $response = $this->postJson('/api/chatbot/message', [
            'message' => 'What is your warranty policy?',
        ]);

        $response->assertStatus(200);
        $json = $response->json();
        $this->assertEquals('policy', $json['response']['type']);
        $this->assertStringContainsString('Official Warranty Policy', $json['response']['message']);
    }

    public function test_chatbot_resolves_catalog_navigation_request(): void
    {
        $cat = Category::create(['name' => 'Laptops', 'slug' => 'laptops-cat', 'is_active' => true]);

        Product::create([
            'title' => 'MacBook Pro M3 Max',
            'slug' => 'macbook-pro-m3-max',
            'sku' => 'MBP-M3-MAX',
            'category_id' => $cat->id,
            'price' => 380000,
            'regular_price' => 395000,
            'stock' => 5,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $response = $this->postJson('/api/chatbot/message', [
            'message' => 'View all in Catalog',
        ]);

        $response->assertStatus(200);
        $json = $response->json();
        $this->assertEquals('products', $json['response']['type']);
        $this->assertStringContainsString('TechMarket Product Catalog', $json['response']['message']);
    }

    public function test_customer_can_escalate_chat_to_support_ticket(): void
    {
        $session = ChatSession::create([
            'session_token' => 'sess_test_token_123',
            'status' => 'active',
        ]);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'user',
            'message' => 'I have a special inquiry about custom server setup',
            'type' => 'text',
        ]);

        $response = $this->postJson('/api/chatbot/escalate', [
            'session_token' => 'sess_test_token_123',
            'customer_name' => 'Tanvir Ahmed',
            'customer_phone' => '01711223344',
            'customer_email' => 'tanvir@example.com',
            'inquiry_text' => 'Need quotation for 10 Xeon rack servers',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('support_tickets', [
            'chat_session_id' => $session->id,
            'customer_name' => 'Tanvir Ahmed',
            'customer_phone' => '01711223344',
            'status' => 'new',
        ]);

        $session->refresh();
        $this->assertEquals('escalated', $session->status);
    }

    public function test_admin_can_view_and_update_support_ticket(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $ticket = SupportTicket::create([
            'ticket_number' => 'TIC-20260817-TEST1',
            'customer_name' => 'Karim Hasan',
            'customer_phone' => '01811223344',
            'inquiry_text' => 'When will RTX 5090 be available in Dhaka?',
            'status' => 'new',
            'priority' => 'medium',
        ]);

        // Admin index
        $this->actingAs($admin)
            ->get('/admin/support-tickets')
            ->assertStatus(200);

        // Admin update ticket status
        $this->actingAs($admin)
            ->put("/admin/support-tickets/{$ticket->id}", [
                'status' => 'resolved',
                'priority' => 'high',
                'resolution_notes' => 'Called customer and informed expected arrival date.',
            ])
            ->assertRedirect();

        $ticket->refresh();
        $this->assertEquals('resolved', $ticket->status);
        $this->assertEquals('high', $ticket->priority);
        $this->assertEquals('Called customer and informed expected arrival date.', $ticket->resolution_notes);
    }

    public function test_unauthorized_user_cannot_access_admin_support_tickets(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->get('/admin/support-tickets')
            ->assertStatus(403);
    }
}
