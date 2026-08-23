<?php

namespace App\DTOs\Cctv;

readonly class StorageCalculationInputDTO
{
    public function __construct(
        public int $cameraCount,
        public float $resolutionMp, // e.g. 2.0, 4.0, 8.0
        public int $fps = 25,
        public string $codec = 'H.265+', // H.265+, H.265, H.264
        public int $recordingHoursPerDay = 24,
        public int $retentionDays = 15,
        public bool $hasAudio = false,
        public float $motionActivityPercentage = 100.0, // 100% for continuous, 30% for motion detection
        public float $storageOverheadPercentage = 10.0, // filesystem formatting overhead
        public ?int $customBitrateKbps = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            cameraCount: (int) ($data['camera_count'] ?? 1),
            resolutionMp: (float) ($data['resolution_mp'] ?? 2.0),
            fps: (int) ($data['fps'] ?? 25),
            codec: $data['codec'] ?? 'H.265+',
            recordingHoursPerDay: (int) ($data['recording_hours_per_day'] ?? 24),
            retentionDays: (int) ($data['retention_days'] ?? 15),
            hasAudio: (bool) ($data['has_audio'] ?? false),
            motionActivityPercentage: (float) ($data['motion_activity_percentage'] ?? 100.0),
            storageOverheadPercentage: (float) ($data['storage_overhead_percentage'] ?? 10.0),
            customBitrateKbps: isset($data['custom_bitrate_kbps']) ? (int) $data['custom_bitrate_kbps'] : null,
        );
    }
}
