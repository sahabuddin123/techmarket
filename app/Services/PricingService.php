<?php

namespace App\Services;

use App\Models\Product;
use App\Models\FlashSaleItem;
use App\Models\Coupon;
use Carbon\Carbon;

class PricingService
{
    /**
     * Resolve the authoritative final price for a product based on active Flash Sales or Sale Prices.
     */
    public static function resolveProductPrice(Product $product): array
    {
        $now = Carbon::now();

        // Priority 1: Check active Flash Sale
        $flashItem = FlashSaleItem::where('product_id', $product->id)
            ->whereHas('flashSale', function ($q) use ($now) {
                $q->where('is_active', true)
                  ->where('start_time', '<=', $now)
                  ->where('end_time', '>=', $now);
            })
            ->first();

        if ($flashItem) {
            return [
                'final_price' => (float)$flashItem->flash_price,
                'original_price' => (float)($product->regular_price ?: $product->price),
                'discount_source' => 'flash_sale',
                'savings' => (float)(($product->regular_price ?: $product->price) - $flashItem->flash_price),
            ];
        }

        // Priority 2: Standard Product Sale Price vs Regular Price
        $effectivePrice = (float)$product->price;
        $originalPrice = (float)($product->regular_price ?: $product->price);

        return [
            'final_price' => $effectivePrice,
            'original_price' => $originalPrice,
            'discount_source' => $originalPrice > $effectivePrice ? 'product_sale' : 'none',
            'savings' => max(0, $originalPrice - $effectivePrice),
        ];
    }

    /**
     * Calculate authoritative Cart/Order total with Coupon & Shipping.
     */
    public static function calculateOrderTotal(array $cartItems, ?string $couponCode = null, float $shippingCost = 60.00): array
    {
        $subtotal = 0.00;
        $processedItems = [];

        foreach ($cartItems as $item) {
            $product = Product::findOrFail($item['product_id']);
            $priceData = self::resolveProductPrice($product);
            $qty = max(1, (int)$item['quantity']);

            $itemSubtotal = $priceData['final_price'] * $qty;
            $subtotal += $itemSubtotal;

            $processedItems[] = [
                'product' => $product,
                'unit_price' => $priceData['final_price'],
                'quantity' => $qty,
                'subtotal' => $itemSubtotal,
            ];
        }

        $discount = 0.00;
        $coupon = null;

        if ($couponCode) {
            $coupon = Coupon::where('code', strtoupper($couponCode))->where('is_active', true)->first();
            if ($coupon && $coupon->isValidFor($subtotal)) {
                $discount = $coupon->calculateDiscount($subtotal);
            }
        }

        $grandTotal = max(0, ($subtotal - $discount) + $shippingCost);

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping_cost' => $shippingCost,
            'total' => $grandTotal,
            'coupon' => $coupon,
            'items' => $processedItems,
        ];
    }
}
