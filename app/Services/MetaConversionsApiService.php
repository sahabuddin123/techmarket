<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaConversionsApiService
{
    /**
     * Canonical content ID generator for Meta Catalog, Pixel, and CAPI.
     */
    public static function canonicalContentId(int|string $productId): string
    {
        return "PRODUCT_{$productId}";
    }

    /**
     * Dispatch server-side Conversion API event to Meta Graph API.
     */
    public static function sendEvent(
        string $eventName,
        array $customData = [],
        ?string $eventId = null,
        ?User $user = null,
        array $userData = []
    ): array {
        $enabled = Setting::getBool('meta_capi_enabled', false);
        $pixelId = Setting::get('meta_pixel_id');
        $accessToken = Setting::get('meta_capi_token');
        $apiVersion = Setting::get('meta_capi_version', 'v19.0');
        $testCode = Setting::get('meta_capi_test_code');

        if (!$enabled || empty($pixelId) || empty($accessToken)) {
            return ['status' => 'skipped', 'reason' => 'Meta CAPI is disabled or unconfigured.'];
        }

        try {
            // Hash user data for privacy compliance
            $userPayload = [
                'client_ip_address' => request()->ip(),
                'client_user_agent' => request()->userAgent(),
            ];

            $email = $userData['email'] ?? ($user?->email);
            if (!empty($email)) {
                $userPayload['em'] = [hash('sha256', strtolower(trim($email)))];
            }

            $phone = $userData['phone'] ?? ($user?->phone);
            if (!empty($phone)) {
                // Normalize phone number digits
                $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
                $userPayload['ph'] = [hash('sha256', $cleanPhone)];
            }

            $eventPayload = [
                'event_name' => $eventName,
                'event_time' => time(),
                'event_id' => $eventId ?: ('TM_' . uniqid() . '_' . time()),
                'event_source_url' => url()->current(),
                'action_source' => 'website',
                'user_data' => $userPayload,
                'custom_data' => array_merge([
                    'currency' => 'BDT',
                ], $customData),
            ];

            $postData = [
                'data' => [$eventPayload],
            ];

            if (!empty($testCode)) {
                $postData['test_event_code'] = $testCode;
            }

            $url = "https://graph.facebook.com/{$apiVersion}/{$pixelId}/events?access_token={$accessToken}";

            $response = Http::timeout(5)->post($url, $postData);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'event_id' => $eventPayload['event_id'],
                    'fbtrace_id' => $response->json('fbtrace_id'),
                ];
            }

            Log::warning('Meta Conversions API returned error: ' . $response->body());
            return [
                'status' => 'error',
                'response' => $response->json(),
            ];
        } catch (\Throwable $e) {
            Log::error('Meta Conversions API exception: ' . $e->getMessage());
            return [
                'status' => 'exception',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Dispatch server-side Purchase event with authoritative database order record.
     */
    public static function trackPurchase(Order $order, ?string $eventId = null): array
    {
        $order->loadMissing('items.product');

        $contents = [];
        $contentIds = [];

        foreach ($order->items as $item) {
            $cId = static::canonicalContentId($item->product_id);
            $contentIds[] = $cId;
            $contents[] = [
                'id' => $cId,
                'quantity' => (int) $item->quantity,
                'item_price' => (float) $item->price,
            ];
        }

        $customData = [
            'value' => (float) $order->total,
            'currency' => 'BDT',
            'order_id' => (string) $order->order_number,
            'content_type' => 'product',
            'content_ids' => $contentIds,
            'contents' => $contents,
            'num_items' => count($order->items),
        ];

        $userData = [
            'email' => $order->customer_email,
            'phone' => $order->customer_phone,
        ];

        $stableEventId = $eventId ?: "PURCHASE_{$order->order_number}";

        return static::sendEvent('Purchase', $customData, $stableEventId, $order->user, $userData);
    }
}
