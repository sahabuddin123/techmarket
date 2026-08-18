<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsSettingController extends Controller
{
    /**
     * Display the Marketing Analytics & Tracking Settings page.
     */
    public function index()
    {
        $settings = [
            // GA4
            'ga4_enabled' => Setting::getBool('ga4_enabled', false),
            'ga4_measurement_id' => Setting::get('ga4_measurement_id', ''),
            'ga4_ecommerce_enabled' => Setting::getBool('ga4_ecommerce_enabled', true),
            'ga4_debug_mode' => Setting::getBool('ga4_debug_mode', false),

            // GTM
            'gtm_enabled' => Setting::getBool('gtm_enabled', false),
            'gtm_container_id' => Setting::get('gtm_container_id', ''),

            // Meta Pixel
            'meta_pixel_enabled' => Setting::getBool('meta_pixel_enabled', false),
            'meta_pixel_id' => Setting::get('meta_pixel_id', ''),

            // Meta Conversions API
            'meta_capi_enabled' => Setting::getBool('meta_capi_enabled', false),
            'meta_capi_token_configured' => !empty(Setting::get('meta_capi_token')),
            'meta_capi_test_code' => Setting::get('meta_capi_test_code', ''),
            'meta_capi_version' => Setting::get('meta_capi_version', 'v19.0'),

            // Meta Marketing API (Optional Ads Reporting)
            'meta_app_id' => Setting::get('meta_app_id', ''),
            'meta_app_secret_configured' => !empty(Setting::get('meta_app_secret')),
            'meta_ad_account_id' => Setting::get('meta_ad_account_id', ''),

            // Feeds
            'meta_feed_enabled' => Setting::getBool('meta_feed_enabled', true),
        ];

        return Inertia::render('Admin/Settings/AnalyticsTracking', [
            'settings' => $settings,
            'feedUrl' => url('/feeds/meta-products.xml'),
            'csvFeedUrl' => url('/feeds/meta-products.csv'),
            'googleFeedUrl' => url('/feeds/google-products.xml'),
        ]);
    }

    /**
     * Save tracking credentials and parameters.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'ga4_enabled' => 'boolean',
            'ga4_measurement_id' => 'nullable|string|max:50',
            'ga4_ecommerce_enabled' => 'boolean',
            'ga4_debug_mode' => 'boolean',

            'gtm_enabled' => 'boolean',
            'gtm_container_id' => 'nullable|string|max:50',

            'meta_pixel_enabled' => 'boolean',
            'meta_pixel_id' => 'nullable|string|max:50',

            'meta_capi_enabled' => 'boolean',
            'meta_capi_token' => 'nullable|string',
            'meta_capi_test_code' => 'nullable|string|max:50',
            'meta_capi_version' => 'nullable|string|max:20',

            'meta_app_id' => 'nullable|string|max:100',
            'meta_app_secret' => 'nullable|string',
            'meta_ad_account_id' => 'nullable|string|max:100',

            'meta_feed_enabled' => 'boolean',
        ]);

        foreach ($validated as $key => $val) {
            // Only update secret tokens if a new value was explicitly provided
            if (in_array($key, ['meta_capi_token', 'meta_app_secret']) && empty($val)) {
                continue;
            }

            if (is_bool($val)) {
                $val = $val ? '1' : '0';
            }

            Setting::set($key, $val, 'analytics');
        }

        AuditLogger::log('analytics_settings.updated', null, null, [
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Marketing analytics and event tracking configuration saved successfully!');
    }
}
