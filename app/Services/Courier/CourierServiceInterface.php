<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\Shipment;

interface CourierServiceInterface
{
    /**
     * Provider slug / unique identifier.
     */
    public function getIdentifier(): string;

    /**
     * Provider display name.
     */
    public function getName(): string;

    /**
     * Check if provider credentials are configured.
     */
    public function isConfigured(): bool;

    /**
     * Check if provider is enabled in settings.
     */
    public function isEnabled(): bool;

    /**
     * Test connection to provider API with credentials.
     */
    public function testConnection(): array;

    /**
     * Create parcel / consignment with courier.
     */
    public function createParcel(Order $order, array $options = []): array;

    /**
     * Track parcel status from courier API.
     */
    public function trackParcel(string $trackingCode, ?string $consignmentId = null): array;

    /**
     * Cancel consignment with courier provider.
     */
    public function cancelParcel(string $trackingCode, ?string $consignmentId = null): array;

    /**
     * Fetch available pickup stores / warehouses if supported.
     */
    public function getStores(): array;

    /**
     * Fetch available cities if supported.
     */
    public function getCities(): array;

    /**
     * Fetch zones for a given city if supported.
     */
    public function getZones(int|string $cityId): array;

    /**
     * Fetch areas for a given zone if supported.
     */
    public function getAreas(int|string $zoneId): array;
}
