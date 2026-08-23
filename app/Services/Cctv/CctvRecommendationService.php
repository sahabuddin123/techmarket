<?php

namespace App\Services\Cctv;

use App\DTOs\Cctv\CableCalculationInputDTO;
use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\RecommendationResultDTO;
use App\DTOs\Cctv\StorageCalculationInputDTO;
use App\Enums\Cctv\CctvProductType;
use App\Enums\Cctv\CctvSystemType;
use App\Models\Product;
use App\Repositories\Contracts\Cctv\CctvProductProfileRepositoryInterface;
use App\Repositories\Contracts\Cctv\CctvRuleRepositoryInterface;
use App\Services\Contracts\Cctv\CctvCableCalculatorInterface;
use App\Services\Contracts\Cctv\CctvRecommendationEngineInterface;
use App\Services\Contracts\Cctv\CctvStorageCalculatorInterface;

class CctvRecommendationService implements CctvRecommendationEngineInterface
{
    public function __construct(
        private readonly CctvProductProfileRepositoryInterface $profileRepo,
        private readonly CctvRuleRepositoryInterface $ruleRepo,
        private readonly CctvStorageCalculatorInterface $storageCalculator,
        private readonly CctvCableCalculatorInterface $cableCalculator,
        private readonly CctvPowerAndPoeCalculator $powerCalculator,
    ) {}

    public function generateSystemRecommendations(CctvRequirementDTO $requirements): RecommendationResultDTO
    {
        $cameraCount = max(1, $requirements->totalCameras);
        $resolutionMp = $requirements->requiredResolutionMp ?? 2.0;

        // 1. Storage Calculation
        $storageInput = new StorageCalculationInputDTO(
            cameraCount: $cameraCount,
            resolutionMp: $resolutionMp,
            fps: 25,
            codec: $requirements->preferredCodec,
            recordingHoursPerDay: $requirements->recordingHoursPerDay,
            retentionDays: $requirements->recordingDays,
            hasAudio: $requirements->requireAudio,
            motionActivityPercentage: $requirements->recordingMode === 'motion_only' ? 30.0 : 100.0
        );
        $storageResult = $this->storageCalculator->calculateStorage($storageInput);

        // 2. Cable Calculation
        $cableInput = new CableCalculationInputDTO(
            cameraCount: $cameraCount,
            systemType: $requirements->systemType,
            averageDistancePerCameraMeters: $requirements->averageCableDistanceMeters,
            floorsCount: $requirements->floorsCount
        );
        $cableResult = $this->cableCalculator->calculateCable($cableInput);

        // 3. Power & PoE Calculation
        $powerMetrics = $this->powerCalculator->calculatePowerRequirements($requirements);

        // 4. Resolve Matching Recording Hub from Catalog
        $channelTier = $this->resolveRequiredChannelTier($cameraCount);
        $compatibleRecorders = $this->profileRepo->findCompatibleRecordingDevices(
            $requirements->systemType,
            $channelTier,
            $resolutionMp
        );
        $recommendedRecorder = $compatibleRecorders->first()?->product;

        // 5. Resolve Matching Surveillance Storage HDD from Catalog
        $compatibleHdds = $this->profileRepo->findCompatibleStorageHdds(
            $storageResult->recommendedHddCapacityTb
        );
        $recommendedHdd = $compatibleHdds->first()?->product;

        // 6. Resolve Transmission Cable Product from Catalog
        $compatibleCables = $this->profileRepo->findCompatibleCables(
            $requirements->systemType,
            $requirements->outdoorCameras > 0
        );
        $recommendedCable = $compatibleCables->first()?->product;

        // 7. Resolve PoE Switch / Central SMPS Power Supply
        $recommendedPoeSwitch = null;
        $recommendedPowerSupply = null;

        if ($requirements->systemType === CctvSystemType::IP) {
            $poeProfiles = $this->profileRepo->getActiveProductsByType(
                CctvProductType::POE_SWITCH,
                $requirements->systemType
            );
            $recommendedPoeSwitch = $poeProfiles->first()?->product;
        } else {
            $powerProfiles = $this->profileRepo->getActiveProductsByType(
                CctvProductType::POWER_SUPPLY,
                $requirements->systemType
            );
            $recommendedPowerSupply = $powerProfiles->first()?->product;
        }

        // 8. Resolve Mandatory Accessories (Connectors, Junction Boxes, Brackets)
        $accessories = [];

        // Junction boxes (1 per camera)
        $junctionBoxProfiles = $this->profileRepo->getActiveProductsByType(CctvProductType::JUNCTION_BOX);
        if ($jBox = $junctionBoxProfiles->first()?->product) {
            $accessories[] = [
                'product_id' => $jBox->id,
                'name' => $jBox->title,
                'sku' => $jBox->sku,
                'quantity' => $cameraCount,
                'unit' => 'piece',
                'price' => (float) $jBox->price,
                'reason' => "1x Waterproof Junction Box per camera position to protect cable terminations",
                'is_mandatory' => true,
                'item_type' => 'required_accessory',
            ];
        }

        // Connectors (RJ45 or BNC/DC)
        $connectorProfiles = $this->profileRepo->getActiveProductsByType(CctvProductType::CONNECTOR);
        if ($connector = $connectorProfiles->first()?->product) {
            $connectorQty = $requirements->systemType === CctvSystemType::IP
                ? $cameraCount * 2 // 2x RJ45 per IP camera run
                : $cameraCount * 3; // 2x BNC + 1x DC per analog run

            $accessories[] = [
                'product_id' => $connector->id,
                'name' => $connector->title,
                'sku' => $connector->sku,
                'quantity' => $connectorQty,
                'unit' => 'piece',
                'price' => (float) $connector->price,
                'reason' => "Essential connector terminals for {$cameraCount} camera transmission lines",
                'is_mandatory' => true,
                'item_type' => 'required_accessory',
            ];
        }

        // 9. Installation Service
        $recommendedInstallationService = null;
        if ($requirements->requireInstallation) {
            $serviceProfiles = $this->profileRepo->getActiveProductsByType(CctvProductType::SERVICE);
            $recommendedInstallationService = $serviceProfiles->first()?->product;
        }

        $notes = [
            "Storage Engine: Calculated ~{$storageResult->grossRequiredStorageTbWithOverhead} TB gross storage for {$requirements->recordingDays} days retention ({$requirements->preferredCodec} @ 25fps).",
            "Cabling Engine: Calculated ~{$cableResult->grossTotalCableMeters}m gross transmission cabling ({$cableResult->recommendedRollsCount} rolls).",
            "Power Engine: Estimated total load of ~{$powerMetrics['total_power_watts']}W. Recommended backup: {$powerMetrics['recommended_ups_capacity']}.",
        ];

        return new RecommendationResultDTO(
            recommendedRecordingDevice: $recommendedRecorder,
            recommendedChannelCount: $channelTier,
            recommendedStorageHdd: $recommendedHdd,
            recommendedStorageTb: $storageResult->recommendedHddCapacityTb,
            recommendedPoeSwitch: $recommendedPoeSwitch,
            recommendedPoePortCount: $powerMetrics['recommended_poe_switch_ports'],
            recommendedPowerSupply: $recommendedPowerSupply,
            recommendedCable: $recommendedCable,
            recommendedCableRolls: $cableResult->recommendedRollsCount,
            recommendedAccessories: $accessories,
            recommendedInstallationService: $recommendedInstallationService,
            systemNotes: $notes
        );
    }

