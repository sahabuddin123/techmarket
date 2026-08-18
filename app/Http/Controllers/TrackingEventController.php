<?php

namespace App\Http\Controllers;

use App\Models\InternalEvent;
use App\Services\MetaConversionsApiService;
use Illuminate\Http\Request;

class TrackingEventController extends Controller
{
    /**
     * Ingest client-side tracking event for internal funnel analytics and optional CAPI forwarding.
     */
    public function logEvent(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string|max:100',
            'event_id' => 'nullable|string|max:150',
            'content_id' => 'nullable|string|max:150',
            'product_id' => 'nullable|exists:products,id',
            'category_id' => 'nullable|exists:categories,id',
            'value' => 'nullable|numeric',
            'currency' => 'nullable|string|size:3',
            'metadata' => 'nullable|array',
        ]);

        $eventId = $validated['event_id'] ?? ('TM_' . uniqid() . '_' . time());
        $value = $validated['value'] ?? 0.00;
        $currency = $validated['currency'] ?? 'BDT';

        // 1. Record internal database event
        $event = InternalEvent::create([
            'event_name' => $validated['event_name'],
            'event_id' => $eventId,
            'content_id' => $validated['content_id'] ?? null,
            'product_id' => $validated['product_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'user_id' => auth()->id(),
            'session_id' => session()->getId(),
            'value' => $value,
            'currency' => $currency,
            'metadata' => $validated['metadata'] ?? [],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 2. Dispatch non-blocking Meta Conversions API if applicable (e.g. ViewContent, AddToCart, InitiateCheckout)
        $metaEventMap = [
            'view_content' => 'ViewContent',
            'add_to_cart' => 'AddToCart',
            'initiate_checkout' => 'InitiateCheckout',
            'search' => 'Search',
        ];

        if (isset($metaEventMap[$validated['event_name']])) {
            $customData = [
                'currency' => $currency,
                'value' => (float) $value,
                'content_type' => 'product',
            ];
            if (!empty($validated['content_id'])) {
                $customData['content_ids'] = [$validated['content_id']];
            }

            MetaConversionsApiService::sendEvent(
                $metaEventMap[$validated['event_name']],
                $customData,
                $eventId,
                auth()->user()
            );
        }

        return response()->json([
            'success' => true,
            'event_id' => $eventId,
        ]);
    }
}
