import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminTable from '../../../Components/Admin/AdminTable';
import { 
  Activity, Truck, Download, Clock, CheckCircle2, 
  XCircle, Send, Layers 
} from 'lucide-react';

export default function OperationsReport({ reportData = {}, filters = {} }) {
  const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || 'last_30_days');
  const [density, setDensity] = useState('comfortable');

  const pipeline = reportData?.pipeline || {};
  const fulfillment = reportData?.fulfillment || {};
  const courierPerformance = Array.isArray(reportData?.courier_performance) ? reportData.courier_performance : [];
  const range = reportData?.range || {};

  const handleFilterChange = (period) => {
    setSelectedPeriod(period);
    router.get('/admin/reports/operations', { period }, { preserveState: true, replace: true });
  };

  const exportUrl = `/admin/reports/export?type=operations&period=${selectedPeriod}`;

  const courierColumns = [
    {
      header: 'Logistics Partner',
      accessor: 'provider',
      render: (cp) => (
        <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-slate-100 text-xs font-sans">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <span>{cp.provider}</span>
        </div>
      ),
    },
    {
      header: 'Total Consignments',
      accessor: 'total_consignments',
      align: 'center',
      render: (cp) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-xs">
          {cp.total_consignments}
        </span>
      ),
    },
    {
      header: 'Delivered',
      accessor: 'delivered',
      align: 'center',
      render: (cp) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
          {cp.delivered}
        </span>
      ),
    },
    {
      header: 'Failed / Returned',
      accessor: 'failed_returned',
      align: 'center',
      render: (cp) => (
        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
          {cp.failed_returned}
        </span>
      ),
    },
    {
      header: 'Pending In-Transit',
      accessor: 'pending_in_transit',
      align: 'center',
      render: (cp) => (
        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
          {cp.pending_in_transit}
        </span>
      ),
    },
    {
      header: 'Success Rate',
      accessor: 'success_rate',
      align: 'right',
      render: (cp) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
          {cp.success_rate}%
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Operations & Pipeline">
      <Head title="Operational & Logistics Intelligence - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Operational & Logistics Intelligence"
          subtitle="Fulfillment funnel turnaround velocity, dispatch stages, and multi-courier partner performance telemetry."
          badge="Live Dispatch"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'last_7_days', label: 'Last 7 Days' },
              { id: 'last_30_days', label: 'Last 30 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
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
        </div>

        {/* Fulfillment Velocity KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Avg Processing Time"
            value={`${fulfillment.avg_processing_hours || 0} hrs`}
            icon={Clock}
            color="amber"
            description={`~${fulfillment.avg_processing_days || 0} business days turnaround`}
          />
          <AdminKpiCard
            title="Delivery Success Rate"
            value={`${fulfillment.delivery_completion_rate || 0}%`}
            icon={CheckCircle2}
            color="emerald"
            description={`${fulfillment.delivered_count || 0} orders delivered successfully`}
          />
          <AdminKpiCard
            title="Cancelled Orders"
            value={fulfillment.cancelled_count || 0}
            icon={XCircle}
            color="rose"
            description="Orders returned or aborted before delivery"
          />
          <AdminKpiCard
            title="Active Pipeline"
            value={Object.values(pipeline).reduce((acc, curr) => 
              !['Delivered', 'Cancelled'].includes(curr.status) ? acc + curr.count : acc, 0
            )}
            icon={Send}
            color="blue"
            description="Orders currently in processing or transit"
          />
        </div>

        {/* Order Pipeline Fulfillment Stages */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
              Order Pipeline Fulfillment Stages
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            {Object.entries(pipeline).map(([status, item]) => {
              const isDelivered = status === 'Delivered';
              const isCancelled = status === 'Cancelled';
              const isProcessing = ['Processing', 'Packed', 'Shipped'].includes(status);

              return (
                <div 
                  key={status} 
                  className={`p-3.5 rounded-xl border space-y-1 ${
                    isDelivered 
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                      : isCancelled
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
                      : isProcessing
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="font-bold uppercase text-[10.5px] tracking-wide opacity-80">{status}</div>
                  <div className="text-xl font-black font-mono">{item.count}</div>
                  <div className="text-[10px] opacity-70 font-mono">{item.percentage}% of total</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier Partner Logistics Performance */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
              Courier Partner Logistics Performance (Pathao, Steadfast, RedX)
            </h3>
          </div>

          <AdminTable
            columns={courierColumns}
            data={courierPerformance}
            density={density}
            onDensityChange={setDensity}
            emptyTitle="No courier shipments recorded"
            emptyDescription="Shipment consignments generated through Pathao or Steadfast will appear here."
          />
        </div>
      </div>
    </AdminShell>
  );
}
