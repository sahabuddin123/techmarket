import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  ShieldAlert, Sliders, Save, CheckCircle2, AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';

export default function FraudSettings({ settings = {} }) {
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    fraud_detection_enabled: Boolean(settings.fraud_detection_enabled),
    fraud_return_rate_weight: settings.fraud_return_rate_weight || 35,
    fraud_cancel_rate_weight: settings.fraud_cancel_rate_weight || 20,
    fraud_failed_delivery_weight: settings.fraud_failed_delivery_weight || 25,
    fraud_duplicate_order_weight: settings.fraud_duplicate_order_weight || 25,
    fraud_high_value_cod_threshold: settings.fraud_high_value_cod_threshold || 40000,
    fraud_high_value_cod_weight: settings.fraud_high_value_cod_weight || 20,
    fraud_rapid_orders_window_mins: settings.fraud_rapid_orders_window_mins || 15,
    fraud_rapid_orders_threshold: settings.fraud_rapid_orders_threshold || 2,
    fraud_rapid_orders_weight: settings.fraud_rapid_orders_weight || 25,
    fraud_suspicious_phone_weight: settings.fraud_suspicious_phone_weight || 30,
    fraud_suspicious_address_weight: settings.fraud_suspicious_address_weight || 20,
    fraud_manual_review_threshold: settings.fraud_manual_review_threshold || 50,
    fraud_auto_hold_threshold: settings.fraud_auto_hold_threshold || 75,
    fraud_duplicate_window_hours: settings.fraud_duplicate_window_hours || 24,
  });

  const handleSave = (e) => {
    e.preventDefault();
    post('/admin/settings/fraud', { preserveScroll: true });
  };

  return (
    <AdminShell title="Fraud Engine Settings">
      <Head title="Fraud Detection Settings - TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none">
        {/* Page Header */}
        <AdminPageHeader
          title="Fraud Risk Scoring & Rule Engine"
          subtitle="Configure risk rule weights, automatic hold thresholds, duplicate order detection windows, and return penalties."
          badge="AI Shield Engine"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/customers/fraud-reviews"
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Fraud Review Queue</span>
              </Link>
            </div>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Fraud scoring weights and threshold rules saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Master Enable Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                  Automated Anti-Fraud Shield Engine
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Calculate cumulative risk scores on every checkout and automatically flag suspicious orders.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.fraud_detection_enabled}
                  onChange={(e) => setData('fraud_detection_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Scoring Thresholds */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading border-b border-slate-100 dark:border-slate-800 pb-3">
              Action Trigger Thresholds (0 - 100 Risk Score)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Manual Review Threshold (Flagged)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.fraud_manual_review_threshold}
                  onChange={(e) => setData('fraud_manual_review_threshold', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">Scores above this trigger a review flag for agent inspection.</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Auto-Hold Threshold (Critical)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.fraud_auto_hold_threshold}
                  onChange={(e) => setData('fraud_auto_hold_threshold', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">Scores above this automatically hold order from courier dispatch.</p>
              </div>
            </div>
          </div>

          {/* Rule Weight Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading border-b border-slate-100 dark:border-slate-800 pb-3">
              Signal Weight Modifiers (Points added per risk factor)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">High Return History Weight</label>
                <input
                  type="number"
                  value={data.fraud_return_rate_weight}
                  onChange={(e) => setData('fraud_return_rate_weight', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Failed Delivery Weight</label>
                <input
                  type="number"
                  value={data.fraud_failed_delivery_weight}
                  onChange={(e) => setData('fraud_failed_delivery_weight', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Duplicate Order Penalty</label>
                <input
                  type="number"
                  value={data.fraud_duplicate_order_weight}
                  onChange={(e) => setData('fraud_duplicate_order_weight', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">High Value COD Threshold (BDT)</label>
                <input
                  type="number"
                  value={data.fraud_high_value_cod_threshold}
                  onChange={(e) => setData('fraud_high_value_cod_threshold', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">High Value COD Penalty</label>
                <input
                  type="number"
                  value={data.fraud_high_value_cod_weight}
                  onChange={(e) => setData('fraud_high_value_cod_weight', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Suspicious Phone Penalty</label>
                <input
                  type="number"
                  value={data.fraud_suspicious_phone_weight}
                  onChange={(e) => setData('fraud_suspicious_phone_weight', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Ribbon */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Scoring updates will immediately affect upcoming orders.</span>

            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Fraud Rules'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
