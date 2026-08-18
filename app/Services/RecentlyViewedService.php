<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class RecentlyViewedService
{
    /**
     * Record a product view for authenticated user or session.
     */
    public static function logView(Product $product): void
    {
        $userId = auth()->id();
        $sessionId = session()->getId();

        if ($userId) {
            DB::table('recently_viewed_products')->updateOrInsert(
                ['user_id' => $userId, 'product_id' => $product->id],
                ['session_id' => $sessionId, 'updated_at' => now(), 'created_at' => now()]
            );
        } else {
            $viewed = session()->get('recently_viewed', []);
            $viewed = array_diff($viewed, [$product->id]);
            array_unshift($viewed, $product->id);

            $maxLimit = (int)(Setting::where('key', 'max_recently_viewed')->value('value') ?: 10);
            session()->put('recently_viewed', array_slice($viewed, 0, $maxLimit));
        }
    }

    /**
     * Get recently viewed products.
     */
    public static function getRecentlyViewed(int $limit = 6)
    {
        $userId = auth()->id();

        if ($userId) {
            $productIds = DB::table('recently_viewed_products')
                ->where('user_id', $userId)
                ->orderByDesc('updated_at')
                ->take($limit)
                ->pluck('product_id');

            return Product::whereIn('id', $productIds)->get();
        }

        $sessionIds = array_slice(session()->get('recently_viewed', []), 0, $limit);
        return Product::whereIn('id', $sessionIds)->get();
    }
}
