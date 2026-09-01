<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ComparisonService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompareController extends Controller
{
    /**
     * Display the side-by-side product comparison page.
     */
    public function index(Request $request)
    {
        $rawIds = $request->input('ids');
        $explicitIds = null;

        if ($rawIds !== null) {
            if (is_string($rawIds)) {
                $explicitIds = array_filter(explode(',', $rawIds));
            } elseif (is_array($rawIds)) {
                $explicitIds = array_filter($rawIds);
            }
            if ($explicitIds !== null) {
                ComparisonService::setSessionIds($explicitIds);
            }
        }

        $sessionIds = ComparisonService::getSessionIds();
        $products = ComparisonService::getComparedProducts($sessionIds);
        $specMatrix = ComparisonService::buildSpecificationMatrix($products);
        $maxCompare = ComparisonService::getMaxItems();

        $formattedProducts = $products->map(function ($p) {
            $regPrice = (float)($p->regular_price ?: $p->price);
            $price = (float)$p->price;
            return [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'sku' => $p->sku,
                'image' => $p->image ?: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop',
                'price' => $price,
                'regular_price' => $regPrice,
                'savings' => max(0, $regPrice - $price),
                'stock' => (int)$p->stock,
                'in_stock' => $p->stock > 0,
                'warranty' => $p->warranty ?: 'No Warranty',
                'brand' => $p->brand ? ['name' => $p->brand->name, 'slug' => $p->brand->slug] : null,
                'category' => $p->category ? ['name' => $p->category->name, 'slug' => $p->category->slug] : null,
            ];
        })->values()->all();

        return Inertia::render('Compare', [
            'products' => $formattedProducts,
            'specMatrix' => $specMatrix,
            'maxCompare' => $maxCompare,
            'compareCount' => count($formattedProducts),
        ]);
    }

    /**
     * Add a product to the comparison list.
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
        ]);

        $productId = (int)$request->input('product_id');
        $product = Product::with(['category.parent'])->find($productId);

        if (!$product) {
            return redirect()->back()->with('error', 'The selected product does not exist or has been removed.');
        }

        $currentIds = ComparisonService::getSessionIds();
        $max = ComparisonService::getMaxItems();

        if (in_array($productId, $currentIds)) {
            // Toggle: remove if already in compare list
            $currentIds = array_values(array_diff($currentIds, [$productId]));
            ComparisonService::setSessionIds($currentIds);
            $message = "{$product->title} removed from comparison.";
            $action = 'removed';
        } else {
            if (count($currentIds) >= $max) {
                array_shift($currentIds); // Evict oldest product if limit reached
            }
            $currentIds[] = $productId;
            ComparisonService::setSessionIds($currentIds);
            $message = "{$product->title} added to comparison list.";
            $action = 'added';
        }

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'status' => 'success',
                'action' => $action,
                'message' => $message,
                'compareCount' => count($currentIds),
            ]);
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Remove a single product from the comparison list.
     */
    public function remove(Request $request, Product $product)
    {
        $currentIds = ComparisonService::getSessionIds();
        $newIds = array_diff($currentIds, [$product->id]);
        ComparisonService::setSessionIds($newIds);

        return redirect()->back()->with('success', "{$product->title} removed from comparison.");
    }

    /**
     * Search products to add into comparison.
     */
    public function search(Request $request)
    {
        $q = trim($request->input('q', ''));
        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $currentIds = ComparisonService::getSessionIds();

        $products = Product::with(['brand', 'category'])
            ->where('is_active', '!=', false)
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%")
                    ->orWhereHas('brand', fn($b) => $b->where('name', 'like', "%{$q}%"));
            })
            ->whereNotIn('id', $currentIds)
            ->limit(10)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'sku' => $p->sku,
                    'price' => (float)$p->price,
                    'regular_price' => (float)($p->regular_price ?: $p->price),
                    'image' => $p->image ?: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop',
                    'brand' => $p->brand?->name,
                    'category' => $p->category?->name,
                    'in_stock' => $p->stock > 0,
                ];
            });

        return response()->json($products);
    }

    /**
     * Clear all products from the comparison list.
     */
    public function clear(Request $request)
    {
        ComparisonService::setSessionIds([]);

        return redirect()->route('compare')->with('success', 'Comparison list cleared.');
    }
}
