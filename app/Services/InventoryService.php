<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductAlert;
use App\Notifications\ProductBackInStockNotification;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryService
{
    /**
     * Atomically adjust inventory stock with complete audit trail and trigger back-in-stock alerts.
     */
    public static function adjustStock(
        int $productId,
        int $quantityChange,
        string $type,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?int $userId = null,
        ?string $notes = null,
        ?int $warehouseId = null
    ): Product {
        return DB::transaction(function () use ($productId, $quantityChange, $type, $referenceType, $referenceId, $userId, $notes, $warehouseId) {
            /** @var Product $product */
            $product = Product::where('id', $productId)->lockForUpdate()->firstOrFail();

            $oldStock = $product->stock;
            $newStock = $product->stock + $quantityChange;

            if ($newStock < 0 && !in_array($type, ['reserved', 'sale'])) {
                throw new Exception("Insufficient stock for product ID: {$productId}. Current stock: {$product->stock}");
            }

            $product->stock = max(0, $newStock);
            $product->save();

            $defaultWh = \App\Services\Inventory\WarehouseInventoryService::getDefaultWarehouse();
            $effectiveWhId = $warehouseId ?: ($defaultWh ? $defaultWh->id : null);

            InventoryMovement::create([
                'product_id' => $productId,
                'warehouse_id' => $effectiveWhId,
                'type' => $type,
                'quantity' => $quantityChange,
                'resulting_stock' => $product->stock,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'user_id' => $userId,
                'notes' => $notes,
            ]);

            // Back-in-stock alert trigger: 0 -> >0
            if ($oldStock === 0 && $product->stock > 0) {
                $alerts = ProductAlert::where('product_id', $product->id)
                    ->where('type', 'back_in_stock')
                    ->where('status', 'active')
                    ->get();

                foreach ($alerts as $alert) {
                    if ($alert->user) {
                        $alert->user->notify(new ProductBackInStockNotification($product));
                    }
                    $alert->update(['status' => 'triggered', 'last_notified_at' => now()]);
                }
            }

            AuditLogger::log("inventory.{$type}", $product, null, [
                'quantity_change' => $quantityChange,
                'resulting_stock' => $product->stock,
                'type' => $type
            ]);

            return $product;
        });
    }

    /**
     * Reserve stock during checkout.
     */
    public static function reserveStock(int $productId, int $quantity, int $orderId): Product
    {
        return self::adjustStock(
            productId: $productId,
            quantityChange: -$quantity,
            type: 'reserved',
            referenceType: 'App\Models\Order',
            referenceId: $orderId,
            notes: "Reserved stock for Order #{$orderId}"
        );
    }

    /**
     * Release reserved stock upon order cancellation.
     */
    public static function releaseStock(int $productId, int $quantity, int $orderId): Product
    {
        return self::adjustStock(
            productId: $productId,
            quantityChange: $quantity,
            type: 'released',
            referenceType: 'App\Models\Order',
            referenceId: $orderId,
            notes: "Released stock for cancelled Order #{$orderId}"
        );
    }
}
