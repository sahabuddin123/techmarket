import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Activity, Truck, Download, Clock, CheckCircle2, 
  XCircle, AlertCircle, RefreshCw, Send, Layers 
} from 'lucide-react';

export default function OperationsReport({ reportData, filters }) {
  const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || 'last_30_days');

  const pipeline = reportData?.pipeline || {};
  const fulfillment = reportData?.fulfillment || {};
  const courierPerformance = reportData?.courier_performance || [];
  const range = reportData?.range || {};

  const handleFilterChange = (period) => {
    setSelectedPeriod(period);
    router.get('/admin/reports/operations', { period }, { preserveState: true, replace: true });
  };

  const exportUrl = `/admin/reports/export?type=operations&period=${selectedPeriod}`;

  return (
    <AdminLayout title="Operational & Logistics Intelligence">
      <Head title="Operational & Logistics Reports - Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Activity className="w-6 h-6 text-indigo-500" />
              <span>OPERATIONAL & LOGISTICS INTELLIGENCE</span>
            </h1>
            <p className="text-xs text-slate-400">
              Fulfillment funnel velocity, average delivery turn-around time, and multi-courier partner performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={exportUrl}
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-2">
          {[
            { id: 'today', label: 'Today' },
            { id: 'last_7_days', label: 'Last 7 Days' },
            { id: 'last_30_days', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handleFilterChange(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPeriod === p.id 
                  ? 'bg-[#1c4289] text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* FULFILLMENT VELOCITY KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Avg Processing Time</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {fulfillment.avg_processing_hours || 0} <span className="text-sm font-normal text-slate-400">hours</span>
            </div>
            <div className="text-[11px] text-slate-500">~{fulfillment.avg_processing_days || 0} business days</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Delivery Success Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {fulfillment.delivery_completion_rate || 0}%
            </div>
            <div className="text-[11px] text-slate-500">{fulfillment.delivered_count || 0} delivered successfully</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Cancelled Orders</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {fulfillment.cancelled_count || 0}
            </div>
            <div className="text-[11px] text-slate-500">Orders returned or aborted</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Active Pipeline</span>
              <Send className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 font-mono">
              {Object.values(pipeline).reduce((acc, curr) => 
                !['Delivered', 'Cancelled'].includes(curr.status) ? acc + curr.count : acc, 0
              )}
            </div>
            <div className="text-[11px] text-slate-500">Orders currently in fulfillment</div>
          </div>
        </div>

        {/* ORDER PIPELINE STAGE FUNNEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Order Pipeline Fulfillment Stages</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            {Object.entries(pipeline).map(([status, item]) => {
              const isDelivered = status === 'Delivered';
              const isCancelled = status === 'Cancelled';
              return (
                <div 
                  key={status} 
                  className={`p-3.5 rounded-xl border space-y-1 ${
                    isDelivered 
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                      : isCancelled
                      ? 'bg-rose-500/5 border-rose-500/30 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold uppercase text-[11px] tracking-wide">{status}</div>
                  <div className="text-xl font-black font-mono">{item.count}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{item.percentage}% of total</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COURIER PARTNER PERFORMANCE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Courier Partner Logistics Performance (Pathao, Steadfast, RedX)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3">Courier Provider</th>
                  <th className="p-3 text-center">Total Consignments</th>
                  <th className="p-3 text-center">Delivered</th>
                  <th className="p-3 text-center">Failed / Returned</th>
                  <th className="p-3 text-center">Pending / In-Transit</th>
                  <th className="p-3 text-right">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {courierPerformance.length > 0 ? (
                  courierPerformance.map((cp, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white font-sans flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-amber-400" />
                        <span>{cp.provider}</span>
                      </td>
                      <td className="p-3 text-center text-slate-300">{cp.total_consignments}</td>
                      <td className="p-3 text-center font-bold text-emerald-400">{cp.delivered}</td>
                      <td className="p-3 text-center font-bold text-rose-400">{cp.failed_returned}</td>
                      <td className="p-3 text-center text-amber-400">{cp.pending_in_transit}</td>
                      <td className="p-3 text-right font-black text-emerald-400">
                        {cp.success_rate}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500 font-sans">No courier shipments recorded in this period.</td>
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
