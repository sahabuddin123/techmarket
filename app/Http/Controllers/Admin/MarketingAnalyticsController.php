<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InternalEvent;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MarketingAnalyticsController extends Controller
{
    /**
     * Display the Marketing Reporting Dashboard with real aggregate data.
     */
    public function index(Request $request)
    {
        $period = $request->input('period', 'last_30_days');
        
        $dateFrom = match ($period) {
            'today' => now()->startOfDay(),
            'last_7_days' => now()->subDays(7)->startOfDay(),
            'this_month' => now()->startOfMonth(),
            default => now()->subDays(30)->startOfDay(),
        };

        // 1. Authoritative Store Ecommerce Metrics
        $ordersQuery = Order::whereNotIn('status', ['Cancelled', 'Failed'])
            ->where('created_at', '>=', $dateFrom);

        $totalRevenue = (float) $ordersQuery->sum('total');
        $totalOrders = $ordersQuery->count();
        $averageOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0;

        // 2. Real Funnel Aggregation from Internal Events
        $funnelEvents = InternalEvent::where('created_at', '>=', $dateFrom)
            ->select('event_name', DB::raw('count(*) as count'))
            ->groupBy('event_name')
            ->pluck('count', 'event_name')
            ->toArray();

        $productViews = $funnelEvents['view_content'] ?? 0;
        $addToCarts = $funnelEvents['add_to_cart'] ?? 0;
        $checkoutStarts = $funnelEvents['initiate_checkout'] ?? 0;
        $purchases = $totalOrders;

        $viewToCartRate = $productViews > 0 ? round(($addToCarts / $productViews) * 100, 1) : 0;
        $cartToCheckoutRate = $addToCarts > 0 ? round(($checkoutStarts / $addToCarts) * 100, 1) : 0;
        $checkoutToPurchaseRate = $checkoutStarts > 0 ? round(($purchases / $checkoutStarts) * 100, 1) : 0;
        $overallConversionRate = $productViews > 0 ? round(($purchases / $productViews) * 100, 2) : 0;

        // 3. Top Products Analysis
        $topPurchased = OrderItem::select('product_id', 'product_name', DB::raw('SUM(quantity) as units_sold'), DB::raw('SUM(total) as revenue_generated'))
            ->whereHas('order', function ($q) use ($dateFrom) {
                $q->whereNotIn('status', ['Cancelled', 'Failed'])->where('created_at', '>=', $dateFrom);
            })
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('units_sold')
            ->take(5)
            ->get();

        $topViewed = InternalEvent::where('event_name', 'view_content')
            ->where('created_at', '>=', $dateFrom)
            ->whereNotNull('product_id')
            ->with('product:id,title,price,image')
            ->select('product_id', DB::raw('count(*) as views_count'))
            ->groupBy('product_id')
            ->orderByDesc('views_count')
            ->take(5)
            ->get();

        // 4. Third-Party Integration Configuration Status
        $gaConfigured = !empty(Setting::get('ga4_measurement_id')) && Setting::getBool('ga4_enabled', false);
        $metaPixelConfigured = !empty(Setting::get('meta_pixel_id')) && Setting::getBool('meta_pixel_enabled', false);
        $metaCapiConfigured = !empty(Setting::get('meta_capi_token')) && Setting::getBool('meta_capi_enabled', false);
        $metaMarketingApiConfigured = !empty(Setting::get('meta_ad_account_id')) && !empty(Setting::get('meta_app_id'));

        return Inertia::render('Admin/Marketing/AnalyticsDashboard', [
            'period' => $period,
            'storePerformance' => [
                'revenue' => $totalRevenue,
                'orders' => $totalOrders,
                'aov' => $averageOrderValue,
                'conversion_rate' => $overallConversionRate,
            ],
            'funnel' => [
                'views' => $productViews,
                'add_to_cart' => $addToCarts,
                'checkout_started' => $checkoutStarts,
                'purchases' => $purchases,
                'view_to_cart_rate' => $viewToCartRate,
                'cart_to_checkout_rate' => $cartToCheckoutRate,
                'checkout_to_purchase_rate' => $checkoutToPurchaseRate,
            ],
            'topPurchased' => $topPurchased,
            'topViewed' => $topViewed,
            'integrations' => [
                'ga4' => [
                    'configured' => $gaConfigured,
                    'measurement_id' => Setting::get('ga4_measurement_id', ''),
                    'reporting_api_connected' => false, // Will show honest setup guide
                ],
                'meta_pixel' => [
                    'configured' => $metaPixelConfigured,
                    'pixel_id' => Setting::get('meta_pixel_id', ''),
                ],
                'meta_capi' => [
                    'configured' => $metaCapiConfigured,
                    'status' => $metaCapiConfigured ? 'Active (Server-Side Deduped)' : 'Disabled',
                ],
                'meta_ads' => [
                    'configured' => $metaMarketingApiConfigured,
                    'reporting_connected' => false, // Honest state
                ],
            ],
        ]);
    }

    /**
     * Display live tracking diagnostics and event debug stream.
     */
    public function debug()
    {
        $recentEvents = InternalEvent::with(['product:id,title,sku', 'category:id,name', 'user:id,name,email'])
            ->latest()
            ->take(40)
            ->get();

        $platformHealth = [
            'ga4' => [
                'name' => 'Google Analytics 4',
                'enabled' => Setting::getBool('ga4_enabled', false),
                'id' => Setting::get('ga4_measurement_id') ?: 'Not configured',
                'ecommerce_enabled' => Setting::getBool('ga4_ecommerce_enabled', true),
                'debug_mode' => Setting::getBool('ga4_debug_mode', false),
            ],
            'gtm' => [
                'name' => 'Google Tag Manager',
                'enabled' => Setting::getBool('gtm_enabled', false),
                'id' => Setting::get('gtm_container_id') ?: 'Not configured',
            ],
            'meta_pixel' => [
                'name' => 'Meta Pixel (Browser)',
                'enabled' => Setting::getBool('meta_pixel_enabled', false),
                'id' => Setting::get('meta_pixel_id') ?: 'Not configured',
            ],
            'meta_capi' => [
                'name' => 'Meta Conversions API (Server-Side)',
                'enabled' => Setting::getBool('meta_capi_enabled', false),
                'token_status' => !empty(Setting::get('meta_capi_token')) ? 'Configured ✓' : 'Missing Token',
                'test_code' => Setting::get('meta_capi_test_code') ?: 'Live Production Mode',
                'version' => Setting::get('meta_capi_version', 'v19.0'),
            ],
            'product_feed' => [
                'name' => 'Meta Catalog Feed',
                'enabled' => Setting::getBool('meta_feed_enabled', true),
                'url' => url('/feeds/meta-products.xml'),
                'product_count' => Product::where('is_active', '!=', false)->count(),
            ],
        ];

        return Inertia::render('Admin/Marketing/TrackingDebug', [
            'health' => $platformHealth,
            'recentEvents' => $recentEvents,
        ]);
    }
}
