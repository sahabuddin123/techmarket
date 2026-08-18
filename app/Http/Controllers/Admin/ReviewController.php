<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = ProductReview::with(['product', 'user'])->latest()->paginate(15);

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }

    public function updateStatus(Request $request, ProductReview $review)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'admin_reply' => 'nullable|string',
        ]);

        $review->update($validated);
        AuditLogger::log('review.updated', $review, null, $validated);

        return back()->with('success', 'Review status updated.');
    }

    public function destroy(ProductReview $review)
    {
        AuditLogger::log('review.deleted', $review, $review->toArray(), null);
        $review->delete();
        return back()->with('success', 'Review deleted.');
    }
}
