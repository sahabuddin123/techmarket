<?php

namespace App\Services\Contracts\Cctv;

use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\RecommendationResultDTO;

interface CctvRecommendationEngineInterface
{
    public function generateSystemRecommendations(CctvRequirementDTO $requirements): RecommendationResultDTO;

    public function generatePresets(CctvRequirementDTO $requirements): array;
}
