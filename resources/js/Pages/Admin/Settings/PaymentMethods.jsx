import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { CreditCard, Save, ShieldCheck, AlertCircle, CheckCircle2, Sliders, Smartphone, Banknote } from 'lucide-react';

export default function PaymentMethods({ methods = [], settings = {} }) {
  const { data, setData, post, processing } = useForm({
    payment_cod_enabled: settings.payment_cod_enabled ?? true,
    payment_cod_title: settings.payment_cod_title || 'Cash on Delivery',
    payment_cod_description: settings.payment_cod_description || 'Pay cash when your order is delivered.',
    payment_cod_sort: settings.payment_cod_sort || 1,

    payment_bkash_enabled: settings.payment_bkash_enabled ?? true,
    payment_bkash_title: settings.payment_bkash_title || 'bKash',
    payment_bkash_description: settings.payment_bkash_description || 'Pay securely using bKash.',
    payment_bkash_sort: settings.payment_bkash_sort || 2,
    bkash_mode: settings.bkash_mode || 'sandbox',

    payment_nagad_enabled: settings.payment_nagad_enabled ?? true,
    payment_nagad_title: settings.payment_nagad_title || 'Nagad',
    payment_nagad_description: settings.payment_nagad_description || 'Pay securely using Nagad.',
    payment_nagad_sort: settings.payment_nagad_sort || 3,
    nagad_mode: settings.nagad_mode || 'sandbox',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/settings/payment-methods');
  };

  return (
    <AdminLayout title="Payment Gateways Configuration">
      <Head title="Payment Methods Settings - Admin" />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2.5">
              <CreditCard className="w-6 h-6 text-amber-500" />
              <span>PAYMENT METHODS & GATEWAYS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure active storefront payment options, environments, sort orders, and inspect gateway health.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">Security Isolation Notice</div>
            <p className="text-slate-400 leading-relaxed">
              API secrets, private keys, and passwords (such as <code className="text-amber-400 font-mono">BKASH_APP_SECRET</code> and <code className="text-amber-400 font-mono">NAGAD_PRIVATE_KEY</code>) are managed exclusively via server-side environment variables and are never transmitted to or displayed in the browser.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* 1. Cash on Delivery (COD) Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Cash on Delivery (COD)
                  </h3>
                  <div className="text-[11px] text-slate-400">Offline payment collected at courier delivery</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  Ready (No API Required)
                </span>
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.payment_cod_enabled}
                    onChange={(e) => setData('payment_cod_enabled', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-slate-200">Enabled on Checkout</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Display Title *</label>
                <input
                  type="text"
                  required
                  value={data.payment_cod_title}
                  onChange={(e) => setData('payment_cod_title', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1">Customer Description *</label>
                <input
                  type="text"
                  required
                  value={data.payment_cod_description}
                  onChange={(e) => setData('payment_cod_description', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 2. bKash Gateway Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#e2136e]/20 text-[#e2136e] flex items-center justify-center font-black text-sm">
                  bKash
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    bKash Online Payment Gateway
                  </h3>
                  <div className="text-[11px] text-slate-400">Tokenized checkout with automatic API verification</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  methods.find(m => m.code === 'bkash')?.status === 'Configured'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                    : 'bg-amber-950 text-amber-400 border-amber-800/40'
                }`}>
                  {methods.find(m => m.code === 'bkash')?.status || 'Configured'}
                </span>
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.payment_bkash_enabled}
                    onChange={(e) => setData('payment_bkash_enabled', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-slate-200">Enabled on Checkout</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Display Title *</label>
                <input
                  type="text"
                  required
                  value={data.payment_bkash_title}
                  onChange={(e) => setData('payment_bkash_title', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Operating Environment</label>
                <select
                  value={data.bkash_mode}
                  onChange={(e) => setData('bkash_mode', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500 font-medium"
                >
                  <option value="sandbox">Sandbox (Testing / Simulator)</option>
                  <option value="live">Live (Production Merchant)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Customer Description *</label>
                <input
                  type="text"
                  required
                  value={data.payment_bkash_description}
                  onChange={(e) => setData('payment_bkash_description', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Nagad Gateway Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#f7941d]/20 text-[#f7941d] flex items-center justify-center font-black text-sm">
                  Nagad
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Nagad Online Payment Gateway
                  </h3>
                  <div className="text-[11px] text-slate-400">Direct financial service (DFS) verification</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  methods.find(m => m.code === 'nagad')?.status === 'Configured'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                    : 'bg-amber-950 text-amber-400 border-amber-800/40'
                }`}>
                  {methods.find(m => m.code === 'nagad')?.status || 'Configured'}
                </span>
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.payment_nagad_enabled}
                    onChange={(e) => setData('payment_nagad_enabled', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-slate-200">Enabled on Checkout</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Display Title *</label>
                <input
                  type="text"
                  required
                  value={data.payment_nagad_title}
                  onChange={(e) => setData('payment_nagad_title', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Operating Environment</label>
                <select
                  value={data.nagad_mode}
                  onChange={(e) => setData('nagad_mode', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500 font-medium"
                >
                  <option value="sandbox">Sandbox (Testing / Simulator)</option>
                  <option value="live">Live (Production Merchant)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Customer Description *</label>
                <input
                  type="text"
                  required
                  value={data.payment_nagad_description}
                  onChange={(e) => setData('payment_nagad_description', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3.5 rounded-lg flex items-center justify-center space-x-2 shadow-xl uppercase tracking-wider transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>SAVE PAYMENT METHODS CONFIGURATION</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
