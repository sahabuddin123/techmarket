<?php

namespace App\DTOs\Cctv;

use App\Enums\Cctv\CctvEstimateItemType;

readonly class EstimateBOMItemDTO
{
    public function __construct(
        public ?int $productId,
        public CctvEstimateItemType $itemType,
        public string $productSkuSnapshot,
        public string $productNameSnapshot,
        public string $productType,
        public string $systemType,
        public float $unitPriceSnapshot,
        public float $quantity,
        public string $unit = 'piece',
        public float $subtotalPrice = 0.0,
        public bool $isRequired = true,
        public bool $isRecommended = false,
        public ?string $recommendationReason = null,
        public string $compatibilityStatus = 'compatible',
        public ?string $imageUrl = null,
        public array $metadata = [],
    ) {}

    public static function fromArray(array $data): self
    {
        $unitPrice = (float) ($data['unit_price_snapshot'] ?? 0.0);
        $qty = (float) ($data['quantity'] ?? 1.0);
        $subtotal = isset($data['subtotal_price']) ? (float) $data['subtotal_price'] : ($unitPrice * $qty);

        return new self(
            productId: isset($data['product_id']) ? (int) $data['product_id'] : null,
            itemType: isset($data['item_type']) ? CctvEstimateItemType::tryFrom($data['item_type']) ?? CctvEstimateItemType::SELECTED_CAMERA : CctvEstimateItemType::SELECTED_CAMERA,
            productSkuSnapshot: $data['product_sku_snapshot'] ?? 'CCTV-ITEM',
            productNameSnapshot: $data['product_name_snapshot'] ?? 'CCTV Hardware Item',
            productType: $data['product_type'] ?? 'camera',
            systemType: $data['system_type'] ?? 'ip',
            unitPriceSnapshot: $unitPrice,
            quantity: $qty,
            unit: $data['unit'] ?? 'piece',
            subtotalPrice: $subtotal,
            isRequired: (bool) ($data['is_required'] ?? true),
            isRecommended: (bool) ($data['is_recommended'] ?? false),
            recommendationReason: $data['recommendation_reason'] ?? null,
            compatibilityStatus: $data['compatibility_status'] ?? 'compatible',
            imageUrl: $data['image_url'] ?? null,
            metadata: $data['metadata'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'product_id' => $this->productId,
            'item_type' => $this->itemType->value,
            'product_sku_snapshot' => $this->productSkuSnapshot,
            'product_name_snapshot' => $this->productNameSnapshot,
            'product_type' => $this->productType,
            'system_type' => $this->systemType,
            'unit_price_snapshot' => $this->unitPriceSnapshot,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'subtotal_price' => $this->subtotalPrice,
            'is_required' => $this->isRequired,
            'is_recommended' => $this->isRecommended,
            'recommendation_reason' => $this->recommendationReason,
            'compatibility_status' => $this->compatibilityStatus,
            'image_url' => $this->imageUrl,
            'metadata' => $this->metadata,
        ];
    }
}
