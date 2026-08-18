<?php

namespace App\Services\Email;

use App\Models\EmailPreference;
use App\Models\EmailUnsubscribe;
use App\Models\User;
use Illuminate\Support\Str;

class EmailPreferenceService
{
    /**
     * Determine if email is enabled for a given category.
     * Transactional and Security alerts remain enabled unless globally blocked.
     */
    public function canReceiveEmail(string $email, string $category = 'transactional'): bool
    {
        $email = strtolower(trim($email));
        $category = strtolower($category);

        $pref = EmailPreference::where('email', $email)->first();
        if (!$pref) {
            return true; // Enabled by default
        }

        // Complete unsubscribe check
        if ($pref->unsubscribed_at !== null && in_array($category, ['marketing', 'promotional', 'product_updates'])) {
            return false;
        }

        return match ($category) {
            'marketing', 'promotional' => $pref->promotional_enabled && $pref->marketing_enabled,
            'product_updates' => $pref->product_updates_enabled,
            'order_updates' => $pref->order_updates_enabled,
            'security_alerts', 'security' => $pref->security_alerts_enabled,
            'transactional' => $pref->transactional_enabled,
            default => true,
        };
    }

    /**
     * Get or generate a secure unsubscribe URL for an email.
     */
    public function getUnsubscribeUrl(string $email, ?string $category = null): string
    {
        $email = strtolower(trim($email));
        $record = EmailUnsubscribe::where('email', $email)->first();

        if (!$record) {
            $token = Str::random(32);
            $record = EmailUnsubscribe::create([
                'email' => $email,
                'category' => $category,
                'token' => $token,
            ]);
        }

        return url("/email/unsubscribe/{$record->token}");
    }

    /**
     * Process unsubscribe request by token.
     */
    public function processUnsubscribe(string $token, ?string $reason = null, ?string $category = null): bool
    {
        $unsub = EmailUnsubscribe::where('token', $token)->first();
        if (!$unsub) {
            return false;
        }

        $email = strtolower($unsub->email);
        $unsub->update([
            'reason' => $reason,
            'category' => $category ?? 'all',
            'unsubscribed_at' => now(),
        ]);

        $pref = EmailPreference::firstOrCreate(['email' => $email]);

        if (empty($category) || $category === 'all' || $category === 'marketing') {
            $pref->update([
                'marketing_enabled' => false,
                'promotional_enabled' => false,
                'product_updates_enabled' => false,
                'unsubscribed_at' => now(),
            ]);
        } elseif ($category === 'product_updates') {
            $pref->update(['product_updates_enabled' => false]);
        } elseif ($category === 'order_updates') {
            $pref->update(['order_updates_enabled' => false]);
        }

        return true;
    }
}
