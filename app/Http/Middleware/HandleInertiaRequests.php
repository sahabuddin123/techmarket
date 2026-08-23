<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $cart = session()->get('cart', []);
        $cartCount = array_reduce($cart, fn($carry, $item) => $carry + $item['quantity'], 0);
        $cartTotal = array_reduce($cart, fn($carry, $item) => $carry + $item['total'], 0);

        $settings = Setting::all()->pluck('value', 'key')->all();

        // High performance cached category navigation tree with recursive subcategories
        $navCategories = Cache::remember('navigation.categories', 3600, function () {
            return Category::with(['children' => function ($q) {
                $q->where('is_nav_visible', true)
                  ->orderBy('sort_order')
                  ->with(['children' => function ($sq) {
                      $sq->where('is_nav_visible', true)->orderBy('sort_order');
                  }]);
            }])
            ->whereNull('parent_id')
            ->where('is_nav_visible', true)
            ->orderBy('sort_order')
            ->get();
        });

        // Dynamic Footer & Header Navigation Links
        $footerNavigations = Cache::remember('navigation.footer_all', 3600, function () {
            return [
                'info' => \App\Models\Navigation::where('location', 'footer_info')->where('is_visible', true)->orderBy('sort_order')->get(),
                'policies' => \App\Models\Navigation::where('location', 'footer_policies')->where('is_visible', true)->orderBy('sort_order')->get(),
                'header' => \App\Models\Navigation::where('location', 'header')->where('is_visible', true)->orderBy('sort_order')->get(),
            ];
        });

        // Resolve Active Storefront Version & Theme Configuration from Database
        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $storefrontVersionKey = $activeVersion ? $activeVersion->key : ($settings['storefront_version'] ?? 'v3');
        $themeConfig = $activeVersion ? $activeVersion->theme_config : null;
        $versionConfig = $activeVersion ? $activeVersion->version_config : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'settings' => $settings,
            'storefront_version' => $storefrontVersionKey,
            'activeStorefrontVersion' => $activeVersion,
            'storefrontTheme' => $themeConfig,
            'storefrontConfig' => $versionConfig,
            'categories' => $navCategories,
            'footerNavigations' => $footerNavigations,
            'cart' => [
                'items' => array_values($cart),
                'count' => $cartCount,
                'total' => $cartTotal,
            ],
            'tracking' => [
                'ga4_enabled' => Setting::getBool('ga4_enabled', false),
                'ga4_measurement_id' => Setting::get('ga4_measurement_id', ''),
                'ga4_ecommerce_enabled' => Setting::getBool('ga4_ecommerce_enabled', true),
                'ga4_debug_mode' => Setting::getBool('ga4_debug_mode', false),
                'gtm_enabled' => Setting::getBool('gtm_enabled', false),
                'gtm_container_id' => Setting::get('gtm_container_id', ''),
                'meta_pixel_enabled' => Setting::getBool('meta_pixel_enabled', false),
                'meta_pixel_id' => Setting::get('meta_pixel_id', ''),
            ],
            'compareCount' => fn () => count($request->session()->get('compare_items', [])),
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
