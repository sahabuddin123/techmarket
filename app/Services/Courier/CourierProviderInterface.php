<?php

namespace App\Services\Courier;

use App\Models\Order;

interface CourierProviderInterface
{
    /**
     * Create consignment with courier provider.
     */
    public function createConsignment(Order $order): array;

    /**
     * Get tracking status of consignment.
     */
    public function getTrackingStatus(string $trackingCode): array;

    /**
     * Cancel consignment with provider.
     */
    public function cancelConsignment(string $trackingCode): array;
}
