<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\InventoryMovement;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
        }

        if ($request->filled('stock_status')) {
            if ($request->input('stock_status') === 'low') {
                $query->where('stock', '>', 0)->where('stock', '<=', 5);
            } elseif ($request->input('stock_status') === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }
        }

        $products = $query->latest()->paginate(10)->withQueryString();

        $movements = InventoryMovement::with(['product', 'user'])
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'movements' => $movements,
            'filters' => $request->only(['search', 'stock_status']),
        ]);
    }

    public function adjust(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:purchase,adjustment,return,damaged',
            'quantity' => 'required|integer|not_in:0',
            'notes' => 'required|string|max:500',
        ]);

        InventoryService::adjustStock(
            productId: (int)$validated['product_id'],
            quantityChange: (int)$validated['quantity'],
            type: $validated['type'],
            userId: auth()->id(),
            notes: $validated['notes']
        );

        return back()->with('success', 'Stock adjustment recorded successfully.');
    }
}
