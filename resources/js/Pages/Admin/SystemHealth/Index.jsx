import React from 'react';
import { Head } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { Activity, ShieldCheck, AlertTriangle, Cpu, Database, Clock, Server, Zap } from 'lucide-react';

export default function AdminSystemHealth({ metrics = {} }) {
  return (
    <AdminShell title="System Health">
      <Head title="System Health & Infrastructure - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Operational System Health & Diagnostics"
          subtitle="Real-time application status, queue performance, database latency, and hardware catalog vital signs."
          badge={metrics.app_env ? `${metrics.app_env.toUpperCase()} ENVIRONMENT` : 'HEALTHY'}
        />

        {/* Vital Signs KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Pending Orders"
            value={`${metrics.pending_orders ?? 0} Orders`}
            description="Awaiting processing or fulfillment"
            icon={Clock}
            color="indigo"
          />

          <AdminKpiCard
            title="Low Stock Alert"
            value={`${metrics.low_stock ?? 0} SKUs`}
            description="Near depletion threshold"
            icon={AlertTriangle}
            color={metrics.low_stock > 0 ? 'amber' : 'emerald'}
          />

          <AdminKpiCard
            title="Out of Stock SKUs"
            value={`${metrics.out_of_stock ?? 0} SKUs`}
            description="Catalog replenishment needed"
            icon={AlertTriangle}
            color={metrics.out_of_stock > 0 ? 'rose' : 'emerald'}
          />

          <AdminKpiCard
            title="Queue Failed Jobs"
            value={`${metrics.failed_jobs ?? 0} Jobs`}
            description="Background worker queue"
            icon={Database}
            color={metrics.failed_jobs > 0 ? 'rose' : 'emerald'}
          />
        </div>

        {/* Runtime Environment Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Application Server Environment & Stack Runtime</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 text-[10.5px] font-bold uppercase font-mono">PHP Runtime</span>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{metrics.php_version || 'PHP 8.2+'}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 text-[10.5px] font-bold uppercase font-mono">Laravel Framework</span>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{metrics.laravel_version || 'Laravel 11.x'}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 text-[10.5px] font-bold uppercase font-mono">Environment Debug State</span>
              <div>
                <AdminStatusBadge
                  status={metrics.debug_mode ? 'pending' : 'active'}
                  label={metrics.debug_mode ? 'Debug Active (Dev)' : 'Production (Secure)'}
                  size="xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
