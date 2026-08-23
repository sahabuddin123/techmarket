<?php

namespace App\DTOs\Cctv;

readonly class StorageCalculationResultDTO
{
    public function __construct(
        public float $bitratePerCameraKbps,
        public float $totalIncomingBandwidthMbps,
        public float $dailyStorageGb,
        public float $netRequiredStorageGb,
        public float $netRequiredStorageTb,
        public float $grossRequiredStorageTbWithOverhead,
        public float $recommendedHddCapacityTb, // Recommended discrete HDD standard (e.g. 1TB, 2TB, 4TB, 6TB, 8TB, etc.)
        public int $recommendedHddBaysRequired, // Number of HDD units required
        public string $recommendedHddModelSuggestion,
        public array $calculationBreakdown = [],
    ) {}

    public function toArray(): array
    {
        return [
            'bitrate_per_camera_kbps' => $this->bitratePerCameraKbps,
            'total_incoming_bandwidth_mbps' => $this->totalIncomingBandwidthMbps,
            'daily_storage_gb' => $this->dailyStorageGb,
            'net_required_storage_gb' => $this->netRequiredStorageGb,
            'net_required_storage_tb' => $this->netRequiredStorageTb,
            'gross_required_storage_tb_with_overhead' => $this->grossRequiredStorageTbWithOverhead,
            'recommended_hdd_capacity_tb' => $this->recommendedHddCapacityTb,
            'recommended_hdd_bays_required' => $this->recommendedHddBaysRequired,
            'recommended_hdd_model_suggestion' => $this->recommendedHddModelSuggestion,
            'calculation_breakdown' => $this->calculationBreakdown,
        ];
    }
}
