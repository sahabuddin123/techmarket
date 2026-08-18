<?php

namespace App\Http\Controllers;

use App\Models\ProductAlert;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductAlertController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:back_in_stock,price_drop',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $alert = ProductAlert::firstOrCreate([
            'user_id' => auth()->id(),
            'product_id' => $product->id,
            'type' => $validated['type'],
        ], [
            'reference_price' => $product->price,
            'status' => 'active',
        ]);

        return back()->with('success', 'Subscribed to alert successfully!');
    }
}
