import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Activity, ShieldCheck, AlertTriangle, Cpu, Database, Bell, ShoppingBag, Clock } from 'lucide-react';

export default function AdminSystemHealth({ metrics }) {
  return (
    <AdminLayout title="Operational System Health">
      <Head title="System Health - Admin" />

      <div className="space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Activity className="w-6 h-6 text-emerald-400" />
              <span>OPERATIONAL SYSTEM HEALTH</span>
            </h1>
            <p className="text-slate-400">Real-time system diagnostics, queue health, and catalog indicators</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-bold uppercase flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{metrics.app_env} mode</span>
            </span>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center justify-between">
              <span>Unprocessed Orders</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.pending_orders}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center justify-between">
              <span>Low Stock Items</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{metrics.low_stock}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center justify-between">
              <span>Out of Stock</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-400">{metrics.out_of_stock}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center justify-between">
              <span>Queue Failed Jobs</span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.failed_jobs}</div>
          </div>
        </div>

        {/* SYSTEM ENVIRONMENT INFO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-black text-sm text-white uppercase border-b border-slate-800 pb-2 flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-amber-500" />
            <span>Platform Environment</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-300">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold">PHP Version</div>
              <div className="text-sm font-bold text-white mt-1">{metrics.php_version}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Laravel Framework</div>
              <div className="text-sm font-bold text-white mt-1">{metrics.laravel_version}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Debug Mode</div>
              <div className="text-sm font-bold text-white mt-1">{metrics.debug_mode ? 'Enabled (Dev)' : 'Disabled (Production)'}</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
