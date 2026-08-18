<?php

namespace App\Http\Controllers;

use App\Models\EmailPreference;
use App\Models\EmailUnsubscribe;
use App\Services\Email\EmailPreferenceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailUnsubscribeController extends Controller
{
    public function __construct(
        protected EmailPreferenceService $preferenceService
    ) {}

    /**
     * Display public unsubscribe page.
     */
    public function show(string $token)
    {
        $unsub = EmailUnsubscribe::where('token', $token)->first();

        if (!$unsub) {
            abort(404, 'Invalid or expired unsubscribe link.');
        }

        $pref = EmailPreference::where('email', $unsub->email)->first();

        return Inertia::render('Email/Unsubscribe', [
            'token' => $token,
            'email' => $unsub->email,
            'category' => $unsub->category ?? 'marketing',
            'preferences' => [
                'marketing' => $pref ? (bool) $pref->marketing_enabled : true,
                'promotional' => $pref ? (bool) $pref->promotional_enabled : true,
                'product_updates' => $pref ? (bool) $pref->product_updates_enabled : true,
                'order_updates' => $pref ? (bool) $pref->order_updates_enabled : true,
            ],
            'isUnsubscribed' => $unsub->unsubscribed_at !== null,
        ]);
    }

    /**
     * Process unsubscribe submission.
     */
    public function unsubscribe(Request $request, string $token)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
            'category' => 'nullable|string|in:all,marketing,promotional,product_updates,order_updates',
            'preferences' => 'nullable|array',
        ]);

        $unsub = EmailUnsubscribe::where('token', $token)->first();

        if (!$unsub) {
            return back()->with('error', 'Invalid or expired token.');
        }

        $email = $unsub->email;
        $category = $validated['category'] ?? 'all';
        $reason = $validated['reason'] ?? null;

        $this->preferenceService->processUnsubscribe($token, $reason, $category);

        if (!empty($validated['preferences'])) {
            $pref = EmailPreference::firstOrCreate(['email' => strtolower(trim($email))]);
            $pref->update([
                'marketing_enabled' => (bool) ($validated['preferences']['marketing'] ?? false),
                'promotional_enabled' => (bool) ($validated['preferences']['promotional'] ?? false),
                'product_updates_enabled' => (bool) ($validated['preferences']['product_updates'] ?? true),
                'order_updates_enabled' => (bool) ($validated['preferences']['order_updates'] ?? true),
            ]);
        }

        return back()->with('success', 'Your email preferences have been successfully updated.');
    }
}
