import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Video,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  Calendar,
  Layers,
  FileText,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsDashboard({
  kpis = {},
  salesFunnel = [],
  technicalDemand = {},
  alerts = [],
  currentRange = 'last_30_days',
  dateBounds = {},
}) {
  const [range, setRange] = useState(currentRange);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    router.get('/admin/cctv/analytics', { range: newRange }, { preserveState: true });
  };

  return (
    <AdminLayout>
      <Head title="CCTV Executive Analytics & Business Intelligence" />

      <div className="space-y-6">
        {/* Header & Date Range Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Surveillance Business Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
              CCTV Enterprise Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Real-time telemetry spanning estimates, quote conversions, revenue, project pipelines, and support tickets.
            </p>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={range}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CCTV Revenue</div>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              ৳{Number(kpis.cctv_revenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">From {kpis.cctv_orders_count || 0} completed orders</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quote Pipeline Value</div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ৳{Number(kpis.quote_value || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-blue-600 font-bold">{kpis.total_quotes || 0} quotes generated</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</div>
            <div className="text-2xl font-black text-blue-600 font-mono">
              {kpis.quote_conversion_rate || 0}%
            </div>
            <div className="text-[11px] text-slate-500 font-medium">{kpis.converted_quotes_count || 0} quotes converted to cart</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Installed Hardware</div>
            <div className="text-2xl font-black text-indigo-600 font-mono">
              {kpis.installed_cameras || 0}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Registered camera endpoints</div>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Estimates Created</div>
            <div className="text-xl font-black text-slate-800 font-mono">{kpis.total_estimates || 0}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Projects</div>
            <div className="text-xl font-black text-slate-800 font-mono">{kpis.active_projects || 0}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Open Support Tickets</div>
            <div className="text-xl font-black text-amber-600 font-mono">{kpis.active_service_tickets || 0}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Open Warranty Claims</div>
            <div className="text-xl font-black text-indigo-600 font-mono">{kpis.open_warranty_claims || 0}</div>
          </div>
        </div>

        {/* Sales Funnel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">
            CCTV Conversion Sales Funnel
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {salesFunnel.map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                <div className="text-xs font-bold text-slate-700">{step.stage}</div>
                <div className="text-2xl font-black text-slate-900 font-mono">{step.count}</div>
                {idx > 0 && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    {step.dropoff > 0 ? `-${step.dropoff}% drop-off` : '100% flow'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Demand Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Average System Sizing</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Storage Required</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-1">{technicalDemand.avg_storage_tb || 0} TB</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Cabling Length</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-1">{technicalDemand.avg_cable_meters || 0} m</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Architecture Demand</h2>
            <div className="space-y-2 text-xs">
              {Object.entries(technicalDemand.system_types || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 uppercase">{type.replace(/_/g, ' ')}</span>
                  <span className="font-mono font-bold text-blue-600">{count} configurations</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
