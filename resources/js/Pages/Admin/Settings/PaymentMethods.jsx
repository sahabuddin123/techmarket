import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { CreditCard, Save, ShieldCheck, CheckCircle2, Smartphone, Banknote } from 'lucide-react';

export default function PaymentMethods({ methods = [], settings = {} }) {
  const { data, setData, post, processing, recentlySuccessful } = useForm({
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
    post('/admin/settings/payment-methods', { preserveScroll: true });
  };

  return (
    <AdminShell title="Payment Gateways">
      <Head title="Payment Methods Settings - TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none">
        {/* Page Header */}
        <AdminPageHeader
          title="Payment Methods & Merchant Gateways"
          subtitle="Configure active storefront payment options, environments, sort orders, and inspect gateway health."
          badge="Checkout Gateways"
        />

        {/* Security Notice */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 flex items-start space-x-3.5 text-xs shadow-2xs">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] font-heading">
              Security Isolation Notice
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              API secrets, private keys, and passwords (such as <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">BKASH_APP_SECRET</code> and <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">NAGAD_PRIVATE_KEY</code>) are managed exclusively via server-side environment variables and are never transmitted to the browser.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* 1. Cash on Delivery (COD) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                    Cash on Delivery (COD)
                  </h3>
                  <p className="text-[11px] text-slate-400">Accept payment upon physical doorstep delivery.</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.payment_cod_enabled}
                  onChange={(e) => setData('payment_cod_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Display Title</label>
                <input
                  type="text"
                  value={data.payment_cod_title}
                  onChange={(e) => setData('payment_cod_title', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={data.payment_cod_sort}
                  onChange={(e) => setData('payment_cod_sort', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Checkout Customer Instructions</label>
                <input
                  type="text"
                  value={data.payment_cod_description}
                  onChange={(e) => setData('payment_cod_description', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. bKash PGW */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                    bKash Payment Gateway (Tokenized v1.2.0)
                  </h3>
                  <p className="text-[11px] text-slate-400">Direct wallet debit and seamless OTP authentication.</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.payment_bkash_enabled}
                  onChange={(e) => setData('payment_bkash_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Display Title</label>
                <input
                  type="text"
                  value={data.payment_bkash_title}
                  onChange={(e) => setData('payment_bkash_title', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Gateway Environment</label>
                <select
                  value={data.bkash_mode}
                  onChange={(e) => setData('bkash_mode', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-bold"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="live">Live Production</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={data.payment_bkash_sort}
                  onChange={(e) => setData('payment_bkash_sort', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Customer Description</label>
                <input
                  type="text"
                  value={data.payment_bkash_description}
                  onChange={(e) => setData('payment_bkash_description', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 3. Nagad Direct Gateway */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                    Nagad Direct PGW
                  </h3>
                  <p className="text-[11px] text-slate-400">Digital financial service by Bangladesh Post Office.</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.payment_nagad_enabled}
                  onChange={(e) => setData('payment_nagad_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Display Title</label>
                <input
                  type="text"
                  value={data.payment_nagad_title}
                  onChange={(e) => setData('payment_nagad_title', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Gateway Environment</label>
                <select
                  value={data.nagad_mode}
                  onChange={(e) => setData('nagad_mode', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-bold"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="live">Live Production</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={data.payment_nagad_sort}
                  onChange={(e) => setData('payment_nagad_sort', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Customer Description</label>
                <input
                  type="text"
                  value={data.payment_nagad_description}
                  onChange={(e) => setData('payment_nagad_description', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Ribbon */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs">
            {recentlySuccessful ? (
              <span className="text-emerald-600 text-xs font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Payment method configuration saved</span>
              </span>
            ) : <div />}

            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Payment Gateways'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
