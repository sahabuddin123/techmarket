<?php

namespace App\DTOs\Cctv;

use App\Enums\Cctv\CctvEstimateStatus;
use App\Enums\Cctv\CctvProjectType;
use App\Enums\Cctv\CctvSystemType;

readonly class EstimateSummaryDTO
{
    /**
     * @param EstimateBOMItemDTO[] $items
     */
    public function __construct(
        public ?int $estimateId,
        public string $estimateNumber,
        public string $projectName,
        public CctvProjectType $projectType,
        public CctvSystemType $systemType,
        public CctvEstimateStatus $status,
        public array $items,
        public float $subtotalAmount,
        public float $accessoryAmount,
        public float $installationAmount,
        public float $discountAmount,
        public float $grandTotal,
        public string $currency = 'BDT',
        public ?StorageCalculationResultDTO $storageMetrics = null,
        public ?CableCalculationResultDTO $cableMetrics = null,
        public ?CompatibilityCheckResultDTO $validation = null,
        public array $requirementsSnapshot = [],
        public ?string $notes = null,
    ) {}

    public function toArray(): array
    {
        return [
            'estimate_id' => $this->estimateId,
            'estimate_number' => $this->estimateNumber,
            'project_name' => $this->projectName,
            'project_type' => $this->projectType->value,
            'system_type' => $this->systemType->value,
            'status' => $this->status->value,
            'items' => array_map(fn(EstimateBOMItemDTO $item) => $item->toArray(), $this->items),
            'subtotal_amount' => $this->subtotalAmount,
            'accessory_amount' => $this->accessoryAmount,
            'installation_amount' => $this->installationAmount,
            'discount_amount' => $this->discountAmount,
            'grand_total' => $this->grandTotal,
            'currency' => $this->currency,
            'storage_metrics' => $this->storageMetrics?->toArray(),
            'cable_metrics' => $this->cableMetrics?->toArray(),
            'validation' => $this->validation?->toArray(),
            'requirements_snapshot' => $this->requirementsSnapshot,
            'notes' => $this->notes,
        ];
    }
}
