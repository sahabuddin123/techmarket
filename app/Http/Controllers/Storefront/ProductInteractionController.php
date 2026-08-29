<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductQuestion;
use App\Models\User;
use Illuminate\Http\Request;

class ProductInteractionController extends Controller
{
    /**
     * Store a product review submitted by a customer/visitor.
     */
    public function storeReview(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:2000',
            'title' => 'nullable|string|max:255',
        ]);

        $userId = $request->user()?->id;
        if (!$userId) {
            $defaultUser = User::first();
            $userId = $defaultUser ? $defaultUser->id : null;
        }

        // Auto approve review so it shows up
        $status = 'approved';

        $review = ProductReview::create([
            'product_id' => $validated['product_id'],
            'user_id' => $userId,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'],
            'status' => $status,
        ]);

        return back()->with('message', 'Thank you! Your review has been submitted successfully.');
    }

    /**
     * Store a product question asked by a customer/visitor.
     */
    public function storeQuestion(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'question' => 'required|string|max:1000',
        ]);

        $userId = $request->user()?->id;
        if (!$userId) {
            $defaultUser = User::first();
            $userId = $defaultUser ? $defaultUser->id : null;
        }

        $question = ProductQuestion::create([
            'product_id' => $validated['product_id'],
            'user_id' => $userId,
            'question' => $validated['question'],
            'status' => 'pending',
        ]);

        return back()->with('message', 'Thank you! Your question has been submitted. Our team will answer soon.');
    }
}
