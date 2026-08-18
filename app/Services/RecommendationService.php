<?php

namespace App\Services;

use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    /**
     * Get related products based on category and brand.
     */
    public static function getRelatedProducts(Product $product, int $limit = 4)
    {
        return Product::where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                      ->orWhere('brand_id', $product->brand_id);
            })
            ->take($limit)
            ->get();
    }

    /**
     * Get frequently bought together products based on completed order co-occurrences.
     */
    public static function getFrequentlyBoughtTogether(int $productId, int $limit = 3)
    {
        // Find order IDs containing target product
        $orderIds = OrderItem::where('product_id', $productId)->pluck('order_id');

        if ($orderIds->isEmpty()) {
            return collect();
        }

        // Find other product IDs co-occurring in those orders
        $coProductIds = OrderItem::whereIn('order_id', $orderIds)
            ->where('product_id', '!=', $productId)
            ->select('product_id', DB::raw('COUNT(*) as co_count'))
            ->groupBy('product_id')
            ->orderByDesc('co_count')
            ->take($limit)
            ->pluck('product_id');

        return Product::whereIn('id', $coProductIds)->get();
    }

    /**
     * Get trending products based on historical completed sales.
     */
    public static function getTrendingProducts(int $limit = 6)
    {
        $trendingIds = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->take($limit)
            ->pluck('product_id');

        if ($trendingIds->isEmpty()) {
            return Product::where('is_featured', true)->take($limit)->get();
        }

        return Product::whereIn('id', $trendingIds)->get();
    }
}
