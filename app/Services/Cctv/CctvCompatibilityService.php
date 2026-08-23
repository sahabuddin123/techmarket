<?php

namespace App\Services\Cctv;

use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\CompatibilityCheckResultDTO;
use App\DTOs\Cctv\EstimateBOMItemDTO;
use App\Enums\Cctv\CctvProductType;
use App\Enums\Cctv\CctvSystemType;
use App\Repositories\Contracts\Cctv\CctvProductProfileRepositoryInterface;
use App\Repositories\Contracts\Cctv\CctvRuleRepositoryInterface;
use App\Services\Contracts\Cctv\CctvCompatibilityEngineInterface;

class CctvCompatibilityService implements CctvCompatibilityEngineInterface
{
    public function __construct(
        private readonly CctvProductProfileRepositoryInterface $profileRepo,
        private readonly CctvRuleRepositoryInterface $ruleRepo,
    ) {}

    public function validateSystemCompatibility(
        CctvRequirementDTO $requirements,
        array $items
    ): CompatibilityCheckResultDTO {
        $errors = [];
        $warnings = [];
        $recommendations = [];
        $validatedPairs = [];

        // Aggregate items by product type
        $cameras = [];
        $recorders = [];
        $hdds = [];
        $cables = [];
        $poeSwitches = [];
        $powerSupplies = [];

        foreach ($items as $item) {
            $type = $item instanceof EstimateBOMItemDTO ? $item->productType : ($item['product_type'] ?? 'camera');
            match ($type) {
                'camera' => $cameras[] = $item,
                'dvr', 'nvr', 'xvr' => $recorders[] = $item,
                'storage' => $hdds[] = $item,
                'cable' => $cables[] = $item,
                'poe_switch' => $poeSwitches[] = $item,
                'power_supply' => $powerSupplies[] = $item,
                default => null,
            };
        }

        $totalCameraCount = 0;
        $maxCameraResolutionMp = 0.0;

        foreach ($cameras as $cam) {
            $qty = $cam instanceof EstimateBOMItemDTO ? $cam->quantity : (float) ($cam['quantity'] ?? 1);
            $totalCameraCount += $qty;

            $meta = $cam instanceof EstimateBOMItemDTO ? $cam->metadata : ($cam['metadata'] ?? []);
            $res = (float) ($meta['resolution_mp'] ?? 2.0);
            if ($res > $maxCameraResolutionMp) {
                $maxCameraResolutionMp = $res;
            }
        }

        // 1. Channel Capacity Check
        if (!empty($recorders)) {
            $primaryRecorder = $recorders[0];
            $recorderMeta = $primaryRecorder instanceof EstimateBOMItemDTO ? $primaryRecorder->metadata : ($primaryRecorder['metadata'] ?? []);
            $channelCount = (int) ($recorderMeta['channel_count'] ?? 4);
            $maxRecorderResMp = (float) ($recorderMeta['max_camera_resolution_mp'] ?? 8.0);
            $deviceType = $primaryRecorder instanceof EstimateBOMItemDTO ? $primaryRecorder->productType : ($primaryRecorder['product_type'] ?? 'nvr');

            $validatedPairs[] = [
                'type' => 'Recorder ↔ Camera Capacity',
                'camera_count' => $totalCameraCount,
                'recorder_channels' => $channelCount,
            ];

            if ($totalCameraCount > $channelCount) {
                $errors[] = "Channel Capacity Exceeded: You have {$totalCameraCount} cameras configured, but the selected {$deviceType} supports a maximum of {$channelCount} channels.";
            } elseif ($totalCameraCount === $channelCount) {
                $recommendations[] = "Expansion Note: All {$channelCount} channels on your {$deviceType} are occupied. Consider a higher channel device if you plan to add cameras in the future.";
            }

            // 2. Resolution Ceiling Check
            if ($maxCameraResolutionMp > $maxRecorderResMp) {
                $errors[] = "Resolution Mismatch: Your camera resolution ({$maxCameraResolutionMp} MP) exceeds the maximum decoding capability ({$maxRecorderResMp} MP) of the selected {$deviceType}.";
            }

            // 3. System Type Match Check
            if ($requirements->systemType === CctvSystemType::IP && $deviceType === 'dvr') {
                $errors[] = "System Type Conflict: An Analog DVR cannot directly manage standard IP Network cameras without an XVR or Hybrid system.";
            } elseif ($requirements->systemType === CctvSystemType::ANALOG && $deviceType === 'nvr') {
                $errors[] = "System Type Conflict: An IP NVR cannot connect to standard Analog BNC cameras directly.";
            }
        }

        // 4. Outdoor Weatherproofing Check
        if ($requirements->outdoorCameras > 0) {
            foreach ($cameras as $cam) {
                $meta = $cam instanceof EstimateBOMItemDTO ? $cam->metadata : ($cam['metadata'] ?? []);
                $env = $meta['environment'] ?? 'both';
                if ($env === 'indoor') {
                    $name = $cam instanceof EstimateBOMItemDTO ? $cam->productNameSnapshot : ($cam['product_name_snapshot'] ?? 'Camera');
                    $warnings[] = "Weather Resistance Warning: '{$name}' is rated for indoor use only, but {$requirements->outdoorCameras} outdoor camera positions were specified.";
                    break;
                }
            }
        }

        // 5. Smart AI Analytics Requirement Check
        if ($requirements->requireAiDetection) {
            $hasAiCam = false;
            foreach ($cameras as $cam) {
                $meta = $cam instanceof EstimateBOMItemDTO ? $cam->metadata : ($cam['metadata'] ?? []);
                if (!empty($meta['ai_features'])) {
                    $hasAiCam = true;
                    break;
                }
            }
            if (!$hasAiCam) {
                $warnings[] = "AI Detection Notice: Smart human and vehicle detection was requested, but selected cameras do not have onboard AI analytics profiles.";
            }
        }

        // 6. PoE Switch Port Sufficiency Check
        if ($requirements->systemType === CctvSystemType::IP && !empty($poeSwitches)) {
            $primarySwitch = $poeSwitches[0];
            $switchMeta = $primarySwitch instanceof EstimateBOMItemDTO ? $primarySwitch->metadata : ($primarySwitch['metadata'] ?? []);
            $poePorts = (int) ($switchMeta['poe_port_count'] ?? 8);

            if ($totalCameraCount > $poePorts) {
                $errors[] = "PoE Switch Insufficiency: You have {$totalCameraCount} PoE cameras, but the selected switch only provides {$poePorts} PoE ports.";
            }
        }

        $isCompatible = empty($errors);

        return new CompatibilityCheckResultDTO(
            isCompatible: $isCompatible,
            errors: $errors,
            warnings: $warnings,
            recommendations: $recommendations,
            validatedPairs: $validatedPairs
        );
    }
}
