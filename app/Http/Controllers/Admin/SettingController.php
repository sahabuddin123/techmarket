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
     * Display the Global System Settings workspace.
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->all();

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
            } elseif (str_starts_with($key, 'default_meta') || str_starts_with($key, 'ga_') || str_starts_with($key, 'gtm_') || str_starts_with($key, 'fb_')) {
                $group = 'seo';
            } elseif (str_starts_with($key, 'bkash_') || str_starts_with($key, 'nagad_') || str_starts_with($key, 'cod_')) {
                $group = 'payment';
            } elseif (str_starts_with($key, 'shipping_') || str_starts_with($key, 'delivery_') || str_starts_with($key, 'free_shipping')) {
                $group = 'shipping';
            } elseif (str_starts_with($key, 'hotline') || str_starts_with($key, 'showroom_') || str_starts_with($key, 'whatsapp_') || str_starts_with($key, 'facebook_') || str_starts_with($key, 'youtube_') || str_starts_with($key, 'instagram_') || str_starts_with($key, 'messenger_')) {
                $group = 'contact_social';
            } elseif (str_starts_with($key, 'maintenance_')) {
                $group = 'maintenance';
            }

            // Boolean or string casting
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            Setting::set($key, $value, $group);
            $updatedKeys[] = $key;
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
