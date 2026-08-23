<?php

namespace App\Repositories\Contracts\Cctv;

use App\Models\Cctv\CctvEstimate;
use App\Enums\Cctv\CctvEstimateStatus;
use Illuminate\Database\Eloquent\Collection;

interface CctvEstimateRepositoryInterface
{
    public function findById(int $id): ?CctvEstimate;

    public function findByEstimateNumber(string $estimateNumber): ?CctvEstimate;

    public function getUserEstimates(int $userId): Collection;

    public function getGuestEstimates(string $guestSessionId): Collection;

    public function createEstimate(array $attributes): CctvEstimate;

    public function updateEstimate(CctvEstimate $estimate, array $attributes): CctvEstimate;

    public function syncEstimateItems(CctvEstimate $estimate, array $items): void;

    public function updateStatus(CctvEstimate $estimate, CctvEstimateStatus $status): bool;
}
