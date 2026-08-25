import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  Activity, Save, ChevronDown, ChevronUp, Copy, Check, 
  ExternalLink, ShieldCheck, AlertCircle, HelpCircle, Eye, EyeOff, CheckCircle2 
} from 'lucide-react';

export default function AnalyticsTracking({ settings = {}, feedUrl = '', csvFeedUrl = '' }) {
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    // GA4
    ga4_enabled: Boolean(settings.ga4_enabled),
    ga4_measurement_id: settings.ga4_measurement_id || '',
    ga4_ecommerce_enabled: Boolean(settings.ga4_ecommerce_enabled ?? true),
    ga4_debug_mode: Boolean(settings.ga4_debug_mode),

    // GTM
    gtm_enabled: Boolean(settings.gtm_enabled),
    gtm_container_id: settings.gtm_container_id || '',

    // Meta Pixel
    meta_pixel_enabled: Boolean(settings.meta_pixel_enabled),
    meta_pixel_id: settings.meta_pixel_id || '',

    // Meta Conversions API
    meta_capi_enabled: Boolean(settings.meta_capi_enabled),
    meta_capi_token: '',
    meta_capi_test_code: settings.meta_capi_test_code || '',
    meta_capi_version: settings.meta_capi_version || 'v19.0',

    // Meta Marketing API
    meta_app_id: settings.meta_app_id || '',
    meta_app_secret: '',
    meta_ad_account_id: settings.meta_ad_account_id || '',

    // Feed
    meta_feed_enabled: Boolean(settings.meta_feed_enabled ?? true),
  });

  const [expandedGuide, setExpandedGuide] = useState(null);
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [copiedCsvFeed, setCopiedCsvFeed] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const toggleGuide = (id) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  const handleCopyFeed = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  const handleCopyCsvFeed = () => {
    navigator.clipboard.writeText(csvFeedUrl);
    setCopiedCsvFeed(true);
    setTimeout(() => setCopiedCsvFeed(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/settings/analytics', { preserveScroll: true });
  };

  return (
    <AdminShell title="Analytics & Pixel Tracking">
      <Head title="Marketing Analytics & Tracking Engine - TechMarket Admin" />

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-none">
        {/* Page Header */}
        <AdminPageHeader
          title="Marketing Analytics & Tracking Engine"
          subtitle="Configure Google Analytics 4, Tag Manager, Meta Pixel, Server-side Conversions API (CAPI), and Product Feeds."
          badge="Conversion APIs"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/analytics/debug"
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                Event Debugger
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : 'Save Tracking Settings'}</span>
              </button>
            </div>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Tracking settings saved and synchronized to frontend scripts.</span>
          </div>
        )}

        {/* 1. GOOGLE ANALYTICS 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm font-mono">
                GA4
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Google Analytics 4 (GA4)</h3>
                <p className="text-xs text-slate-500">Direct client-side gtag telemetry and standard GA4 ecommerce purchase events.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.ga4_enabled}
                onChange={(e) => setData('ga4_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                GA4 Measurement ID
              </label>
              <input
                type="text"
                value={data.ga4_measurement_id}
                onChange={(e) => setData('ga4_measurement_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-mono"
              />
              {errors.ga4_measurement_id && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.ga4_measurement_id}</p>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.ga4_ecommerce_enabled}
                  onChange={(e) => setData('ga4_ecommerce_enabled', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable Full GA4 Ecommerce Event Stream</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.ga4_debug_mode}
                  onChange={(e) => setData('ga4_debug_mode', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable GA4 Debug Mode (Admin DebugView)</span>
              </label>
            </div>
          </div>
        </div>

        {/* 2. GOOGLE TAG MANAGER (GTM) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm font-mono">
                GTM
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Google Tag Manager (GTM)</h3>
                <p className="text-xs text-slate-500">Inject container snippet with comprehensive dataLayer push events.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.gtm_enabled}
                onChange={(e) => setData('gtm_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              GTM Container ID
            </label>
            <input
              type="text"
              value={data.gtm_container_id}
              onChange={(e) => setData('gtm_container_id', e.target.value)}
              placeholder="GTM-XXXXXXX"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        {/* 3. META PIXEL & CONVERSIONS API */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm font-mono">
                META
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Meta Pixel & Conversions API (CAPI)</h3>
                <p className="text-xs text-slate-500">Browser pixel + server-side event deduplication for maximum match rate.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.meta_pixel_enabled}
                onChange={(e) => setData('meta_pixel_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Meta Pixel ID *
              </label>
              <input
                type="text"
                value={data.meta_pixel_id}
                onChange={(e) => setData('meta_pixel_id', e.target.value)}
                placeholder="e.g. 123456789012345"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                CAPI Test Event Code (Optional)
              </label>
              <input
                type="text"
                value={data.meta_capi_test_code}
                onChange={(e) => setData('meta_capi_test_code', e.target.value)}
                placeholder="TESTXXXXX"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5 flex items-center justify-between">
                <span>Meta Conversions API (CAPI) Access Token</span>
                {settings.meta_capi_token_configured && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    ✓ Configured in DB
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={data.meta_capi_token}
                  onChange={(e) => setData('meta_capi_token', e.target.value)}
                  placeholder={settings.meta_capi_token_configured ? "•••••••••••••••••••• (Leave blank to keep existing)" : "EAAB..."}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Ribbon */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Changes take effect immediately on public web storefront.</span>

          <button
            type="submit"
            disabled={processing}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{processing ? 'Saving...' : 'Save Tracking Settings'}</span>
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
