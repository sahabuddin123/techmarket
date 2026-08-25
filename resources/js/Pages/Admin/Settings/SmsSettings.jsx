import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  Sliders, CheckCircle2, Save, 
  MessageSquare, Clock, Phone, Zap, BookOpen 
} from 'lucide-react';

export default function SmsSettings({ settings = {} }) {
  const { data, setData, post, processing, recentlySuccessful } = useForm({
    sms_enabled: Boolean(settings.sms_enabled),
    sms_transactional_enabled: Boolean(settings.sms_transactional_enabled),
    sms_promotional_enabled: Boolean(settings.sms_promotional_enabled),
    sms_queue_enabled: Boolean(settings.sms_queue_enabled),
    sms_admin_phone: settings.sms_admin_phone || '',
    sms_duplicate_window_minutes: settings.sms_duplicate_window_minutes || '5',
    sms_quiet_hours_enabled: Boolean(settings.sms_quiet_hours_enabled),
    sms_quiet_hours_start: settings.sms_quiet_hours_start || '22',
    sms_quiet_hours_end: settings.sms_quiet_hours_end || '8',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/settings/sms', {
      preserveScroll: true,
    });
  };

  return (
    <AdminShell title="SMS Settings">
      <Head title="SMS System Configuration - TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none">
        {/* Header */}
        <AdminPageHeader
          title="Global SMS Engine Configuration"
          subtitle="Configure master dispatch toggles, administrative alert receivers, queue workers, and promotional quiet hours."
          badge="Global Controls"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/settings/sms-gateways"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center space-x-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure Gateways</span>
              </Link>
            </div>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Global SMS settings saved and cache invalidated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* 1. MASTER TOGGLES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 font-heading">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Master Dispatch Controls</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Enable SMS Globally</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Master kill-switch for all outbound SMS messages.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sms_enabled}
                    onChange={(e) => setData('sms_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Asynchronous Background Queue</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send SMS via background worker without delaying checkout.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sms_queue_enabled}
                    onChange={(e) => setData('sms_queue_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Transactional Order SMS</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Order placed, confirmed, shipped, delivered, refunds.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sms_transactional_enabled}
                    onChange={(e) => setData('sms_transactional_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Promotional & Broadcast SMS</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bulk campaigns and promotional broadcasts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sms_promotional_enabled}
                    onChange={(e) => setData('sms_promotional_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. ADMIN ALERTS & DUPLICATE PREVENTION */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 font-heading">
              <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Administrative Alerts & Rate Limiting</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Admin Notification Mobile Number</label>
                <input
                  type="text"
                  value={data.sms_admin_phone}
                  onChange={(e) => setData('sms_admin_phone', e.target.value)}
                  placeholder="e.g. 01711000000"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono text-xs"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">Target number for High Risk fraud alerts and New Order SMS alerts.</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Duplicate Prevention Window (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={data.sms_duplicate_window_minutes}
                  onChange={(e) => setData('sms_duplicate_window_minutes', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono text-xs"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">Prevents duplicate event SMS from sending to the same order within this window.</p>
              </div>
            </div>
          </div>

          {/* 3. PROMOTIONAL QUIET HOURS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-2 font-heading">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Promotional SMS Quiet Hours</span>
              </h2>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={data.sms_quiet_hours_enabled}
                  onChange={(e) => setData('sms_quiet_hours_enabled', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">Enable Quiet Hours</span>
              </label>
            </div>

            <p className="text-slate-500 text-xs">
              Restrict promotional broadcasts during nighttime hours to respect customer convenience (BTRC guidelines).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Quiet Hours Start (24h format)</label>
                <select
                  value={data.sms_quiet_hours_start}
                  onChange={(e) => setData('sms_quiet_hours_start', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono text-xs"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00 ({i >= 12 ? `${i === 12 ? 12 : i - 12} PM` : `${i === 0 ? 12 : i} AM`})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Quiet Hours End (24h format)</label>
                <select
                  value={data.sms_quiet_hours_end}
                  onChange={(e) => setData('sms_quiet_hours_end', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono text-xs"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00 ({i >= 12 ? `${i === 12 ? 12 : i - 12} PM` : `${i === 0 ? 12 : i} AM`})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Global Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
