<?php

namespace App\Services\Inventory;

use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\StockCount;
use App\Models\StockCountItem;
use App\Models\InventoryMovement;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Exception;

class WarehouseInventoryService
{
    /**
     * Get or create the primary default warehouse.
     */
    public static function getDefaultWarehouse(): Warehouse
    {
        return Warehouse::firstOrCreate(
            ['code' => 'MAIN-WH'],
            [
                'name' => 'Central Distribution Warehouse',
                'address' => 'Elephant Road, Dhaka, Bangladesh',
                'manager_name' => 'Inventory Operations Lead',
                'phone' => '+8801700000000',
                'email' => 'warehouse@techmarket.com',
                'is_default' => true,
                'is_active' => true,
            ]
        );
    }

    /**
     * Atomically adjust stock for a specific warehouse and sync global product stock.
     */
    public static function adjustStock(
        int $productId,
        ?int $warehouseId,
        int $quantityChange,
        string $type,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?int $userId = null,
        ?string $notes = null
    ): Product {
        return DB::transaction(function () use ($productId, $warehouseId, $quantityChange, $type, $referenceType, $referenceId, $userId, $notes) {
            $warehouse = $warehouseId ? Warehouse::findOrFail($warehouseId) : self::getDefaultWarehouse();

            /** @var Product $product */
            $product = Product::where('id', $productId)->lockForUpdate()->firstOrFail();

            $newGlobalStock = $product->stock + $quantityChange;

            if ($newGlobalStock < 0 && !in_array($type, ['reserved', 'sale', 'pos_sale'])) {
                throw new Exception("Insufficient stock for product '{$product->title}'. Current stock: {$product->stock}");
            }

            // Sync global product stock
            $product->stock = max(0, $newGlobalStock);
            $product->save();

            // Sync warehouse-specific stock
            $whStock = WarehouseStock::firstOrCreate(
                ['warehouse_id' => $warehouse->id, 'product_id' => $product->id],
                ['stock' => 0]
            );

            $newWhStock = $whStock->stock + $quantityChange;
            $whStock->stock = max(0, $newWhStock);
            $whStock->save();

            // Record authoritative inventory movement
            InventoryMovement::create([
                'product_id' => $productId,
                'warehouse_id' => $warehouse->id,
                'type' => $type,
                'quantity' => $quantityChange,
                'resulting_stock' => $product->stock,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'user_id' => $userId,
                'notes' => $notes ?? "Stock {$type} at {$warehouse->name}",
            ]);

            AuditLogger::log("inventory.{$type}", $product, null, [
                'warehouse_id' => $warehouse->id,
                'warehouse_name' => $warehouse->name,
                'quantity_change' => $quantityChange,
                'resulting_stock' => $product->stock,
                'type' => $type,
            ]);

            return $product;
        });
    }

