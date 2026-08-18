<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\ShippingRate;
use App\Services\ShippingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShippingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resolves_district_rates_and_applies_free_shipping_threshold(): void
    {
        ShippingRate::create([
            'zone_name' => 'Dhaka City Zone',
            'district' => 'Dhaka',
            'rate' => 60.00,
            'estimated_days' => '24 Hours',
            'is_active' => true,
        ]);

        ShippingRate::create([
            'zone_name' => 'Chittagong Express',
            'district' => 'Chittagong',
            'rate' => 130.00,
            'estimated_days' => '48 Hours',
            'is_active' => true,
        ]);

        // Dhaka rate lookup (subtotal 10,000 < 150,000 threshold)
        $dhakaShipping = ShippingService::resolveShippingCost('Dhaka', 10000.00);
        $this->assertEquals(60.00, $dhakaShipping['cost']);
        $this->assertFalse($dhakaShipping['is_free']);

        // Chittagong rate lookup
        $ctgShipping = ShippingService::resolveShippingCost('Chittagong', 10000.00);
        $this->assertEquals(130.00, $ctgShipping['cost']);

        // Free shipping threshold rule (subtotal 200,000 >= 150,000 threshold)
        $freeShipping = ShippingService::resolveShippingCost('Chittagong', 200000.00);
        $this->assertEquals(0.00, $freeShipping['cost']);
        $this->assertTrue($freeShipping['is_free']);
    }
}
