<?php

namespace App\Services\Pos;

use App\Models\Sale;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use App\Models\FinancialAccount;
use App\Services\Sales\SalesService;
use App\Services\Inventory\WarehouseInventoryService;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Exception;

class PosService
{
    /**
     * Get searchable POS product catalog with live stock and filters.
     */
    public static function getPosCatalog(?string $search = null, ?int $categoryId = null, ?int $brandId = null, ?int $warehouseId = null): array
    {
        $warehouse = $warehouseId ? \App\Models\Warehouse::find($warehouseId) : WarehouseInventoryService::getDefaultWarehouse();

        $query = Product::select('id', 'title', 'slug', 'sku', 'price', 'regular_price', 'stock', 'image', 'category_id', 'brand_id')
            ->with(['category:id,name', 'brand:id,name']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($brandId) {
            $query->where('brand_id', $brandId);
        }

        $products = $query->orderBy('title')->limit(60)->get();

        return [
            'products' => $products,
            'categories' => Category::select('id', 'name', 'slug')->get(),
            'brands' => Brand::select('id', 'name', 'slug')->get(),
            'warehouse' => $warehouse,
            'financial_accounts' => FinancialAccount::where('is_active', true)->get(),
        ];
    }

    /**
     * Complete POS sale with strict server-side validation and atomic execution.
     */
    public static function completeSale(array $payload, int $userId): Sale
    {
        $cartItems = $payload['items'] ?? [];
        if (empty($cartItems)) {
            throw new Exception("Cannot process sale: POS Cart is empty.");
        }

        $payments = $payload['payments'] ?? [];
        if (empty($payments)) {
            $payments = [
                [
                    'payment_method' => 'cash',
                    'amount' => (float)($payload['paid_amount'] ?? $payload['grand_total'] ?? 0),
                ]
            ];
        }

        $saleData = [
            'customer_id' => $payload['customer_id'] ?? null,
            'customer_name' => $payload['customer_name'] ?? 'Walk-in Customer',
            'customer_phone' => $payload['customer_phone'] ?? null,
            'customer_email' => $payload['customer_email'] ?? null,
            'warehouse_id' => $payload['warehouse_id'] ?? null,
            'sales_channel' => 'pos',
            'status' => 'completed',
            'discount_amount' => (float)($payload['discount_amount'] ?? 0.00),
            'discount_type' => $payload['discount_type'] ?? 'fixed',
            'coupon_code' => $payload['coupon_code'] ?? null,
            'tax_amount' => (float)($payload['tax_amount'] ?? 0.00),
            'shipping_charge' => (float)($payload['shipping_charge'] ?? 0.00),
            'notes' => $payload['notes'] ?? 'POS In-Store Sale',
        ];

        return SalesService::createSale($saleData, $cartItems, $payments, $userId);
    }

    /**
     * Hold a POS cart for later retrieval.
     */
    public static function holdCart(array $payload, int $userId): Sale
    {
        $saleNumber = 'HOLD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        $sale = Sale::create([
            'sale_number' => $saleNumber,
            'customer_id' => $payload['customer_id'] ?? null,
            'customer_name' => $payload['customer_name'] ?? 'Held Cart',
            'customer_phone' => $payload['customer_phone'] ?? null,
            'customer_email' => $payload['customer_email'] ?? null,
            'salesperson_id' => $userId,
            'sales_channel' => 'pos',
            'status' => 'draft',
            'payment_status' => 'unpaid',
            'subtotal' => (float)($payload['subtotal'] ?? 0.00),
            'discount_amount' => (float)($payload['discount_amount'] ?? 0.00),
            'tax_amount' => (float)($payload['tax_amount'] ?? 0.00),
            'grand_total' => (float)($payload['grand_total'] ?? 0.00),
            'notes' => $payload['notes'] ?? 'POS Held Order',
            'is_held' => true,
            'held_at' => now(),
        ]);

        foreach ($payload['items'] as $item) {
            $product = Product::find($item['product_id']);
            \App\Models\SaleItem::create([
                'sale_id' => $sale->id,
                'product_id' => $item['product_id'],
                'product_title' => $product?->title ?? 'Product',
                'sku' => $product?->sku,
                'unit_price' => (float)($item['unit_price'] ?? $product?->price ?? 0),
                'cost_price' => (float)($product?->cost_price ?? $product?->price * 0.8),
                'quantity' => (int)$item['quantity'],
                'line_discount' => (float)($item['line_discount'] ?? 0),
                'tax_amount' => 0.00,
                'line_total' => (float)($item['quantity'] * ($item['unit_price'] ?? $product?->price ?? 0)),
            ]);
        }

        AuditLogger::log("pos.cart_held", $sale, null, ['sale_number' => $saleNumber]);

        return $sale;
    }

    /**
     * Get currently held POS sales.
     */
    public static function getHeldSales()
    {
        return Sale::with('items.product')
            ->where('is_held', true)
            ->where('status', 'draft')
            ->orderBy('held_at', 'desc')
            ->get();
    }
}
