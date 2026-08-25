<?php

namespace App\Services\Sales;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\Product;
use App\Models\User;
use App\Services\Accounting\AccountingService;
use App\Services\Inventory\WarehouseInventoryService;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Exception;

class SalesService
{
    /**
     * Create an authoritative sale record with atomic inventory deduction and journal posting.
     */
    public static function createSale(array $data, array $items, array $payments = [], ?int $userId = null): Sale
    {
        return DB::transaction(function () use ($data, $items, $payments, $userId) {
            $warehouse = isset($data['warehouse_id']) && $data['warehouse_id']
                ? \App\Models\Warehouse::findOrFail($data['warehouse_id'])
                : WarehouseInventoryService::getDefaultWarehouse();

            $saleNumber = 'SL-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            $subtotal = 0.00;
            $validatedItems = [];

            foreach ($items as $item) {
                $product = Product::where('id', $item['product_id'])->lockForUpdate()->firstOrFail();
                $qty = (int)$item['quantity'];
                if ($qty <= 0) continue;

                if ($product->stock < $qty) {
                    throw new Exception("Insufficient stock for '{$product->title}'. Available: {$product->stock}, Requested: {$qty}");
                }

                // Authoritative selling price from DB
                $unitPrice = (float)($item['unit_price'] ?? $product->price);
                $costPrice = (float)($product->cost_price ?? $product->regular_price ?? $product->price * 0.8);
                $lineDiscount = (float)($item['line_discount'] ?? 0.00);
                $taxAmount = (float)($item['tax_amount'] ?? 0.00);
                $lineTotal = ($qty * $unitPrice) - $lineDiscount + $taxAmount;

                $subtotal += $lineTotal;

                $validatedItems[] = [
                    'product' => $product,
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'sku' => $product->sku,
                    'unit_price' => $unitPrice,
                    'cost_price' => $costPrice,
                    'quantity' => $qty,
                    'line_discount' => $lineDiscount,
                    'tax_amount' => $taxAmount,
                    'line_total' => $lineTotal,
                ];
            }

            if (empty($validatedItems)) {
                throw new Exception("Cannot create sale with no valid items.");
            }

            $discountAmount = (float)($data['discount_amount'] ?? 0.00);
            $taxAmount = (float)($data['tax_amount'] ?? 0.00);
            $shippingCharge = (float)($data['shipping_charge'] ?? 0.00);
            $grandTotal = max(0, $subtotal - $discountAmount + $taxAmount + $shippingCharge);

            // Process and validate payments
            $validPayments = [];
            $totalPaid = 0.00;
            $hasNonCashOverpayment = false;

            foreach ($payments as $p) {
                $payAmt = (float)($p['amount'] ?? 0.00);
                $method = strtolower($p['payment_method'] ?? 'cash');

                if ($payAmt < 0) {
                    throw new Exception("Payment amount cannot be negative.");
                }

                if ($payAmt == 0 && !in_array($method, ['cod', 'due'])) {
                    continue; // skip zero amount rows
                }

                // Reference number requirement for non-cash digital methods
                if (in_array($method, ['card', 'pos_card', 'bkash', 'nagad', 'bank_transfer']) && $payAmt > 0) {
                    if (empty(trim($p['reference_number'] ?? ''))) {
                        throw new Exception("Transaction/reference number is required for " . strtoupper($method) . " payment.");
                    }
                }

                $validPayments[] = [
                    'payment_method' => $method,
                    'amount' => $payAmt,
                    'financial_account_id' => $p['financial_account_id'] ?? null,
                    'reference_number' => $p['reference_number'] ?? null,
                    'notes' => $p['notes'] ?? null,
                ];

                if (!in_array($method, ['cod', 'due'])) {
                    $totalPaid += $payAmt;
                }
            }

            // If multiple payments provided and total paid > grand total, reject unless single cash payment with change
            if (count($validPayments) > 1 && $totalPaid > $grandTotal) {
                throw new Exception("Total payment allocation (৳" . number_format($totalPaid, 2) . ") cannot exceed invoice grand total (৳" . number_format($grandTotal, 2) . ").");
            }

            $dueAmount = max(0, $grandTotal - $totalPaid);
            $changeAmount = max(0, $totalPaid - $grandTotal);
            $finalPaidAmount = min($totalPaid, $grandTotal);

            // Authoritative Customer Credit & Due Validation
            $customerId = $data['customer_id'] ?? null;
            $customer = $customerId ? User::find($customerId) : null;

            if (!$customer && !empty($data['customer_phone'])) {
                $customer = User::where('phone', $data['customer_phone'])->where('role', '!=', 'admin')->first();
                if ($customer) {
                    $customerId = $customer->id;
                }
            }

            if ($dueAmount > 0) {
                \App\Services\Pos\PosCustomerService::validateCreditLimit($customer, $dueAmount);
            }

            $customerName = !empty($data['customer_name']) ? $data['customer_name'] : ($customer ? $customer->name : 'Walk-in Customer');
            $customerPhone = !empty($data['customer_phone']) ? $data['customer_phone'] : ($customer ? $customer->phone : null);
            $customerEmail = !empty($data['customer_email']) ? $data['customer_email'] : ($customer ? $customer->email : null);

            $paymentStatus = $dueAmount == 0 && $grandTotal > 0 ? 'paid' : ($finalPaidAmount > 0 ? 'partially_paid' : 'unpaid');
            $saleStatus = $data['status'] ?? ($paymentStatus === 'paid' ? 'completed' : 'confirmed');

            $sale = Sale::create([
                'sale_number' => $saleNumber,
                'order_id' => $data['order_id'] ?? null,
                'customer_id' => $customerId,
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'customer_email' => $customerEmail,
                'warehouse_id' => $warehouse->id,
                'salesperson_id' => $userId,
                'sales_channel' => $data['sales_channel'] ?? 'pos',
                'status' => $saleStatus,
                'payment_status' => $paymentStatus,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'discount_type' => $data['discount_type'] ?? 'fixed',
                'coupon_code' => $data['coupon_code'] ?? null,
                'tax_amount' => $taxAmount,
                'shipping_charge' => $shippingCharge,
                'grand_total' => $grandTotal,
                'paid_amount' => $finalPaidAmount,
                'change_amount' => $changeAmount,
                'due_amount' => $dueAmount,
                'notes' => $data['notes'] ?? null,
                'completed_at' => $saleStatus === 'completed' ? now() : null,
            ]);

            // Save Sale Items & Deduct Stock
            foreach ($validatedItems as $vItem) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $vItem['product_id'],
                    'product_title' => $vItem['product_title'],
                    'sku' => $vItem['sku'],
                    'unit_price' => $vItem['unit_price'],
                    'cost_price' => $vItem['cost_price'],
                    'quantity' => $vItem['quantity'],
                    'line_discount' => $vItem['line_discount'],
                    'tax_amount' => $vItem['tax_amount'],
                    'line_total' => $vItem['line_total'],
                ]);

                // Atomically deduct inventory
                WarehouseInventoryService::adjustStock(
                    productId: $vItem['product_id'],
                    warehouseId: $warehouse->id,
                    quantityChange: -$vItem['quantity'],
                    type: $data['sales_channel'] === 'pos' ? 'pos_sale' : 'sale',
                    referenceType: Sale::class,
                    referenceId: $sale->id,
                    userId: $userId,
                    notes: "Deducted for Sale #{$saleNumber}"
                );
            }