    public function generatePresets(CctvRequirementDTO $requirements): array
    {
        $baseArray = $requirements->toArray();

        // 1. Budget Preset (Tier 1: 1080P/2MP, cost-optimized, essential components)
        $budgetReq = CctvRequirementDTO::fromArray(array_merge($baseArray, [
            'required_resolution_mp' => 2.0,
            'preferred_codec' => 'H.265',
        ]));
        $budgetRec = $this->generateSystemRecommendations($budgetReq);

        // 2. Balanced Preset (Tier 2: 2K/4MP, ColorVu / Night Vision, optimal HDD)
        $balancedReq = CctvRequirementDTO::fromArray(array_merge($baseArray, [
            'required_resolution_mp' => max(4.0, (float) ($baseArray['required_resolution_mp'] ?? 4.0)),
            'preferred_codec' => 'H.265+',
        ]));
        $balancedRec = $this->generateSystemRecommendations($balancedReq);

        // 3. Premium Preset (Tier 3: 4K/8MP, Smart AI analytics, extended retention, multi-bay headroom)
        $premiumReq = CctvRequirementDTO::fromArray(array_merge($baseArray, [
            'required_resolution_mp' => max(8.0, (float) ($baseArray['required_resolution_mp'] ?? 8.0)),
            'preferred_codec' => 'H.265+',
            'require_ai_detection' => true,
        ]));
        $premiumRec = $this->generateSystemRecommendations($premiumReq);

        return [
            'budget' => [
                'name' => 'Essential Value Setup',
                'badge' => 'Budget Friendly',
                'description' => 'Reliable 1080P Full HD surveillance focused on core monitoring and minimal cost.',
                'resolution' => '2.0 MP (1080P Full HD)',
                'recommendation' => $budgetRec->toArray(),
            ],
            'balanced' => [
                'name' => 'Smart Ultra 2K Setup',
                'badge' => 'Most Popular',
                'description' => 'Optimal balance of 2K resolution, color night vision, H.265+ compression, and future expansion headroom.',
                'resolution' => '4.0 MP (2K Quad HD)',
                'recommendation' => $balancedRec->toArray(),
            ],
            'premium' => [
                'name' => 'Enterprise 4K AI Guard',
                'badge' => 'Maximum Security',
                'description' => '4K Ultra HD clarity, AI human & vehicle classification, extended retention, and high PoE budget.',
                'resolution' => '8.0 MP (4K Ultra HD)',
                'recommendation' => $premiumRec->toArray(),
            ],
        ];
    }

    private function resolveRequiredChannelTier(int $cameraCount): int
    {
        if ($cameraCount <= 4) return 4;
        if ($cameraCount <= 8) return 8;
        if ($cameraCount <= 16) return 16;
        if ($cameraCount <= 32) return 32;
        if ($cameraCount <= 64) return 64;
        return 128;
    }
}
