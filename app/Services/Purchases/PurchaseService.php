<?php

namespace App\Services\Purchases;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\PurchasePayment;
use App\Models\PurchaseReturn;
use App\Models\PurchaseReturnItem;
use App\Models\Supplier;
use App\Services\Accounting\AccountingService;
use App\Services\Inventory\WarehouseInventoryService;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Exception;

class PurchaseService
{
    public static function createPurchaseOrder(array $data, array $items, ?int $userId = null): Purchase
    {
        return self::createPurchase($data, $items, $userId);
    }

    /**
     * Create a purchase order.
     */
    public static function createPurchase(array $data, array $items, ?int $userId = null): Purchase
    {
        return DB::transaction(function () use ($data, $items, $userId) {
            $supplier = Supplier::findOrFail($data['supplier_id']);
            $warehouse = isset($data['warehouse_id']) && $data['warehouse_id']
                ? \App\Models\Warehouse::findOrFail($data['warehouse_id'])
                : WarehouseInventoryService::getDefaultWarehouse();

            $purchaseNumber = 'PO-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $subtotal = 0.00;
            foreach ($items as $item) {
                $qty = (int)$item['quantity_ordered'];
                $cost = (float)$item['unit_cost'];
                $discount = (float)($item['line_discount'] ?? 0.00);
                $subtotal += ($qty * $cost) - $discount;
            }

            $discount = (float)($data['discount'] ?? 0.00);
            $tax = (float)($data['tax'] ?? 0.00);
            $shippingCost = (float)($data['shipping_cost'] ?? 0.00);
            $total = max(0, $subtotal - $discount + $tax + $shippingCost);
            $paidAmount = (float)($data['paid_amount'] ?? 0.00);
            $dueAmount = max(0, $total - $paidAmount);

            $purchase = Purchase::create([
                'purchase_number' => $purchaseNumber,
                'supplier_id' => $supplier->id,
                'warehouse_id' => $warehouse->id,
                'purchase_date' => $data['purchase_date'] ?? now()->toDateString(),
                'expected_delivery_date' => $data['expected_delivery_date'] ?? null,
                'status' => $data['status'] ?? 'ordered',
                'payment_status' => $dueAmount == 0 && $total > 0 ? 'paid' : ($paidAmount > 0 ? 'partially_paid' : 'unpaid'),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            foreach ($items as $item) {
                $qty = (int)$item['quantity_ordered'];
                $cost = (float)$item['unit_cost'];
                $lineDiscount = (float)($item['line_discount'] ?? 0.00);
                $lineTotal = ($qty * $cost) - $lineDiscount;

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity_ordered' => $qty,
                    'quantity_received' => 0,
                    'unit_cost' => $cost,
                    'line_discount' => $lineDiscount,
                    'tax_percent' => (float)($item['tax_percent'] ?? 0.00),
                    'line_total' => $lineTotal,
                ]);
            }

            // Update supplier current balance if due
            if ($dueAmount > 0) {
                $supplier->current_balance += $dueAmount;
                $supplier->save();
            }

            // Record upfront payment if provided
            if ($paidAmount > 0) {
                PurchasePayment::create([
                    'purchase_id' => $purchase->id,
                    'supplier_id' => $supplier->id,
                    'financial_account_id' => $data['financial_account_id'] ?? null,
                    'amount' => $paidAmount,
                    'payment_method' => $data['payment_method'] ?? 'cash',
                    'transaction_reference' => $data['payment_reference'] ?? null,
                    'paid_at' => now()->toDateString(),
                    'notes' => "Initial payment for Purchase #{$purchaseNumber}",
                    'created_by' => $userId,
                ]);
            }

            AuditLogger::log("purchases.created", $purchase, null, [
                'purchase_number' => $purchaseNumber,
                'supplier' => $supplier->company_name,
                'total' => $total,
            ]);

            return $purchase;
        });
    }

    /**
     * Receive goods from purchase order (supporting partial receipts).
     */
    public static function receiveItems(int $purchaseId, array $receivedQuantities, ?int $userId = null): Purchase
    {
        return DB::transaction(function () use ($purchaseId, $receivedQuantities, $userId) {
            $purchase = Purchase::with(['items.product', 'supplier', 'warehouse'])->lockForUpdate()->findOrFail($purchaseId);

            $allCompleted = true;
            $anyReceived = false;

            foreach ($purchase->items as $item) {
                $incomingQty = isset($receivedQuantities[$item->id]) ? (int)$receivedQuantities[$item->id] : 0;
                if ($incomingQty <= 0) {
                    if ($item->quantity_received < $item->quantity_ordered) {
                        $allCompleted = false;
                    }
                    continue;
                }

                $maxCanReceive = $item->quantity_ordered - $item->quantity_received;
                $actualReceive = min($incomingQty, $maxCanReceive);

                if ($actualReceive > 0) {
                    $item->quantity_received += $actualReceive;
                    $item->save();
                    $anyReceived = true;

                    // Atomically increase stock and create inventory movement
                    WarehouseInventoryService::adjustStock(
                        productId: $item->product_id,
                        warehouseId: $purchase->warehouse_id,
                        quantityChange: $actualReceive,
                        type: 'purchase',
                        referenceType: Purchase::class,
                        referenceId: $purchase->id,
                        userId: $userId,
                        notes: "Goods received from Purchase #{$purchase->purchase_number} ({$actualReceive} units)"
                    );
                }

                if ($item->quantity_received < $item->quantity_ordered) {
                    $allCompleted = false;
                }
            }

            if ($anyReceived) {
                $purchase->status = $allCompleted ? 'received' : 'partially_received';
                $purchase->save();

                // Generate Accounting Journal Entry
                AccountingService::recordPurchaseJournal($purchase);

                AuditLogger::log("purchases.received", $purchase, null, [
                    'purchase_number' => $purchase->purchase_number,
                    'status' => $purchase->status,
                ]);
            }

            return $purchase;
        });
    }

    /**
     * Record payment to supplier for an existing purchase.
     */
    public static function recordPayment(int $purchaseId, float $amount, string $paymentMethod, ?int $financialAccountId = null, ?string $notes = null, ?int $userId = null): PurchasePayment
    {
        return DB::transaction(function () use ($purchaseId, $amount, $paymentMethod, $financialAccountId, $notes, $userId) {
            $purchase = Purchase::with('supplier')->lockForUpdate()->findOrFail($purchaseId);

            if ($amount <= 0) {
                throw new Exception("Payment amount must be greater than zero.");
            }

            if ($amount > $purchase->due_amount) {
                throw new Exception("Payment amount (৳{$amount}) exceeds outstanding due (৳{$purchase->due_amount}).");
            }

            $payment = PurchasePayment::create([
                'purchase_id' => $purchase->id,
                'supplier_id' => $purchase->supplier_id,
                'financial_account_id' => $financialAccountId,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'paid_at' => now()->toDateString(),
                'notes' => $notes,
                'created_by' => $userId,
            ]);

            $purchase->paid_amount += $amount;
            $purchase->due_amount = max(0, $purchase->total - $purchase->paid_amount);
            $purchase->payment_status = $purchase->due_amount == 0 ? 'paid' : 'partially_paid';
            $purchase->save();

            // Deduct supplier balance
            if ($purchase->supplier) {
                $purchase->supplier->current_balance = max(0, $purchase->supplier->current_balance - $amount);
                $purchase->supplier->save();
            }

            AuditLogger::log("purchases.payment_recorded", $payment, null, [
                'purchase_number' => $purchase->purchase_number,
                'amount' => $amount,
            ]);

            return $payment;
        });
    }
}
