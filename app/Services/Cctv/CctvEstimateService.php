<?php

namespace App\Services\Cctv;

use App\DTOs\Cctv\CableCalculationInputDTO;
use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\EstimateBOMItemDTO;
use App\DTOs\Cctv\EstimateSummaryDTO;
use App\DTOs\Cctv\StorageCalculationInputDTO;
use App\Enums\Cctv\CctvEstimateItemType;
use App\Enums\Cctv\CctvEstimateStatus;
use App\Models\Cctv\CctvEstimate;
use App\Models\Product;
use App\Repositories\Contracts\Cctv\CctvEstimateRepositoryInterface;
use App\Repositories\Contracts\Cctv\CctvProductProfileRepositoryInterface;
use App\Services\Contracts\Cctv\CctvCableCalculatorInterface;
use App\Services\Contracts\Cctv\CctvCompatibilityEngineInterface;
use App\Services\Contracts\Cctv\CctvEstimatorServiceInterface;
use App\Services\Contracts\Cctv\CctvRecommendationEngineInterface;
use App\Services\Contracts\Cctv\CctvStorageCalculatorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CctvEstimateService implements CctvEstimatorServiceInterface
{
    public function __construct(
        private readonly CctvEstimateRepositoryInterface $estimateRepo,
        private readonly CctvProductProfileRepositoryInterface $profileRepo,
        private readonly CctvStorageCalculatorInterface $storageCalculator,
        private readonly CctvCableCalculatorInterface $cableCalculator,
        private readonly CctvCompatibilityEngineInterface $compatibilityService,
        private readonly CctvRecommendationEngineInterface $recommendationService,
    ) {}

    public function calculateEstimate(CctvRequirementDTO $requirements, array $selectedItems = []): EstimateSummaryDTO
    {
        // 1. Authoritative Calculations
        $storageInput = new StorageCalculationInputDTO(
            cameraCount: max(1, $requirements->totalCameras),
            resolutionMp: $requirements->requiredResolutionMp ?? 2.0,
            fps: 25,
            codec: $requirements->preferredCodec,
            recordingHoursPerDay: $requirements->recordingHoursPerDay,
            retentionDays: $requirements->recordingDays,
            hasAudio: $requirements->requireAudio,
            motionActivityPercentage: $requirements->recordingMode === 'motion_only' ? 30.0 : 100.0
        );
        $storageMetrics = $this->storageCalculator->calculateStorage($storageInput);

        $cableInput = new CableCalculationInputDTO(
            cameraCount: max(1, $requirements->totalCameras),
            systemType: $requirements->systemType,
            averageDistancePerCameraMeters: $requirements->averageCableDistanceMeters,
            floorsCount: $requirements->floorsCount
        );
        $cableMetrics = $this->cableCalculator->calculateCable($cableInput);

        // 2. Resolve System Recommendations
        $recommendations = $this->recommendationService->generateSystemRecommendations($requirements);

        // 3. Construct Normalized BOM Items
        $bomItems = [];
        $subtotal = 0.0;
        $accessoryTotal = 0.0;
        $installationTotal = 0.0;

        foreach ($selectedItems as $rawItem) {
            $productId = $rawItem['product_id'] ?? null;
            $product = $productId ? Product::with('brand')->find($productId) : null;
            $profile = $productId ? $this->profileRepo->findByProductId($productId) : null;

            $qty = max(1.0, (float) ($rawItem['quantity'] ?? 1.0));
            $unitPrice = $product ? (float) $product->price : (float) ($rawItem['unit_price'] ?? 0.0);
            $itemSubtotal = $unitPrice * $qty;

            $itemTypeStr = $rawItem['item_type'] ?? ($profile ? $profile->product_type->value : 'selected_camera');
            $itemType = CctvEstimateItemType::tryFrom($itemTypeStr) ?? CctvEstimateItemType::SELECTED_CAMERA;

            $bomItem = new EstimateBOMItemDTO(
                productId: $productId,
                itemType: $itemType,
                productSkuSnapshot: $product ? $product->sku : ($rawItem['sku'] ?? 'CCTV-ITEM'),
                productNameSnapshot: $product ? $product->title : ($rawItem['name'] ?? 'CCTV Hardware'),
                productType: $profile ? $profile->product_type->value : 'camera',
                systemType: $profile ? $profile->system_type->value : $requirements->systemType->value,
                unitPriceSnapshot: $unitPrice,
                quantity: $qty,
                unit: $rawItem['unit'] ?? 'piece',
                subtotalPrice: $itemSubtotal,
                isRequired: (bool) ($rawItem['is_required'] ?? true),
                isRecommended: (bool) ($rawItem['is_recommended'] ?? false),
                recommendationReason: $rawItem['recommendation_reason'] ?? null,
                compatibilityStatus: 'compatible',
                imageUrl: $product?->image,
                metadata: [
                    'resolution_mp' => $profile?->resolution_mp,
                    'camera_form_factor' => $profile?->camera_form_factor,
                    'environment' => $profile?->environment,
                    'channel_count' => $profile?->deviceProfile?->channel_count,
                    'max_camera_resolution_mp' => $profile?->deviceProfile?->max_camera_resolution_mp,
                    'capacity_tb' => $profile?->storageProfile?->capacity_tb,
                ]
            );

            $bomItems[] = $bomItem;

            if ($itemType === CctvEstimateItemType::REQUIRED_ACCESSORY || $itemType === CctvEstimateItemType::OPTIONAL_ACCESSORY) {
                $accessoryTotal += $itemSubtotal;
            } elseif ($itemType === CctvEstimateItemType::INSTALLATION_SERVICE) {
                $installationTotal += $itemSubtotal;
            } else {
                $subtotal += $itemSubtotal;
            }
        }

        // 4. Validate Compatibility
        $validation = $this->compatibilityService->validateSystemCompatibility($requirements, $bomItems);

        // 5. Compute Grand Total
        $discountAmount = 0.0;
        $grandTotal = $subtotal + $accessoryTotal + $installationTotal - $discountAmount;

        return new EstimateSummaryDTO(
            estimateId: null,
            estimateNumber: 'PREVIEW-' . strtoupper(bin2hex(random_bytes(3))),
            projectName: $requirements->projectName,
            projectType: $requirements->projectType,
            systemType: $requirements->systemType,
            status: CctvEstimateStatus::CALCULATED,
            items: $bomItems,
            subtotalAmount: round($subtotal, 2),
            accessoryAmount: round($accessoryTotal, 2),
            installationAmount: round($installationTotal, 2),
            discountAmount: round($discountAmount, 2),
            grandTotal: round($grandTotal, 2),
            currency: 'BDT',
            storageMetrics: $storageMetrics,
            cableMetrics: $cableMetrics,
            validation: $validation,
            requirementsSnapshot: $requirements->toArray(),
            notes: $requirements->notes
        );
    }

    public function saveEstimate(
        CctvRequirementDTO $requirements,
        array $selectedItems = [],
        ?int $userId = null,
        ?string $guestSessionId = null,
        ?int $existingEstimateId = null
    ): CctvEstimate {
        return DB::transaction(function () use ($requirements, $selectedItems, $userId, $guestSessionId, $existingEstimateId) {
            $summary = $this->calculateEstimate($requirements, $selectedItems);

            $itemsData = array_map(function (EstimateBOMItemDTO $item) {
                return [
                    'product_id' => $item->productId,
                    'item_type' => $item->itemType->value,
                    'product_sku_snapshot' => $item->productSkuSnapshot,
                    'product_name_snapshot' => $item->productNameSnapshot,
                    'product_type' => $item->productType,
                    'system_type' => $item->systemType,
                    'unit_price_snapshot' => $item->unitPriceSnapshot,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit,
                    'subtotal_price' => $item->subtotalPrice,
                    'is_required' => $item->isRequired,
                    'is_recommended' => $item->isRecommended,
                    'recommendation_reason' => $item->recommendationReason,
                    'compatibility_status' => $item->compatibilityStatus,
                    'metadata' => $item->metadata,
                ];
            }, $summary->items);

            $attributes = [
                'user_id' => $userId,
                'guest_session_id' => $guestSessionId,
                'project_name' => $requirements->projectName,
                'project_type' => $requirements->projectType->value,
                'location_district' => $requirements->locationDistrict,
                'location_address' => $requirements->locationAddress,
                'floors_count' => $requirements->floorsCount,
                'areas_count' => $requirements->areasCount,
                'system_type' => $requirements->systemType->value,
                'status' => CctvEstimateStatus::SAVED->value,
                'requirements_payload' => $requirements->toArray(),
                'calculation_metrics' => [
                    'storage' => $summary->storageMetrics?->toArray(),
                    'cable' => $summary->cableMetrics?->toArray(),
                ],
                'validation_results' => $summary->validation?->toArray(),
                'subtotal_amount' => $summary->subtotalAmount,
                'accessory_amount' => $summary->accessoryAmount,
                'installation_amount' => $summary->installationAmount,
                'discount_amount' => $summary->discountAmount,
                'grand_total' => $summary->grandTotal,
                'currency' => $summary->currency,
                'notes' => $requirements->notes,
                'created_by' => $userId,
                'items' => $itemsData,
            ];

            if ($existingEstimateId) {
                $existing = $this->estimateRepo->findById($existingEstimateId);
                if ($existing) {
                    $attributes['version'] = $existing->version + 1;
                    return $this->estimateRepo->updateEstimate($existing, $attributes);
                }
            }

            return $this->estimateRepo->createEstimate($attributes);
        });
    }

    public function getEstimateDetails(string $estimateNumber): ?EstimateSummaryDTO
    {
        $estimate = $this->estimateRepo->findByEstimateNumber($estimateNumber);
        if (!$estimate) {
            return null;
        }

        $items = $estimate->items->map(function ($item) {
            return new EstimateBOMItemDTO(
                productId: $item->product_id,
                itemType: $item->item_type,
                productSkuSnapshot: $item->product_sku_snapshot,
                productNameSnapshot: $item->product_name_snapshot,
                productType: $item->product_type,
                systemType: $item->system_type,
                unitPriceSnapshot: (float) $item->unit_price_snapshot,
                quantity: (float) $item->quantity,
                unit: $item->unit,
                subtotalPrice: (float) $item->subtotal_price,
                isRequired: (bool) $item->is_required,
                isRecommended: (bool) $item->is_recommended,
                recommendationReason: $item->recommendation_reason,
                compatibilityStatus: $item->compatibility_status,
                imageUrl: $item->product?->image,
                metadata: $item->metadata ?? []
            );
        })->all();

        return new EstimateSummaryDTO(
            estimateId: $estimate->id,
            estimateNumber: $estimate->estimate_number,
            projectName: $estimate->project_name,
            projectType: $estimate->project_type,
            systemType: $estimate->system_type,
            status: $estimate->status,
            items: $items,
            subtotalAmount: (float) $estimate->subtotal_amount,
            accessoryAmount: (float) $estimate->accessory_amount,
            installationAmount: (float) $estimate->installation_amount,
            discountAmount: (float) $estimate->discount_amount,
            grandTotal: (float) $estimate->grand_total,
            currency: $estimate->currency,
            requirementsSnapshot: $estimate->requirements_payload ?? [],
            notes: $estimate->notes
        );
    }
}
