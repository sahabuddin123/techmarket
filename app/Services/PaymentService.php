<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentHistory;
use App\Models\Refund;
use App\Models\OrderHistory;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Allowed State Transitions Matrix
     */
    protected static array $allowedTransitions = [
        'pending' => ['initiated', 'awaiting_verification', 'cancelled'],
        'initiated' => ['paid', 'failed', 'cancelled'],
        'awaiting_verification' => ['paid', 'failed'],
        'paid' => ['partially_refunded', 'refunded'],
        'partially_refunded' => ['partially_refunded', 'refunded'],
        'failed' => ['initiated', 'awaiting_verification'],
        'cancelled' => [],
        'refunded' => [],
    ];

    /**
     * Transition Payment state with strict state machine validation and audit history recording.
     */
    public static function transitionState(Payment $payment, string $toStatus, ?int $actorId = null, ?string $notes = null, ?array $payload = null): Payment
    {
        $fromStatus = $payment->status;

        if ($fromStatus === $toStatus) {
            return $payment; // Idempotent
        }

        $allowed = static::$allowedTransitions[$fromStatus] ?? [];
        if (!in_array($toStatus, $allowed)) {
            throw new \InvalidArgumentException("Invalid payment state transition from '{$fromStatus}' to '{$toStatus}'.");
        }

        return DB::transaction(function () use ($payment, $fromStatus, $toStatus, $actorId, $notes, $payload) {
            $payment->update(['status' => $toStatus]);

            PaymentHistory::create([
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'actor_id' => $actorId ?: auth()->id(),
                'notes' => $notes,
                'payload' => $payload,
            ]);

            AuditLogger::log('payment.transitioned', $payment, ['from' => $fromStatus], ['to' => $toStatus, 'notes' => $notes]);

            return $payment;
        });
    }

    /**
     * Initiate payment transaction record for an order.
     */
    public static function initiatePayment(Order $order, string $paymentMethod, ?string $transactionId = null, ?string $senderNumber = null): Payment
    {
        $trxId = $transactionId ?: ('TRX-' . strtoupper(uniqid()));

        return DB::transaction(function () use ($order, $paymentMethod, $trxId, $senderNumber) {
            $initialStatus = $paymentMethod === 'COD' ? 'pending' : ($senderNumber ? 'awaiting_verification' : 'initiated');

            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'payment_method' => $paymentMethod,
                'transaction_id' => $trxId,
                'amount' => $order->total,
                'currency' => 'BDT',
                'status' => $initialStatus,
                'notes' => "Payment initiated via {$paymentMethod}",
            ]);

            $order->update([
                'transaction_id' => $trxId,
                'sender_number' => $senderNumber,
                'payment_status' => $paymentMethod === 'COD' ? 'Pending' : ($senderNumber ? 'Awaiting Verification' : 'Initiated'),
            ]);

            PaymentHistory::create([
                'payment_id' => $payment->id,
                'order_id' => $order->id,
                'from_status' => null,
                'to_status' => $initialStatus,
                'actor_id' => auth()->id(),
                'notes' => "Initiated payment via {$paymentMethod}",
            ]);

            AuditLogger::log('payment.initiated', $payment, null, [
                'order_number' => $order->order_number,
                'amount' => $order->total,
                'trx_id' => $trxId,
            ]);

            return $payment;
        });
    }

    /**
     * Handle SSLCommerz Gateway Callback (Success/Fail/Cancel/IPN) with Idempotency Protection.
     */
    public static function handleSslCommerzCallback(array $payload, string $status): Order
    {
        $trxId = $payload['tran_id'] ?? null;
        $valId = $payload['val_id'] ?? null;

        if (!$trxId) {
            throw new \InvalidArgumentException('Transaction ID missing from SSLCommerz callback.');
        }

        return DB::transaction(function () use ($trxId, $valId, $payload, $status) {
            $payment = Payment::where('transaction_id', $trxId)->first();
            $order = $payment ? Order::find($payment->order_id) : Order::where('transaction_id', $trxId)->firstOrFail();

            // Idempotency check: if order is already paid, return early
            if ($order->payment_status === 'Paid' && $status === 'VALID') {
                return $order;
            }

            if ($status === 'VALID') {
                $order->update([
                    'payment_status' => 'Paid',
                    'payment_data' => $payload,
                ]);

                if ($payment) {
                    self::transitionState($payment, 'paid', null, "SSLCommerz payment validated successfully. ValID: {$valId}", $payload);
                }

                OrderHistory::create([
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'notes' => "SSLCommerz payment validated successfully. Validation ID: {$valId}",
                ]);

                AuditLogger::log('payment.sslcommerz_success', $order, null, ['val_id' => $valId]);
            } else {
                $order->update(['payment_status' => 'Failed']);

                if ($payment) {
                    self::transitionState($payment, 'failed', null, "SSLCommerz payment callback status: {$status}", $payload);
                }

                OrderHistory::create([
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'notes' => "SSLCommerz payment callback status: {$status}",
                ]);

                AuditLogger::log('payment.sslcommerz_failed', $order, null, ['status' => $status]);
            }

            return $order;
        });
    }

    /**
     * Admin approves manual mobile banking payment (bKash/Nagad/Rocket).
     */
    public static function approveManualPayment(Order $order, int $adminUserId): void
    {
        DB::transaction(function () use ($order, $adminUserId) {
            $order->update(['payment_status' => 'Paid']);

            $payment = Payment::where('order_id', $order->id)->first();
            if ($payment) {
                self::transitionState($payment, 'paid', $adminUserId, "Manual mobile banking payment approved by Admin.");
            }

            OrderHistory::create([
                'order_id' => $order->id,
                'status' => $order->status,
                'notes' => "Manual mobile banking payment approved by Admin.",
                'created_by' => $adminUserId,
            ]);

            AuditLogger::log('payment.manual_approved', $order, null, ['order_number' => $order->order_number]);
        });
    }

    /**
     * Admin rejects manual mobile banking payment.
     */
    public static function rejectManualPayment(Order $order, int $adminUserId, string $reason): void
    {
        DB::transaction(function () use ($order, $adminUserId, $reason) {
            $order->update(['payment_status' => 'Failed']);

            $payment = Payment::where('order_id', $order->id)->first();
            if ($payment) {
                self::transitionState($payment, 'failed', $adminUserId, "Manual payment rejected: {$reason}");
            }

            OrderHistory::create([
                'order_id' => $order->id,
                'status' => $order->status,
                'notes' => "Manual mobile banking payment rejected: {$reason}",
                'created_by' => $adminUserId,
            ]);

            AuditLogger::log('payment.manual_rejected', $order, null, ['reason' => $reason]);
        });
    }

    /**
     * Process order payment refund with strict validation against duplicate or excess refunds.
     */
    public static function processRefund(Order $order, float $amount, string $reason, int $adminUserId): Refund
    {
        $payment = Payment::where('order_id', $order->id)->lockForUpdate()->firstOrFail();

        if (!in_array($payment->status, ['paid', 'partially_refunded'])) {
            throw new \InvalidArgumentException("Cannot refund a payment that is not in 'paid' or 'partially_refunded' status.");
        }

        if ($amount <= 0) {
            throw new \InvalidArgumentException("Refund amount must be greater than zero.");
        }

        // Cumulative refund check
        $totalPriorRefunded = (float)Refund::where('payment_id', $payment->id)->where('status', 'completed')->sum('amount');
        $newCumulativeRefund = $totalPriorRefunded + $amount;

        if ($newCumulativeRefund > (float)$payment->amount) {
            throw new \InvalidArgumentException("Cumulative refund amount (৳{$newCumulativeRefund}) exceeds original paid amount (৳{$payment->amount}).");
        }

        return DB::transaction(function () use ($order, $payment, $amount, $newCumulativeRefund, $reason, $adminUserId) {
            $isFullRefund = $newCumulativeRefund >= (float)$payment->amount;
            $targetStatus = $isFullRefund ? 'refunded' : 'partially_refunded';

            $refund = Refund::create([
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'amount' => $amount,
                'status' => 'completed',
                'reason' => $reason,
                'processed_by' => $adminUserId,
                'gateway_reference' => 'INTERNAL-REFUND-' . time(),
            ]);

            self::transitionState($payment, $targetStatus, $adminUserId, "Refund of ৳{$amount} completed. Reason: {$reason}");

            $order->update([
                'payment_status' => $isFullRefund ? 'Refunded' : 'Partially Refunded',
            ]);

            // Reverse loyalty points if applicable
            if ($order->user) {
                LoyaltyService::reversePoints($order->user, $order);
            }

            AuditLogger::log('payment.refund_processed', $refund, null, [
                'order_number' => $order->order_number,
                'amount' => $amount,
                'is_full' => $isFullRefund,
            ]);

            return $refund;
        });
    }
}
