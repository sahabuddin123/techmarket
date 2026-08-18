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
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class BkashPaymentService
{
    /**
     * Get bKash Gateway Configuration from Config / Settings.
     */
    public static function getConfig(): array
    {
        return [
            'enabled' => Setting::getBool('payment_bkash_enabled', true),
            'mode' => Setting::get('bkash_mode') ?: (config('services.bkash.mode') ?: 'sandbox'),
            'app_key' => config('services.bkash.app_key') ?: Setting::get('bkash_app_key', ''),
            'app_secret' => config('services.bkash.app_secret') ?: Setting::get('bkash_app_secret', ''),
            'username' => config('services.bkash.username') ?: Setting::get('bkash_username', ''),
            'password' => config('services.bkash.password') ?: Setting::get('bkash_password', ''),
            'callback_url' => config('services.bkash.callback_url') ?: Setting::get('bkash_callback_url', ''),
        ];
    }

    /**
     * Check if bKash gateway credentials are fully configured.
     */
    public static function isConfigured(): bool
    {
        $config = self::getConfig();
        return !empty($config['app_key']) && !empty($config['app_secret']) && !empty($config['username']) && !empty($config['password']);
    }

    /**
     * Get Base API URL based on active mode.
     */
    public static function getBaseUrl(): string
    {
        $config = self::getConfig();
        return $config['mode'] === 'live'
            ? 'https://tokenized.pay.bka.sh/v2.0/checkout'
            : 'https://tokenized.sandbox.bka.sh/v2.0/checkout';
    }

    /**
     * Retrieve or Grant Token from bKash Tokenized Checkout API.
     */
    public static function getGrantToken(): ?string
    {
        $config = self::getConfig();
        if (!self::isConfigured()) {
            return null;
        }

        $cacheKey = 'bkash_token_' . md5($config['app_key'] . $config['username']);
        return Cache::remember($cacheKey, 3400, function () use ($config) {
            try {
                $response = Http::withHeaders([
                    'username' => $config['username'],
                    'password' => $config['password'],
                ])->post(self::getBaseUrl() . '/token/grant', [
                    'app_key' => $config['app_key'],
                    'app_secret' => $config['app_secret'],
                ]);

                if ($response->successful()) {
                    return $response->json('id_token');
                }

                Log::error('bKash Grant Token Failed', ['response' => $response->json()]);
                return null;
            } catch (\Throwable $e) {
                Log::error('bKash Grant Token Exception: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Initiate bKash Payment for an Order with Idempotent Record Creation.
     */
    public static function createPayment(Order $order): array
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

            $trxId = $payment ? $payment->transaction_id : ('BKASH-' . Carbon::now()->format('YmdHis') . '-' . mt_rand(1000, 9999));
            $paymentID = 'BKASH-PID-' . strtoupper(uniqid());

            if (!$payment) {
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $order->user_id,
                    'payment_method' => 'bkash',
                    'transaction_id' => $trxId,
                    'amount' => $order->total,
                    'currency' => 'BDT',
                    'status' => 'initiated',
                    'notes' => "bKash payment initiated (Mode: {$config['mode']})",
                ]);

                PaymentHistory::create([
                    'payment_id' => $payment->id,
                    'order_id' => $order->id,
                    'from_status' => null,
                    'to_status' => 'initiated',
                    'actor_id' => auth()->id(),
                    'notes' => "bKash payment record created and initiated.",
                ]);
            } else {
                if (in_array($payment->status, ['failed', 'cancelled'])) {
                    PaymentService::transitionState($payment, 'initiated', auth()->id(), "bKash payment retry initiated.");
                }
            }

            $order->update([
                'transaction_id' => $trxId,
                'payment_status' => 'Initiated',
            ]);

            // Attempt Real Gateway API Create if configured
            $gatewayUrl = null;
            $token = self::getGrantToken();
            if ($token) {
                try {
                    $createRes = Http::withHeaders([
                        'Authorization' => $token,
                        'X-APP-Key' => $config['app_key'],
                    ])->post(self::getBaseUrl() . '/create', [
                        'mode' => '0011',
                        'payerReference' => $order->customer_phone,
                        'callbackURL' => route('payment.bkash.confirm', $order->order_number),
                        'amount' => (string)number_format($order->total, 2, '.', ''),
                        'currency' => 'BDT',
                        'intent' => 'sale',
                        'merchantInvoiceNumber' => $order->order_number,
                    ]);

                    if ($createRes->successful() && $createRes->json('statusCode') === '0000') {
                        $paymentID = $createRes->json('paymentID') ?: $paymentID;
                        $gatewayUrl = $createRes->json('bkashURL');
                    }
                } catch (\Throwable $e) {
                    Log::warning('bKash API create call warning: ' . $e->getMessage());
                }
            }

            return [
                'status' => 'success',
                'paymentID' => $paymentID,
                'trxID' => $trxId,
                'amount' => $order->total,
                'order_number' => $order->order_number,
                'mode' => $config['mode'],
                'redirect_url' => $gatewayUrl ?: route('payment.bkash.process', $order->order_number),
                'configured' => self::isConfigured(),
            ];
        });
    }

    /**
     * Authoritative Server-Side Execute & Complete bKash Payment with Idempotency.
     */
    public static function executePayment(Order $order, ?string $paymentID = null, ?string $customTrxId = null): Order
    {
        return DB::transaction(function () use ($order, $paymentID, $customTrxId) {
            $payment = Payment::where('order_id', $order->id)->lockForUpdate()->first();

            // Idempotency: If already paid, return early safely without duplicate processing
            if ($order->payment_status === 'Paid' || ($payment && $payment->status === 'paid')) {
                return $order;
            }

            $config = self::getConfig();
            $token = self::getGrantToken();
            $verifiedTrxId = null;
            $gatewayResponse = null;

            if ($token && $paymentID) {
                // Perform real server-side execution with bKash API
                try {
                    $execRes = Http::withHeaders([
                        'Authorization' => $token,
                        'X-APP-Key' => $config['app_key'],
                    ])->post(self::getBaseUrl() . '/execute', [
                        'paymentID' => $paymentID,
                    ]);

                    $gatewayResponse = $execRes->json();
                    if ($execRes->successful() && ($gatewayResponse['statusCode'] ?? '') === '0000') {
                        $verifiedTrxId = $gatewayResponse['trxID'] ?? null;
                    } else {
                        Log::error('bKash execution verification rejected', ['response' => $gatewayResponse]);
                        throw new \RuntimeException('bKash payment verification failed with gateway code: ' . ($gatewayResponse['statusMessage'] ?? 'Unknown error'));
                    }
                } catch (\Throwable $e) {
                    Log::error('bKash Verification API Error: ' . $e->getMessage());
                    throw $e;
                }
            } else {
                if ($config['mode'] === 'live') {
                    throw new \RuntimeException('bKash live gateway credentials and payment ID are required for live execution.');
                }

                // If in sandbox mode without active credentials or in simulated execution
                $verifiedTrxId = $customTrxId ?: ($order->transaction_id ?: 'BKASH-' . Carbon::now()->format('YmdHis') . '-' . mt_rand(1000, 9999));
                $gatewayResponse = [
                    'mode' => $config['mode'],
                    'paymentID' => $paymentID ?: 'SIMULATED-PID-' . uniqid(),
                    'trxID' => $verifiedTrxId,
                    'amount' => $order->total,
                    'status' => 'Completed',
                ];
            }

            // Authoritative server-side amount validation against order total
            if (isset($gatewayResponse['amount']) && abs((float)$gatewayResponse['amount'] - (float)$order->total) > 0.01) {
                Log::error('bKash Amount Mismatch', ['gateway_amount' => $gatewayResponse['amount'], 'order_total' => $order->total]);
                throw new \RuntimeException("Payment amount mismatch: Gateway charged ৳{$gatewayResponse['amount']}, but order total is ৳{$order->total}.");
            }

            if ($payment) {
                $payment->update(['gateway_response' => $gatewayResponse]);
                PaymentService::transitionState(
                    $payment,
                    'paid',
                    auth()->id(),
                    "bKash online payment confirmed. TrxID: {$verifiedTrxId}",
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
                'notes' => "bKash online payment verified successfully. Transaction ID: {$verifiedTrxId}",
                'created_by' => auth()->id(),
            ]);

            AuditLogger::log('payment.bkash_success', $order, null, [
                'order_number' => $order->order_number,
                'trx_id' => $verifiedTrxId,
                'amount' => $order->total,
            ]);

            return $order;
        });
    }

    /**
     * Mark bKash Payment as Failed or Cancelled safely without downgrading paid orders.
     */
    public static function failPayment(Order $order, string $reason = 'Customer cancelled or payment failed.', string $targetStatus = 'failed'): Order
    {
        return DB::transaction(function () use ($order, $reason, $targetStatus) {
            $payment = Payment::where('order_id', $order->id)->lockForUpdate()->first();

            // Safety Rule: Never downgrade an already paid order
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
                'notes' => "bKash payment {$validTarget}: {$reason}",
                'created_by' => auth()->id(),
            ]);

            AuditLogger::log("payment.bkash_{$validTarget}", $order, null, ['reason' => $reason]);

            return $order;
        });
    }
}
