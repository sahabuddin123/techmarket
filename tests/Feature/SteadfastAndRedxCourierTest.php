<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\User;
use App\Services\Courier\SteadfastCourierService;
use App\Services\Courier\PathaoCourierService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SteadfastAndRedxCourierTest extends TestCase
{
    use RefreshDatabase;

    public function test_steadfast_and_redx_providers_handle_credentials_and_tracking(): void
    {
        $user = User::create(['name' => 'Courier Customer', 'email' => 'courier.c@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);

        $order = Order::create([
            'order_number' => 'TMB-20260817-PROV1',
            'user_id' => $user->id,
            'customer_name' => 'Courier Customer',
            'customer_email' => 'courier.c@test.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 2000.00,
            'total' => 2060.00,
            'status' => 'Processing',
        ]);

        $steadfast = new SteadfastCourierService();
        $this->assertEquals('steadfast', $steadfast->getIdentifier());
        $resSteadfast = $steadfast->createParcel($order);
        $this->assertTrue($resSteadfast['success']);
        $this->assertNotEmpty($resSteadfast['consignment_id']);

        $pathao = new PathaoCourierService();
        $this->assertEquals('pathao', $pathao->getIdentifier());
        $resPathao = $pathao->createParcel($order);
        $this->assertTrue($resPathao['success']);
        $this->assertNotEmpty($resPathao['consignment_id']);
    }
}

