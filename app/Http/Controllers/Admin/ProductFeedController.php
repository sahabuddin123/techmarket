<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductFeedController extends Controller
{
    /**
     * Display the Product Feeds & Meta Catalog Manager.
     */
    public function index()
    {
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', '!=', false)->count();
        $inStockProducts = Product::where('is_active', '!=', false)->where('stock', '>', 0)->count();
        $outOfStockProducts = Product::where('is_active', '!=', false)->where('stock', '<=', 0)->count();
        $missingImageCount = Product::where('is_active', '!=', false)
            ->where(function ($q) {
                $q->whereNull('image')->orWhere('image', '');
            })->count();

        $settings = [
            'meta_feed_enabled' => Setting::getBool('meta_feed_enabled', true),
            'feed_include_out_of_stock' => Setting::getBool('feed_include_out_of_stock', true),
            'feed_default_brand' => Setting::get('feed_default_brand', 'TechMarket'),
            'feed_currency' => Setting::get('feed_currency', 'BDT'),
        ];

        $feeds = [
            'meta_xml' => url('/feeds/meta-products.xml'),
            'meta_csv' => url('/feeds/meta-products.csv'),
            'google_xml' => url('/feeds/google-products.xml'),
            'products_csv' => url('/feeds/products.csv'),
            'csv' => url('/feeds/products.csv'),
        ];

        return Inertia::render('Admin/Marketing/ProductFeeds', [
            'stats' => [
                'total' => $totalProducts,
                'active' => $activeProducts,
                'in_stock' => $inStockProducts,
                'out_of_stock' => $outOfStockProducts,
                'missing_image' => $missingImageCount,
            ],
            'settings' => $settings,
            'feeds' => $feeds,
        ]);
    }

    /**
     * Update product feed configuration.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'meta_feed_enabled' => 'boolean',
            'feed_include_out_of_stock' => 'boolean',
            'feed_default_brand' => 'required|string|max:100',
            'feed_currency' => 'required|string|size:3',
        ]);

        foreach ($validated as $key => $val) {
            Setting::set($key, $val, 'marketing');
        }

        return back()->with('success', 'Product feed configuration saved successfully!');
    }
}