    /**
     * Transfer stock between two warehouses atomically.
     */
    public static function transferStock(
        int $fromWarehouseId,
        int $toWarehouseId,
        array $items, // [['product_id' => int, 'quantity' => int]]
        ?string $notes = null,
        ?int $userId = null
    ): StockTransfer {
        if ($fromWarehouseId === $toWarehouseId) {
            throw new Exception("Source and destination warehouses cannot be the same.");
        }

        return DB::transaction(function () use ($fromWarehouseId, $toWarehouseId, $items, $notes, $userId) {
            $fromWh = Warehouse::findOrFail($fromWarehouseId);
            $toWh = Warehouse::findOrFail($toWarehouseId);

            $transferNumber = 'TRF-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $transfer = StockTransfer::create([
                'transfer_number' => $transferNumber,
                'from_warehouse_id' => $fromWarehouseId,
                'to_warehouse_id' => $toWarehouseId,
                'status' => 'completed',
                'initiated_by' => $userId,
                'received_by' => $userId,
                'notes' => $notes,
            ]);

            foreach ($items as $item) {
                $productId = (int)$item['product_id'];
                $qty = (int)$item['quantity'];
                if ($qty <= 0) continue;

                $fromWhStock = WarehouseStock::firstOrCreate(
                    ['warehouse_id' => $fromWarehouseId, 'product_id' => $productId],
                    ['stock' => 0]
                );

                if ($fromWhStock->stock < $qty) {
                    $prod = Product::find($productId);
                    throw new Exception("Insufficient stock in '{$fromWh->name}' for {$prod?->title}. Available: {$fromWhStock->stock}, Requested: {$qty}");
                }

                // Deduct from source warehouse
                $fromWhStock->stock -= $qty;
                $fromWhStock->save();

                // Add to destination warehouse
                $toWhStock = WarehouseStock::firstOrCreate(
                    ['warehouse_id' => $toWarehouseId, 'product_id' => $productId],
                    ['stock' => 0]
                );
                $toWhStock->stock += $qty;
                $toWhStock->save();

                StockTransferItem::create([
                    'stock_transfer_id' => $transfer->id,
                    'product_id' => $productId,
                    'quantity_transferred' => $qty,
                    'quantity_received' => $qty,
                ]);

                // Create movements for audit trail
                InventoryMovement::create([
                    'product_id' => $productId,
                    'warehouse_id' => $fromWarehouseId,
                    'type' => 'transfer_out',
                    'quantity' => -$qty,
                    'resulting_stock' => Product::find($productId)?->stock ?? 0,
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'user_id' => $userId,
                    'notes' => "Transferred to {$toWh->name} via #{$transferNumber}",
                ]);

                InventoryMovement::create([
                    'product_id' => $productId,
                    'warehouse_id' => $toWarehouseId,
                    'type' => 'transfer_in',
                    'quantity' => $qty,
                    'resulting_stock' => Product::find($productId)?->stock ?? 0,
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'user_id' => $userId,
                    'notes' => "Received from {$fromWh->name} via #{$transferNumber}",
                ]);
            }

            AuditLogger::log("inventory.transfer_completed", $transfer, null, [
                'from' => $fromWh->name,
                'to' => $toWh->name,
                'items_count' => count($items),
            ]);

            return $transfer;
        });
    }

    /**
     * Submit physical stock count sheet and compute variances.
     */
    public static function submitStockCount(
        int $warehouseId,
        array $items, // [['product_id' => int, 'physical_quantity' => int]]
        ?string $notes = null,
        ?int $userId = null
    ): StockCount {
        return DB::transaction(function () use ($warehouseId, $items, $notes, $userId) {
            $warehouse = Warehouse::findOrFail($warehouseId);
            $countNumber = 'CNT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $stockCount = StockCount::create([
                'count_number' => $countNumber,
                'warehouse_id' => $warehouseId,
                'status' => 'draft',
                'counted_by' => $userId,
                'notes' => $notes,
            ]);

            foreach ($items as $item) {
                $productId = (int)$item['product_id'];
                $physicalQty = (int)$item['physical_quantity'];

                $product = Product::findOrFail($productId);
                $whStock = WarehouseStock::firstOrCreate(
                    ['warehouse_id' => $warehouseId, 'product_id' => $productId],
                    ['stock' => $product->stock]
                );

                $systemQty = $whStock->stock;
                $varianceQty = $physicalQty - $systemQty;
                $costPrice = (float)($product->cost_price ?? $product->regular_price ?? $product->price ?? 0);
                $varianceCost = $varianceQty * $costPrice;

                StockCountItem::create([
                    'stock_count_id' => $stockCount->id,
                    'product_id' => $productId,
                    'system_quantity' => $systemQty,
                    'physical_quantity' => $physicalQty,
                    'variance_quantity' => $varianceQty,
                    'variance_cost' => $varianceCost,
                ]);
            }

            AuditLogger::log("inventory.count_submitted", $stockCount, null, [
                'count_number' => $countNumber,
                'warehouse' => $warehouse->name,
                'items_count' => count($items),
            ]);

            return $stockCount;
        });
    }

    /**
     * Approve stock count and apply adjustments atomically.
     */
    public static function approveStockCount(int $stockCountId, int $userId): StockCount
    {
        return DB::transaction(function () use ($stockCountId, $userId) {
            $stockCount = StockCount::with('items.product')->lockForUpdate()->findOrFail($stockCountId);

            if ($stockCount->status === 'approved') {
                throw new Exception("This stock count has already been approved.");
            }

            foreach ($stockCount->items as $item) {
                if ($item->variance_quantity != 0) {
                    self::adjustStock(
                        productId: $item->product_id,
                        warehouseId: $stockCount->warehouse_id,
                        quantityChange: $item->variance_quantity,
                        type: 'adjustment',
                        referenceType: StockCount::class,
                        referenceId: $stockCount->id,
                        userId: $userId,
                        notes: "Stock count reconciliation #{$stockCount->count_number}. Variance: {$item->variance_quantity}"
                    );
                }
            }

            $stockCount->status = 'approved';
            $stockCount->approved_by = $userId;
            $stockCount->save();

            AuditLogger::log("inventory.count_approved", $stockCount, null, [
                'count_number' => $stockCount->count_number,
                'approved_by' => $userId,
            ]);

            return $stockCount;
        });
    }

    /**
     * Calculate comprehensive real-time inventory valuation summary.
     */
    public static function getValuationSummary(): array
    {
        $products = Product::select('id', 'title', 'sku', 'stock', 'price', 'regular_price', 'cost_price')->get();

        $totalUnits = 0;
        $totalCost = 0.00;
        $potentialRetailValue = 0.00;
        $lowStockCount = 0;
        $outOfStockCount = 0;

        foreach ($products as $p) {
            $stock = (int)$p->stock;
            $totalUnits += $stock;

            // Unit cost resolution (fallback to 75% MSRP or regular price if cost_price not explicitly stored)
            $unitCost = (float)($p->cost_price > 0 ? $p->cost_price : ($p->regular_price > 0 ? $p->regular_price * 0.8 : $p->price * 0.8));
            $sellingPrice = (float)$p->price;

            $totalCost += ($stock * $unitCost);
            $potentialRetailValue += ($stock * $sellingPrice);

            if ($stock <= 0) {
                $outOfStockCount++;
            } elseif ($stock <= 5) {
                $lowStockCount++;
            }
        }

        $grossMargin = $potentialRetailValue > 0 ? (($potentialRetailValue - $totalCost) / $potentialRetailValue) * 100 : 0;

        return [
            'total_products' => $products->count(),
            'total_units' => $totalUnits,
            'total_cost' => round($totalCost, 2),
            'potential_retail_value' => round($potentialRetailValue, 2),
            'estimated_gross_profit' => round($potentialRetailValue - $totalCost, 2),
            'estimated_gross_margin_percent' => round($grossMargin, 1),
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
        ];
    }
}
