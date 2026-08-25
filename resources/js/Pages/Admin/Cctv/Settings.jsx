import React from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Cpu,
  Save,
  HardDrive,
  Cable,
  Tag,
  Sparkles,
  Layers,
  Wrench,
  Info
} from 'lucide-react';

export default function Settings({ settings = {} }) {
  const { data, setData, post, processing, errors } = useForm({
    cctv_engine_version: settings.cctv_engine_version || '2.4.0',
    cctv_storage_overhead_percent: settings.cctv_storage_overhead_percent || '10',
    cctv_cable_waste_percent: settings.cctv_cable_waste_percent || '15',
    cctv_cable_safety_margin_meters: settings.cctv_cable_safety_margin_meters || '20',
    cctv_default_recording_days: settings.cctv_default_recording_days || '15',
    cctv_default_recording_hours: settings.cctv_default_recording_hours || '24',
    cctv_installation_base_charge: settings.cctv_installation_base_charge || '1500',
    cctv_installation_per_camera_charge: settings.cctv_installation_per_camera_charge || '500',
    cctv_quote_validity_days: settings.cctv_quote_validity_days || '15',
    cctv_storefront_version_enabled: settings.cctv_storefront_version_enabled || 'v1,v2,v3',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/cctv/settings');
  };

  return (
    <AdminLayout title="CCTV Calculation & Engine Settings" breadcrumbs={[{ label: 'CCTV Estimator', href: '/admin/cctv' }, { label: 'Settings' }]}>
      <div className="space-y-6 w-full max-w-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-heading">
            CCTV Calculation Engine Parameters
          </h1>
          <p className="text-xs text-slate-400">
            Configure system-wide overhead factors, cabling sag margins, and dynamic labor cost models.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Storage Parameters */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Storage Calculation Factors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Filesystem Formatting Overhead (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={data.cctv_storage_overhead_percent}
                  onChange={(e) => setData('cctv_storage_overhead_percent', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Additional margin added to raw bitrate calculations.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Retention Days
                </label>
                <input
                  type="number"
                  value={data.cctv_default_recording_days}
                  onChange={(e) => setData('cctv_default_recording_days', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Initial default slider position on estimator.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Daily Recording Hours
                </label>
                <input
                  type="number"
                  value={data.cctv_default_recording_hours}
                  onChange={(e) => setData('cctv_default_recording_hours', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Default daily duty cycle (1-24 hours).</p>
              </div>
            </div>
          </div>

          {/* Cabling Parameters */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <Cable className="w-4 h-4 text-amber-400" />
              <span>Cabling & Sag Margins</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cable Sag & Waste Allowance (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={data.cctv_cable_waste_percent}
                  onChange={(e) => setData('cctv_cable_waste_percent', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Covers bends, raceways, conduits, and pull slack.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Flat Safety Margin (Meters)
                </label>
                <input
                  type="number"
                  value={data.cctv_cable_safety_margin_meters}
                  onChange={(e) => setData('cctv_cable_safety_margin_meters', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Buffer added to entire project cabling run.</p>
              </div>
            </div>
          </div>

          {/* Installation & Labor Fees */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>Installation & Labor Algorithm</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Base Site Mobilization Charge (BDT)
                </label>
                <input
                  type="number"
                  value={data.cctv_installation_base_charge}
                  onChange={(e) => setData('cctv_installation_base_charge', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Fixed technician dispatch and tool setup charge.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Per-Camera Mounting & Termination Fee (BDT)
                </label>
                <input
                  type="number"
                  value={data.cctv_installation_per_camera_charge}
                  onChange={(e) => setData('cctv_installation_per_camera_charge', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Multiplied by total camera count.</p>
              </div>
            </div>
          </div>

          {/* Storefront & Versioning */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Storefront Architecture & Versioning</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enabled Storefront Versions
                </label>
                <input
                  type="text"
                  value={data.cctv_storefront_version_enabled}
                  onChange={(e) => setData('cctv_storefront_version_enabled', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Comma-separated list (e.g. v1,v2,v3).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Commercial Quote Validity (Days)
                </label>
                <input
                  type="number"
                  value={data.cctv_quote_validity_days}
                  onChange={(e) => setData('cctv_quote_validity_days', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Default expiry timeframe for issued quotes.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
