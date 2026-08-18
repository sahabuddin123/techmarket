<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Notifications\OrderPlacedNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatches_notification_upon_order_creation_and_admin_marks_as_read(): void
    {
        $customer = User::create([
            'name' => 'Notify Customer',
            'email' => 'notify@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $admin = User::create([
            'name' => 'Notify Admin',
            'email' => 'notify.admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-111111',
            'user_id' => $customer->id,
            'customer_name' => 'Notify Customer',
            'customer_email' => 'notify@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'COD',
            'payment_status' => 'Pending',
            'shipping_cost' => 60.00,
            'subtotal' => 15000.00,
            'discount' => 0.00,
            'total' => 15060.00,
            'status' => 'Pending',
        ]);

        // Send Notification
        $admin->notify(new OrderPlacedNotification($order));

        $this->assertEquals(1, $admin->unreadNotifications()->count());

        // Admin marks as read
        $notification = $admin->unreadNotifications()->first();
        $response = $this->actingAs($admin)->post("/admin/notifications/{$notification->id}/read");

        $response->assertRedirect();
        $this->assertEquals(0, $admin->unreadNotifications()->count());
    }
}
