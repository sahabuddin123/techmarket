<?php

namespace App\Services;

use App\Models\HomepageSection;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\FlashSale;
use App\Models\QuickAction;
use App\Models\OrderItem;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HomepageService
{
    /**
     * Resolve structured, dynamic homepage layout and section data with high-speed caching.
     */
    public static function getHomepageData(): array
    {
        return Cache::remember('storefront.homepage_data', 180, function () {
            // 1. Dynamic Sections Configuration
            $sections = HomepageSection::where('is_enabled', true)
                ->orderBy('sort_order')
                ->get()
                ->keyBy('section_key');

        // 2. Banners Resolution
        $allBanners = Banner::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_time')->orWhere('start_time', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_time')->orWhere('end_time', '>=', now());
            })
            ->orderBy('sort_order')
            ->get();

        $heroSlides = $allBanners->where('placement', 'hero_slider')->values();
        $sideBannerTop = $allBanners->where('placement', 'side_banner_top')->first();
        $sideBannerBottom = $allBanners->where('placement', 'side_banner_bottom')->first();

        // Fallbacks if placements not explicitly set
        if ($heroSlides->isEmpty() && $allBanners->isNotEmpty()) {
            $heroSlides = $allBanners->take(3);
        }

        // 3. Quick Action Cards (4 Cards)
        $quickActions = QuickAction::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // 4. Featured Categories (16 Cards matching grid)
        $featuredCategories = Category::where('is_featured', true)
            ->orderBy('sort_order')
            ->take(16)
            ->get();

        // 5. Navigation Categories (with subcategories and grandchildren)
        $navCategories = Category::with(['children' => function ($q) {
            $q->where('is_nav_visible', true)->orderBy('sort_order')->with(['children' => function ($sq) {
                $sq->where('is_nav_visible', true)->orderBy('sort_order');
            }]);
        }])
        ->whereNull('parent_id')
        ->where('is_nav_visible', true)
        ->orderBy('sort_order')
        ->get();

        // 6. Flash Sale Campaign with Products & Countdown
        $activeFlashSale = FlashSale::with(['items.product.category', 'items.product.brand'])
            ->where('is_active', true)
            ->where('end_time', '>', now())
            ->latest()
            ->first();

        $flashSaleData = null;
        if ($activeFlashSale) {
            $flashProducts = $activeFlashSale->items->map(function ($item) use ($activeFlashSale) {
                $p = $item->product;
                if (!$p) return null;

                // Attach flash sale metadata to product
                $p->flash_price = $item->flash_price;
                $p->regular_price = $p->regular_price ?: $p->price;
                $p->price = $item->flash_price;
                $p->savings = max(0, $p->regular_price - $item->flash_price);
                $p->quantity_limit = $item->quantity_limit;
                $p->sold_quantity = $item->sold_quantity;
                $p->flash_end_time = $activeFlashSale->end_time ? $activeFlashSale->end_time->toIso8601String() : null;
                return $p;
            })->filter()->values();

            $flashSaleData = [
                'id' => $activeFlashSale->id,
                'title' => $activeFlashSale->title,
                'start_time' => $activeFlashSale->start_time ? $activeFlashSale->start_time->toIso8601String() : null,
                'end_time' => $activeFlashSale->end_time ? $activeFlashSale->end_time->toIso8601String() : null,
                'products' => $flashProducts,
            ];
        }

        // 7. Featured Products (6 Products)
        $featuredProducts = Product::with(['category', 'brand'])
            ->where('is_featured', true)
            ->latest()
            ->take(6)
            ->get();

        // 8. Latest Products (8 Products)
        $latestProducts = Product::with(['category', 'brand'])
            ->latest()
            ->take(8)
            ->get();

        // 9. Best Sellers (8 Products resolved from Order Items or highest stock)
        $bestSellerIds = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->take(8)
            ->pluck('product_id');

        $bestSellers = Product::with(['category', 'brand'])
            ->whereIn('id', $bestSellerIds)
            ->get();

        if ($bestSellers->count() < 8) {
            $existingIds = $bestSellers->pluck('id')->toArray();
            $fillers = Product::with(['category', 'brand'])
                ->whereNotIn('id', $existingIds)
                ->orderBy('price', 'desc')
                ->take(8 - $bestSellers->count())
                ->get();
            $bestSellers = $bestSellers->merge($fillers);
        }

        // 10. Active Brands
        $brands = Brand::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // 11. Store Settings (cached)
        $settings = Setting::pluck('value', 'key')->toArray();

        return [
            'sections' => $sections,
            'heroSlides' => $heroSlides,
            'sideBannerTop' => $sideBannerTop,
            'sideBannerBottom' => $sideBannerBottom,
            'quickActions' => $quickActions,
            'featuredCategories' => $featuredCategories,
            'navCategories' => $navCategories,
            'flashSale' => $flashSaleData,
            'featuredProducts' => $featuredProducts,
            'latestProducts' => $latestProducts,
            'bestSellers' => $bestSellers,
            'brands' => $brands,
            'settings' => $settings,
            // Backwards compatibility for any components referencing banners/dealsOfDay
            'storefront_version' => $settings['storefront_version'] ?? 'v1',
            'banners' => $allBanners,
            'dealsOfDay' => $flashSaleData ? $flashSaleData['products'] : [],
            'categories' => $navCategories,
        ];
        });
    }
}
