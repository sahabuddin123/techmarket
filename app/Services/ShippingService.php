<?php

namespace App\Services;

use App\Models\ShippingRate;

class ShippingService
{
    /**
     * Resolve authoritative shipping cost based on customer district and order subtotal.
     */
    public static function resolveShippingCost(string $district, float $subtotal): array
    {
        // Free shipping threshold rule: Orders above BDT 150,000 get free shipping
        $freeShippingThreshold = (float)config('app.free_shipping_threshold', 150000.00);

        if ($subtotal >= $freeShippingThreshold) {
            return [
                'cost' => 0.00,
                'zone_name' => 'Free Express Shipping Promo',
                'estimated_days' => '24-48 Hours',
                'is_free' => true,
            ];
        }

        // Exact district rate lookup
        $rate = ShippingRate::where('is_active', true)
            ->where('district', $district)
            ->first();

        // Fallback to default zone rate if district-specific rate not found
        if (!$rate) {
            $rate = ShippingRate::where('is_active', true)
                ->whereNull('district')
                ->first();
        }

        $cost = $rate ? (float)$rate->rate : ($district === 'Dhaka' ? 60.00 : 120.00);
        $zoneName = $rate ? $rate->zone_name : ($district === 'Dhaka' ? 'Dhaka City' : 'Outside Dhaka');
        $estimatedDays = $rate ? $rate->estimated_days : '24-48 Hours';

        return [
            'cost' => $cost,
            'zone_name' => $zoneName,
            'estimated_days' => $estimatedDays,
            'is_free' => false,
        ];
    }
}
