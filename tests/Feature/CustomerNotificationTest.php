<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Notifications\OrderPlacedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_view_own_notifications_and_cannot_access_another_customers_notifications(): void
    {
        $customerA = User::create(['name' => 'Cust A', 'email' => 'a.notif@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);
        $customerB = User::create(['name' => 'Cust B', 'email' => 'b.notif@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);

        $orderA = Order::create([
            'order_number' => 'TMB-20260817-NOTIFA',
            'user_id' => $customerA->id,
            'customer_name' => 'Cust A',
            'customer_email' => 'a.notif@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'subtotal' => 1000.00,
            'total' => 1060.00,
            'status' => 'Pending',
        ]);

        $customerA->notify(new OrderPlacedNotification($orderA));

        $notificationA = $customerA->unreadNotifications()->first();

        // Customer A marks as read
        $responseA = $this->actingAs($customerA)->post("/customer-notifications/{$notificationA->id}/read");
        $responseA->assertRedirect();
        $this->assertEquals(0, $customerA->unreadNotifications()->count());

        // Customer B attempts to mark Customer A's notification as read (should fail with 404/403)
        $responseB = $this->actingAs($customerB)->post("/customer-notifications/{$notificationA->id}/read");
        $responseB->assertStatus(404);
    }
}
