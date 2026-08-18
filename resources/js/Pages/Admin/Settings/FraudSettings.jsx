import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  ShieldAlert, Sliders, Save, CheckCircle2, AlertTriangle, 
  HelpCircle, Eye, ShieldCheck, RefreshCw, Zap
} from 'lucide-react';

export default function FraudSettings({ settings }) {
  const { data, setData, post, processing, errors } = useForm({
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
    <AdminLayout title="Fraud Detection & Risk Rule Settings">
      <Head title="Fraud Detection Settings - Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2.5">
              <ShieldAlert className="w-7 h-7 text-rose-500" />
              <span>Fraud Risk Scoring & Rule Engine</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Configure risk rule weights, automatic hold thresholds, duplicate order detection windows, and return penalties.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => router.visit('/admin/customers/fraud-reviews')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Fraud Review Queue</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Engine Master Switch Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Automated Fraud Detection Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically scans all incoming checkout orders, computes risk scores (0–100), and flags suspicious behavior.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.fraud_detection_enabled}
                  onChange={(e) => setData('fraud_detection_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
              <span className="text-xs font-bold text-slate-200">
                {data.fraud_detection_enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Thresholds & Decision Boundaries */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h2 className="text-sm font-black text-white uppercase border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Risk Threshold Boundaries</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 uppercase tracking-wide">Manual Review Threshold</span>
                  <span className="text-sm font-black text-white font-mono">{data.fraud_manual_review_threshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={data.fraud_manual_review_threshold}
                  onChange={(e) => setData('fraud_manual_review_threshold', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Orders at or above this score require Admin manual review before packing.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 uppercase tracking-wide">Auto-Hold Threshold</span>
                  <span className="text-sm font-black text-white font-mono">{data.fraud_auto_hold_threshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={data.fraud_auto_hold_threshold}
                  onChange={(e) => setData('fraud_auto_hold_threshold', parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Orders at or above this score are automatically put ON HOLD & blocked from courier dispatch.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400 uppercase tracking-wide">Duplicate Window (Hours)</span>
                  <span className="text-sm font-black text-white font-mono">{data.fraud_duplicate_window_hours} hrs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="72"
                  value={data.fraud_duplicate_window_hours}
                  onChange={(e) => setData('fraud_duplicate_window_hours', parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Time window to detect multiple orders from the same customer phone / address.</p>
              </div>
            </div>
          </div>

          {/* Rule Impact Weights */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h2 className="text-sm font-black text-white uppercase border-b border-slate-800 pb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Risk Penalty Weights (0 - 100 Impact Points)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Return Rate Penalty */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>Courier Return Rate Penalty</span>
                  <span className="font-mono text-amber-400">+{data.fraud_return_rate_weight} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={data.fraud_return_rate_weight}
                  onChange={(e) => setData('fraud_return_rate_weight', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Applied when customer has $\ge 50\%$ courier return/cancellation history.</p>
              </div>

              {/* Cancellation Rate Penalty */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>Order Cancellation Rate Penalty</span>
                  <span className="font-mono text-amber-400">+{data.fraud_cancel_rate_weight} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={data.fraud_cancel_rate_weight}
                  onChange={(e) => setData('fraud_cancel_rate_weight', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Applied when customer cancelled majority of previous orders.</p>
              </div>

              {/* Duplicate Order Penalty */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>Duplicate Order Detection Penalty</span>
                  <span className="font-mono text-amber-400">+{data.fraud_duplicate_order_weight} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={data.fraud_duplicate_order_weight}
                  onChange={(e) => setData('fraud_duplicate_order_weight', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Applied if multiple orders placed with same phone within window.</p>
              </div>

              {/* High-Value COD Threshold & Penalty */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>High-Value Cash on Delivery (COD)</span>
                  <span className="font-mono text-amber-400">+{data.fraud_high_value_cod_weight} pts</span>
                </div>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      value={data.fraud_high_value_cod_threshold}
                      onChange={(e) => setData('fraud_high_value_cod_threshold', parseFloat(e.target.value))}
                      className="w-full bg-slate-950 text-slate-100 pl-7 pr-3 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={data.fraud_high_value_cod_weight}
                    onChange={(e) => setData('fraud_high_value_cod_weight', parseInt(e.target.value))}
                    className="w-1/3 accent-amber-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Flag COD orders exceeding threshold with no advance payment.</p>
              </div>

              {/* Rapid Multiple Orders */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>Rapid Flood Orders ({data.fraud_rapid_orders_threshold} in {data.fraud_rapid_orders_window_mins} mins)</span>
                  <span className="font-mono text-amber-400">+{data.fraud_rapid_orders_weight} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={data.fraud_rapid_orders_weight}
                  onChange={(e) => setData('fraud_rapid_orders_weight', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Spam order detection for bot flooding or accidental multi-clicks.</p>
              </div>

              {/* Suspicious Phone / Multi-Account Phone */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>Multi-Account Shared Phone Penalty</span>
                  <span className="font-mono text-amber-400">+{data.fraud_suspicious_phone_weight} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={data.fraud_suspicious_phone_weight}
                  onChange={(e) => setData('fraud_suspicious_phone_weight', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Applied when a phone number is linked to multiple customer logins.</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving Rules...' : 'Save Fraud Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
