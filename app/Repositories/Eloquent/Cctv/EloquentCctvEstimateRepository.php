<?php

namespace App\Repositories\Eloquent\Cctv;

use App\Enums\Cctv\CctvEstimateStatus;
use App\Models\Cctv\CctvEstimate;
use App\Models\Cctv\CctvEstimateItem;
use App\Repositories\Contracts\Cctv\CctvEstimateRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EloquentCctvEstimateRepository implements CctvEstimateRepositoryInterface
{
    public function findById(int $id): ?CctvEstimate
    {
        return CctvEstimate::with(['items.product.brand', 'user', 'quotes'])->find($id);
    }

    public function findByEstimateNumber(string $estimateNumber): ?CctvEstimate
    {
        return CctvEstimate::with(['items.product.brand', 'user', 'quotes'])
            ->where('estimate_number', $estimateNumber)
            ->first();
    }

    public function getUserEstimates(int $userId): Collection
    {
        return CctvEstimate::with(['items', 'latestQuote'])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function getGuestEstimates(string $guestSessionId): Collection
    {
        return CctvEstimate::with(['items', 'latestQuote'])
            ->where('guest_session_id', $guestSessionId)
            ->latest()
            ->get();
    }

    public function createEstimate(array $attributes): CctvEstimate
    {
        return DB::transaction(function () use ($attributes) {
            $items = $attributes['items'] ?? [];
            unset($attributes['items']);

            if (empty($attributes['estimate_number'])) {
                $attributes['estimate_number'] = 'EST-CCTV-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(4)));
            }

            $estimate = CctvEstimate::create($attributes);

            if (!empty($items)) {
                $this->syncEstimateItems($estimate, $items);
            }

            return $estimate->fresh(['items.product.brand', 'user']);
        });
    }

    public function updateEstimate(CctvEstimate $estimate, array $attributes): CctvEstimate
    {
        return DB::transaction(function () use ($estimate, $attributes) {
            $items = $attributes['items'] ?? null;
            unset($attributes['items']);

            $estimate->update($attributes);

            if ($items !== null) {
                $this->syncEstimateItems($estimate, $items);
            }

            return $estimate->fresh(['items.product.brand', 'user']);
        });
    }

    public function syncEstimateItems(CctvEstimate $estimate, array $items): void
    {
        $estimate->items()->delete();

        foreach ($items as $item) {
            $estimate->items()->create([
                'product_id' => $item['product_id'] ?? null,
                'item_type' => $item['item_type'] ?? 'selected_camera',
                'product_sku_snapshot' => $item['product_sku_snapshot'] ?? 'CCTV-SKU',
                'product_name_snapshot' => $item['product_name_snapshot'] ?? 'CCTV Hardware',
                'product_type' => $item['product_type'] ?? 'camera',
                'system_type' => $item['system_type'] ?? 'ip',
                'unit_price_snapshot' => $item['unit_price_snapshot'] ?? 0.00,
                'quantity' => $item['quantity'] ?? 1.00,
                'unit' => $item['unit'] ?? 'piece',
                'subtotal_price' => $item['subtotal_price'] ?? 0.00,
                'is_required' => $item['is_required'] ?? true,
                'is_recommended' => $item['is_recommended'] ?? false,
                'recommendation_reason' => $item['recommendation_reason'] ?? null,
                'compatibility_status' => $item['compatibility_status'] ?? 'compatible',
                'metadata' => $item['metadata'] ?? null,
            ]);
        }
    }

    public function updateStatus(CctvEstimate $estimate, CctvEstimateStatus $status): bool
    {
        return $estimate->update(['status' => $status->value]);
    }
}
