<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class StorefrontVersion extends Model
{
    protected $fillable = [
        'key',
        'name',
        'slug',
        'status',
        'is_active',
        'description',
        'theme_config',
        'version_config',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'theme_config' => 'array',
        'version_config' => 'array',
    ];

    /**
     * Get the currently active storefront version record with caching.
     */
    public static function getActiveVersion(): ?self
    {
        return Cache::remember('storefront.active_version', 3600, function () {
            // First check database table
            $active = self::where('is_active', true)->where('status', 'published')->first();
            if ($active) {
                return $active;
            }

            // Check setting fallback
            $settingKey = Setting::get('storefront_version', 'v3');
            $fallback = self::where('key', $settingKey)->first();
            if ($fallback) {
                $fallback->update(['is_active' => true]);
                return $fallback;
            }

            return null;
        });
    }

    /**
     * Activate a specific storefront version and synchronize settings.
     */
    public static function activateVersion(string $key): self
    {
        self::query()->update(['is_active' => false]);

        $version = self::firstOrCreate(
            ['key' => $key],
            [
                'name' => 'Storefront ' . strtoupper($key),
                'slug' => 'storefront-' . $key,
                'status' => 'published',
                'is_active' => true,
            ]
        );

        $version->update(['is_active' => true, 'status' => 'published']);

        // Synchronize with Setting table for full backward compatibility
        Setting::updateOrCreate(['key' => 'storefront_version'], ['value' => $key]);

        Cache::forget('storefront.active_version');
        Cache::forget('homepage.data.' . $key);

        return $version;
    }
}
