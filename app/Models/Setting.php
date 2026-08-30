<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value', 'group'];

    /**
     * Normalize stored media/asset URLs to root-relative paths (/storage/...)
     * so they load seamlessly across localhost, 127.0.0.1, custom dev ports, and production domains.
     */
    public static function normalizeValue($value)
    {
        if (is_string($value)) {
            if (preg_match('#^https?://[^/]+/storage/(.+)$#i', $value, $matches)) {
                return '/storage/' . $matches[1];
            }
        }
        return $value;
    }

    public static function get($key, $default = null)
    {
        try {
            $setting = static::where('key', $key)->first();
            $value = $setting ? $setting->value : $default;
            return static::normalizeValue($value);
        } catch (\Throwable $e) {
            return $default;
        }
    }

    public static function getBool($key, $default = true): bool
    {
        $val = static::get($key, $default);
        if ($val === null) return (bool)$default;
        if (is_bool($val)) return $val;
        return $val !== '0' && $val !== 0 && $val !== 'false' && $val !== false;
    }

    public static function getCached($key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            return static::get($key, $default);
        });
    }

    public static function set($key, $value, $group = 'general')
    {
        Cache::forget("setting.{$key}");
        $value = static::normalizeValue($value);

        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
    }
}
