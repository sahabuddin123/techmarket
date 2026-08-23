<?php

namespace App\Services\Cctv;

use App\DTOs\Cctv\StorageCalculationInputDTO;
use App\DTOs\Cctv\StorageCalculationResultDTO;
use App\Models\Setting;
use App\Services\Contracts\Cctv\CctvStorageCalculatorInterface;

class CctvStorageCalculator implements CctvStorageCalculatorInterface
{
    /**
     * Standard commercial HDD capacities (in TB).
     */
    private const STANDARD_HDD_TIERS = [1.0, 2.0, 3.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0];

    public function calculateStorage(StorageCalculationInputDTO $input): StorageCalculationResultDTO
    {
        // 1. Bitrate determination (Kbps)
        $bitratePerCameraKbps = $input->customBitrateKbps !== null && $input->customBitrateKbps > 0
            ? (float) $input->customBitrateKbps
            : $this->getEstimatedBitrateKbps($input->resolutionMp, $input->codec, $input->fps);

        if ($input->hasAudio) {
            $bitratePerCameraKbps += 64.0; // Audio stream overhead
        }

        // Total system incoming network bandwidth (Mbps)
        $totalIncomingBandwidthMbps = ($bitratePerCameraKbps * $input->cameraCount) / 1000.0;

        // 2. Daily storage per camera (GB)
        // Formula: (Bitrate Kbps * 3600 sec * hours) / (8 bits * 1024 * 1024) * (Motion % / 100)
        $secondsPerDay = min(24, max(1, $input->recordingHoursPerDay)) * 3600;
        $motionFactor = min(100.0, max(5.0, $input->motionActivityPercentage)) / 100.0;
        
        $dailyStoragePerCameraGb = (($bitratePerCameraKbps * $secondsPerDay) / (8.0 * 1024.0 * 1024.0)) * $motionFactor;
        $totalDailyStorageGb = $dailyStoragePerCameraGb * $input->cameraCount;

        // 3. Net storage for total retention days (GB and TB)
        $retentionDays = max(1, $input->retentionDays);
        $netRequiredStorageGb = $totalDailyStorageGb * $retentionDays;
        $netRequiredStorageTb = $netRequiredStorageGb / 1024.0;

        // 4. Gross storage with formatting / filesystem overhead
        $overheadPercentage = $input->storageOverheadPercentage;
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $overheadPercentage = max(0.0, (float) Setting::get('cctv_storage_overhead_percent', $input->storageOverheadPercentage));
            }
        } catch (\Throwable $e) {}
        $grossRequiredStorageTb = $netRequiredStorageTb * (1.0 + ($overheadPercentage / 100.0));

        // 5. Recommended Discrete HDD Sizing
        $recommendedHddCapacityTb = $this->resolveRecommendedHddCapacity($grossRequiredStorageTb);
        $recommendedHddBaysRequired = (int) ceil($grossRequiredStorageTb / 10.0); // 10TB standard single bay ceiling
        $recommendedHddBaysRequired = max(1, $recommendedHddBaysRequired);

        $suggestion = "Requires ~{$recommendedHddCapacityTb} TB Surveillance Grade Storage ({$retentionDays} Days at {$input->recordingHoursPerDay} hrs/day)";

        return new StorageCalculationResultDTO(
            bitratePerCameraKbps: round($bitratePerCameraKbps, 2),
            totalIncomingBandwidthMbps: round($totalIncomingBandwidthMbps, 2),
            dailyStorageGb: round($totalDailyStorageGb, 2),
            netRequiredStorageGb: round($netRequiredStorageGb, 2),
            netRequiredStorageTb: round($netRequiredStorageTb, 3),
            grossRequiredStorageTbWithOverhead: round($grossRequiredStorageTb, 3),
            recommendedHddCapacityTb: $recommendedHddCapacityTb,
            recommendedHddBaysRequired: $recommendedHddBaysRequired,
            recommendedHddModelSuggestion: $suggestion,
            calculationBreakdown: [
                'camera_count' => $input->cameraCount,
                'resolution_mp' => $input->resolutionMp,
                'codec' => $input->codec,
                'fps' => $input->fps,
                'motion_percentage' => $input->motionActivityPercentage,
                'overhead_percentage' => $overheadPercentage,
                'hours_per_day' => $input->recordingHoursPerDay,
                'retention_days' => $retentionDays,
            ]
        );
    }

    public function getEstimatedBitrateKbps(float $resolutionMp, string $codec, int $fps = 25): float
    {
        // Base bitrate for H.264 at 25fps (Kbps)
        $baseBitrate = match (true) {
            $resolutionMp <= 2.0 => 2048.0, // 1080P Full HD
            $resolutionMp <= 3.0 => 3072.0,
            $resolutionMp <= 4.0 => 4096.0, // 2K Quad HD
            $resolutionMp <= 5.0 => 5120.0,
            $resolutionMp <= 8.0 => 8192.0, // 4K Ultra HD
            default => 12288.0, // 12MP+
        };

        // Frame rate adjustment factor (normalized to 25fps)
        $fpsFactor = max(10, min(30, $fps)) / 25.0;

        // Codec compression efficiency multiplier
        $codecFactor = match (strtoupper(trim($codec))) {
            'H.265+', 'H265+' => 0.30, // 70% reduction
            'H.265', 'H265' => 0.50,   // 50% reduction
            'H.264+', 'H264+' => 0.65, // 35% reduction
            default => 1.00,           // Standard H.264 baseline
        };

        return max(256.0, $baseBitrate * $fpsFactor * $codecFactor);
    }

    private function resolveRecommendedHddCapacity(float $requiredTb): float
    {
        if ($requiredTb <= 0.0) {
            return 1.0;
        }

        foreach (self::STANDARD_HDD_TIERS as $tier) {
            if ($tier >= $requiredTb) {
                return $tier;
            }
        }

        // For massive installations exceeding 20TB, round to nearest 2TB multiple
        return ceil($requiredTb / 2.0) * 2.0;
    }
}
