<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentHistory;
use App\Models\OrderHistory;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NagadPaymentService
{
    /**
     * Get Nagad Gateway Configuration from Config / Settings.
     */
    public static function getConfig(): array
    {
        return [
            'enabled' => Setting::getBool('payment_nagad_enabled', true),
            'mode' => Setting::get('nagad_mode') ?: (config('services.nagad.mode') ?: 'sandbox'),
            'merchant_id' => config('services.nagad.merchant_id') ?: Setting::get('nagad_merchant_id', ''),
            'merchant_number' => config('services.nagad.merchant_number') ?: Setting::get('nagad_merchant_number', ''),
            'public_key' => config('services.nagad.public_key') ?: Setting::get('nagad_public_key', ''),
            'private_key' => config('services.nagad.private_key') ?: Setting::get('nagad_private_key', ''),
            'callback_url' => config('services.nagad.callback_url') ?: Setting::get('nagad_callback_url', ''),
        ];
    }

    /**
     * Check if Nagad credentials are fully configured.
     */
    public static function isConfigured(): bool
    {
        $config = self::getConfig();
        return !empty($config['merchant_id']) && !empty($config['public_key']) && !empty($config['private_key']);
    }

    /**
     * Get Base API URL based on active mode.
     */
    public static function getBaseUrl(): string
    {
        $config = self::getConfig();
        return $config['mode'] === 'live'
            ? 'https://api.mynagad.com/api/dfs'
            : 'https://sandbox.mynagad.com/api/dfs';
    }

    /**
     * Initiate Nagad Payment for an Order with Idempotency.
     */
    public static function initiatePayment(Order $order): array
    {
        $config = self::getConfig();

        if ($order->payment_status === 'Paid') {
            return [
                'status' => 'already_paid',
                'order_number' => $order->order_number,
                'redirect_url' => route('checkout.invoice', $order->order_number),
            ];
        }

        return DB::transaction(function () use ($order, $config) {
            $payment = Payment::where('order_id', $order->id)->lockForUpdate()->first();

            $paymentRefId = 'NAGAD-REF-' . strtoupper(uniqid());
            $trxId = $payment ? $payment->transaction_id : ('NAGAD-' . Carbon::now()->format('YmdHis') . '-' . mt_rand(1000, 9999));

            if (!$payment) {
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $order->user_id,
                    'payment_method' => 'nagad',
                    'transaction_id' => $trxId,
                    'amount' => $order->total,
                    'currency' => 'BDT',
                    'status' => 'initiated',
                    'notes' => "Nagad payment initiated (Mode: {$config['mode']})",
                ]);

                PaymentHistory::create([
                    'payment_id' => $payment->id,
                    'order_id' => $order->id,
                    'from_status' => null,
                    'to_status' => 'initiated',
                    'actor_id' => auth()->id(),
                    'notes' => "Nagad payment record created and initiated.",
                ]);
            } else {
                if (in_array($payment->status, ['failed', 'cancelled'])) {
                    PaymentService::transitionState($payment, 'initiated', auth()->id(), "Nagad payment retry initiated.");
                }
            }

            $order->update([
                'transaction_id' => $trxId,
                'payment_status' => 'Initiated',
            ]);

            return [
                'status' => 'success',
                'paymentReferenceId' => $paymentRefId,
                'trxID' => $trxId,
                'amount' => $order->total,
                'order_number' => $order->order_number,
                'mode' => $config['mode'],
                'redirect_url' => route('payment.nagad.process', $order->order_number),
                'configured' => self::isConfigured(),
            ];
        });
    }

    /**
     * Authoritative Server-Side Verify & Complete Nagad Payment with Idempotency.
     */
    public static function verifyPayment(Order $order, ?string $paymentRefId = null, ?string $customTrxId = null): Order
    {
        return DB::transaction(function () use ($order, $paymentRefId, $customTrxId) {
            $payment = Payment::where('order_id', $order->id)->lockForUpdate()->first();

            // Idempotency: If already paid, return early safely without duplicate processing
            if ($order->payment_status === 'Paid' || ($payment && $payment->status === 'paid')) {
                return $order;
            }

            $config = self::getConfig();
            $verifiedTrxId = null;
            $gatewayResponse = null;

            if (self::isConfigured() && $paymentRefId) {
                try {
                    $verifyUrl = self::getBaseUrl() . "/verify/payment/{$paymentRefId}";
                    $res = Http::get($verifyUrl);
                    $gatewayResponse = $res->json();

                    if ($res->successful() && ($gatewayResponse['status'] ?? '') === 'Success') {
                        $verifiedTrxId = $gatewayResponse['issuerPaymentRefNo'] ?? ($gatewayResponse['paymentRefId'] ?? null);
                    } else {
                        Log::error('Nagad verification rejected', ['response' => $gatewayResponse]);
                        throw new \RuntimeException('Nagad payment verification failed with status: ' . ($gatewayResponse['message'] ?? 'Rejected'));
                    }
                } catch (\Throwable $e) {
                    Log::error('Nagad Verification API Error: ' . $e->getMessage());
                    throw $e;
                }
            } else {
                if ($config['mode'] === 'live') {
                    throw new \RuntimeException('Nagad live gateway credentials and payment reference are required for live verification.');
                }

                $verifiedTrxId = $customTrxId ?: ($order->transaction_id ?: 'NAGAD-' . Carbon::now()->format('YmdHis') . '-' . mt_rand(1000, 9999));
                $gatewayResponse = [
                    'mode' => $config['mode'],
                    'paymentRefId' => $paymentRefId ?: 'SIMULATED-NAGAD-REF-' . uniqid(),
                    'issuerPaymentRefNo' => $verifiedTrxId,
                    'amount' => $order->total,
                    'status' => 'Success',
                ];
            }

            // Authoritative server-side amount validation against order total
            if (isset($gatewayResponse['amount']) && abs((float)$gatewayResponse['amount'] - (float)$order->total) > 0.01) {
                Log::error('Nagad Amount Mismatch', ['gateway_amount' => $gatewayResponse['amount'], 'order_total' => $order->total]);
                throw new \RuntimeException("Payment amount mismatch: Gateway charged ৳{$gatewayResponse['amount']}, but order total is ৳{$order->total}.");
            }

            if ($payment) {
                $payment->update(['gateway_response' => $gatewayResponse]);
                PaymentService::transitionState(
                    $payment,
                    'paid',
                    auth()->id(),
                    "Nagad online payment confirmed. TrxID: {$verifiedTrxId}",
                    $gatewayResponse
                );
            }

            $order->update([
                'payment_status' => 'Paid',
                'transaction_id' => $verifiedTrxId,
                'payment_data' => $gatewayResponse,
            ]);

            OrderHistory::create([
                'order_id' => $order->id,
                'status' => $order->status,
                'notes' => "Nagad online payment verified successfully. Transaction ID: {$verifiedTrxId}",
                'created_by' => auth()->id(),
            ]);

            AuditLogger::log('payment.nagad_success', $order, null, [
                'order_number' => $order->order_number,
                'trx_id' => $verifiedTrxId,
                'amount' => $order->total,
            ]);

            return $order;
        });
    }

    /**
     * Mark Nagad Payment as Failed or Cancelled safely without downgrading paid orders.
     */
    public static function failPayment(Order $order, string $reason = 'Customer cancelled or payment failed.', string $targetStatus = 'failed'): Order
    {
        return DB::transaction(function () use ($order, $reason, $targetStatus) {
            $payment = Payment::where('order_id', $order->id)->lockForUpdate()->first();

            // Safety: Never downgrade an already paid order
            if ($order->payment_status === 'Paid' || ($payment && $payment->status === 'paid')) {
                return $order;
            }

            $validTarget = in_array($targetStatus, ['failed', 'cancelled']) ? $targetStatus : 'failed';

            if ($payment && in_array($payment->status, ['initiated', 'awaiting_verification', 'pending'])) {
                PaymentService::transitionState($payment, $validTarget, auth()->id(), $reason);
            }

            $order->update([
                'payment_status' => ucfirst($validTarget),
            ]);

            OrderHistory::create([
                'order_id' => $order->id,
                'status' => $order->status,
                'notes' => "Nagad payment {$validTarget}: {$reason}",
                'created_by' => auth()->id(),
            ]);

            AuditLogger::log("payment.nagad_{$validTarget}", $order, null, ['reason' => $reason]);

            return $order;
        });
    }
}
