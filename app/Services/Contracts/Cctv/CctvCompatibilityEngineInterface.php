<?php

namespace App\Services\Contracts\Cctv;

use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\CompatibilityCheckResultDTO;
use App\DTOs\Cctv\EstimateBOMItemDTO;

interface CctvCompatibilityEngineInterface
{
    /**
     * @param EstimateBOMItemDTO[] $items
     */
    public function validateSystemCompatibility(
        CctvRequirementDTO $requirements,
        array $items
    ): CompatibilityCheckResultDTO;
}
