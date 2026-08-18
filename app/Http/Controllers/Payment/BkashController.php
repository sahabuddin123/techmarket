<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\BkashPaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BkashController extends Controller
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
     * Show bKash Interactive Payment Gateway Screen.
     */
    public function process($orderNumber)
    {
        $order = Order::with('items.product')->where('order_number', $orderNumber)->firstOrFail();
        $this->authorizeOrderAccess($order);

        // If order is already paid, redirect to result
        if ($order->payment_status === 'Paid') {
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'success']);
        }

        $initData = BkashPaymentService::createPayment($order);
        $config = BkashPaymentService::getConfig();

        return Inertia::render('Payment/BkashCheckout', [
            'order' => $order,
            'paymentData' => [
                'paymentID' => $initData['paymentID'] ?? null,
                'trxID' => $initData['trxID'] ?? null,
                'amount' => $order->total,
                'mode' => $config['mode'],
                'merchant' => 'TechLand BD Online Store',
                'configured' => BkashPaymentService::isConfigured(),
            ],
        ]);
    }

    /**
     * Confirm & Execute bKash Payment.
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
            BkashPaymentService::failPayment($order, 'Customer cancelled the bKash payment.', 'cancelled');
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'cancelled']);
        }

        if (in_array(strtolower($status), ['failure', 'failed', 'error'])) {
            BkashPaymentService::failPayment($order, 'bKash gateway reported payment failure.', 'failed');
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'failed']);
        }

        try {
            $paymentID = $request->input('paymentID');
            $customTrxId = $request->input('trx_id');

            BkashPaymentService::executePayment($order, $paymentID, $customTrxId);

            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'success']);
        } catch (\Throwable $e) {
            BkashPaymentService::failPayment($order, 'Payment execution error: ' . $e->getMessage(), 'failed');
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'failed']);
        }
    }

    /**
     * Cancel bKash Payment.
     */
    public function cancel(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $this->authorizeOrderAccess($order);

        BkashPaymentService::failPayment($order, 'Payment was cancelled by the customer.', 'cancelled');

        return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'cancelled']);
    }

    /**
     * Safe Retry bKash Payment.
     */
    public function retry($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $this->authorizeOrderAccess($order);

        if ($order->payment_status === 'Paid') {
            return redirect()->route('payment.result', ['orderNumber' => $order->order_number, 'status' => 'success']);
        }

        return redirect()->route('payment.bkash.process', $order->order_number);
    }
}
