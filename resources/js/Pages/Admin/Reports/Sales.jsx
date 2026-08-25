import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminTable from '../../../Components/Admin/AdminTable';
import { 
  TrendingUp, DollarSign, Download, Calendar, 
  CreditCard, CheckCircle, RotateCcw, ShoppingBag 
} from 'lucide-react';

export default function SalesReport({ reportData = {}, filters = {} }) {
  const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || 'last_30_days');
  const [customStart, setCustomStart] = useState(filters?.start_date || '');
  const [customEnd, setCustomEnd] = useState(filters?.end_date || '');
  const [density, setDensity] = useState('comfortable');

  const summary = reportData?.summary || {};
  const timeline = Array.isArray(reportData?.timeline) ? reportData.timeline : [];
  const monthlySales = Array.isArray(reportData?.monthly_sales) ? reportData.monthly_sales : [];
  const paymentMethods = Array.isArray(reportData?.payment_methods) ? reportData.payment_methods : [];
  const orderStatuses = Array.isArray(reportData?.order_statuses) ? reportData.order_statuses : [];
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

  const timelineColumns = [
    {
      header: 'Date & Timeline',
      accessor: 'date',
      render: (t) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs font-sans">
          {t.formatted_date || t.date}
        </span>
      ),
    },
    {
      header: 'Orders Completed',
      accessor: 'orders_count',
      render: (t) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-xs">
          {t.orders_count} orders
        </span>
      ),
    },
    {
      header: 'Discounts Given',
      accessor: 'discount',
      render: (t) => (
        <span className="font-mono text-slate-500 text-xs">
          ৳{Number(t.discount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Shipping Collected',
      accessor: 'shipping',
      render: (t) => (
        <span className="font-mono text-slate-500 text-xs">
          ৳{Number(t.shipping || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Total Revenue',
      accessor: 'revenue',
      align: 'right',
      render: (t) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
          ৳{Number(t.revenue || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Sales & Revenue Reports">
      <Head title="Sales & Financial Reporting - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Sales & Financial Reporting"
          subtitle={`Period: ${range.label || selectedPeriod} (${range.start_date || ''} to ${range.end_date || ''})`}
          badge="Live Financials"
          actions={
            <a
              href={exportUrl}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          }
        />

        {/* Date Filter Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
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
                type="button"
                onClick={() => handleFilterChange(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === p.id 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {selectedPeriod === 'custom' && (
            <form onSubmit={handleCustomApply} className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">From:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">To:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Apply Range
              </button>
            </form>
          )}
        </div>

        {/* Financial KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Gross Revenue"
            value={`৳${Number(summary.gross_revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="amber"
            description={`From ${summary.non_cancelled_orders || 0} valid orders`}
          />
          <AdminKpiCard
            title="Net Revenue"
            value={`৳${Number(summary.net_revenue || 0).toLocaleString()}`}
            icon={CheckCircle}
            color="emerald"
            description="After deducting completed refunds"
          />
          <AdminKpiCard
            title="Refunds Issued"
            value={`৳${Number(summary.refunded_amount || 0).toLocaleString()}`}
            icon={RotateCcw}
            color="rose"
            description="Approved customer return refunds"
          />
          <AdminKpiCard
            title="Average Order Value"
            value={`৳${Number(summary.aov || 0).toLocaleString()}`}
            icon={ShoppingBag}
            color="blue"
            description={`Discounts: ৳${Number(summary.total_discount || 0).toLocaleString()}`}
          />
        </div>

        {/* Daily Revenue Timeline Table */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
              Daily Revenue & Order Timeline
            </h3>
          </div>

          <AdminTable
            columns={timelineColumns}
            data={timeline.slice().reverse()}
            density={density}
            onDensityChange={setDensity}
            emptyTitle="No sales activity in this date range"
            emptyDescription="Completed and confirmed orders for the selected period will appear in this timeline."
          />
        </div>

        {/* Payment Methods & Order Statuses Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Payment Method Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-200/80 dark:border-slate-800/80 pb-3">
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Payment Method Distribution
              </h3>
            </div>

            <div className="space-y-3">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((pm, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">{pm.method}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        ৳{Number(pm.revenue || 0).toLocaleString()} ({pm.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${pm.percentage}%` }}></div>
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-mono">{pm.order_count} orders</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No payment records found.</div>
              )}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-200/80 dark:border-slate-800/80 pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Order Status Breakdown
              </h3>
            </div>

            <div className="space-y-3">
              {orderStatuses.length > 0 ? (
                orderStatuses.map((os, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">{os.status}</span>
                      <div className="text-[10.5px] text-slate-500 font-mono">{os.count} orders ({os.percentage}%)</div>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ৳{Number(os.total_amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No order status data available.</div>
              )}
            </div>
          </div>
        </div>

        {/* 12-Month Historical Revenue Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading border-b border-slate-100 dark:border-slate-800 pb-3">
            12-Month Historical Revenue Performance
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10.5px] border-b border-slate-200/80 dark:border-slate-700/80">
                  <th className="p-3">Month</th>
                  <th className="p-3">Completed Orders</th>
                  <th className="p-3">Discounts</th>
                  <th className="p-3 text-right">Revenue (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                {monthlySales.length > 0 ? (
                  monthlySales.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100 font-sans">{m.month}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-sans">{m.order_count} Orders</td>
                      <td className="p-3 text-slate-500">৳{Number(m.discount || 0).toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        ৳{Number(m.revenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400 font-sans">No monthly history recorded.</td>
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
