import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Bell, Shield, Check, Save, Radio, Globe, MessageSquare, Mail, 
  AlertOctagon, Sliders
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

  const { data, setData, post, processing } = useForm({
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

  return (
    <AdminLayout title="Notification Settings">
      <Head title="Notification Preferences & Settings — TechMarket BD" />

      <div className="space-y-6 font-['Hind_Siliguri',sans-serif] max-w-5xl">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-amber-400" />
              <span>Notification Preferences</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure personal and operational delivery channels per alert category
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/settings/notification-rules"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              Configure Alert Rules
            </Link>
          </div>
        </div>

        {/* Browser Permission Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Desktop & Browser Push Notifications</h3>
              <p className="text-xs text-slate-400">
                Current status: <strong className="text-amber-400 font-mono capitalize">{browserPermission}</strong>
              </p>
            </div>
          </div>

          {browserPermission !== 'granted' ? (
            <button
              type="button"
              onClick={handleRequestBrowserPermission}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Enable Browser Notifications
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Permission Active</span>
            </div>
          )}
        </div>

        {/* Preferences Matrix Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-black text-white text-sm">Category Delivery Matrix</h2>
              <span className="text-[11px] text-slate-400 font-medium">Toggle active channels</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {Object.entries(prefsState).map(([catKey, pref]) => (
                <div key={catKey} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-white text-sm">{pref.label || catKey}</span>
                    <p className="text-xs text-slate-500 font-mono">Category: {catKey}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* In-App */}
                    <button
                      type="button"
                      onClick={() => handleChannelToggle(catKey, 'in_app')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        pref.in_app_enabled
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>In-App</span>
                    </button>

                    {/* Browser */}
                    <button
                      type="button"
                      onClick={() => handleChannelToggle(catKey, 'browser')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        pref.browser_enabled
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Browser</span>
                    </button>

                    {/* SMS */}
                    <button
                      type="button"
                      onClick={() => handleChannelToggle(catKey, 'sms')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        pref.sms_enabled
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </button>

                    {/* Email */}
                    <button
                      type="button"
                      onClick={() => handleChannelToggle(catKey, 'email')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        pref.email_enabled
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Priority Override Policy Note */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-400">
          <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Critical Alert Policy:</strong> Notifications flagged as <code className="text-rose-400 font-mono">CRITICAL</code> (such as negative stock anomalies, gateway downtime, and critical fraud scores) will automatically dispatch in-app regardless of category preference to ensure business continuity.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
}
