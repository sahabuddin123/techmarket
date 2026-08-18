import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck, ArrowLeft, RefreshCw, ExternalLink, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

export default function BkashCheckout({ order, paymentData }) {
  const [loading, setLoading] = useState(false);
  const isConfigured = paymentData?.configured;
  const redirectUrl = paymentData?.redirect_url;
  const isExternalUrl = redirectUrl && (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://'));

  // Auto redirect if real gateway redirect URL provided
  useEffect(() => {
    if (isExternalUrl) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl, isExternalUrl]);

  const handleVerifyOrProceed = () => {
    setLoading(true);
    if (isExternalUrl) {
      window.location.href = redirectUrl;
    } else {
      // In sandbox mode or status poll, verify against backend authoritative endpoint
      router.post(`/payment/bkash/confirm/${order.order_number}`, {
        paymentID: paymentData?.paymentID,
        trx_id: paymentData?.trxID,
      });
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel the bKash payment?')) {
      setLoading(true);
      router.post(`/payment/bkash/cancel/${order.order_number}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col justify-center items-center p-4 font-sans selection:bg-[#e2136e] selection:text-white">
      <Head title={`bKash Payment - Order #${order.order_number}`} />

      {/* Main Payment Container */}
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        {/* bKash Pink Header */}
        <div className="bg-[#e2136e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center font-black text-[#e2136e] text-base shadow-sm">
              bKash
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">bKash Payment</div>
              <div className="text-[11px] text-pink-100 font-medium">
                {paymentData?.merchant || 'TechMarket BD Online Store'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-pink-100 font-medium uppercase">Total Payable</div>
            <div className="text-lg font-black tracking-tight">৳{Number(order.total).toLocaleString()}</div>
          </div>
        </div>

        {/* Invoice Info Bar */}
        <div className="bg-pink-50/80 px-5 py-2.5 border-b border-pink-100 flex items-center justify-between text-xs text-slate-700">
          <div>Invoice: <strong className="text-slate-900 font-mono">{order.order_number}</strong></div>
          <div className="flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* Status & Verification Box */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-[#e2136e] mb-1">
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isExternalUrl ? 'Redirecting to bKash Gateway...' : 'Payment Awaiting Authorization'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please complete your transaction securely on the bKash payment portal.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-bold text-slate-900 font-mono">{order.order_number}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Customer Phone:</span>
              <span className="font-medium text-slate-900">{order.customer_phone}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Gateway Environment:</span>
              <span className="font-bold uppercase text-[10px] text-[#e2136e]">{paymentData?.mode || 'Sandbox'}</span>
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="font-bold text-slate-900">Amount:</span>
              <span className="font-black text-[#e2136e] text-sm">৳{Number(order.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel Payment
            </button>
            <button
              type="button"
              onClick={handleVerifyOrProceed}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#e2136e] hover:bg-[#c20f5e] text-white font-bold text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : isExternalUrl ? (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Pay with bKash</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify Payment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Support Notice */}
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100 text-[11px] text-slate-500">
          Dial <strong>16247</strong> for bKash Customer Support
        </div>
      </div>
    </div>
  );
}
