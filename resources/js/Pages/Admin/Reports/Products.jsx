import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTable from '../../../Components/Admin/AdminTable';
import { 
  Package, BarChart3, Download, TrendingUp, 
  AlertTriangle, FolderTree, Tag, Layers 
} from 'lucide-react';

export default function ProductsReport({ reportData = {}, filters = {} }) {
  const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || 'last_30_days');
  const [density, setDensity] = useState('comfortable');

  const bestSelling = Array.isArray(reportData?.best_selling) ? reportData.best_selling : [];
  const highestRevenue = Array.isArray(reportData?.highest_revenue) ? reportData.highest_revenue : [];
  const zeroSalesProducts = Array.isArray(reportData?.zero_sales_products) ? reportData.zero_sales_products : [];
  const categoryPerformance = Array.isArray(reportData?.category_performance) ? reportData.category_performance : [];
  const brandPerformance = Array.isArray(reportData?.brand_performance) ? reportData.brand_performance : [];
  const range = reportData?.range || {};

  const handleFilterChange = (period) => {
    setSelectedPeriod(period);
    router.get('/admin/reports/products', { period }, { preserveState: true, replace: true });
  };

  const exportUrl = `/admin/reports/export?type=products&period=${selectedPeriod}`;

  const topProductColumns = [
    {
      header: 'Hardware Product',
      accessor: 'title',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {p.title}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            SKU: {p.sku || 'N/A'} • {p.category || 'Catalog'}
          </div>
        </div>
      ),
    },
    {
      header: 'Units Sold',
      accessor: 'units_sold',
      align: 'center',
      render: (p) => (
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
          {p.units_sold} units
        </span>
      ),
    },
    {
      header: 'Total Revenue',
      accessor: 'revenue',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
          ৳{Number(p.revenue || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Product Intelligence">
      <Head title="Product Performance Reports - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Product Performance Intelligence"
          subtitle={`Sales velocity, high-revenue hardware SKUs, and zero-traction catalog analysis for: ${range.label || selectedPeriod}`}
          badge="Product Velocity"
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

        {/* Best Selling vs Highest Revenue Products Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading px-1">
              Top Best-Selling Products by Volume
            </h3>
            <AdminTable
              columns={topProductColumns}
              data={bestSelling}
              density={density}
              onDensityChange={setDensity}
              emptyTitle="No sales recorded"
              emptyDescription="Best selling products will appear here."
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading px-1">
              Top Revenue Generating Products (BDT)
            </h3>
            <AdminTable
              columns={topProductColumns}
              data={highestRevenue}
              density={density}
              onDensityChange={setDensity}
              emptyTitle="No revenue recorded"
              emptyDescription="High revenue products will appear here."
            />
          </div>
        </div>

        {/* Category & Brand Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FolderTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Category Sales Performance
              </h3>
            </div>
            <div className="space-y-2">
              {categoryPerformance.length > 0 ? (
                categoryPerformance.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">{c.units_sold || 0} units sold</div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
                      ৳{Number(c.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">No category data.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Tag className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Brand Mix Performance
              </h3>
            </div>
            <div className="space-y-2">
              {brandPerformance.length > 0 ? (
                brandPerformance.map((b, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{b.name}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">{b.units_sold || 0} units sold</div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
                      ৳{Number(b.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">No brand data.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
