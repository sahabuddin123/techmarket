<?php

namespace App\Services\Fraud;

use App\Models\FraudCheck;
use App\Models\FraudReviewLog;
use App\Models\FraudSignal;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Shipment;
use App\Models\User;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FraudDetectionService
{
    /**
     * Get configurable risk weights and thresholds from Settings.
     */
    public static function getSettings(): array
    {
        return [
            'enabled' => Setting::getBool('fraud_detection_enabled', true),
            'return_rate_weight' => (int)Setting::get('fraud_return_rate_weight', 35),
            'cancel_rate_weight' => (int)Setting::get('fraud_cancel_rate_weight', 20),
            'failed_delivery_weight' => (int)Setting::get('fraud_failed_delivery_weight', 25),
            'duplicate_order_weight' => (int)Setting::get('fraud_duplicate_order_weight', 25),
            'high_value_cod_threshold' => (float)Setting::get('fraud_high_value_cod_threshold', 40000),
            'high_value_cod_weight' => (int)Setting::get('fraud_high_value_cod_weight', 20),
            'rapid_orders_window_mins' => (int)Setting::get('fraud_rapid_orders_window_mins', 15),
            'rapid_orders_threshold' => (int)Setting::get('fraud_rapid_orders_threshold', 2),
            'rapid_orders_weight' => (int)Setting::get('fraud_rapid_orders_weight', 25),
            'suspicious_phone_weight' => (int)Setting::get('fraud_suspicious_phone_weight', 30),
            'suspicious_address_weight' => (int)Setting::get('fraud_suspicious_address_weight', 20),
            'review_threshold' => (int)Setting::get('fraud_manual_review_threshold', 50),
            'hold_threshold' => (int)Setting::get('fraud_auto_hold_threshold', 75),
            'duplicate_window_hours' => (int)Setting::get('fraud_duplicate_window_hours', 24),
        ];
    }

    /**
     * Analyze an incoming or existing order and generate/update FraudCheck record.
     */
    public static function analyzeOrder(Order $order): FraudCheck
    {
        $settings = self::getSettings();
        $phone = preg_replace('/[^0-9]/', '', $order->customer_phone);
        $customer = $order->user ?: ($order->user_id ? User::find($order->user_id) : null);

        $reasons = [];
        $positiveSignals = [];
        $breakdown = [];
        $signalsToSave = [];
        $score = 0;

        // 1. Customer Order History & Courier Returned Rates
        $pastOrders = Order::where('customer_phone', $order->customer_phone)
            ->where('id', '!=', $order->id)
            ->get();

        $totalPast = $pastOrders->count();
        $deliveredPast = $pastOrders->where('status', 'Delivered')->count();
        $cancelledPast = $pastOrders->where('status', 'Cancelled')->count();

        // Check shipments for returned / failed delivery history
        $pastShipments = Shipment::where('recipient_phone', $order->customer_phone)->get();
        $returnedShipments = $pastShipments->whereIn('courier_status', ['returned', 'failed', 'partial_delivery', 'cancelled'])->count();

        // Signal: High Return Rate
        if ($returnedShipments > 0 || ($totalPast >= 2 && $cancelledPast >= 2)) {
            $returnRate = $totalPast > 0 ? round(($returnedShipments + $cancelledPast) / max(1, $totalPast) * 100) : 100;
            if ($returnRate >= 50) {
                $impact = $settings['return_rate_weight'];
                $score += $impact;
                $reason = "Customer has {$returnedShipments} returned shipments / {$cancelledPast} cancellations ({$returnRate}% return rate).";
                $reasons[] = "⚠ " . $reason;
                $breakdown['return_rate'] = $impact;
                $signalsToSave[] = [
                    'signal_type' => 'high_return_rate',
                    'severity' => $returnRate >= 75 ? 'critical' : 'high',
                    'score_impact' => $impact,
                    'description' => $reason,
                    'metadata' => ['returned_count' => $returnedShipments, 'return_rate' => $returnRate],
                ];
            }
        }

        // Signal: Cancellation Rate
        if ($totalPast >= 3 && ($cancelledPast / $totalPast) >= 0.5) {
            $impact = $settings['cancel_rate_weight'];
            $score += $impact;
            $reason = "High cancellation history: {$cancelledPast} out of {$totalPast} orders cancelled.";
            $reasons[] = "⚠ " . $reason;
            $breakdown['cancel_rate'] = $impact;
            $signalsToSave[] = [
                'signal_type' => 'high_cancellation_rate',
                'severity' => 'medium',
                'score_impact' => $impact,
                'description' => $reason,
                'metadata' => ['cancelled_count' => $cancelledPast],
            ];
        }

        // Signal: Duplicate Order Check within time window
        $duplicateWindow = Carbon::now()->subHours($settings['duplicate_window_hours']);
        $recentDuplicates = Order::where('customer_phone', $order->customer_phone)
            ->where('id', '!=', $order->id)
            ->where('created_at', '>=', $duplicateWindow)
            ->get();

        $isDuplicate = false;
        $relatedIds = [];

        if ($recentDuplicates->isNotEmpty()) {
            $isDuplicate = true;
            $relatedIds = $recentDuplicates->pluck('id')->all();
            $impact = $settings['duplicate_order_weight'];
            $score += $impact;
            $dupCount = $recentDuplicates->count();
            $reason = "Possible Duplicate Order: {$dupCount} other order(s) placed with same phone number within {$settings['duplicate_window_hours']} hours.";
            $reasons[] = "⚠ " . $reason;
            $breakdown['duplicate_order'] = $impact;
            $signalsToSave[] = [
                'signal_type' => 'duplicate_order',
                'severity' => 'medium',
                'score_impact' => $impact,
                'description' => $reason,
                'metadata' => ['related_order_ids' => $relatedIds],
            ];
        }

        // Signal: Rapid Multiple Orders in short minutes window
        $rapidWindow = Carbon::now()->subMinutes($settings['rapid_orders_window_mins']);
        $rapidOrders = Order::where('customer_phone', $order->customer_phone)
            ->where('id', '!=', $order->id)
            ->where('created_at', '>=', $rapidWindow)
            ->count();

        if ($rapidOrders >= $settings['rapid_orders_threshold']) {
            $impact = $settings['rapid_orders_weight'];
            $score += $impact;
            $reason = "Rapid Order Flood: {$rapidOrders} orders submitted within {$settings['rapid_orders_window_mins']} minutes.";
            $reasons[] = "⚠ " . $reason;
            $breakdown['rapid_orders'] = $impact;
            $signalsToSave[] = [
                'signal_type' => 'rapid_orders',
                'severity' => 'high',
                'score_impact' => $impact,
                'description' => $reason,
                'metadata' => ['rapid_order_count' => $rapidOrders],
            ];
        }

        // Signal: High Value Cash on Delivery (COD)
        $isCod = strtolower($order->payment_method ?? '') === 'cod';
        if ($isCod && (float)$order->total >= $settings['high_value_cod_threshold']) {
            $impact = $settings['high_value_cod_weight'];
            $score += $impact;
            $reason = "High-Value Cash on Delivery: Order total is ৳" . number_format($order->total) . " (Threshold: ৳" . number_format($settings['high_value_cod_threshold']) . ").";
            $reasons[] = "⚠ " . $reason;
            $breakdown['high_value_cod'] = $impact;
            $signalsToSave[] = [
                'signal_type' => 'high_value_cod',
                'severity' => 'medium',
                'score_impact' => $impact,
                'description' => $reason,
                'metadata' => ['total' => $order->total],
            ];
        }

        // Signal: Phone number associated with multiple user accounts
        $accountsWithPhone = User::where('phone', $order->customer_phone)
            ->orWhere('phone', $phone)
            ->count();

        if ($accountsWithPhone > 1) {
            $impact = $settings['suspicious_phone_weight'];
            $score += $impact;
            $reason = "Phone number is associated with {$accountsWithPhone} different user accounts.";
            $reasons[] = "⚠ " . $reason;
            $breakdown['multi_account_phone'] = $impact;
            $signalsToSave[] = [
                'signal_type' => 'suspicious_phone',
                'severity' => 'high',
                'score_impact' => $impact,
                'description' => $reason,
                'metadata' => ['account_count' => $accountsWithPhone],
            ];
        }

        // Positive Trust Signals (Discounting score)
        if ($deliveredPast >= 5) {
            $positiveSignals[] = "✓ Trusted Customer: {$deliveredPast} previous successfully delivered orders.";
            $score = max(0, $score - 25);
        } elseif ($deliveredPast >= 1) {
            $positiveSignals[] = "✓ Prior successful delivery on record ({$deliveredPast} order).";
            $score = max(0, $score - 10);
        }

        if (!$isCod && $order->payment_status === 'Paid') {
            $positiveSignals[] = "✓ Fully Prepaid Order ({$order->payment_method_label}). Zero COD default risk.";
            $score = max(0, $score - 15);
        }

        if ($customer && $customer->created_at && $customer->created_at->diffInDays(now()) > 90) {
            $positiveSignals[] = "✓ Registered customer account older than 3 months.";
            $score = max(0, $score - 5);
        }

        // Bound score strictly between 0 and 100
        $finalScore = min(100, max(0, (int)$score));

        // Risk Level determination
        $riskLevel = match (true) {
            $finalScore >= $settings['hold_threshold'] => 'critical',
            $finalScore >= $settings['review_threshold'] => 'high',
            $finalScore >= 25 => 'medium',
            default => 'low',
        };

        // Order Action Status
        $fraudStatus = match ($riskLevel) {
            'critical' => 'on_hold',
            'high' => 'review_required',
            'medium' => 'warning',
            default => 'passed',
        };

        return DB::transaction(function () use ($order, $customer, $finalScore, $riskLevel, $fraudStatus, $reasons, $positiveSignals, $breakdown, $isDuplicate, $relatedIds, $signalsToSave) {
            $fraudCheck = FraudCheck::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'customer_id' => $customer?->id,
                    'customer_phone' => $order->customer_phone,
                    'customer_email' => $order->customer_email,
                    'customer_name' => $order->customer_name,
                    'shipping_address' => $order->shipping_address . ', ' . $order->district,
                    'risk_score' => $finalScore,
                    'risk_level' => $riskLevel,
                    'reasons' => $reasons,
                    'positive_signals' => $positiveSignals,
                    'breakdown' => $breakdown,
                    'status' => $fraudStatus,
                    'is_duplicate' => $isDuplicate,
                    'related_order_ids' => $relatedIds,
                ]
            );

            // Sync Signals
            $fraudCheck->signals()->delete();
            foreach ($signalsToSave as $sig) {
                FraudSignal::create(array_merge($sig, [
                    'fraud_check_id' => $fraudCheck->id,
                    'created_at' => Carbon::now(),
                ]));
            }

            // Update Order columns
            $order->update([
                'fraud_score' => $finalScore,
                'fraud_risk_level' => $riskLevel,
                'fraud_status' => $fraudStatus,
                'fraud_check_id' => $fraudCheck->id,
            ]);

            // Dispatch Admin Alert on Critical / High Risk Orders
            if ($riskLevel === 'critical' || $fraudStatus === 'hold') {
                \App\Services\Sms\SmsNotificationService::sendEvent('admin.fraud_alert', [
                    'order_number' => $order->order_number,
                    'fraud_score' => $finalScore,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                ], null, $order->id, $order->user_id);

                try {
                    $notifManager = app(\App\Services\Notification\NotificationManager::class);
                    if ($riskLevel === 'critical') {
                        $notifManager->dispatch('fraud.critical_risk', ['order' => $order, 'fraud_check' => $fraudCheck]);
                    } else {
                        $notifManager->dispatch('fraud.review_required', ['order' => $order, 'fraud_check' => $fraudCheck]);
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to dispatch fraud alert notification: ' . $e->getMessage());
                }
            }

            return $fraudCheck;
        });
    }

    /**
     * Run on-demand customer phone or account fraud profile analysis.
     */
    public static function analyzeCustomer(string $phone, ?User $user = null): array
    {
        $orders = Order::where('customer_phone', $phone)->latest()->get();
        $shipments = Shipment::where('recipient_phone', $phone)->latest()->get();

        $totalOrders = $orders->count();
        $deliveredOrders = $orders->where('status', 'Delivered')->count();
        $cancelledOrders = $orders->where('status', 'Cancelled')->count();
        $pendingOrders = $orders->whereIn('status', ['Pending', 'Confirmed', 'Processing', 'Packed'])->count();
        $returnedShipments = $shipments->whereIn('courier_status', ['returned', 'failed'])->count();

        $codTotal = (float)$orders->where('payment_method', 'cod')->sum('total');
        $prepaidTotal = (float)$orders->whereIn('payment_method', ['bkash', 'nagad', 'sslcommerz', 'card'])->sum('total');

        $totalCompleted = $deliveredOrders + $returnedShipments;
        $returnRate = $totalCompleted > 0 ? round(($returnedShipments / $totalCompleted) * 100, 1) : 0.0;
        $cancelRate = $totalOrders > 0 ? round(($cancelledOrders / $totalOrders) * 100, 1) : 0.0;
        $successRate = $totalOrders > 0 ? round(($deliveredOrders / $totalOrders) * 100, 1) : 0.0;

        // Perform instant score computation
        $score = 0;
        $reasons = [];
        $positives = [];

        if ($returnedShipments >= 2 || $returnRate >= 40) {
            $score += 40;
            $reasons[] = "Customer has {$returnedShipments} courier returned shipments ({$returnRate}% return rate).";
        }
        if ($cancelRate >= 50 && $cancelledOrders >= 2) {
            $score += 25;
            $reasons[] = "High cancellation rate of {$cancelRate}% ({$cancelledOrders} cancelled orders).";
        }
        if ($deliveredOrders >= 5) {
            $positives[] = "Verified customer with {$deliveredOrders} successful deliveries.";
            $score = max(0, $score - 30);
        } elseif ($deliveredOrders >= 1) {
            $positives[] = "Customer has {$deliveredOrders} successful delivery on record.";
            $score = max(0, $score - 10);
        }

        if ($prepaidTotal > 0) {
            $positives[] = "Customer has paid ৳" . number_format($prepaidTotal) . " via digital payment methods.";
        }

        $finalScore = min(100, max(0, $score));
        $riskLevel = match (true) {
            $finalScore >= 75 => 'critical',
            $finalScore >= 50 => 'high',
            $finalScore >= 25 => 'medium',
            default => 'low',
        };

        $recommendedAction = match ($riskLevel) {
            'critical' => 'Reject or Require Full 100% Advance Payment before dispatch.',
            'high' => 'Hold for Manual Verification: Require advance delivery fee before booking.',
            'medium' => 'Call Customer to re-confirm delivery address and order items.',
            default => 'Low Risk: Verified clean order, approved for fast-track courier dispatch.',
        };

        return [
            'phone' => $phone,
            'user' => $user,
            'customer_name' => $orders->first()?->customer_name ?? $user?->name ?? 'Guest Customer',
            'customer_email' => $orders->first()?->customer_email ?? $user?->email ?? null,
            'total_orders' => $totalOrders,
            'delivered_orders' => $deliveredOrders,
            'cancelled_orders' => $cancelledOrders,
            'pending_orders' => $pendingOrders,
            'returned_shipments' => $returnedShipments,
            'cod_total' => $codTotal,
            'prepaid_total' => $prepaidTotal,
            'return_rate' => $returnRate,
            'cancel_rate' => $cancelRate,
            'success_rate' => $successRate,
            'risk_score' => $finalScore,
            'risk_level' => $riskLevel,
            'recommended_action' => $recommendedAction,
            'reasons' => $reasons,
            'positive_signals' => $positives,
            'orders' => $orders->take(15),
            'shipments' => $shipments->take(15),
        ];
    }

    /**
     * Admin review action on flagged fraud check (Approve, Reject, Hold, Override Score).
     */
    public static function reviewOrder(Order $order, string $action, ?int $overrideScore = null, string $notes = '', ?User $admin = null): FraudCheck
    {
        $admin = $admin ?: auth()->user();
        $fraudCheck = $order->fraudCheck ?: self::analyzeOrder($order);

        $oldStatus = $fraudCheck->status;
        $oldScore = $fraudCheck->risk_score;

        $newStatus = match ($action) {
            'approve' => 'approved',
            'reject' => 'rejected',
            'hold' => 'on_hold',
            'override' => $fraudCheck->status,
            default => 'approved',
        };

        $newScore = $overrideScore !== null ? min(100, max(0, $overrideScore)) : $oldScore;
        $newRiskLevel = match (true) {
            $newScore >= 75 => 'critical',
            $newScore >= 50 => 'high',
            $newScore >= 25 => 'medium',
            default => 'low',
        };

        return DB::transaction(function () use ($order, $fraudCheck, $admin, $action, $oldStatus, $newStatus, $oldScore, $newScore, $newRiskLevel, $notes) {
            $fraudCheck->update([
                'status' => $newStatus,
                'risk_score' => $newScore,
                'risk_level' => $newRiskLevel,
                'reviewed_by' => $admin?->id,
                'reviewed_at' => Carbon::now(),
                'review_action' => $action,
                'review_notes' => $notes,
            ]);

            FraudReviewLog::create([
                'fraud_check_id' => $fraudCheck->id,
                'user_id' => $admin?->id,
                'action' => $action,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'old_score' => $oldScore,
                'new_score' => $newScore,
                'notes' => $notes ?: "Fraud review action [{$action}] performed by {$admin?->name}",
                'created_at' => Carbon::now(),
            ]);

            // Update order fraud status
            $order->update([
                'fraud_score' => $newScore,
                'fraud_risk_level' => $newRiskLevel,
                'fraud_status' => $newStatus,
            ]);

            // Lifecycle impact on Order
            if ($action === 'reject') {
                if ($order->status !== 'Cancelled') {
                    $order->update(['status' => 'Cancelled']);
                    foreach ($order->items as $item) {
                        if ($item->product_id) {
                            \App\Services\InventoryService::releaseStock($item->product_id, $item->quantity, $order->id);
                        }
                    }
                    \App\Models\OrderHistory::create([
                        'order_id' => $order->id,
                        'status' => 'Cancelled',
                        'notes' => "Order cancelled due to fraud rejection. Reason: {$notes}",
                        'created_by' => $admin?->id,
                    ]);
                }
            } elseif ($action === 'approve') {
                \App\Models\OrderHistory::create([
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'notes' => "Order approved via Fraud Review by " . ($admin?->name ?? 'Admin') . ". Reason: {$notes}",
                    'created_by' => $admin?->id,
                ]);
            } elseif ($action === 'hold') {
                \App\Models\OrderHistory::create([
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'notes' => "Order placed on Fraud Hold by " . ($admin?->name ?? 'Admin') . ". Reason: {$notes}",
                    'created_by' => $admin?->id,
                ]);
            } elseif ($action === 'override') {
                \App\Models\OrderHistory::create([
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'notes' => "Fraud risk score manually adjusted to {$newScore}/100 by " . ($admin?->name ?? 'Admin') . ". Reason: {$notes}",
                    'created_by' => $admin?->id,
                ]);
            }

            AuditLogger::log('fraud.order_reviewed', $order, ['score' => $oldScore, 'status' => $oldStatus], [
                'action' => $action,
                'new_score' => $newScore,
                'new_status' => $newStatus,
                'admin' => $admin?->name,
                'notes' => $notes,
            ]);

            return $fraudCheck;
        });
    }
}
