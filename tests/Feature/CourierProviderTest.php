<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\User;
use App\Services\Courier\PathaoCourierService;
use App\Services\CourierService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CourierProviderTest extends TestCase
{
    use RefreshDatabase;

    public function test_courier_provider_handles_missing_credentials_and_normalizes_statuses(): void
    {
        $user = User::create([
            'name' => 'Courier User',
            'email' => 'courier@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $order = Order::create([
            'order_number' => 'TMB-20260817-COUR1',
            'user_id' => $user->id,
            'customer_name' => 'Courier User',
            'customer_email' => 'courier@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 1000.00,
            'total' => 1060.00,
            'status' => 'Processing',
        ]);

        $provider = new PathaoCourierService();
        $res = $provider->createParcel($order);

        $this->assertTrue($res['success']);
        $this->assertNotEmpty($res['consignment_id']);

        // Status Normalization tests
        $this->assertEquals('delivered', CourierService::normalizeStatus('DELIVERED'));
        $this->assertEquals('delivered', CourierService::normalizeStatus('Completed Successfully'));
        $this->assertEquals('in_transit', CourierService::normalizeStatus('In Transit'));
        $this->assertEquals('cancelled', CourierService::normalizeStatus('Cancelled by Hub'));
    }
}

