<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shipment;
use App\Services\Courier\CourierManager;

class CourierService
{
    /**
     * Get CourierManager singleton instance.
     */
    public static function manager(): CourierManager
    {
        return app(CourierManager::class);
    }

    /**
     * Create shipment consignment with Bangladesh courier provider.
     */
    public static function createConsignment(Order $order, string $provider = 'Pathao', array $params = []): array
    {
        return static::manager()->bookShipment($order, strtolower($provider), $params);
    }

    /**
     * Track shipment with provider.
     */
    public static function track(Shipment $shipment): array
    {
        return static::manager()->trackShipment($shipment);
    }

    /**
     * Cancel shipment.
     */
    public static function cancel(Shipment $shipment): array
    {
        return static::manager()->cancelShipment($shipment);
    }

    /**
     * Normalize provider-specific courier statuses to internal courier status.
     */
    public static function normalizeStatus(string $rawStatus): string
    {
        $statusLower = strtolower(trim($rawStatus));

        return match (true) {
            str_contains($statusLower, 'deliver') || str_contains($statusLower, 'complete') || str_contains($statusLower, 'paid') => 'delivered',
            str_contains($statusLower, 'partial') => 'partial_delivery',
            str_contains($statusLower, 'transit') || str_contains($statusLower, 'dispatch') || str_contains($statusLower, 'pickup') || str_contains($statusLower, 'holding') || str_contains($statusLower, 'assigned') => 'in_transit',
            str_contains($statusLower, 'cancel') || str_contains($statusLower, 'reject') => 'cancelled',
            str_contains($statusLower, 'return') => 'returned',
            default => 'pending',
        };
    }
}
