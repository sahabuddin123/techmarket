<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Closure;

class AnalyticsCacheService
{
    protected const DEFAULT_TTL = 900; // 15 minutes

    public static function remember(string $subsystem, array $params, Closure $callback, int $ttl = self::DEFAULT_TTL): mixed
    {
        $version = self::getVersion($subsystem);
        $globalVersion = self::getVersion('global');
        $paramsHash = md5(json_encode($params));
        $cacheKey = "analytics:{$subsystem}:gv{$globalVersion}:v{$version}:{$paramsHash}";

        return Cache::remember($cacheKey, $ttl, $callback);
    }

    public static function getVersion(string $subsystem): int
    {
        return (int) Cache::get("analytics_ver_{$subsystem}", 1);
    }

    public static function invalidate(string $subsystem): void
    {
        $current = self::getVersion($subsystem);
        Cache::put("analytics_ver_{$subsystem}", $current + 1, now()->addDays(30));
    }

    public static function invalidateSales(): void
    {
        self::invalidate('sales');
        self::invalidate('dashboard');
    }

    public static function invalidateProducts(): void
    {
        self::invalidate('products');
        self::invalidate('dashboard');
    }

    public static function invalidateInventory(): void
    {
        self::invalidate('inventory');
        self::invalidate('dashboard');
    }

    public static function invalidateCustomers(): void
    {
        self::invalidate('customers');
        self::invalidate('dashboard');
    }

    public static function invalidateOperations(): void
    {
        self::invalidate('operations');
        self::invalidate('dashboard');
    }

    public static function invalidateAll(): void
    {
        $current = self::getVersion('global');
        Cache::put("analytics_ver_global", $current + 1, now()->addDays(30));
    }
}
