<?php

namespace App\Services\Courier;

use App\Models\Order;
use Carbon\Carbon;

class PathaoCourierProvider implements CourierProviderInterface
{
    protected ?string $clientId;
    protected ?string $clientSecret;

    public function __construct()
    {
        $this->clientId = config('services.pathao.client_id');
        $this->clientSecret = config('services.pathao.client_secret');
    }

    public function createConsignment(Order $order): array
    {
        if (!$this->clientId || !$this->clientSecret) {
            return [
                'status' => 'config_required',
                'message' => 'Pathao API credentials (client_id, client_secret) are not configured in environment.',
                'provider' => 'Pathao',
                'tracking_code' => 'PATHAO-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)$order->id, 5, '0', STR_PAD_LEFT),
            ];
        }

        $trackingCode = 'PATHAO-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)$order->id, 5, '0', STR_PAD_LEFT);

        return [
            'status' => 'success',
            'provider' => 'Pathao',
            'tracking_code' => $trackingCode,
        ];
    }

    public function getTrackingStatus(string $trackingCode): array
    {
        return [
            'provider' => 'Pathao',
            'tracking_code' => $trackingCode,
            'raw_status' => 'In Transit',
            'normalized_status' => 'in_transit',
        ];
    }

    public function cancelConsignment(string $trackingCode): array
    {
        return [
            'status' => 'cancelled',
            'provider' => 'Pathao',
            'tracking_code' => $trackingCode,
        ];
    }
}
