import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Activity, Save, ChevronDown, ChevronUp, Copy, Check, 
  ExternalLink, ShieldCheck, AlertCircle, HelpCircle, Eye, EyeOff 
} from 'lucide-react';

export default function AnalyticsTracking({ settings = {}, feedUrl = '', csvFeedUrl = '' }) {
  const { data, setData, post, processing, errors } = useForm({
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
    post('/admin/settings/analytics');
  };

  return (
    <AdminLayout title="Analytics & Tracking Settings">
      <Head title="Marketing Analytics & Tracking - TechMarket Admin" />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Activity className="w-6 h-6 text-amber-500" />
              <span>MARKETING ANALYTICS & TRACKING ENGINE</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure Google Analytics 4, Tag Manager, Meta Pixel, Conversions API (CAPI), and Meta Product Feeds.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/analytics/debug"
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Event Debugger
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'SAVING...' : 'SAVE TRACKING SETTINGS'}</span>
            </button>
          </div>
        </div>

        {/* 1. GOOGLE ANALYTICS 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-base">
                G4
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Analytics 4 (GA4)</h3>
                <p className="text-xs text-slate-400">Direct integration for web traffic and standard GA4 ecommerce events.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.ga4_enabled}
                onChange={(e) => setData('ga4_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                GA4 Measurement ID
              </label>
              <input
                type="text"
                value={data.ga4_measurement_id}
                onChange={(e) => setData('ga4_measurement_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              {errors.ga4_measurement_id && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.ga4_measurement_id}</p>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={data.ga4_ecommerce_enabled}
                  onChange={(e) => setData('ga4_ecommerce_enabled', e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span>Enable Full GA4 Ecommerce Event Stream</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={data.ga4_debug_mode}
                  onChange={(e) => setData('ga4_debug_mode', e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span>Enable GA4 Debug Mode (Admin DebugView)</span>
              </label>
            </div>
          </div>

          {/* Expandable How To Set Up Guide */}
          <div className="border-t border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => toggleGuide('ga4')}
              className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How to Set Up Google Analytics 4</span>
              {expandedGuide === 'ga4' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expandedGuide === 'ga4' && (
              <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-white">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Log in to your <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google Analytics Console</a>.</li>
                  <li>Create or select your GA4 Property and navigate to <strong>Admin → Data Streams</strong>.</li>
                  <li>Click on your <strong>Web Stream</strong> and copy the <strong>Measurement ID</strong> (formatted as <code className="text-amber-400">G-XXXXXXXXXX</code>).</li>
                  <li>Paste the Measurement ID above and toggle <strong>Enable Google Analytics</strong>.</li>
                  <li>Save settings and verify real-time events in Google Analytics <strong>Realtime</strong> or <strong>DebugView</strong>.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* 2. GOOGLE TAG MANAGER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-base">
                GTM
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Tag Manager (GTM)</h3>
                <p className="text-xs text-slate-400">Container-based tag orchestration. Avoid duplicate tags if GA4 is already enabled directly.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.gtm_enabled}
                onChange={(e) => setData('gtm_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                GTM Container ID
              </label>
              <input
                type="text"
                value={data.gtm_container_id}
                onChange={(e) => setData('gtm_container_id', e.target.value)}
                placeholder="GTM-XXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              {errors.gtm_container_id && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.gtm_container_id}</p>
              )}
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start space-x-2 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>GTM injects the official container snippet. When GTM is enabled, direct GA4 script loading is automatically bypassed to prevent double-counting.</span>
            </div>
          </div>

          {/* GTM Guide */}
          <div className="border-t border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => toggleGuide('gtm')}
              className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How to Set Up Google Tag Manager</span>
              {expandedGuide === 'gtm' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expandedGuide === 'gtm' && (
              <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-white">GTM Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Visit <a href="https://tagmanager.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google Tag Manager</a> and create a Web container.</li>
                  <li>Copy your Container ID (<code className="text-amber-400">GTM-XXXXXXX</code>) from the top navigation bar.</li>
                  <li>Paste the Container ID into the input above and enable GTM.</li>
                  <li>Publish your GTM container tags and trigger live preview.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* 3. META PIXEL & CONVERSIONS API */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-500 font-black text-base">
                FB
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Meta Pixel (Browser Tracking)</h3>
                <p className="text-xs text-slate-400">Client-side Facebook/Instagram tracking with deduplication support.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.meta_pixel_enabled}
                onChange={(e) => setData('meta_pixel_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Meta Pixel ID / Dataset ID
            </label>
            <input
              type="text"
              value={data.meta_pixel_id}
              onChange={(e) => setData('meta_pixel_id', e.target.value)}
              placeholder="e.g. 123456789012345"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Conversions API Sub-Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Meta Conversions API (Server-Side CAPI)</span>
                </h4>
                <p className="text-[11px] text-slate-400">Server-to-server tracking bypassing ad-blockers and iOS restrictions.</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.meta_capi_enabled}
                  onChange={(e) => setData('meta_capi_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center justify-between">
                  <span>Conversions API Access Token</span>
                  {settings.meta_capi_token_configured && (
                    <span className="text-emerald-400 font-normal text-[10px] font-mono">Configured ✓</span>
                  )}
                </label>
                <input
                  type="password"
                  value={data.meta_capi_token}
                  onChange={(e) => setData('meta_capi_token', e.target.value)}
                  placeholder={settings.meta_capi_token_configured ? '•••••••••••••••••••••••• (Unchanged)' : 'Paste System User Access Token'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Stored securely on server. Never exposed to browser or JavaScript.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Test Event Code (Optional)
                </label>
                <input
                  type="text"
                  value={data.meta_capi_test_code}
                  onChange={(e) => setData('meta_capi_test_code', e.target.value)}
                  placeholder="e.g. TEST12345 (Leave empty in production)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Used to view server events inside Meta Events Manager Test Events tab.</p>
              </div>
            </div>
          </div>

          {/* Meta Pixel & CAPI Guide */}
          <div className="border-t border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => toggleGuide('meta')}
              className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How to Set Up Meta Pixel & Conversions API</span>
              {expandedGuide === 'meta' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expandedGuide === 'meta' && (
              <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-white">Meta Setup Guide:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Open <a href="https://business.facebook.com/events_manager" target="_blank" rel="noreferrer" className="text-amber-400 underline">Meta Events Manager</a>.</li>
                  <li>Copy your <strong>Pixel ID / Dataset ID</strong> and paste it into the Pixel ID field.</li>
                  <li>Navigate to <strong>Settings → Conversions API → Set up manually</strong> and click <strong>Generate access token</strong>.</li>
                  <li>Paste the generated token into the <strong>Access Token</strong> field.</li>
                  <li>Enter your <strong>Test Event Code</strong> from the Test Events tab to verify browser and server event deduplication.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* 4. META PRODUCT CATALOG FEED */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
                CSV / XML
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Meta Product Catalog / Dynamic Product Ads Feed</h3>
                <p className="text-xs text-slate-400">Automated dynamic catalog feeds synchronized with canonical product IDs for Facebook Commerce Manager.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.meta_feed_enabled}
                onChange={(e) => setData('meta_feed_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 1. CSV Data Feed URL (Recommended for Facebook Commerce Manager Data Feed) */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <span>Live Meta Catalog CSV Data Feed URL</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-bold">Recommended for URL / Scheduled Feed</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={csvFeedUrl}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyCsvFeed}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
              >
                {copiedCsvFeed ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCsvFeed ? 'COPIED' : 'COPY CSV URL'}</span>
              </button>
              <a
                href={csvFeedUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl shrink-0"
                title="Open / Download CSV"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Paste this URL into Meta Commerce Manager &rarr; <strong>Add products &rarr; Use a URL or Google Sheets</strong>.
            </p>
          </div>

          {/* 2. XML Feed URL (Alternative RSS 2.0 with g: namespace) */}
          <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Live Meta Catalog XML Feed URL (Alternative)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono select-all"
              />
              <button
                type="button"
                onClick={handleCopyFeed}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
              >
                {copiedFeed ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedFeed ? 'COPIED' : 'COPY XML URL'}</span>
              </button>
              <a
                href={feedUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              Canonical Content ID format: <code className="text-amber-400">PRODUCT_&#123;id&#125;</code> (Matches ViewContent, AddToCart, and Purchase events).
            </p>
          </div>

          {/* Feed Guide */}
          <div className="border-t border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => toggleGuide('catalog')}
              className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How to Connect Meta Catalog in Commerce Manager</span>
              {expandedGuide === 'catalog' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expandedGuide === 'catalog' && (
              <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-white">Meta Catalog Connection Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Go to <a href="https://business.facebook.com/commerce" target="_blank" rel="noreferrer" className="text-amber-400 underline">Meta Commerce Manager</a>.</li>
                  <li>Create or select your Catalog → Click <strong>Data Sources</strong> → <strong>Add Items</strong>.</li>
                  <li>Select <strong>Data Feed</strong> → <strong>Scheduled Feed</strong>.</li>
                  <li>Paste the <strong>Live Meta Catalog XML Feed URL</strong> above.</li>
                  <li>Set the refresh schedule to <strong>Daily</strong> or <strong>Hourly</strong>.</li>
                  <li>Connect your Meta Pixel under <strong>Events</strong> to enable Dynamic Product Ads and Retargeting!</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
