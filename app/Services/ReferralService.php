<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Referral;
use App\Models\Setting;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    /**
     * Generate or fetch unique referral code for user.
     */
    public static function getOrCreateReferralCode(User $user): string
    {
        if ($user->referral_code) {
            return $user->referral_code;
        }

        $code = 'REF-' . strtoupper(Str::random(6));
        $user->update(['referral_code' => $code]);

        return $code;
    }

    /**
     * Attribute new customer registration to referrer code with self-referral prevention.
     */
    public static function attributeReferral(User $newUser, string $referralCode): ?Referral
    {
        $referrer = User::where('referral_code', $referralCode)->first();

        // Prevent self-referral or invalid code
        if (!$referrer || (int)$referrer->id === (int)$newUser->id) {
            return null;
        }

        // Prevent duplicate attribution
        $existing = Referral::where('referred_id', $newUser->id)->first();
        if ($existing) {
            return $existing;
        }

        $rewardPoints = (int)(Setting::where('key', 'referral_reward_points')->value('value') ?: 500);

        return Referral::create([
            'referrer_id' => $referrer->id,
            'referred_id' => $newUser->id,
            'referral_code' => $referralCode,
            'status' => 'pending',
            'reward_points' => $rewardPoints,
        ]);
    }

    /**
     * Qualify referral upon first completed order and issue reward.
     */
    public static function qualifyReferral(Order $order): ?Referral
    {
        if (!$order->user_id) {
            return null;
        }

        $referral = Referral::where('referred_id', $order->user_id)
            ->where('status', 'pending')
            ->first();

        if (!$referral) {
            return null;
        }

        return DB::transaction(function () use ($referral, $order) {
            $referral->update(['status' => 'rewarded']);

            // Reward referrer via Loyalty ledger
            LoyaltyService::earnPoints($referral->referrer, $order);

            AuditLogger::log('referral.rewarded', $referral, null, ['reward_points' => $referral->reward_points]);

            return $referral;
        });
    }
}
