import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight, HeartHandshake } from 'lucide-react';

export default function Unsubscribe({
  token,
  email,
  category = 'marketing',
  preferences = {},
  isUnsubscribed = false,
}) {
  const [submitted, setSubmitted] = useState(isUnsubscribed);

  const { data, setData, post, processing } = useForm({
    category: 'all',
    reason: '',
    preferences: {
      marketing: false,
      promotional: false,
      product_updates: preferences.product_updates ?? true,
      order_updates: true, // Transactional always preserved
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(`/email/unsubscribe/${token}`, {
      preserveScroll: true,
      onSuccess: () => {
        setSubmitted(true);
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-['Hind_Siliguri',sans-serif] flex flex-col justify-between py-12 px-4">
      <Head title="Email Preferences & Unsubscribe — TechMarket BD" />

      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center space-y-2">
        <a href="/" className="inline-block">
          <span className="text-2xl font-black text-amber-400 tracking-tight font-heading">
            TECHMARKET<span className="text-white"> BD</span>
          </span>
        </a>
        <p className="text-xs text-slate-400">Manage Your Email Communication Preferences</p>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-white">Preferences Updated</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We have updated email settings for <strong className="text-slate-200 font-mono">{email}</strong>. You will no longer receive promotional emails.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-left flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Essential transactional messages (order confirmation, receipts, warranty) will continue to be delivered safely.
              </span>
            </div>
            <a
              href="/"
              className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              Return to Homepage
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-base font-black text-white">Email Preferences</h2>
              <p className="text-xs text-slate-400">
                Customizing notifications for <span className="text-amber-400 font-mono font-bold">{email}</span>
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="unsub_type"
                  checked={data.category === 'all'}
                  onChange={() => {
                    setData('category', 'all');
                    setData('preferences', { marketing: false, promotional: false, product_updates: false, order_updates: true });
                  }}
                  className="mt-1 text-amber-500 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Unsubscribe from all promotional emails</span>
                  <span className="text-[11px] text-slate-400">No more discounts, sales announcements, or newsletters</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-800/80">
                <input
                  type="radio"
                  name="unsub_type"
                  checked={data.category === 'promotional'}
                  onChange={() => {
                    setData('category', 'promotional');
                    setData('preferences', { marketing: false, promotional: false, product_updates: true, order_updates: true });
                  }}
                  className="mt-1 text-amber-500 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Keep only product stock & release updates</span>
                  <span className="text-[11px] text-slate-400">Receive alerts when wishlisted items come back in stock</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Reason for unsubscribing (Optional)</label>
              <textarea
                rows={2}
                value={data.reason}
                onChange={(e) => setData('reason', e.target.value)}
                placeholder="Let us know how we can improve..."
                className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {processing ? 'Updating...' : 'Save Email Preferences'}
            </button>
          </form>
        )}

      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-600 space-y-1">
        <p>&copy; 2026 TechMarket BD. All rights reserved.</p>
        <p>Dhaka, Bangladesh • Hotline: 09678-000000</p>
      </div>

    </div>
  );
}
