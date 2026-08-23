<?php

namespace App\Http\Controllers;

use App\Enums\Cctv\CctvQuoteStatus;
use App\Models\Cctv\CctvQuote;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CctvQuoteViewController extends Controller
{
    /**
     * Public Commercial Quotation View via Secure Share Token.
     */
    public function show(string $token, Request $request): Response
    {
        $quote = CctvQuote::with(['estimate.items', 'user', 'parentQuote'])
            ->where('share_token', $token)
            ->firstOrFail();

        // If newly opened by customer, mark as viewed/sent
        if ($quote->status === CctvQuoteStatus::DRAFT) {
            $quote->update(['status' => CctvQuoteStatus::ISSUED]);
        }

        $versionKey = Setting::get('active_theme', 'v3');

        $companyInfo = [
            'name' => Setting::get('site_name', 'TechMarket BD'),
            'tagline' => Setting::get('site_tagline', 'Premier IT & Surveillance Solutions Provider'),
            'email' => Setting::get('site_email', 'sales@techmarketbd.com'),
            'phone' => Setting::get('site_phone', '+880 1700-000000'),
            'address' => Setting::get('site_address', 'Multiplan Center, Level 9, New Elephant Road, Dhaka-1205'),
            'website' => url('/'),
            'logo' => Setting::get('site_logo'),
            'terms' => Setting::get('cctv_quote_terms', "1. This quotation is valid until the stated expiration date.\n2. Standard 1-Year hardware warranty applies to cameras and recorders.\n3. Installation includes physical cabling, camera mounting, and mobile application live view setup.\n4. 50% advance required upon work order confirmation."),
            'warranty' => Setting::get('cctv_quote_warranty', 'All surveillance hardware carries official manufacturer warranty. Burnt/physical damages are void from warranty coverage.'),
        ];

        return Inertia::render('CctvQuoteView', [
            'storefront_version' => $versionKey,
            'quote' => $quote,
            'company' => $companyInfo,
            'shareUrl' => route('cctvQuote.show', ['token' => $token]),
        ]);
    }

    /**
     * Server-rendered clean printable quotation document.
     */
    public function print(string $token)
    {
        $quote = CctvQuote::with(['estimate.items', 'user'])
            ->where('share_token', $token)
            ->firstOrFail();

        $companyName = Setting::get('site_name', 'TechMarket BD');
        $companyEmail = Setting::get('site_email', 'sales@techmarketbd.com');
        $companyPhone = Setting::get('site_phone', '+880 1700-000000');
        $companyAddress = Setting::get('site_address', 'Multiplan Center, Level 9, New Elephant Road, Dhaka-1205');
        $terms = Setting::get('cctv_quote_terms', '1. Valid until expiration date. 2. 1-Year standard hardware warranty. 3. 50% advance upon order confirmation.');

        return view('cctv.quote-print', compact('quote', 'companyName', 'companyEmail', 'companyPhone', 'companyAddress', 'terms'));
    }

    /**
     * Customer Approves Quote Online.
     */
    public function approve(string $token, Request $request): JsonResponse
    {
        $quote = CctvQuote::where('share_token', $token)->firstOrFail();

        if ($quote->isExpired()) {
            return response()->json([
                'status' => 'error',
                'message' => 'This commercial quotation has expired. Please request an updated quotation.',
            ], 422);
        }

        $quote->update([
            'status' => CctvQuoteStatus::ACCEPTED,
            'approved_at' => now(),
            'approval_ip' => $request->ip(),
            'approval_user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Commercial quotation successfully approved.',
            'data' => $quote,
        ]);
    }

    /**
     * Convert Approved Quote to Commerce Cart with live validation.
     */
    public function convertToCart(string $token, Request $request): JsonResponse
    {
        $quote = CctvQuote::with('estimate.items')
            ->where('share_token', $token)
            ->firstOrFail();

        if ($quote->isExpired()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot convert expired quotation to cart. Please request an updated quotation.',
            ], 422);
        }

        $cart = session()->get('cart', []);
        $priceChanges = [];
        $outOfStock = [];
        $items = $quote->estimate?->items ?? [];

        foreach ($items as $item) {
            $productId = $item->product_id;
            if (!$productId) continue;

            $product = Product::find($productId);
            if (!$product || !$product->is_active || $product->stock <= 0) {
                $outOfStock[] = $item->product_name_snapshot;
                continue;
            }

            $currentPrice = (float) $product->price;
            $quotePrice = (float) $item->unit_price_snapshot;

            if (abs($currentPrice - $quotePrice) > 0.01) {
                $priceChanges[] = [
                    'product' => $product->title,
                    'quoted_price' => $quotePrice,
                    'current_price' => $currentPrice,
                ];
            }

            $qty = max(1, (int) ceil($item->quantity));

            $cart[$productId] = [
                'id' => $productId,
                'title' => $product->title,
                'sku' => $product->sku,
                'price' => $currentPrice,
                'quantity' => $qty,
                'total' => $currentPrice * $qty,
                'image' => $product->image,
                'is_cctv_item' => true,
                'cctv_quote_id' => $quote->id,
                'cctv_estimate_id' => $quote->estimate_id,
            ];
        }

        if (!empty($outOfStock)) {
            return response()->json([
                'status' => 'warning',
                'message' => 'Some hardware in this quotation is currently out of stock.',
                'out_of_stock_items' => $outOfStock,
            ], 422);
        }

        session()->put('cart', $cart);

        // Update quote status to converted_to_order
        $quote->update(['status' => CctvQuoteStatus::CONVERTED_TO_ORDER]);

        return response()->json([
            'status' => 'success',
            'message' => 'Quotation successfully converted to checkout cart.',
            'data' => [
                'cart_count' => count($cart),
                'price_changes' => $priceChanges,
                'checkout_url' => url('/checkout'),
            ],
        ]);
    }
}
