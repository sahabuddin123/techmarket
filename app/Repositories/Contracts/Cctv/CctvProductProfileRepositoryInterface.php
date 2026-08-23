<?php

namespace App\Repositories\Contracts\Cctv;

use App\Models\Cctv\CctvProductProfile;
use App\Enums\Cctv\CctvProductType;
use App\Enums\Cctv\CctvSystemType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CctvProductProfileRepositoryInterface
{
    public function findByProductId(int $productId): ?CctvProductProfile;

    public function getActiveProductsByType(
        CctvProductType $productType,
        ?CctvSystemType $systemType = null,
        array $filters = []
    ): Collection;

    public function paginateActiveProducts(
        array $filters = [],
        int $perPage = 20
    ): LengthAwarePaginator;

    public function findCompatibleRecordingDevices(
        CctvSystemType $systemType,
        int $minChannels = 4,
        float $minResolutionMp = 2.0
    ): Collection;

    public function findCompatibleStorageHdds(
        float $minCapacityTb = 1.0,
        int $limit = 10
    ): Collection;

    public function findCompatibleCables(
        CctvSystemType $systemType,
        bool $isOutdoor = false
    ): Collection;

    public function findRequiredAccessories(
        CctvSystemType $systemType,
        array $selectedProductTypes = []
    ): Collection;
}
