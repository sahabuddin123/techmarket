<?php

namespace App\Http\Controllers;

use App\Models\ProductQuestion;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductQuestionController extends Controller
{
    /**
     * Customer submits question for a product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'question' => 'required|string|max:1000',
        ]);

        ProductQuestion::create([
            'product_id' => $validated['product_id'],
            'user_id' => auth()->id(),
            'question' => $validated['question'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Question submitted! It will appear once approved by our tech support team.');
    }

    /**
     * Admin Q&A Moderation List.
     */
    public function adminIndex()
    {
        $questions = ProductQuestion::with(['product', 'user'])->latest()->paginate(15);

        return Inertia::render('Admin/Questions/Index', [
            'questions' => $questions,
        ]);
    }

    /**
     * Admin answers and publishes question.
     */
    public function adminAnswer(Request $request, ProductQuestion $question)
    {
        $validated = $request->validate([
            'answer' => 'required|string|max:1000',
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $question->update($validated);
        AuditLogger::log('question.answered', $question, null, $validated);

        return back()->with('success', 'Question answered and published.');
    }

    /**
     * Admin deletes question.
     */
    public function adminDestroy(ProductQuestion $question)
    {
        AuditLogger::log('question.deleted', $question, $question->toArray(), null);
        $question->delete();
        return back()->with('success', 'Question deleted.');
    }
}
