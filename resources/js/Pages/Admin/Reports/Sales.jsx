import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  TrendingUp, DollarSign, Download, Calendar, 
  CreditCard, CheckCircle, RotateCcw, Tag, ShoppingBag, Filter
} from 'lucide-react';

export default function SalesReport({ reportData, filters }) {
  const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || 'last_30_days');
  const [customStart, setCustomStart] = useState(filters?.start_date || '');
  const [customEnd, setCustomEnd] = useState(filters?.end_date || '');

  const summary = reportData?.summary || {};
  const timeline = reportData?.timeline || [];
  const monthlySales = reportData?.monthly_sales || [];
  const paymentMethods = reportData?.payment_methods || [];
  const orderStatuses = reportData?.order_statuses || [];
  const range = reportData?.range || {};

  const handleFilterChange = (period) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      router.get('/admin/reports/sales', { period }, { preserveState: true, replace: true });
    }
  };

  const handleCustomApply = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    router.get('/admin/reports/sales', {
      period: 'custom',
      start_date: customStart,
      end_date: customEnd,
    }, { preserveState: true, replace: true });
  };

  const exportUrl = `/admin/reports/export?type=sales&period=${selectedPeriod}${
    selectedPeriod === 'custom' ? `&start_date=${customStart}&end_date=${customEnd}` : ''
  }`;

  return (
    <AdminLayout title="Sales & Financial Reporting">
      <Head title="Sales & Revenue Reports - Admin" />

      <div className="space-y-6">
        {/* Title and Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <span>SALES & FINANCIAL REPORTING</span>
            </h1>
            <p className="text-xs text-slate-400">
              Period: <span className="text-amber-400 font-bold">{range.label || selectedPeriod}</span> ({range.start_date} to {range.end_date})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last_7_days', label: 'Last 7 Days' },
              { id: 'last_30_days', label: 'Last 30 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'custom', label: 'Custom Range' },
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

          {selectedPeriod === 'custom' && (
            <form onSubmit={handleCustomApply} className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">From:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">To:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                Apply Range
              </button>
            </form>
          )}
        </div>

        {/* SUMMARY FINANCIAL KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ৳{Number(summary.gross_revenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">From {summary.non_cancelled_orders || 0} valid orders</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Net Revenue</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ৳{Number(summary.net_revenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">After deducting refunds</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Refunds Issued</span>
              <RotateCcw className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              ৳{Number(summary.refunded_amount || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Approved & completed refunds</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Average Order Value</span>
              <ShoppingBag className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 font-mono">
              ৳{Number(summary.aov || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Discounts given: ৳{Number(summary.total_discount || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* TIME SERIES TIMELINE TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Daily Revenue & Order Timeline</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3">Date</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Discount (BDT)</th>
                  <th className="p-3">Shipping (BDT)</th>
                  <th className="p-3 text-right">Revenue (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {timeline.length > 0 ? (
                  timeline.slice().reverse().map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white font-sans">{t.formatted_date} ({t.date})</td>
                      <td className="p-3 text-slate-300 font-sans">{t.orders_count} orders</td>
                      <td className="p-3 text-slate-400">৳{Number(t.discount).toLocaleString()}</td>
                      <td className="p-3 text-slate-400">৳{Number(t.shipping).toLocaleString()}</td>
                      <td className="p-3 text-right font-black text-amber-400">৳{Number(t.revenue).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">No sales activity in this date range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAYMENT METHODS & STATUS BREAKDOWNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Payment Method Distribution</span>
            </h3>

            <div className="space-y-3">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((pm, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{pm.method}</span>
                      <span className="font-black text-amber-400 font-mono">৳{Number(pm.revenue).toLocaleString()} ({pm.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pm.percentage}%` }}></div>
                    </div>
                    <div className="text-[10px] text-slate-400">{pm.order_count} orders</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs">No payment records found.</div>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Order Status Breakdown</span>
            </h3>

            <div className="space-y-3">
              {orderStatuses.length > 0 ? (
                orderStatuses.map((os, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{os.status}</span>
                      <div className="text-[10px] text-slate-400">{os.count} orders ({os.percentage}%)</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-amber-400">৳{Number(os.total_amount).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs">No order statuses recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* 12-MONTH HISTORICAL REVENUE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            12-Month Historical Revenue Overview
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3">Month</th>
                  <th className="p-3">Completed Orders</th>
                  <th className="p-3">Discounts</th>
                  <th className="p-3 text-right">Revenue (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {monthlySales.length > 0 ? (
                  monthlySales.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white font-sans">{m.month}</td>
                      <td className="p-3 text-slate-300 font-sans">{m.order_count} Orders</td>
                      <td className="p-3 text-slate-400">৳{Number(m.discount).toLocaleString()}</td>
                      <td className="p-3 text-right font-black text-amber-400">৳{Number(m.revenue).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 font-sans">No monthly history recorded.</td>
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
