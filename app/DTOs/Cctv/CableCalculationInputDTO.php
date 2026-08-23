<?php

namespace App\DTOs\Cctv;

use App\Enums\Cctv\CctvCableType;
use App\Enums\Cctv\CctvSystemType;

readonly class CableCalculationInputDTO
{
    public function __construct(
        public int $cameraCount,
        public CctvSystemType $systemType,
        public float $averageDistancePerCameraMeters = 30.0,
        public float $wasteAndSagPercentage = 15.0, // 15% standard installation bend/slack/waste allowance
        public float $safetyMarginMeters = 20.0,
        public ?CctvCableType $preferredCableType = null,
        public int $floorsCount = 1,
        public float $interFloorRiserMeters = 15.0,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            cameraCount: (int) ($data['camera_count'] ?? 1),
            systemType: isset($data['system_type']) ? CctvSystemType::tryFrom($data['system_type']) ?? CctvSystemType::IP : CctvSystemType::IP,
            averageDistancePerCameraMeters: (float) ($data['average_distance_per_camera_meters'] ?? 30.0),
            wasteAndSagPercentage: (float) ($data['waste_and_sag_percentage'] ?? 15.0),
            safetyMarginMeters: (float) ($data['safety_margin_meters'] ?? 20.0),
            preferredCableType: isset($data['preferred_cable_type']) ? CctvCableType::tryFrom($data['preferred_cable_type']) : null,
            floorsCount: (int) ($data['floors_count'] ?? 1),
            interFloorRiserMeters: (float) ($data['inter_floor_riser_meters'] ?? 15.0),
        );
    }
}
