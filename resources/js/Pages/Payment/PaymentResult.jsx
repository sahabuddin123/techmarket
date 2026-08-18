import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { CheckCircle2, XCircle, AlertCircle, Clock, FileText, ArrowRight, RotateCcw, Home, HelpCircle } from 'lucide-react';

export default function PaymentResult({ order, payment, status = 'success' }) {
  const normalizedStatus = String(status).toLowerCase();

  const isSuccess = normalizedStatus === 'success' || normalizedStatus === 'paid';
  const isFailed = normalizedStatus === 'failed' || normalizedStatus === 'error';
  const isCancelled = normalizedStatus === 'cancelled' || normalizedStatus === 'cancel';
  const isPending = !isSuccess && !isFailed && !isCancelled;

  const getMethodName = (pm) => {
    const m = String(pm || '').toLowerCase();
    if (m === 'cod') return 'Cash on Delivery';
    if (m === 'bkash') return 'bKash';
    if (m === 'nagad') return 'Nagad';
    return pm || 'Cash on Delivery';
  };

  const handleRetry = () => {
    const m = String(order.payment_method || '').toLowerCase();
    if (m === 'bkash') {
      router.post(`/payment/bkash/retry/${order.order_number}`);
    } else if (m === 'nagad') {
      router.post(`/payment/nagad/retry/${order.order_number}`);
    } else {
      router.visit('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#334155] font-sans flex flex-col selection:bg-[#274a7d] selection:text-white">
      <Head title={`Payment ${isSuccess ? 'Success' : isFailed ? 'Failed' : isCancelled ? 'Cancelled' : 'Pending'} - TechMarket BD`} />

      <Navbar />

      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-8 text-center space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {isSuccess && (
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            )}
            {isFailed && (
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-9 h-9" />
              </div>
            )}
            {isCancelled && (
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-9 h-9" />
              </div>
            )}
            {isPending && (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock className="w-9 h-9" />
              </div>
            )}
          </div>

          {/* Heading and Description */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1e293b]">
              {isSuccess && 'Payment Completed Successfully!'}
              {isFailed && 'Payment Failed or Declined'}
              {isCancelled && 'Payment Was Cancelled'}
              {isPending && 'Payment Awaiting Verification'}
            </h1>
            <p className="text-[13px] text-[#64748b] max-w-[480px] mx-auto">
              {isSuccess && 'Thank you for your payment. Your order has been confirmed and is now being processed by our fulfillment team.'}
              {isFailed && 'We could not complete your online transaction. Please check your balance or retry with another payment method.'}
              {isCancelled && 'You cancelled the payment process. You can safely retry or change your payment option.'}
              {isPending && 'Your payment is currently being verified by the gateway. We will update your order status as soon as confirmation arrives.'}
            </p>
          </div>

          {/* Transaction Summary Card */}
          <div className="bg-[#fafbfc] border border-[#e2e8f0] rounded-[6px] p-4 text-left space-y-2.5 text-[12.5px]">
            <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b]">Order Number:</span>
              <span className="font-bold text-[#1e293b] font-mono">{order.order_number}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b]">Payment Method:</span>
              <span className="font-semibold text-[#1e293b]">{getMethodName(order.payment_method)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b]">Payment Status:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider ${
                isSuccess ? 'bg-emerald-100 text-emerald-800' :
                isFailed ? 'bg-rose-100 text-rose-800' :
                isCancelled ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.payment_status}
              </span>
            </div>
            {order.transaction_id && (
              <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Transaction Ref:</span>
                <span className="font-mono text-[#274a7d] font-semibold">{order.transaction_id}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-[#1e293b]">Total Amount:</span>
              <span className="text-[15px] font-black text-[#274a7d]">৳{Number(order.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {isSuccess && (
              <>
                <Link
                  href={`/invoice/${order.order_number}`}
                  className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[13px] font-bold px-5 py-2.5 rounded-[4px] shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Official Invoice</span>
                </Link>
                <Link
                  href="/account/orders/history"
                  className="bg-white hover:bg-slate-50 text-[#1e293b] border border-[#d9dde3] text-[13px] font-semibold px-4 py-2.5 rounded-[4px] transition-colors"
                >
                  Order History
                </Link>
                <Link
                  href="/"
                  className="text-[12.5px] font-semibold text-[#274a7d] hover:underline px-3 py-2 flex items-center space-x-1"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </>
            )}

            {(isFailed || isCancelled) && (
              <>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[13px] font-bold px-5 py-2.5 rounded-[4px] shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Payment</span>
                </button>
                <Link
                  href={`/invoice/${order.order_number}`}
                  className="bg-white hover:bg-slate-50 text-[#1e293b] border border-[#d9dde3] text-[13px] font-semibold px-4 py-2.5 rounded-[4px] transition-colors"
                >
                  View Order
                </Link>
                <Link
                  href="/page/contact-us"
                  className="text-[12.5px] font-semibold text-[#64748b] hover:text-[#1e293b] px-3 py-2 flex items-center space-x-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Contact Support</span>
                </Link>
              </>
            )}

            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => router.reload()}
                  className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[13px] font-bold px-5 py-2.5 rounded-[4px] shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refresh Status</span>
                </button>
                <Link
                  href="/account/orders/history"
                  className="bg-white hover:bg-slate-50 text-[#1e293b] border border-[#d9dde3] text-[13px] font-semibold px-4 py-2.5 rounded-[4px] transition-colors"
                >
                  Order History
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
