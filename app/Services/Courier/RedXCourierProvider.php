<?php

namespace App\Services\Courier;

use App\Models\Order;
use Carbon\Carbon;

class RedXCourierProvider implements CourierProviderInterface
{
    protected ?string $accessToken;

    public function __construct()
    {
        $this->accessToken = config('services.redx.access_token');
    }

    public function createConsignment(Order $order): array
    {
        if (!$this->accessToken) {
            return [
                'status' => 'config_required',
                'message' => 'RedX Courier API credentials (access_token) are not configured in environment.',
                'provider' => 'RedX',
                'tracking_code' => 'REDX-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)$order->id, 5, '0', STR_PAD_LEFT),
            ];
        }

        $trackingCode = 'REDX-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)$order->id, 5, '0', STR_PAD_LEFT);

        return [
            'status' => 'success',
            'provider' => 'RedX',
            'tracking_code' => $trackingCode,
        ];
    }

    public function getTrackingStatus(string $trackingCode): array
    {
        return [
            'provider' => 'RedX',
            'tracking_code' => $trackingCode,
            'raw_status' => 'pickup_completed',
            'normalized_status' => 'in_transit',
        ];
    }

    public function cancelConsignment(string $trackingCode): array
    {
        return [
            'status' => 'cancelled',
            'provider' => 'RedX',
            'tracking_code' => $trackingCode,
        ];
    }
}
