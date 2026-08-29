<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\AnalyticsCacheService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Default Admin Theme & Appearance Configuration
     */
    public const DEFAULT_ADMIN_THEME = [
        'admin_brand_name' => 'TechMarket Admin',
        'admin_logo' => '',
        'admin_logo_dark' => '',
        'admin_favicon' => '',
        'admin_font_family' => 'Inter',
        'admin_heading_font' => 'Inter',
        'admin_primary_color' => '#4f46e5',
        'admin_secondary_color' => '#6366f1',
        'admin_accent_color' => '#8b5cf6',
        'admin_success_color' => '#10b981',
        'admin_warning_color' => '#f59e0b',
        'admin_danger_color' => '#ef4444',
        'admin_info_color' => '#3b82f6',
        'admin_sidebar_bg' => '#ffffff',
        'admin_header_bg' => '#ffffff',
        'admin_page_bg' => '#f8fafc',
        'admin_card_bg' => '#ffffff',
        'admin_border_color' => '#e2e8f0',
        'admin_text_primary' => '#0f172a',
        'admin_text_secondary' => '#475569',
        'admin_border_radius' => '12px',
        'admin_card_style' => 'soft_shadow',
        'admin_density' => 'comfortable',
        'admin_sidebar_width' => 'standard',
    ];

    /**
     * Display the Global System Settings workspace.
     */
    public function index()
    {
        $settings = Setting::all()->mapWithKeys(function ($s) {
            return [$s->key => Setting::normalizeValue($s->value)];
        })->all();

        // System information diagnostics
        $systemInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'PHP CLI / Built-in Server',
            'db_driver' => config('database.default'),
            'app_env' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'cache_driver' => config('cache.default'),
            'storage_status' => is_writable(storage_path()) ? 'Writable (Healthy)' : 'Read-Only (Error)',
            'public_storage_linked' => file_exists(public_path('storage')),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'systemInfo' => $systemInfo,
        ]);
    }

    /**
     * Display the Admin Appearance & Dynamic Branding workspace.
     */
    public function appearance()
    {
        $allSettings = Setting::all()->mapWithKeys(function ($s) {
            return [$s->key => Setting::normalizeValue($s->value)];
        })->all();
        $themeSettings = array_merge(self::DEFAULT_ADMIN_THEME, array_intersect_key($allSettings, self::DEFAULT_ADMIN_THEME));

        return Inertia::render('Admin/Settings/Appearance', [
            'themeSettings' => $themeSettings,
            'defaultTheme' => self::DEFAULT_ADMIN_THEME,
        ]);
    }

    /**
     * Update Admin Appearance & Dynamic Branding.
     */
    public function updateAppearance(Request $request)
    {
        $validated = $request->validate([
            'admin_brand_name' => 'nullable|string|max:100',
            'admin_logo' => 'nullable|string|max:500',
            'admin_logo_dark' => 'nullable|string|max:500',
            'admin_favicon' => 'nullable|string|max:500',
            'admin_font_family' => 'nullable|string|max:100',
            'admin_heading_font' => 'nullable|string|max:100',
            'admin_primary_color' => 'nullable|string|max:50',
            'admin_secondary_color' => 'nullable|string|max:50',
            'admin_accent_color' => 'nullable|string|max:50',
            'admin_success_color' => 'nullable|string|max:50',
            'admin_warning_color' => 'nullable|string|max:50',
            'admin_danger_color' => 'nullable|string|max:50',
            'admin_info_color' => 'nullable|string|max:50',
            'admin_sidebar_bg' => 'nullable|string|max:50',
            'admin_header_bg' => 'nullable|string|max:50',
            'admin_page_bg' => 'nullable|string|max:50',
            'admin_card_bg' => 'nullable|string|max:50',
            'admin_border_color' => 'nullable|string|max:50',
            'admin_text_primary' => 'nullable|string|max:50',
            'admin_text_secondary' => 'nullable|string|max:50',
            'admin_border_radius' => 'nullable|string|max:50',
            'admin_card_style' => 'nullable|string|max:50',
            'admin_density' => 'nullable|string|max:50',
            'admin_sidebar_width' => 'nullable|string|max:50',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value ?? '', 'admin_theme');
        }

        Cache::flush();

        AuditLogger::log('admin_theme.updated', null, null, [
            'updated_by' => auth()->id(),
            'keys' => array_keys($validated),
        ]);

        return back()->with('success', 'Admin Theme & Appearance settings updated and applied globally!');
    }

    /**
     * Reset Admin Appearance to project default.
     */
    public function resetAppearance()
    {
        foreach (self::DEFAULT_ADMIN_THEME as $key => $defaultValue) {
            Setting::set($key, $defaultValue, 'admin_theme');
        }

        Cache::flush();

        AuditLogger::log('admin_theme.reset', null, null, [
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Admin appearance reset to default premium enterprise theme.');
    }

    /**
     * Update store and system settings.
     */
    public function update(Request $request)
    {
        $inputs = $request->except(['_token', 'systemInfo']);
        $updatedKeys = [];

        foreach ($inputs as $key => $value) {
            // Group determination
            $group = 'general';
            if (str_starts_with($key, 'site_') || str_starts_with($key, 'admin_') || str_starts_with($key, 'favicon')) {
                $group = 'branding';
            } elseif (str_starts_with($key, 'store_') || str_starts_with($key, 'order_') || str_starts_with($key, 'min_order') || str_starts_with($key, 'low_stock') || str_starts_with($key, 'out_of_stock')) {
                $group = 'store';
            } elseif (str_starts_with($key, 'default_meta') || str_starts_with($key, 'default_og') || str_starts_with($key, 'seo_') || str_starts_with($key, 'google_') || str_starts_with($key, 'bing_') || str_starts_with($key, 'ga_') || str_starts_with($key, 'gtm_') || str_starts_with($key, 'fb_')) {
                $group = 'seo';
            } elseif (str_starts_with($key, 'bkash_') || str_starts_with($key, 'nagad_') || str_starts_with($key, 'cod_')) {
                $group = 'payment';
            } elseif (str_starts_with($key, 'shipping_') || str_starts_with($key, 'delivery_') || str_starts_with($key, 'free_shipping')) {
                $group = 'shipping';
            } elseif (str_starts_with($key, 'hotline') || str_starts_with($key, 'showroom_') || str_starts_with($key, 'whatsapp_') || str_starts_with($key, 'facebook_') || str_starts_with($key, 'youtube_') || str_starts_with($key, 'instagram_') || str_starts_with($key, 'messenger_')) {
                $group = 'contact_social';
            } elseif (str_starts_with($key, 'storefront_')) {
                $group = 'storefront';
            } elseif (str_starts_with($key, 'maintenance_')) {
                $group = 'maintenance';
            }

            // Boolean or string casting
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            Setting::set($key, $value, $group);
            $updatedKeys[] = $key;

            if ($key === 'storefront_version') {
                \App\Models\StorefrontVersion::activateVersion($value);
            }
        }

        // Invalidate global caches
        Cache::flush();
        AnalyticsCacheService::invalidateProducts();
        AnalyticsCacheService::invalidateInventory();

        AuditLogger::log('settings.updated', null, null, [
            'updated_keys' => $updatedKeys,
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Global system settings saved and application cache cleared successfully!');
    }

    /**
     * Clear application & view caches on-demand.
     */
    public function clearCache(Request $request)
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('view:clear');
            Artisan::call('route:clear');
            Artisan::call('config:clear');

            AuditLogger::log('system.cache_cleared', null, null, [
                'user_id' => auth()->id(),
            ]);

            return back()->with('success', 'Application config, route, view, and analytics caches purged successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to purge system cache: ' . $e->getMessage()]);
        }
    }
}
