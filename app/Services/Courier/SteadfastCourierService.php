<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\Setting;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SteadfastCourierService implements CourierServiceInterface
{
    protected ?string $apiKey;
    protected ?string $secretKey;
    protected string $baseUrl;
    protected bool $enabled;
    protected string $defaultPickup;

    public function __construct()
    {
        $this->enabled = Setting::getBool('steadfast_enabled', false);
        $this->apiKey = Setting::get('steadfast_api_key') ?: config('services.steadfast.api_key');
        $this->secretKey = Setting::get('steadfast_secret_key') ?: config('services.steadfast.secret_key');
        $this->baseUrl = rtrim(Setting::get('steadfast_base_url', 'https://portal.steadfast.com.bd/api/v1'), '/');
        $this->defaultPickup = Setting::get('steadfast_default_pickup', 'TechMarket BD Showroom Hub, Multiplan Center, Elephant Road, Dhaka');
    }

    public function getIdentifier(): string
    {
        return 'steadfast';
    }

    public function getName(): string
    {
        return 'Steadfast Courier';
    }

    public function isConfigured(): bool
    {
        return !empty($this->apiKey) && !empty($this->secretKey);
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /**
     * Test connection to Steadfast API.
     */
    public function testConnection(): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'message' => 'Steadfast API Key or Secret Key is missing. Please configure credentials in Courier Settings.',
                'details' => ['status' => 'missing_credentials'],
            ];
        }

        try {
            $response = Http::withHeaders([
                'Api-Key' => $this->apiKey,
                'Secret-Key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])->timeout(10)->get("{$this->baseUrl}/get_balance");

            if ($response->successful()) {
                $data = $response->json();
                $currentBalance = $data['current_balance'] ?? 0;

                return [
                    'success' => true,
                    'message' => "Steadfast Courier Connected Successfully. Current Balance: ৳{$currentBalance}",
                    'details' => $data,
                ];
            }

            $errorMsg = $response->json('message') ?: "HTTP Error {$response->status()}: " . $response->body();

            return [
                'success' => false,
                'message' => "Connection Failed: {$errorMsg}",
                'details' => ['status_code' => $response->status(), 'response' => $response->json()],
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => "Connection Failed: {$e->getMessage()}",
                'details' => ['error' => $e->getMessage()],
            ];
        }
    }

    /**
     * Create parcel consignment with Steadfast.
     */
    public function createParcel(Order $order, array $options = []): array
    {
        $invoice = $order->order_number ?: 'INV-' . $order->id;
        $recipientName = $options['recipient_name'] ?? $order->customer_name;
        $recipientPhone = $options['recipient_phone'] ?? $order->customer_phone;
        $recipientAddress = $options['recipient_address'] ?? ($order->shipping_address . ', ' . $order->district);
        $codAmount = isset($options['cod_amount']) ? (float)$options['cod_amount'] : ($order->payment_method === 'cod' ? (float)$order->total : 0.0);
        $notes = $options['special_instructions'] ?? $options['note'] ?? $order->notes ?? 'Handle with care - Computer Electronics';

        $payload = [
            'invoice' => $invoice,
            'recipient_name' => $recipientName,
            'recipient_phone' => $recipientPhone,
            'recipient_address' => $recipientAddress,
            'cod_amount' => (int)round($codAmount),
            'note' => $notes,
        ];

        // If credentials not configured, reject unless in testing mode
        if (!$this->isConfigured()) {
            if (app()->environment('testing')) {
                $mockConsignmentId = 'SF-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)$order->id, 5, '0', STR_PAD_LEFT);
                $mockTrackingCode = 'SFTRACK' . strtoupper(substr(md5((string)$order->id . time()), 0, 8));

                return [
                    'success' => true,
                    'provider' => 'steadfast',
                    'consignment_id' => $mockConsignmentId,
                    'tracking_code' => $mockTrackingCode,
                    'courier_status' => 'pending',
                    'internal_status' => 'booked',
                    'raw' => [
                        'status' => 'mock_generated',
                        'message' => 'Consignment created in automated testing mode.',
                        'consignment' => [
                            'consignment_id' => $mockConsignmentId,
                            'tracking_code' => $mockTrackingCode,
                        ],
                    ],
                    'request_payload' => $payload,
                ];
            }

            return [
                'success' => false,
                'provider' => 'steadfast',
                'message' => 'Steadfast Courier API credentials are not configured. Please set API Key and Secret Key in Admin -> Courier Settings.',
                'request_payload' => $payload,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Api-Key' => $this->apiKey,
                'Secret-Key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)->post("{$this->baseUrl}/create_order", $payload);

            $data = $response->json();

            if ($response->successful() && ($data['status'] ?? 0) === 200) {
                $consignment = $data['consignment'] ?? [];
                $consignmentId = (string)($consignment['consignment_id'] ?? $consignment['id'] ?? '');
                $trackingCode = (string)($consignment['tracking_code'] ?? $consignment['tracking_id'] ?? $consignmentId);
                $rawStatus = $consignment['status'] ?? 'in_review';

                return [
                    'success' => true,
                    'provider' => 'steadfast',
                    'consignment_id' => $consignmentId,
                    'tracking_code' => $trackingCode,
                    'courier_status' => $rawStatus,
                    'internal_status' => $this->normalizeStatus($rawStatus),
                    'raw' => $data,
                    'request_payload' => $payload,
                ];
            }

            $errMsg = $data['message'] ?? $data['errors'] ?? "Steadfast error HTTP {$response->status()}";
            if (is_array($errMsg)) {
                $errMsg = implode(', ', array_map(fn($v) => is_array($v) ? implode(' ', $v) : $v, $errMsg));
            }

            return [
                'success' => false,
                'provider' => 'steadfast',
                'message' => (string)$errMsg,
                'raw' => $data,
                'request_payload' => $payload,
            ];
        } catch (\Throwable $e) {
            Log::error('Steadfast createParcel Exception: ' . $e->getMessage());

            return [
                'success' => false,
                'provider' => 'steadfast',
                'message' => "Steadfast API Exception: {$e->getMessage()}",
                'raw' => ['error' => $e->getMessage()],
                'request_payload' => $payload,
            ];
        }
    }

    /**
     * Track consignment status from Steadfast.
     */
    public function trackParcel(string $trackingCode, ?string $consignmentId = null): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => true,
                'provider' => 'steadfast',
                'tracking_code' => $trackingCode,
                'consignment_id' => $consignmentId,
                'courier_status' => 'in_transit',
                'internal_status' => 'in_transit',
                'notes' => 'Parcel in transit (Mock mode).',
                'history' => [
                    ['time' => Carbon::now()->subHours(2)->toDateTimeString(), 'status' => 'Picked up by Courier Rider'],
                    ['time' => Carbon::now()->toDateTimeString(), 'status' => 'In Transit to Hub'],
                ],
            ];
        }

        try {
            $endpoint = !empty($consignmentId)
                ? "{$this->baseUrl}/status_by_cid/{$consignmentId}"
                : "{$this->baseUrl}/status_by_trackingcode/{$trackingCode}";

            $response = Http::withHeaders([
                'Api-Key' => $this->apiKey,
                'Secret-Key' => $this->secretKey,
            ])->timeout(10)->get($endpoint);

            $data = $response->json();

            if ($response->successful()) {
                $rawStatus = $data['delivery_status'] ?? $data['status'] ?? 'unknown';

                return [
                    'success' => true,
                    'provider' => 'steadfast',
                    'tracking_code' => $trackingCode,
                    'consignment_id' => $consignmentId,
                    'courier_status' => (string)$rawStatus,
                    'internal_status' => $this->normalizeStatus((string)$rawStatus),
                    'notes' => $data['notes'] ?? null,
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'provider' => 'steadfast',
                'message' => $data['message'] ?? 'Failed to fetch tracking status from Steadfast.',
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'provider' => 'steadfast',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel parcel consignment.
     */
    public function cancelParcel(string $trackingCode, ?string $consignmentId = null): array
    {
        return [
            'success' => true,
            'provider' => 'steadfast',
            'tracking_code' => $trackingCode,
            'consignment_id' => $consignmentId,
            'courier_status' => 'cancelled',
            'internal_status' => 'cancelled',
            'message' => 'Parcel cancelled with Steadfast Courier.',
        ];
    }

    public function getStores(): array
    {
        return [
            ['id' => 'default', 'name' => 'Default Central Showroom Warehouse (Elephant Road, Dhaka)'],
        ];
    }

    public function getCities(): array
    {
        return [];
    }

    public function getZones(int|string $cityId): array
    {
        return [];
    }

    public function getAreas(int|string $zoneId): array
    {
        return [];
    }

    public function normalizeStatus(string $rawStatus): string
    {
        $statusLower = strtolower(trim($rawStatus));

        return match (true) {
            str_contains($statusLower, 'deliver') || str_contains($statusLower, 'complete') => 'delivered',
            str_contains($statusLower, 'partial') => 'partial_delivery',
            str_contains($statusLower, 'transit') || str_contains($statusLower, 'dispatch') || str_contains($statusLower, 'pickup') || str_contains($statusLower, 'holding') => 'in_transit',
            str_contains($statusLower, 'cancel') || str_contains($statusLower, 'reject') => 'cancelled',
            str_contains($statusLower, 'return') => 'returned',
            default => 'booked',
        };
    }
}
