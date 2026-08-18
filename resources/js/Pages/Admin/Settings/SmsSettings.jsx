import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import SectionCard from '../../../Components/Admin/SectionCard';
import { 
  Sliders, ShieldCheck, CheckCircle2, AlertCircle, Save, 
  MessageSquare, Clock, Phone, Zap, BookOpen, ExternalLink, Send
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
    <AdminLayout title="Global SMS System Settings">
      <Head title="SMS Settings - Admin Back-Office" />

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Global SMS Engine Configuration"
          subtitle="Configure master dispatch toggles, administrative alert receivers, queue workers, and promotional quiet hours."
          badge="Global Controls"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/settings/sms-gateways"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold text-xs inline-flex items-center space-x-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure Gateways</span>
              </Link>
            </div>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Global SMS settings saved and cache invalidated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* 1. MASTER TOGGLES */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Master Dispatch Controls</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Enable SMS Globally</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Master kill-switch for all outbound SMS messages.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sms_enabled}
                    onChange={(e) => setData('sms_enabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${data.sms_enabled ? 'bg-amber-500' : 'bg-slate-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${data.sms_enabled ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Asynchronous Background Queue</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Send SMS via background worker without delaying checkout.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sms_queue_enabled}
                    onChange={(e) => setData('sms_queue_enabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${data.sms_queue_enabled ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${data.sms_queue_enabled ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Transactional Order SMS</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Order placed, confirmed, shipped, delivered, refunds.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sms_transactional_enabled}
                    onChange={(e) => setData('sms_transactional_enabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${data.sms_transactional_enabled ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${data.sms_transactional_enabled ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Promotional & Broadcast SMS</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bulk campaigns and promotional broadcasts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sms_promotional_enabled}
                    onChange={(e) => setData('sms_promotional_enabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${data.sms_promotional_enabled ? 'bg-amber-500' : 'bg-slate-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${data.sms_promotional_enabled ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. ADMIN ALERTS & DUPLICATE PREVENTION */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>Administrative Alerts & Rate Limiting</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Admin Notification Mobile Number</label>
                <input
                  type="text"
                  value={data.sms_admin_phone}
                  onChange={(e) => setData('sms_admin_phone', e.target.value)}
                  placeholder="e.g. 01711000000"
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">Target number for High Risk fraud alerts and New Order SMS alerts.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Duplicate Prevention Window (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={data.sms_duplicate_window_minutes}
                  onChange={(e) => setData('sms_duplicate_window_minutes', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">Prevents duplicate event SMS from sending to the same order within this window.</p>
              </div>
            </div>
          </div>

          {/* 3. PROMOTIONAL QUIET HOURS */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Promotional SMS Quiet Hours</span>
              </h2>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={data.sms_quiet_hours_enabled}
                  onChange={(e) => setData('sms_quiet_hours_enabled', e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="font-bold text-slate-300">Enable Quiet Hours</span>
              </label>
            </div>

            <p className="text-slate-400 text-xs">
              Restrict promotional broadcasts during nighttime hours to respect customer convenience (BTRC guidelines).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Quiet Hours Start (24h format)</label>
                <select
                  value={data.sms_quiet_hours_start}
                  onChange={(e) => setData('sms_quiet_hours_start', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00 ({i >= 12 ? `${i === 12 ? 12 : i - 12} PM` : `${i === 0 ? 12 : i} AM`})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Quiet Hours End (24h format)</label>
                <select
                  value={data.sms_quiet_hours_end}
                  onChange={(e) => setData('sms_quiet_hours_end', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00 ({i >= 12 ? `${i === 12 ? 12 : i - 12} PM` : `${i === 0 ? 12 : i} AM`})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. SETUP & STEP-BY-STEP INSTRUCTIONS */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>How to Configure SMS Gateways</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">Step 1: Obtain Provider Credentials</div>
                <p className="text-slate-400 text-[11px]">
                  Sign up with BulkSMS BD, MIM SMS, Greenweb SMS, or any vendor offering HTTP API access and acquire your API Key / Token and Sender ID.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">Step 2: Enter API Keys in Gateways</div>
                <p className="text-slate-400 text-[11px]">
                  Navigate to <Link href="/admin/settings/sms-gateways" className="text-white underline">SMS Gateways</Link>, select your provider, enter the credentials, and save.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">Step 3: Run Connection & Send Test</div>
                <p className="text-slate-400 text-[11px]">
                  Click "Test Connection" to fetch your account balance and dispatch a real test SMS to your personal mobile number.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">Step 4: Enable Automated Templates</div>
                <p className="text-slate-400 text-[11px]">
                  Head over to <Link href="/admin/communication/sms-templates" className="text-white underline">SMS Templates</Link> to toggle and customize individual event messages.
                </p>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={processing}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/10 cursor-pointer uppercase transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Global Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
