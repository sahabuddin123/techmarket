<?php

namespace App\DTOs\Cctv;

use App\Enums\Cctv\CctvProjectType;
use App\Enums\Cctv\CctvSystemType;

readonly class CctvRequirementDTO
{
    public function __construct(
        public string $projectName,
        public CctvProjectType $projectType,
        public CctvSystemType $systemType,
        public int $totalCameras,
        public int $indoorCameras = 0,
        public int $outdoorCameras = 0,
        public int $ptzCameras = 0,
        public ?float $requiredResolutionMp = null, // e.g. 2.0, 4.0, 8.0
        public int $recordingDays = 15,
        public int $recordingHoursPerDay = 24,
        public string $recordingMode = 'continuous', // continuous, motion_only, scheduled
        public string $preferredCodec = 'H.265+', // H.265+, H.265, H.264
        public bool $requireAudio = false,
        public bool $requireAiDetection = false, // Human & Vehicle detection
        public bool $requireColorNightVision = false,
        public bool $requireRemoteViewing = true,
        public bool $requireInstallation = true,
        public float $averageCableDistanceMeters = 30.0,
        public int $floorsCount = 1,
        public int $areasCount = 1,
        public ?string $locationDistrict = null,
        public ?string $locationAddress = null,
        public ?string $notes = null,
        public array $customParameters = [],
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            projectName: $data['project_name'] ?? 'My CCTV Surveillance System',
            projectType: isset($data['project_type']) ? CctvProjectType::tryFrom($data['project_type']) ?? CctvProjectType::COMMERCIAL_OFFICE : CctvProjectType::COMMERCIAL_OFFICE,
            systemType: isset($data['system_type']) ? CctvSystemType::tryFrom($data['system_type']) ?? CctvSystemType::IP : CctvSystemType::IP,
            totalCameras: (int) ($data['total_cameras'] ?? max(1, ($data['indoor_cameras'] ?? 0) + ($data['outdoor_cameras'] ?? 0))),
            indoorCameras: (int) ($data['indoor_cameras'] ?? 0),
            outdoorCameras: (int) ($data['outdoor_cameras'] ?? 0),
            ptzCameras: (int) ($data['ptz_cameras'] ?? 0),
            requiredResolutionMp: isset($data['required_resolution_mp']) ? (float) $data['required_resolution_mp'] : null,
            recordingDays: (int) ($data['recording_days'] ?? 15),
            recordingHoursPerDay: (int) ($data['recording_hours_per_day'] ?? 24),
            recordingMode: $data['recording_mode'] ?? 'continuous',
            preferredCodec: $data['preferred_codec'] ?? 'H.265+',
            requireAudio: (bool) ($data['require_audio'] ?? false),
            requireAiDetection: (bool) ($data['require_ai_detection'] ?? false),
            requireColorNightVision: (bool) ($data['require_color_night_vision'] ?? false),
            requireRemoteViewing: (bool) ($data['require_remote_viewing'] ?? true),
            requireInstallation: (bool) ($data['require_installation'] ?? true),
            averageCableDistanceMeters: (float) ($data['average_cable_distance_meters'] ?? 30.0),
            floorsCount: (int) ($data['floors_count'] ?? 1),
            areasCount: (int) ($data['areas_count'] ?? 1),
            locationDistrict: $data['location_district'] ?? null,
            locationAddress: $data['location_address'] ?? null,
            notes: $data['notes'] ?? null,
            customParameters: $data['custom_parameters'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'project_name' => $this->projectName,
            'project_type' => $this->projectType->value,
            'system_type' => $this->systemType->value,
            'total_cameras' => $this->totalCameras,
            'indoor_cameras' => $this->indoorCameras,
            'outdoor_cameras' => $this->outdoorCameras,
            'ptz_cameras' => $this->ptzCameras,
            'required_resolution_mp' => $this->requiredResolutionMp,
            'recording_days' => $this->recordingDays,
            'recording_hours_per_day' => $this->recordingHoursPerDay,
            'recording_mode' => $this->recordingMode,
            'preferred_codec' => $this->preferredCodec,
            'require_audio' => $this->requireAudio,
            'require_ai_detection' => $this->requireAiDetection,
            'require_color_night_vision' => $this->requireColorNightVision,
            'require_remote_viewing' => $this->requireRemoteViewing,
            'require_installation' => $this->requireInstallation,
            'average_cable_distance_meters' => $this->averageCableDistanceMeters,
            'floors_count' => $this->floorsCount,
            'areas_count' => $this->areasCount,
            'location_district' => $this->locationDistrict,
            'location_address' => $this->locationAddress,
            'notes' => $this->notes,
            'custom_parameters' => $this->customParameters,
        ];
    }
}
