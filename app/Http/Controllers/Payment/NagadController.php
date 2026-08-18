<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\NagadPaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NagadController extends Controller
{
    /**
     * Verify ownership of the order.
     */
    protected function authorizeOrderAccess(Order $order): void
    {
        if (auth()->check()) {
            if ($order->user_id && $order->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'manager'])) {
                abort(403, 'Unauthorized access to this order payment.');
            }
        }
    }

    /**
     * Show Nagad Interactive Payment Gateway Screen.
     */
    public function process($orderNumber)
    {
        $order = Order::with('items.product')->where('order_number', $orderNumber)->firstOrFail();
        $this->authorizeOrderAccess($order);

        // If order is already paid, redirect to result
        if ($order->payment_status === 'Paid') {
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'success']);
        }

        $initData = NagadPaymentService::initiatePayment($order);
        $config = NagadPaymentService::getConfig();

        return Inertia::render('Payment/NagadCheckout', [
            'order' => $order,
            'paymentData' => [
                'paymentRefId' => $initData['paymentReferenceId'] ?? null,
                'trxID' => $initData['trxID'] ?? null,
                'amount' => $order->total,
                'mode' => $config['mode'],
                'merchant' => 'TechLand BD Online Store',
                'merchant_number' => $config['merchant_number'] ?: '01800000000',
                'configured' => NagadPaymentService::isConfigured(),
            ],
        ]);
    }

    /**
     * Confirm & Verify Nagad Payment.
     */
    public function confirm(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $this->authorizeOrderAccess($order);

        // Idempotency: If already paid, return success result
        if ($order->payment_status === 'Paid') {
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'success']);
        }

        $status = $request->input('status', 'success');
        if (in_array(strtolower($status), ['cancel', 'cancelled'])) {
            NagadPaymentService::failPayment($order, 'Customer cancelled the Nagad payment.', 'cancelled');
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'cancelled']);
        }

        if (in_array(strtolower($status), ['failure', 'failed', 'error', 'declined'])) {
            NagadPaymentService::failPayment($order, 'Nagad gateway reported payment failure.', 'failed');
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'failed']);
        }

        try {
            $paymentRefId = $request->input('payment_ref_id') ?: $request->input('paymentRefId');
            $customTrxId = $request->input('trx_id');

            NagadPaymentService::verifyPayment($order, $paymentRefId, $customTrxId);

            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'success']);
        } catch (\Throwable $e) {
            NagadPaymentService::failPayment($order, 'Payment verification error: ' . $e->getMessage(), 'failed');
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'failed']);
        }
    }

    /**
     * Cancel Nagad Payment.
     */
    public function cancel(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $this->authorizeOrderAccess($order);

        NagadPaymentService::failPayment($order, 'Payment was cancelled by the customer.', 'cancelled');

        return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'cancelled']);
    }

    /**
     * Safe Retry Nagad Payment.
     */
    public function retry($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $this->authorizeOrderAccess($order);

        if ($order->payment_status === 'Paid') {
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'success']);
        }

        return redirect()->route('payment.nagad.process', $order->order_number);
    }
}
