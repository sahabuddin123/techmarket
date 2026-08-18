<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\LoyaltyTransaction;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    /**
     * Get dynamic user points balance calculated directly from transaction ledger.
     */
    public static function getUserBalance(User $user): int
    {
        return (int)LoyaltyTransaction::where('user_id', $user->id)
            ->sum(DB::raw("CASE WHEN type IN ('earned', 'adjusted') THEN points WHEN type IN ('redeemed', 'reversed') THEN -points ELSE 0 END"));
    }

    /**
     * Earn loyalty points upon completed order with deduplication.
     */
    public static function earnPoints(User $user, Order $order): ?LoyaltyTransaction
    {
        // Check if points already earned for this order
        $existing = LoyaltyTransaction::where('user_id', $user->id)
            ->where('order_id', $order->id)
            ->where('type', 'earned')
            ->first();

        if ($existing) {
            return null; // Deduplicated
        }

        $rate = (float)(Setting::where('key', 'loyalty_earn_rate')->value('value') ?: 100.00); // 1 point per BDT 100
        $points = max(1, (int)floor($order->total / $rate));

        return DB::transaction(function () use ($user, $order, $points) {
            return LoyaltyTransaction::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'type' => 'earned',
                'points' => $points,
                'notes' => "Earned {$points} points from Order #{$order->order_number}",
            ]);
        });
    }

    /**
     * Redeem points during checkout.
     */
    public static function redeemPoints(User $user, int $points, Order $order): LoyaltyTransaction
    {
        $currentBalance = self::getUserBalance($user);
        if ($points > $currentBalance) {
            throw new \InvalidArgumentException("Insufficient loyalty points balance. Requested: {$points}, Available: {$currentBalance}");
        }

        return DB::transaction(function () use ($user, $order, $points) {
            return LoyaltyTransaction::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'type' => 'redeemed',
                'points' => $points,
                'notes' => "Redeemed {$points} points on Order #{$order->order_number}",
            ]);
        });
    }

    /**
     * Reverse earned points when order is cancelled or refunded.
     */
    public static function reversePoints(User $user, Order $order): ?LoyaltyTransaction
    {
        $earnedTx = LoyaltyTransaction::where('user_id', $user->id)
            ->where('order_id', $order->id)
            ->where('type', 'earned')
            ->first();

        if (!$earnedTx) {
            return null;
        }

        // Check if already reversed
        $alreadyReversed = LoyaltyTransaction::where('user_id', $user->id)
            ->where('order_id', $order->id)
            ->where('type', 'reversed')
            ->exists();

        if ($alreadyReversed) {
            return null;
        }

        return DB::transaction(function () use ($user, $order, $earnedTx) {
            return LoyaltyTransaction::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'type' => 'reversed',
                'points' => $earnedTx->points,
                'notes' => "Reversed {$earnedTx->points} points due to cancellation/refund of Order #{$order->order_number}",
            ]);
        });
    }
}
