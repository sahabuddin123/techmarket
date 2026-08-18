<?php

namespace App\Services\Courier;

use App\Models\Order;
use Carbon\Carbon;

class SteadfastCourierProvider implements CourierProviderInterface
{
    protected ?string $apiKey;
    protected ?string $secretKey;

    public function __construct()
    {
        $this->apiKey = config('services.steadfast.api_key');
        $this->secretKey = config('services.steadfast.secret_key');
    }

    public function createConsignment(Order $order): array
    {
        if (!$this->apiKey || !$this->secretKey) {
            return [
                'status' => 'config_required',
                'message' => 'Steadfast Courier API credentials (api_key, secret_key) are not configured in environment.',
                'provider' => 'Steadfast',
                'tracking_code' => 'STEADFAST-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)$order->id, 5, '0', STR_PAD_LEFT),
            ];
        }

        $trackingCode = 'STEADFAST-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)$order->id, 5, '0', STR_PAD_LEFT);

        return [
            'status' => 'success',
            'provider' => 'Steadfast',
            'tracking_code' => $trackingCode,
        ];
    }

    public function getTrackingStatus(string $trackingCode): array
    {
        return [
            'provider' => 'Steadfast',
            'tracking_code' => $trackingCode,
            'raw_status' => 'delivered',
            'normalized_status' => 'delivered',
        ];
    }

    public function cancelConsignment(string $trackingCode): array
    {
        return [
            'status' => 'cancelled',
            'provider' => 'Steadfast',
            'tracking_code' => $trackingCode,
        ];
    }
}
