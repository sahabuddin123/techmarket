<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Order;
use App\Models\Category;
use App\Models\Product;
use App\Models\Notification;
use App\Models\NotificationRule;
use App\Services\Notification\NotificationManager;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderNotificationDispatchTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::create([
            'name' => 'Super Administrator',
            'email' => 'admin@techmarketbd.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '01324294323',
        ]);
        $this->admin->roles()->attach($adminRole->id);

        $this->customer = User::create([
            'name' => 'Tanvir Ahmed',
            'email' => 'tanvir@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'phone' => '01799887766',
        ]);

        $category = Category::create([
            'name' => 'Laptops',
            'slug' => 'laptops',
        ]);

        $this->product = Product::create([
            'title' => 'Asus ROG Strix G16',
            'slug' => 'asus-rog-strix-g16',
            'sku' => 'ROG-G16-01',
            'category_id' => $category->id,
            'price' => 185000,
            'regular_price' => 195000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->seed(\Database\Seeders\NotificationRulesSeeder::class);
    }

    public function test_checkout_creates_in_app_notification_for_admin(): void
    {
        $response = $this->actingAs($this->customer)
            ->withSession([
                'cart' => [
                    $this->product->id => [
                        'id' => $this->product->id,
                        'title' => $this->product->title,
                        'price' => $this->product->price,
                        'quantity' => 1,
                    ]
                ]
            ])
            ->post('/checkout', [
                'customer_name' => 'Tanvir Ahmed',
                'customer_email' => 'tanvir@gmail.com',
                'customer_phone' => '01799887766',
                'shipping_address' => 'House 12, Road 4, Banani',
                'district' => 'Dhaka',
                'payment_method' => 'COD',
            ]);

        $response->assertRedirect();

        // Verify in-app notification exists in database
        $this->assertDatabaseHas('notifications', [
            'type' => 'order.created',
            'category' => 'ORDER',
        ]);

        // High value notification for order >= 50,000 BDT
        $this->assertDatabaseHas('notifications', [
            'type' => 'order.high_value',
            'category' => 'ORDER',
            'priority' => 'HIGH',
        ]);

        // Topbar feed should contain these notifications for the admin
        $feedRes = $this->actingAs($this->admin)->getJson('/admin/notifications/feed');
        $feedRes->assertStatus(200);
        $feedData = $feedRes->json();
        $this->assertGreaterThanOrEqual(1, $feedData['unread_count']);
        $this->assertNotEmpty($feedData['notifications']);
    }
}
