<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Models\StockTransfer;
use App\Models\StockCount;
use App\Models\InventoryMovement;
use App\Services\Inventory\WarehouseInventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display inventory overview, stock list, and valuation summary.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['category:id,name', 'brand:id,name']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->query('filter') === 'low_stock') {
            $query->where('stock', '>', 0)->where('stock', '<=', 5);
        } elseif ($request->query('filter') === 'out_of_stock') {
            $query->where('stock', '<=', 0);
        }

        $products = $query->orderBy('title')->paginate(15)->withQueryString();
        $warehouses = Warehouse::where('is_active', true)->get();
        $valuation = WarehouseInventoryService::getValuationSummary();
        $recentMovements = InventoryMovement::with(['product:id,title,sku', 'user:id,name', 'warehouse:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get();

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'warehouses' => $warehouses,
            'valuation' => $valuation,
            'movements' => $recentMovements,
            'filters' => $request->only(['search', 'filter']),
        ]);
    }

    /**
     * Atomically adjust stock for a product.
     */
    public function adjust(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'quantity' => 'required|integer',
            'type' => 'required|in:purchase,adjustment,damaged,lost,found,expired,return',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $product = WarehouseInventoryService::adjustStock(
                productId: (int)$request->input('product_id'),
                warehouseId: $request->input('warehouse_id') ? (int)$request->input('warehouse_id') : null,
                quantityChange: (int)$request->input('quantity'),
                type: $request->input('type'),
                userId: auth()->id(),
                notes: $request->input('notes')
            );

            return back()->with('success', "Stock updated successfully for '{$product->title}'. New stock: {$product->stock}");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Stock Transfers workspace.
     */
    public function transfers(Request $request): Response
    {
        $transfers = StockTransfer::with(['fromWarehouse', 'toWarehouse', 'initiator', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $warehouses = Warehouse::where('is_active', true)->get();
        $products = Product::select('id', 'title', 'sku', 'stock')->where('stock', '>', 0)->get();

        return Inertia::render('Admin/Inventory/Transfers', [
            'transfers' => $transfers,
            'warehouses' => $warehouses,
            'products' => $products,
        ]);
    }

    /**
     * Execute inter-warehouse stock transfer.
     */
    public function storeTransfer(Request $request)
    {
        $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|different:from_warehouse_id|exists:warehouses,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $transfer = WarehouseInventoryService::transferStock(
                fromWarehouseId: (int)$request->input('from_warehouse_id'),
                toWarehouseId: (int)$request->input('to_warehouse_id'),
                items: $request->input('items'),
                notes: $request->input('notes'),
                userId: auth()->id()
            );

            return back()->with('success', "Stock Transfer #{$transfer->transfer_number} completed successfully.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Stock Counting workspace.
     */
    public function counts(Request $request): Response
    {
        $counts = StockCount::with(['warehouse', 'counter', 'approver', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $warehouses = Warehouse::where('is_active', true)->get();
        $products = Product::select('id', 'title', 'sku', 'stock', 'price', 'cost_price')->get();

        return Inertia::render('Admin/Inventory/Counts', [
            'counts' => $counts,
            'warehouses' => $warehouses,
            'products' => $products,
        ]);
    }

    /**
     * Submit physical stock count.
     */
    public function storeCount(Request $request)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.physical_quantity' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $stockCount = WarehouseInventoryService::submitStockCount(
                warehouseId: (int)$request->input('warehouse_id'),
                items: $request->input('items'),
                notes: $request->input('notes'),
                userId: auth()->id()
            );

            return back()->with('success', "Physical Count #{$stockCount->count_number} submitted for review.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Approve and apply stock count variances.
     */
    public function approveCount(StockCount $stockCount)
    {
        try {
            $approved = WarehouseInventoryService::approveStockCount($stockCount->id, auth()->id());
            return back()->with('success', "Stock count #{$approved->count_number} approved and variances reconciled.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
