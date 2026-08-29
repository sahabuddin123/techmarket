<?php

namespace App\Http\Controllers;

use App\Services\MetaConversionsApiService;
use Illuminate\Http\Request;

class TrackingEventController extends Controller
{
    /**
     * Ingest client-side tracking event for optional server-side CAPI forwarding.
     * Database table insertions are permanently disabled to prevent MySQL bloat.
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

        // Dispatch non-blocking Meta Conversions API if applicable (e.g. ViewContent, AddToCart, InitiateCheckout)
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
