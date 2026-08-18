<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value', 'group'];

    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
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

        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
    }
}
