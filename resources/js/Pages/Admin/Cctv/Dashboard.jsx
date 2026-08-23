import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  ShieldCheck,
  Video,
  HardDrive,
  Cable,
  Sliders,
  FileText,
  Tag,
  Sparkles,
  Cpu,
  Layers,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function Dashboard({ kpis = {}, recentEstimates = [], recentQuotes = [] }) {
  const statCards = [
    {
      title: 'Total CCTV Profiles',
      value: kpis.total_profiles ?? 0,
      sub: `${kpis.camera_profiles ?? 0} Cameras • ${kpis.recorder_profiles ?? 0} Recorders`,
      icon: Video,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Active Hardware Rules',
      value: (kpis.active_compatibility_rules ?? 0) + (kpis.active_recommendation_rules ?? 0) + (kpis.active_calculation_rules ?? 0),
      sub: `${kpis.active_compatibility_rules ?? 0} Compatibility • ${kpis.active_recommendation_rules ?? 0} Recommendations`,
      icon: Sliders,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Project Estimates',
      value: kpis.total_estimates ?? 0,
      sub: `${kpis.saved_estimates ?? 0} Saved • Real DB records`,
      icon: FileText,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Formal Quotes',
      value: kpis.total_quotes ?? 0,
      sub: `Commercial proposals issued`,
      icon: Tag,
      color: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400',
    },
  ];

  return (
    <AdminLayout title="CCTV Estimator Configuration Hub" breadcrumbs={[{ label: 'CCTV Estimator' }]}>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise CCTV Calculation & Rule Engine v2.4</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white font-heading tracking-tight">
                Surveillance Estimator Control Center
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl">
                Configure technical hardware profiles, multi-factor compatibility matrices, dynamic storage bitrates, cabling roll models, and automated accessory recommendations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/cctv/test"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Live Rule Tester</span>
              </Link>
              <Link
                href="/admin/cctv/profiles"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Attach Product Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Real KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border shadow-lg space-y-3 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white font-heading">
                  {card.value}
                </div>
                <div className="text-xs text-slate-400 font-medium truncate">
                  {card.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Nav Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/cctv/profiles"
            className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10 space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Video className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              Product Technical Profiles
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Attach MP resolution, lens size, night vision, PoE draw, channels, and HDD bay specs to catalog items.
            </p>
          </Link>

          <Link
            href="/admin/cctv/rules"
            className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10 space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Rule Engine & Matrix
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configure IF/THEN compatibility rules, auto-accessory mappings, and product recommendation priorities.
            </p>
          </Link>

          <Link
            href="/admin/cctv/settings"
            className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/10 space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Engine & Calculation Parameters
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage storage overhead %, cable waste %, default retention days, and installation charge algorithms.
            </p>
          </Link>
        </div>

        {/* Real Recent Estimates & Quotes Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Estimates */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Recent Project Estimates</h2>
              </div>
              <Link href="/admin/cctv/estimates" className="text-xs text-indigo-400 hover:underline">
                View All
              </Link>
            </div>

            {recentEstimates.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No estimates recorded yet in the database.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {recentEstimates.map((est) => (
                  <div key={est.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1 truncate">
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                        <span>{est.estimate_number}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 uppercase">
                          {est.system_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {est.project_name || 'Surveillance Project'} • {est.user?.name || 'Guest User'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        ৳{Number(est.grand_total || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {est.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Quotes */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-bold text-white">Recent Commercial Quotes</h2>
              </div>
              <Link href="/admin/cctv/quotes" className="text-xs text-purple-400 hover:underline">
                View All
              </Link>
            </div>

            {recentQuotes.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No commercial quotes issued yet in the database.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {recentQuotes.map((qte) => (
                  <div key={qte.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1 truncate">
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                        <span>{qte.quote_number}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 uppercase">
                          {qte.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {qte.customer_name} • {qte.customer_phone}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        ৳{Number(qte.grand_total || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Valid: {qte.valid_until ? new Date(qte.valid_until).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
