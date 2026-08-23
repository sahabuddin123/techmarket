<?php

namespace App\Repositories\Eloquent\Cctv;

use App\Enums\Cctv\CctvRuleType;
use App\Enums\Cctv\CctvSystemType;
use App\Models\Cctv\CctvRule;
use App\Repositories\Contracts\Cctv\CctvRuleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class EloquentCctvRuleRepository implements CctvRuleRepositoryInterface
{
    private const CACHE_TTL_SECONDS = 3600;

    public function getActiveRulesByType(
        CctvRuleType $ruleType,
        ?CctvSystemType $systemType = null
    ): Collection {
        $cacheKey = "cctv:rules:type:{$ruleType->value}:" . ($systemType?->value ?? 'all');

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($ruleType, $systemType) {
            $now = now();
            $query = CctvRule::where('is_active', true)
                ->where('rule_type', $ruleType->value)
                ->where(function ($q) use ($now) {
                    $q->whereNull('effective_from')->orWhere('effective_from', '<=', $now);
                })
                ->where(function ($q) use ($now) {
                    $q->whereNull('effective_to')->orWhere('effective_to', '>=', $now);
                })
                ->orderBy('priority', 'desc');

            if ($systemType && $systemType !== CctvSystemType::ALL) {
                $query->where(function ($q) use ($systemType) {
                    $q->where('system_type_scope', $systemType->value)
                      ->orWhere('system_type_scope', CctvSystemType::ALL->value);
                });
            }

            return $query->get();
        });
    }

    public function findByCode(string $code): ?CctvRule
    {
        return Cache::remember("cctv:rules:code:{$code}", self::CACHE_TTL_SECONDS, function () use ($code) {
            return CctvRule::where('code', $code)->first();
        });
    }

    public function getAllActiveRules(): Collection
    {
        return Cache::remember('cctv:rules:all_active', self::CACHE_TTL_SECONDS, function () {
            $now = now();
            return CctvRule::where('is_active', true)
                ->where(function ($q) use ($now) {
                    $q->whereNull('effective_from')->orWhere('effective_from', '<=', $now);
                })
                ->where(function ($q) use ($now) {
                    $q->whereNull('effective_to')->orWhere('effective_to', '>=', $now);
                })
                ->orderBy('rule_type')
                ->orderBy('priority', 'desc')
                ->get();
        });
    }
}
