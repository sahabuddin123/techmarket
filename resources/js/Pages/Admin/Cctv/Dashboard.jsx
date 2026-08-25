import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminChartCard from '../../../Components/Admin/AdminChartCard';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminEmptyState from '../../../Components/Admin/AdminEmptyState';
import {
  ShieldCheck, Video, Sliders, FileText, Tag, 
  Sparkles, Cpu, Layers, Plus, ArrowRight
} from 'lucide-react';

export default function CctvDashboard({ kpis = {}, recentEstimates = [], recentQuotes = [] }) {
  return (
    <AdminShell title="CCTV Solutions Hub" breadcrumbs={[{ label: 'CCTV Solutions' }]}>
      <Head title="CCTV Surveillance Suite - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="CCTV Solutions & Estimator Suite"
          subtitle="Configure technical hardware profiles, multi-factor compatibility matrices, dynamic storage bitrates, and automated accessory recommendations."
          badge="Engine v2.4"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/cctv/test"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Live Rule Tester</span>
              </Link>
              <Link
                href="/admin/cctv/profiles"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Attach Profile</span>
              </Link>
            </div>
          }
        />

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Total Hardware Profiles"
            value={kpis.total_profiles ?? 0}
            description={`${kpis.camera_profiles ?? 0} Cameras • ${kpis.recorder_profiles ?? 0} Recorders`}
            icon={Video}
            color="blue"
            href="/admin/cctv/profiles"
          />

          <AdminKpiCard
            title="Active Hardware Rules"
            value={(kpis.active_compatibility_rules ?? 0) + (kpis.active_recommendation_rules ?? 0) + (kpis.active_calculation_rules ?? 0)}
            description={`${kpis.active_compatibility_rules ?? 0} Compatibility • ${kpis.active_recommendation_rules ?? 0} Recommendations`}
            icon={Sliders}
            color="amber"
            href="/admin/cctv/rules"
          />

          <AdminKpiCard
            title="Project Estimates"
            value={kpis.total_estimates ?? 0}
            description={`${kpis.saved_estimates ?? 0} Saved in database`}
            icon={FileText}
            color="emerald"
            href="/admin/cctv/estimates"
          />

          <AdminKpiCard
            title="Formal Quotes"
            value={kpis.total_quotes ?? 0}
            description="Commercial proposals generated"
            icon={Tag}
            color="purple"
            href="/admin/cctv/quotes"
          />
        </div>

        {/* Quick Nav Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/cctv/profiles"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs hover:shadow-sm transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Video className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-heading">
              Product Technical Profiles
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Attach MP resolution, lens size, night vision, PoE draw, channels, and HDD bay specs to catalog items.
            </p>
          </Link>

          <Link
            href="/admin/cctv/rules"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs hover:shadow-sm transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-heading">
              Rule Engine & Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Configure IF/THEN compatibility rules, auto-accessory mappings, and product recommendation priorities.
            </p>
          </Link>

          <Link
            href="/admin/cctv/settings"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs hover:shadow-sm transition-all space-y-2 block"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">
              Engine & Calculation Parameters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Manage storage overhead %, cable waste %, default retention days, and installation charge algorithms.
            </p>
          </Link>
        </div>

        {/* Real Recent Estimates & Quotes Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Estimates */}
          <AdminChartCard
            title="Recent Project Estimates"
            subtitle="Customer surveillance bills of materials"
            actions={
              <Link
                href="/admin/cctv/estimates"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </Link>
            }
          >
            {recentEstimates.length === 0 ? (
              <AdminEmptyState
                title="No estimates recorded yet"
                description="Estimates calculated in the public or admin estimator will populate here."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pt-1">
                {recentEstimates.map((est) => (
                  <div key={est.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center space-x-2">
                        <span>{est.estimate_number}</span>
                        <AdminStatusBadge status={est.system_type} size="xs" showDot={false} />
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {est.project_name || 'Surveillance Project'} • {est.user?.name || 'Guest User'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                        ৳ {Number(est.grand_total || 0).toLocaleString()}
                      </div>
                      <AdminStatusBadge status={est.status || 'saved'} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminChartCard>

          {/* Recent Quotes */}
          <AdminChartCard
            title="Recent Commercial Quotes"
            subtitle="Formal quotes issued to clients"
            actions={
              <Link
                href="/admin/cctv/quotes"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </Link>
            }
          >
            {recentQuotes.length === 0 ? (
              <AdminEmptyState
                title="No quotes issued yet"
                description="Quotes converted from estimates will appear here."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pt-1">
                {recentQuotes.map((qte) => (
                  <div key={qte.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center space-x-2">
                        <span>{qte.quote_number}</span>
                        <AdminStatusBadge status={qte.status} size="xs" />
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {qte.customer_name} • {qte.customer_phone}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                        ৳ {Number(qte.grand_total || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Valid: {qte.valid_until ? new Date(qte.valid_until).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminChartCard>
        </div>
      </div>
    </AdminShell>
  );
}
