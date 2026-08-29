<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    /**
     * Display the wishlist page with all added products.
     */
    public function index(Request $request)
    {
        if (auth()->check()) {
            $wishlistItems = Wishlist::with('product')
                ->where('user_id', auth()->id())
                ->latest()
                ->get();
            
            // Format to standard list
            $products = $wishlistItems->map(fn($w) => $w->product)->filter();
        } else {
            $sessionIds = $request->session()->get('wishlist_ids', []);
            $products = Product::whereIn('id', $sessionIds)->get();
            
            // Wrap in simulated wishlist structure for page consistency
            $wishlistItems = $products->map(function ($p) {
                return (object)[
                    'id' => 'session_' . $p->id,
                    'product_id' => $p->id,
                    'product' => $p,
                    'created_at' => now(),
                ];
            });
        }

        return Inertia::render('Wishlist', [
            'wishlists' => $wishlistItems,
            'products' => $products,
        ]);
    }

    /**
     * Toggle a product in/out of the user's or guest's wishlist.
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $productId = (int)$validated['product_id'];
        $product = Product::find($productId);

        if (auth()->check()) {
            $userId = auth()->id();
            $existing = Wishlist::where('user_id', $userId)
                ->where('product_id', $productId)
                ->first();

            if ($existing) {
                $existing->delete();
                $message = ($product ? $product->title : 'Product') . ' removed from Wishlist.';
                $status = 'removed';
            } else {
                Wishlist::create([
                    'user_id' => $userId,
                    'product_id' => $productId,
                ]);
                $message = ($product ? $product->title : 'Product') . ' added to your Wishlist!';
                $status = 'added';
            }
        } else {
            $sessionIds = $request->session()->get('wishlist_ids', []);
            if (!is_array($sessionIds)) $sessionIds = [];

            if (in_array($productId, $sessionIds)) {
                $sessionIds = array_values(array_diff($sessionIds, [$productId]));
                $message = ($product ? $product->title : 'Product') . ' removed from Wishlist.';
                $status = 'removed';
            } else {
                $sessionIds[] = $productId;
                $sessionIds = array_values(array_unique($sessionIds));
                $message = ($product ? $product->title : 'Product') . ' added to your Wishlist!';
                $status = 'added';
            }

            $request->session()->put('wishlist_ids', $sessionIds);
            $request->session()->save();
        }

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'action' => $status,
                'message' => $message,
                'wishlistCount' => auth()->check()
                    ? Wishlist::where('user_id', auth()->id())->count()
                    : count($request->session()->get('wishlist_ids', [])),
            ]);
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Merge guest session wishlist items into authenticated user database upon login.
     */
    public function merge(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        if (auth()->check()) {
            $userId = auth()->id();
            foreach ($validated['product_ids'] as $pid) {
                Wishlist::firstOrCreate([
                    'user_id' => $userId,
                    'product_id' => (int)$pid,
                ]);
            }
            $request->session()->forget('wishlist_ids');
            $request->session()->save();
        }

        return response()->json(['status' => 'success']);
    }
}
