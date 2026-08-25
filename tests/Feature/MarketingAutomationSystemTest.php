<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\MarketingAutomation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MarketingAutomationSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::create([
            'name' => 'Marketing Admin',
            'email' => 'marketing.admin@techlandbd.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_view_marketing_automations_index(): void
    {
        MarketingAutomation::create([
            'name' => 'Welcome Loyalty Gift',
            'trigger_event' => 'user_registered',
            'channel' => 'database',
            'template' => 'Welcome to TechLand BD! You earned 100 points.',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->get('/admin/marketing-automations');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/MarketingAutomations/Index')
                 ->has('automations.data', 1)
                 ->where('automations.data.0.name', 'Welcome Loyalty Gift')
        );
    }

    public function test_admin_can_create_marketing_automation(): void
    {
        $response = $this->actingAs($this->adminUser)->post('/admin/marketing-automations', [
            'name' => 'Order Completed Points',
            'trigger_event' => 'order_completed',
            'channel' => 'email',
            'template' => 'Thank you for your order! 50 points added.',
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('marketing_automations', [
            'name' => 'Order Completed Points',
            'trigger_event' => 'order_completed',
            'channel' => 'email',
        ]);
    }

    public function test_admin_can_toggle_marketing_automation_status(): void
    {
        $automation = MarketingAutomation::create([
            'name' => 'Price Drop Alert',
            'trigger_event' => 'product_price_dropped',
            'channel' => 'database',
            'template' => 'An item on your wishlist dropped in price!',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->post("/admin/marketing-automations/{$automation->id}/toggle");

        $response->assertRedirect();
        $this->assertDatabaseHas('marketing_automations', [
            'id' => $automation->id,
            'is_active' => false,
        ]);
    }
}
