import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminChartCard from '../../../Components/Admin/AdminChartCard';
import { AreaLineChart, BarChart } from '../../../Components/Admin/AdminCharts';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { BarChart3, TrendingUp, AlertTriangle, PackageCheck, Download, Layers } from 'lucide-react';

export default function AdminReports({ 
  salesByMonth = [], 
  topSellingProducts = [], 
  lowStockProducts = [] 
}) {
  const salesList = Array.isArray(salesByMonth) ? salesByMonth : [];
  const topProducts = Array.isArray(topSellingProducts) ? topSellingProducts : [];
  const lowStock = Array.isArray(lowStockProducts) ? lowStockProducts : [];

  // Monthly Sales Chart Data
  const monthlyChartData = salesList.map(s => ({
    label: s.month || 'Month',
    value: Number(s.revenue || 0),
  }));

  const topProductsChartData = topProducts.map(p => ({
    label: p.title ? p.title.substring(0, 14) + '...' : 'Product',
    value: Number(p.total_sold || 0),
  }));

  const salesTableColumns = [
    {
      header: 'Month Period',
      accessor: 'month',
      render: (s) => <span className="font-bold text-slate-900 dark:text-slate-100">{s.month}</span>,
    },
    {
      header: 'Completed Orders',
      accessor: 'order_count',
      render: (s) => <span className="font-mono text-slate-700 dark:text-slate-300">{s.order_count} Orders</span>,
    },
    {
      header: 'Realized Gross Revenue',
      accessor: 'revenue',
      align: 'right',
      render: (s) => (
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
          ৳ {Number(s.revenue || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Reports">
      <Head title="Sales & Inventory Reports - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Enterprise Sales & Catalog Reports"
          subtitle="Database-calculated monthly revenue, top performing hardware volume, and inventory risk analysis."
          badge="Live Analytics"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/reports/sales"
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                Deep Sales Drilldown
              </Link>
              <Link
                href="/admin/reports/inventory"
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                Inventory Valuation
              </Link>
            </div>
          }
        />

        {/* Top Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminChartCard
            title="Monthly Gross Sales Revenue"
            subtitle="Calculated from finalized customer checkouts (BDT ৳)"
          >
            <div className="p-4">
              <AreaLineChart
                data={monthlyChartData}
                height={220}
                color="#6366f1"
                valuePrefix="৳ "
              />
            </div>
          </AdminChartCard>

          <AdminChartCard
            title="Top Hardware Volume Sold"
            subtitle="Top performing products by units shipped"
          >
            <div className="p-4">
              <BarChart
                data={topProductsChartData}
                height={220}
                color="#06b6d4"
              />
            </div>
          </AdminChartCard>
        </div>

        {/* Monthly Revenue Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
            Monthly Revenue Ledger Breakdown
          </h3>
          <AdminTable
            columns={salesTableColumns}
            data={salesList}
            emptyTitle="No monthly sales recorded"
            emptyDescription="Completed store orders will generate monthly sales metrics automatically."
          />
        </div>

        {/* Lower Row: Top Selling & Low Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Top Selling Hardware Items</span>
            </h3>

            <div className="space-y-2 text-xs">
              {topProducts.length > 0 ? (
                topProducts.map((p, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.title}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">SKU: {p.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-600">{p.total_sold} Sold</div>
                      <div className="text-[10px] text-slate-400 font-mono">৳ {Number(p.price || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs py-4 text-center">No sales recorded yet.</div>
              )}
            </div>
          </div>

          {/* Low Stock Queue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Low Stock Replenishment Queue</span>
            </h3>

            <div className="space-y-2 text-xs">
              {lowStock.length > 0 ? (
                lowStock.map((p, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.title}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">SKU: {p.sku}</div>
                    </div>
                    <div>
                      <AdminStatusBadge
                        status="low_stock"
                        label={`${p.stock} Units Left`}
                        size="xs"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs py-4 text-center">All catalog items have healthy stock levels.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
