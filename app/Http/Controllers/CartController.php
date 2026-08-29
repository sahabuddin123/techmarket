<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Coupon;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = session()->get('cart', []);
        
        $rawSubtotal = 0.00;
        $saleTotal = 0.00;
        $totalItems = 0;
        $formattedCart = [];

        foreach ($cart as $key => $item) {
            $unitPrice = (float)($item['price'] ?? 0);
            $regPrice = (float)($item['regular_price'] ?? $unitPrice);
            $qty = max(1, (int)($item['quantity'] ?? 1));
            
            $itemRawSubtotal = $regPrice * $qty;
            $itemSaleSubtotal = $unitPrice * $qty;
            $itemSavings = max(0, $itemRawSubtotal - $itemSaleSubtotal);

            $rawSubtotal += $itemRawSubtotal;
            $saleTotal += $itemSaleSubtotal;
            $totalItems += $qty;

            $formattedCart[] = array_merge($item, [
                'price' => $unitPrice,
                'regular_price' => $regPrice,
                'quantity' => $qty,
                'total' => $itemSaleSubtotal,
                'savings' => $itemSavings,
            ]);
        }

        // Calculate Discounts:
        // 1. Base Savings (difference between regular price and current selling price)
        $baseSavings = max(0, $rawSubtotal - $saleTotal);

        // 2. Applied Coupon
        $couponSession = session()->get('cart_coupon');
        $couponDiscount = 0.00;
        $appliedCoupon = null;

        if ($couponSession) {
            $coupon = Coupon::where('code', strtoupper($couponSession))->where('is_active', true)->first();
            if ($coupon && $coupon->isValidFor($saleTotal)) {
                $couponDiscount = $coupon->calculateDiscount($saleTotal);
                $appliedCoupon = [
                    'code' => $coupon->code,
                    'discount' => $couponDiscount,
                    'type' => $coupon->type,
                    'value' => $coupon->value,
                ];
            } else {
                session()->forget('cart_coupon');
            }
        }

        // 3. Applied Loyalty Points
        $pointsSession = (int)session()->get('cart_points', 0);
        $pointsDiscount = 0.00;
        $appliedPoints = null;

        if ($pointsSession > 0 && auth()->check()) {
            $userBalance = LoyaltyService::getUserBalance(auth()->user());
            $validPoints = min($pointsSession, $userBalance);
            if ($validPoints > 0) {
                // 1 point = 1 BDT
                $pointsDiscount = min((float)$validPoints, max(0, $saleTotal - $couponDiscount));
                $appliedPoints = [
                    'points' => $validPoints,
                    'discount' => $pointsDiscount,
                ];
            } else {
                session()->forget('cart_points');
            }
        }

        $totalDiscount = $baseSavings + $couponDiscount + $pointsDiscount;
        $grandTotal = max(0, $rawSubtotal - $totalDiscount);

        // Available Reward Points for logged-in user
        $availablePoints = auth()->check() ? LoyaltyService::getUserBalance(auth()->user()) : 0;

        return Inertia::render('Cart', [
            'cart' => $formattedCart,
            'summary' => [
                'subtotal' => $rawSubtotal,
                'base_subtotal' => $saleTotal,
                'discount' => $totalDiscount,
                'base_savings' => $baseSavings,
                'coupon_discount' => $couponDiscount,
                'points_discount' => $pointsDiscount,
                'total' => $grandTotal,
                'item_count' => $totalItems,
                'coupon' => $appliedCoupon,
                'points' => $appliedPoints,
                'available_points' => $availablePoints,
            ],
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $productId = $request->input('product_id');
        $quantity = (int)$request->input('quantity', 1);

        $product = Product::with('brand')->findOrFail($productId);
        $cart = session()->get('cart', []);

        $regularPrice = (float)($product->regular_price ?: $product->price);
        $sellingPrice = (float)$product->price;

        if (isset($cart[$productId])) {
            $cart[$productId]['quantity'] += $quantity;
            $cart[$productId]['total'] = $cart[$productId]['quantity'] * $sellingPrice;
        } else {
            $cart[$productId] = [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'price' => $sellingPrice,
                'regular_price' => $regularPrice,
                'image' => $product->image,
                'sku' => $product->sku,
                'brand_name' => $product->brand ? $product->brand->name : null,
                'quantity' => $quantity,
                'total' => $quantity * $sellingPrice,
                'warranty' => $product->warranty,
            ];
        }

        session()->put('cart', $cart);
        session()->save();

        if ($request->boolean('buy_now') || $request->input('buy_now') === '1' || $request->input('buy_now') === 'true') {
            return redirect()->to('/checkout');
        }

        return back()->with('message', 'Product added to cart successfully!');
    }

    public function update(Request $request)
    {
        $request->validate([
            'product_id' => 'required',
            'quantity' => 'required|integer|min:1',
        ]);

        $productId = $request->input('product_id');
        $quantity = (int)$request->input('quantity');

        $cart = session()->get('cart', []);

        if (isset($cart[$productId])) {
            $cart[$productId]['quantity'] = $quantity;
            $cart[$productId]['total'] = $quantity * (float)$cart[$productId]['price'];
            session()->put('cart', $cart);
        }

        return back()->with('message', 'Cart updated.');
    }

    public function remove(Request $request)
    {
        $request->validate([
            'product_id' => 'required',
        ]);

        $productId = $request->input('product_id');
        $cart = session()->get('cart', []);

        if (isset($cart[$productId])) {
            unset($cart[$productId]);
            session()->put('cart', $cart);
        }

        return back()->with('message', 'Product removed from cart.');
    }

    public function clear()
    {
        session()->forget(['cart', 'cart_coupon', 'cart_points']);
        return back()->with('message', 'Cart cleared.');
    }

    public function addMultiple(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
        ]);

        $cart = session()->get('cart', []);

        foreach ($request->input('items') as $item) {
            $product = Product::with('brand')->find($item['product_id']);
            if (!$product) continue;

            $pId = $product->id;
            $regularPrice = (float)($product->regular_price ?: $product->price);
            $sellingPrice = (float)$product->price;

            if (isset($cart[$pId])) {
                $cart[$pId]['quantity'] += 1;
                $cart[$pId]['total'] = $cart[$pId]['quantity'] * $sellingPrice;
            } else {
                $cart[$pId] = [
                    'id' => $product->id,
                    'title' => $product->title,
                    'slug' => $product->slug,
                    'price' => $sellingPrice,
                    'regular_price' => $regularPrice,
                    'image' => $product->image,
                    'sku' => $product->sku,
                    'brand_name' => $product->brand ? $product->brand->name : null,
                    'quantity' => 1,
                    'total' => $sellingPrice,
                    'warranty' => $product->warranty,
                ];
            }
        }

        session()->put('cart', $cart);

        return redirect()->route('cart.index')->with('message', 'PC Build added to cart!');
    }

    public function applyCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = strtoupper(trim($request->input('code')));
        $coupon = Coupon::where('code', $code)->where('is_active', true)->first();

        if (!$coupon) {
            return back()->withErrors(['coupon' => 'Invalid or inactive promo code.']);
        }

        $cart = session()->get('cart', []);
        $cartSubtotal = array_reduce($cart, fn($carry, $item) => $carry + ((float)$item['price'] * (int)$item['quantity']), 0.0);

        if (!$coupon->isValidFor($cartSubtotal)) {
            return back()->withErrors(['coupon' => 'Promo code requirements not met or minimum spend not reached.']);
        }

        session()->put('cart_coupon', $coupon->code);

        return back()->with('message', "Promo code '{$coupon->code}' applied successfully!");
    }

    public function removeCoupon()
    {
        session()->forget('cart_coupon');
        return back()->with('message', 'Promo code removed.');
    }

    public function applyPoints(Request $request)
    {
        if (!auth()->check()) {
            return back()->withErrors(['points' => 'Please log in to redeem reward points.']);
        }

        $request->validate([
            'points' => 'required|integer|min:1',
        ]);

        $points = (int)$request->input('points');
        $userBalance = LoyaltyService::getUserBalance(auth()->user());

        if ($points > $userBalance) {
            return back()->withErrors(['points' => "Insufficient reward points. You have {$userBalance} points available."]);
        }

        session()->put('cart_points', $points);

        return back()->with('message', "Successfully applied {$points} reward points!");
    }

    public function removePoints()
    {
        session()->forget('cart_points');
        return back()->with('message', 'Reward points removed.');
    }
}
