<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\FlashSaleItem;
use App\Models\Product;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FlashSaleController extends Controller
{
    public function index()
    {
        $flashSales = FlashSale::with('items.product')->latest()->get();
        $products = Product::select('id', 'title', 'price', 'sku')->get();

        return Inertia::render('Admin/FlashSales/Index', [
            'flashSales' => $flashSales,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_active' => 'boolean',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.flash_price' => 'required|numeric|min:0',
        ]);

        $flashSale = FlashSale::create([
            'title' => $validated['title'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        foreach ($validated['items'] as $item) {
            FlashSaleItem::create([
                'flash_sale_id' => $flashSale->id,
                'product_id' => $item['product_id'],
                'flash_price' => $item['flash_price'],
            ]);
        }

        AuditLogger::log('flash_sale.created', $flashSale, null, $validated);

        return back()->with('success', 'Flash Sale campaign created.');
    }

    public function toggle(FlashSale $flashSale)
    {
        $flashSale->update(['is_active' => !$flashSale->is_active]);
        AuditLogger::log('flash_sale.toggled', $flashSale, null, ['is_active' => $flashSale->is_active]);
        return back()->with('success', 'Flash Sale status updated.');
    }

    public function destroy(FlashSale $flashSale)
    {
        AuditLogger::log('flash_sale.deleted', $flashSale, $flashSale->toArray(), null);
        $flashSale->delete();
        return back()->with('success', 'Flash Sale deleted.');
    }
}
