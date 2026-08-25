import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  Bell, Shield, Check, Save, Radio, Globe, MessageSquare, Mail, 
  AlertOctagon, Sliders, CheckCircle2 
} from 'lucide-react';

export default function NotificationSettings({
  preferences = {}
}) {
  const [prefsState, setPrefsState] = useState(preferences);
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const { data, setData, post, processing, recentlySuccessful } = useForm({
    preferences: prefsState,
  });

  const handleChannelToggle = (category, channel) => {
    setPrefsState(prev => {
      const currentCat = prev[category] || { in_app_enabled: true, browser_enabled: true, sms_enabled: false, email_enabled: false };
      const updated = {
        ...prev,
        [category]: {
          ...currentCat,
          [`${channel}_enabled`]: !currentCat[`${channel}_enabled`],
        },
      };
      setData('preferences', updated);
      return updated;
    });
  };

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        new Notification('TechMarket BD OS', {
          body: 'Browser notifications are now enabled for enterprise alerts.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/settings/notifications', { preserveScroll: true });
  };

  const categories = [
    { key: 'ORDER', label: 'Orders & Checkout Events', desc: 'New orders placed, cancelled, or requiring payment verification.' },
    { key: 'INVENTORY', label: 'Inventory & Low Stock Alarms', desc: 'SKUs breaching safety stock replenishment thresholds.' },
    { key: 'SECURITY', label: 'Security & Access Audits', desc: 'Multiple failed logins, brute force lockouts, and permission changes.' },
    { key: 'SYSTEM', label: 'System Health & Worker Telemetry', desc: 'Failed background queue jobs and gateway connectivity drops.' },
    { key: 'CUSTOMER', label: 'Customer Reviews & Fraud Flags', desc: 'New verified buyer reviews and suspicious phone score alerts.' },
  ];

  return (
    <AdminShell title="Notification Preferences">
      <Head title="Notification Preferences & Settings - TechMarket Admin" />

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-none">
        {/* Page Header */}
        <AdminPageHeader
          title="Administrative Notification Preferences"
          subtitle="Configure real-time in-app bell badges, web browser push permissions, SMS alerts, and email notifications."
          badge="Alerts Hub"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/settings/notification-rules"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Rule Definitions</span>
              </Link>
            </div>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Notification preferences updated successfully.</span>
          </div>
        )}

        {/* Web Push Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                Web Browser Desktop Push Notifications
              </h3>
              <p className="text-xs text-slate-500">
                Receive instant toast popups even when the Admin panel tab is in the background.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestBrowserPermission}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer self-start sm:self-auto ${
              browserPermission === 'granted'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {browserPermission === 'granted' ? '✓ Browser Push Enabled' : 'Enable Browser Push'}
          </button>
        </div>

        {/* Matrix Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
              Category Channel Dispatch Matrix
            </h3>
            <span className="text-[11px] text-slate-400">Per-category toggle matrix</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((cat) => {
              const pref = prefsState[cat.key] || { in_app_enabled: true, browser_enabled: true, sms_enabled: false, email_enabled: false };

              return (
                <div key={cat.key} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{cat.label}</div>
                    <p className="text-[11px] text-slate-500">{cat.desc}</p>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.in_app_enabled}
                        onChange={() => handleChannelToggle(cat.key, 'in_app')}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">In-App Bell</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.browser_enabled}
                        onChange={() => handleChannelToggle(cat.key, 'browser')}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Browser Push</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.sms_enabled}
                        onChange={() => handleChannelToggle(cat.key, 'sms')}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">SMS Alert</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.email_enabled}
                        onChange={() => handleChannelToggle(cat.key, 'email')}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Email</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Notification Matrix'}</span>
            </button>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
