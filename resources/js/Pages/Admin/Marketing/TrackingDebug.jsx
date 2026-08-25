import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  Activity, ShieldCheck, CheckCircle2, AlertTriangle, 
  ExternalLink, Rss, Layers, Check, ArrowLeft 
} from 'lucide-react';

export default function TrackingDebug({ health = {}, recentEvents = [] }) {
  return (
    <AdminShell title="Tracking Diagnostics">
      <Head title="Tracking Diagnostics & Event Debugger - TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none pb-12">
        {/* Header */}
        <AdminPageHeader
          title="Tracking Diagnostics & Event Stream"
          subtitle="Inspect active tracking tags, Meta CAPI server status, and real-time client-to-server event streams."
          badge="Diagnostic Telemetry"
          actions={
            <div className="flex items-center space-x-2.5">
              <Link
                href="/admin/analytics"
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Analytics</span>
              </Link>
              <Link
                href="/admin/settings/analytics"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Configure Tracking
              </Link>
            </div>
          }
        />

        {/* 1. PLATFORM HEALTH STATUS MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* GA4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center space-x-2 font-heading">
                <span className={`w-2.5 h-2.5 rounded-full ${health.ga4?.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>{health.ga4?.name}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                health.ga4?.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {health.ga4?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 truncate">
              ID: {health.ga4?.id}
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Ecommerce Stream:</span>
              <span className="text-emerald-700 font-bold">{health.ga4?.ecommerce_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          {/* Meta Pixel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center space-x-2 font-heading">
                <span className={`w-2.5 h-2.5 rounded-full ${health.meta_pixel?.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                <span>{health.meta_pixel?.name}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                health.meta_pixel?.enabled ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {health.meta_pixel?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 truncate">
              Pixel ID: {health.meta_pixel?.id}
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Browser Deduplication:</span>
              <span className="text-blue-700 font-bold">Supported (event_id)</span>
            </div>
          </div>

          {/* Meta CAPI */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center space-x-2 font-heading">
                <span className={`w-2.5 h-2.5 rounded-full ${health.meta_capi?.enabled ? 'bg-purple-600' : 'bg-slate-300'}`}></span>
                <span>Meta CAPI Server</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                health.meta_capi?.enabled ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {health.meta_capi?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 truncate">
              Token: {health.meta_capi?.token_status}
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Mode:</span>
              <span className="text-indigo-600 font-mono text-[10px] font-bold">{health.meta_capi?.test_code}</span>
            </div>
          </div>
        </div>

        {/* 2. RECENT EVENT STREAM TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
                Live Ingested Event Log Stream
              </h2>
              <p className="text-xs text-slate-500">Inspecting last 40 ecommerce events with canonical content IDs & deduplication keys.</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Non-blocking async ingestion</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="p-3">Event Name</th>
                  <th className="p-3">Event ID (Dedup Key)</th>
                  <th className="p-3">Content ID</th>
                  <th className="p-3">Product / Target</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentEvents && recentEvents.length > 0 ? (
                  recentEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                          evt.event_name === 'purchase'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : evt.event_name === 'add_to_cart'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : evt.event_name === 'initiate_checkout'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {evt.event_name}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{evt.event_id || '—'}</td>
                      <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{evt.content_id || '—'}</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200 font-medium max-w-[200px] truncate">
                        {evt.product?.title || evt.metadata?.title || evt.metadata?.name || '—'}
                      </td>
                      <td className="p-3 font-mono text-slate-900 dark:text-slate-100 font-bold">
                        {evt.value > 0 ? `৳${Number(evt.value).toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">
                        {new Date(evt.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No tracking events logged yet. Visit storefront pages or interact with products to stream live events.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
