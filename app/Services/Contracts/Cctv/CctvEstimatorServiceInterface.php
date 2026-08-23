<?php

namespace App\Services\Contracts\Cctv;

use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\EstimateSummaryDTO;
use App\Models\Cctv\CctvEstimate;

interface CctvEstimatorServiceInterface
{
    /**
     * Calculate and generate a live project estimate with full BOM, storage, and validation.
     */
    public function calculateEstimate(CctvRequirementDTO $requirements, array $selectedItems = []): EstimateSummaryDTO;

    /**
     * Persist or update a customer estimate with frozen price snapshot.
     */
    public function saveEstimate(
        CctvRequirementDTO $requirements,
        array $selectedItems = [],
        ?int $userId = null,
        ?string $guestSessionId = null,
        ?int $existingEstimateId = null
    ): CctvEstimate;

    /**
     * Retrieve full details of a saved estimate.
     */
    public function getEstimateDetails(string $estimateNumber): ?EstimateSummaryDTO;
}
