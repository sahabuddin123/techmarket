<?php

namespace App\DTOs\Cctv;

readonly class CableCalculationResultDTO
{
    public function __construct(
        public float $netCameraDistanceMeters,
        public float $interFloorRiserMeters,
        public float $wasteAndSlackMeters,
        public float $grossTotalCableMeters,
        public int $recommendedRollsCount,
        public float $metersPerRoll, // e.g. 305m for Cat6, 100m for Coaxial
        public string $recommendedCablePackageType, // "305m Full Box", "100m Coil", "Per Meter"
        public string $recommendedCableDescription,
        public array $breakdown = [],
    ) {}

    public function toArray(): array
    {
        return [
            'net_camera_distance_meters' => $this->netCameraDistanceMeters,
            'inter_floor_riser_meters' => $this->interFloorRiserMeters,
            'waste_and_slack_meters' => $this->wasteAndSlackMeters,
            'gross_total_cable_meters' => $this->grossTotalCableMeters,
            'recommended_rolls_count' => $this->recommendedRollsCount,
            'meters_per_roll' => $this->metersPerRoll,
            'recommended_cable_package_type' => $this->recommendedCablePackageType,
            'recommended_cable_description' => $this->recommendedCableDescription,
            'breakdown' => $this->breakdown,
        ];
    }
}