            // Save Valid Payments
            foreach ($validPayments as $pay) {
                $payAmt = (float)$pay['amount'];
                if ($payAmt <= 0) continue;

                // If single cash payment has change returned to customer, record net payment amount on sale
                $effectivePayAmt = ($pay['payment_method'] === 'cash' && count($validPayments) === 1 && $payAmt > $grandTotal) ? $grandTotal : $payAmt;

                SalePayment::create([
                    'sale_id' => $sale->id,
                    'financial_account_id' => $pay['financial_account_id'] ?? null,
                    'payment_method' => $pay['payment_method'] ?? 'cash',
                    'amount' => $effectivePayAmt,
                    'reference_number' => $pay['reference_number'] ?? null,
                    'notes' => $payAmt > $effectivePayAmt ? "Cash Tendered: ৳" . number_format($payAmt, 2) . " (Change: ৳" . number_format($payAmt - $effectivePayAmt, 2) . ")" : ($pay['notes'] ?? null),
                    'collected_by' => $userId,
                    'paid_at' => now(),
                ]);

                if (!empty($pay['financial_account_id'])) {
                    $finAcc = \App\Models\FinancialAccount::find($pay['financial_account_id']);
                    if ($finAcc) {
                        $finAcc->increment('current_balance', $effectivePayAmt);
                    }
                }
            }

            // Load payments relation for accurate journal entries
            $sale->load('payments');

            // Post Accounting Journal Entry
            AccountingService::recordSaleJournal($sale);

            AuditLogger::log("sales.created", $sale, null, [
                'sale_number' => $saleNumber,
                'customer' => $sale->customer_name,
                'grand_total' => $grandTotal,
                'sales_channel' => $sale->sales_channel,
            ]);

            return $sale->load(['items.product', 'payments']);
        });
    }

    /**
     * Process sale refund and restock returned items.
     */
    public static function refundSale(int $saleId, array $items, float $refundAmount, string $paymentMethod, ?string $reason = null, ?int $userId = null): SaleReturn
    {
        return DB::transaction(function () use ($saleId, $items, $refundAmount, $paymentMethod, $reason, $userId) {
            $sale = Sale::with('items')->lockForUpdate()->findOrFail($saleId);

            $returnNumber = 'RET-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $saleReturn = SaleReturn::create([
                'return_number' => $returnNumber,
                'sale_id' => $sale->id,
                'customer_id' => $sale->customer_id,
                'warehouse_id' => $sale->warehouse_id,
                'refund_amount' => $refundAmount,
                'payment_method' => $paymentMethod,
                'reason' => $reason,
                'processed_by' => $userId,
            ]);

            foreach ($items as $item) {
                $productId = (int)$item['product_id'];
                $qty = (int)$item['quantity_returned'];
                $unitPrice = (float)$item['unit_price'];
                $lineTotal = $qty * $unitPrice;

                SaleReturnItem::create([
                    'sale_return_id' => $saleReturn->id,
                    'product_id' => $productId,
                    'quantity_returned' => $qty,
                    'unit_price' => $unitPrice,
                    'refund_line_total' => $lineTotal,
                ]);

                // Restock returned product
                WarehouseInventoryService::adjustStock(
                    productId: $productId,
                    warehouseId: $sale->warehouse_id,
                    quantityChange: $qty,
                    type: 'return',
                    referenceType: SaleReturn::class,
                    referenceId: $saleReturn->id,
                    userId: $userId,
                    notes: "Customer return for Sale #{$sale->sale_number} (Ref: #{$returnNumber})"
                );
            }

            $sale->status = 'refunded';
            $sale->payment_status = 'refunded';
            $sale->save();

            AuditLogger::log("sales.refunded", $saleReturn, null, [
                'sale_number' => $sale->sale_number,
                'return_number' => $returnNumber,
                'refund_amount' => $refundAmount,
            ]);

            return $saleReturn;
        });
    }
}
