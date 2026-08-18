<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index()
    {
        $wishlists = Wishlist::with('product')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('Wishlist', [
            'wishlists' => $wishlists,
        ]);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = auth()->id();
        $productId = (int)$validated['product_id'];

        $existing = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            return back()->with('success', 'Removed from Wishlist.');
        }

        Wishlist::create([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);

        return back()->with('success', 'Added to Wishlist!');
    }

    public function merge(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $userId = auth()->id();

        foreach ($validated['product_ids'] as $pid) {
            Wishlist::firstOrCreate([
                'user_id' => $userId,
                'product_id' => $pid,
            ]);
        }

        return response()->json(['status' => 'success']);
    }
}
