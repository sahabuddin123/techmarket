<?php

namespace App\Repositories\Eloquent\Cctv;

use App\Enums\Cctv\CctvProductType;
use App\Enums\Cctv\CctvSystemType;
use App\Models\Cctv\CctvProductProfile;
use App\Models\Product;
use App\Repositories\Contracts\Cctv\CctvProductProfileRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class EloquentCctvProductProfileRepository implements CctvProductProfileRepositoryInterface
{
    private const CACHE_TTL_SECONDS = 3600;

    public function findByProductId(int $productId): ?CctvProductProfile
    {
        return Cache::remember("cctv:product_profile:{$productId}", self::CACHE_TTL_SECONDS, function () use ($productId) {
            return CctvProductProfile::with(['product.brand', 'product.category', 'deviceProfile', 'storageProfile', 'cableProfile'])
                ->where('product_id', $productId)
                ->first();
        });
    }

    public function getActiveProductsByType(
        CctvProductType $productType,
        ?CctvSystemType $systemType = null,
        array $filters = []
    ): Collection {
        $query = CctvProductProfile::with(['product.brand', 'product.category', 'deviceProfile', 'storageProfile', 'cableProfile'])
            ->where('is_active', true)
            ->where('product_type', $productType->value)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            });

        if ($systemType && $systemType !== CctvSystemType::ALL) {
            $query->where(function ($q) use ($systemType) {
                $q->where('system_type', $systemType->value)
                  ->orWhere('system_type', CctvSystemType::ALL->value);
            });
        }

        if (isset($filters['min_resolution_mp'])) {
            $query->where('resolution_mp', '>=', (float) $filters['min_resolution_mp']);
        }

        if (isset($filters['environment']) && $filters['environment'] !== 'both') {
            $query->where(function ($q) use ($filters) {
                $q->where('environment', $filters['environment'])
                  ->orWhere('environment', 'both');
            });
        }

        if (!empty($filters['require_audio'])) {
            $query->where('audio_type', '!=', 'none');
        }

        if (!empty($filters['require_color_night_vision'])) {
            $query->whereNotNull('low_light_tech')
                  ->where('low_light_tech', '!=', 'Standard IR');
        }

        return $query->get();
    }

    public function paginateActiveProducts(
        array $filters = [],
        int $perPage = 20
    ): LengthAwarePaginator {
        $query = CctvProductProfile::with(['product.brand', 'product.category', 'deviceProfile', 'storageProfile', 'cableProfile'])
            ->where('is_active', true)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            });

        if (isset($filters['product_type'])) {
            $query->where('product_type', $filters['product_type']);
        }

        if (isset($filters['system_type']) && $filters['system_type'] !== 'all') {
            $query->where(function ($q) use ($filters) {
                $q->where('system_type', $filters['system_type'])
                  ->orWhere('system_type', 'all');
            });
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function findCompatibleRecordingDevices(
        CctvSystemType $systemType,
        int $minChannels = 4,
        float $minResolutionMp = 2.0
    ): Collection {
        $deviceTypes = match ($systemType) {
            CctvSystemType::ANALOG => ['dvr', 'xvr'],
            CctvSystemType::IP => ['nvr', 'xvr'],
            CctvSystemType::HYBRID => ['xvr', 'dvr', 'nvr'],
            CctvSystemType::WIFI => ['nvr', 'xvr'],
            default => ['dvr', 'nvr', 'xvr'],
        };

        return CctvProductProfile::with(['product.brand', 'deviceProfile'])
            ->where('is_active', true)
            ->whereIn('product_type', [CctvProductType::DVR->value, CctvProductType::NVR->value, CctvProductType::XVR->value])
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->whereHas('deviceProfile', function ($q) use ($deviceTypes, $minChannels, $minResolutionMp) {
                $q->whereIn('device_type', $deviceTypes)
                  ->where('channel_count', '>=', $minChannels)
                  ->where('max_camera_resolution_mp', '>=', $minResolutionMp);
            })
            ->get();
    }

    public function findCompatibleStorageHdds(
        float $minCapacityTb = 1.0,
        int $limit = 10
    ): Collection {
        return CctvProductProfile::with(['product.brand', 'storageProfile'])
            ->where('is_active', true)
            ->where('product_type', CctvProductType::STORAGE->value)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->whereHas('storageProfile', function ($q) use ($minCapacityTb) {
                $q->where('capacity_tb', '>=', $minCapacityTb)
                  ->where('is_surveillance_optimized', true);
            })
            ->limit($limit)
            ->get();
    }

    public function findCompatibleCables(
        CctvSystemType $systemType,
        bool $isOutdoor = false
    ): Collection {
        $query = CctvProductProfile::with(['product.brand', 'cableProfile'])
            ->where('is_active', true)
            ->where('product_type', CctvProductType::CABLE->value)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            });

        if ($systemType === CctvSystemType::IP) {
            $query->whereHas('cableProfile', function ($q) {
                $q->whereIn('cable_type', ['cat5e', 'cat6', 'cat6a', 'outdoor_shielded_cat6']);
            });
        } elseif ($systemType === CctvSystemType::ANALOG) {
            $query->whereHas('cableProfile', function ($q) {
                $q->whereIn('cable_type', ['coaxial_rg59', 'coaxial_siamese_3c2v', 'coaxial_siamese_rg6', 'cat6']);
            });
        }

        if ($isOutdoor) {
            $query->whereHas('cableProfile', function ($q) {
                $q->where('is_outdoor_rated', true);
            });
        }

        return $query->get();
    }

    public function findRequiredAccessories(
        CctvSystemType $systemType,
        array $selectedProductTypes = []
    ): Collection {
        return CctvProductProfile::with(['product.brand'])
            ->where('is_active', true)
            ->whereIn('product_type', [
                CctvProductType::CONNECTOR->value,
                CctvProductType::JUNCTION_BOX->value,
                CctvProductType::BRACKET->value,
                CctvProductType::POWER_SUPPLY->value,
                CctvProductType::POE_SWITCH->value,
                CctvProductType::BALUN->value,
            ])
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->get();
    }
}
