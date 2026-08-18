import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Activity, ShieldCheck, CheckCircle2, AlertTriangle, 
  ExternalLink, Rss, Layers, Check, ArrowLeft 
} from 'lucide-react';

export default function TrackingDebug({ health = {}, recentEvents = [] }) {
  return (
    <AdminLayout title="Tracking Diagnostics & Event Stream">
      <Head title="Tracking Diagnostics & Event Debugger - TechMarket Admin" />

      <div className="space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Activity className="w-6 h-6 text-emerald-400" />
              <span>TRACKING DIAGNOSTICS & EVENT DEBUGGER</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Inspect active tracking tags, Meta CAPI server status, and real-time client-to-server event streams.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/analytics"
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Analytics</span>
            </Link>
            <Link
              href="/admin/settings/analytics"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg"
            >
              Configure Tracking
            </Link>
          </div>
        </div>

        {/* 1. PLATFORM HEALTH STATUS MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* GA4 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${health.ga4?.enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                <span>{health.ga4?.name}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                health.ga4?.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
              }`}>
                {health.ga4?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
              ID: {health.ga4?.id}
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Ecommerce Stream:</span>
              <span className="text-emerald-400 font-bold">{health.ga4?.ecommerce_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          {/* Meta Pixel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${health.meta_pixel?.enabled ? 'bg-blue-500' : 'bg-slate-600'}`}></span>
                <span>{health.meta_pixel?.name}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                health.meta_pixel?.enabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-400'
              }`}>
                {health.meta_pixel?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
              Pixel ID: {health.meta_pixel?.id}
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Browser Deduplication:</span>
              <span className="text-blue-400 font-bold">Supported (event_id)</span>
            </div>
          </div>

          {/* Meta CAPI */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${health.meta_capi?.enabled ? 'bg-purple-500' : 'bg-slate-600'}`}></span>
                <span>Meta CAPI Server</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                health.meta_capi?.enabled ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400'
              }`}>
                {health.meta_capi?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
              Token: {health.meta_capi?.token_status}
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Mode:</span>
              <span className="text-amber-400 font-mono text-[10px]">{health.meta_capi?.test_code}</span>
            </div>
          </div>
        </div>

        {/* 2. RECENT EVENT STREAM TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Ingested Event Log Stream
              </h2>
              <p className="text-xs text-slate-400">Inspecting last 40 ecommerce events with canonical content IDs & deduplication keys.</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Non-blocking async ingestion</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                  <th className="p-3">Event Name</th>
                  <th className="p-3">Event ID (Dedup Key)</th>
                  <th className="p-3">Content ID</th>
                  <th className="p-3">Product / Target</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentEvents && recentEvents.length > 0 ? (
                  recentEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                          evt.event_name === 'purchase'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : evt.event_name === 'add_to_cart'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : evt.event_name === 'initiate_checkout'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {evt.event_name}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{evt.event_id || '—'}</td>
                      <td className="p-3 font-mono text-[11px] text-amber-400">{evt.content_id || '—'}</td>
                      <td className="p-3 text-slate-300 max-w-[200px] truncate">
                        {evt.product?.title || evt.metadata?.title || evt.metadata?.name || '—'}
                      </td>
                      <td className="p-3 font-mono text-white">
                        {evt.value > 0 ? `৳${Number(evt.value).toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500">
                        {new Date(evt.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No tracking events logged yet. Visit storefront pages or interact with products to stream live events.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
