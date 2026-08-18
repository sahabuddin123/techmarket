<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * SSLCommerz Success Callback Handler.
     */
    public function sslCommerzSuccess(Request $request)
    {
        $order = PaymentService::handleSslCommerzCallback($request->all(), 'VALID');
        return redirect()->route('checkout.invoice', $order->order_number)->with('success', 'SSLCommerz payment completed successfully!');
    }

    /**
     * SSLCommerz Fail Callback Handler.
     */
    public function sslCommerzFail(Request $request)
    {
        $order = PaymentService::handleSslCommerzCallback($request->all(), 'FAILED');
        return redirect()->route('checkout.invoice', $order->order_number)->with('error', 'Payment failed. Please try again.');
    }

    /**
     * SSLCommerz Cancel Callback Handler.
     */
    public function sslCommerzCancel(Request $request)
    {
        $order = PaymentService::handleSslCommerzCallback($request->all(), 'CANCELLED');
        return redirect()->route('checkout.invoice', $order->order_number)->with('error', 'Payment was cancelled.');
    }

    /**
     * SSLCommerz IPN (Instant Payment Notification) Callback Handler.
     */
    public function sslCommerzIpn(Request $request)
    {
        PaymentService::handleSslCommerzCallback($request->all(), $request->input('status') === 'VALID' ? 'VALID' : 'FAILED');
        return response()->json(['status' => 'success']);
    }

    /**
     * Admin Payments Workspace: View all payments, filter by status, approve/reject manual mobile banking payments.
     */
    public function adminIndex(Request $request)
    {
        $query = Payment::with(['order', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Admin approves manual mobile banking payment.
     */
    public function adminApprove(Order $order)
    {
        PaymentService::approveManualPayment($order, auth()->id());
        return back()->with('success', 'Manual payment approved.');
    }

    /**
     * Customer Payment Result Screen (Success / Failed / Cancelled / Pending).
     */
    public function result(Request $request, string $orderNumber)
    {
        $order = Order::with(['items.product', 'user'])->where('order_number', $orderNumber)->firstOrFail();

        if (auth()->check()) {
            if ($order->user_id && $order->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'manager'])) {
                abort(403, 'Unauthorized access to this payment result.');
            }
        }

        $payment = Payment::where('order_id', $order->id)->latest()->first();
        $status = $request->input('status');

        if (!$status) {
            $status = match (strtolower($order->payment_status)) {
                'paid' => 'success',
                'failed' => 'failed',
                'cancelled' => 'cancelled',
                default => 'pending',
            };
        }

        return Inertia::render('Payment/PaymentResult', [
            'order' => $order,
            'payment' => $payment,
            'status' => $status,
        ]);
    }

    /**
     * Admin rejects manual mobile banking payment.
     */
    public function adminReject(Request $request, Order $order)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        PaymentService::rejectManualPayment($order, auth()->id(), $validated['reason']);
        return back()->with('success', 'Manual payment rejected.');
    }
}
