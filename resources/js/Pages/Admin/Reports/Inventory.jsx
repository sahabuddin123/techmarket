import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { 
  Warehouse, Download, DollarSign, Package, AlertTriangle, 
  Boxes, ArrowDownRight, ArrowUpRight, CheckCircle2 
} from 'lucide-react';

export default function InventoryReport({ reportData = {} }) {
  const [density, setDensity] = useState('comfortable');

  const summary = reportData?.catalog_summary || {};
  const movements = reportData?.movements_by_type || {};
  const lowStock = Array.isArray(reportData?.low_stock_products) ? reportData.low_stock_products : [];
  const outOfStock = Array.isArray(reportData?.out_of_stock_products) ? reportData.out_of_stock_products : [];
  const fastMoving = Array.isArray(reportData?.fast_moving) ? reportData.fast_moving : [];
  const slowMoving = Array.isArray(reportData?.slow_moving) ? reportData.slow_moving : [];

  const exportUrl = '/admin/reports/export?type=inventory';

  const stockColumns = [
    {
      header: 'Product Hardware',
      accessor: 'title',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {p.title}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            SKU: {p.sku || 'N/A'} • {p.category?.name || 'Catalog'}
          </div>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      accessor: 'stock',
      align: 'center',
      render: (p) => (
        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
          {p.stock} units
        </span>
      ),
    },
    {
      header: 'Safety Alert Limit',
      accessor: 'low_stock_threshold',
      align: 'center',
      render: (p) => (
        <span className="font-mono text-slate-400 text-xs">
          {p.low_stock_threshold || 5} units
        </span>
      ),
    },
    {
      header: 'Unit Retail Price',
      accessor: 'price',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
          ৳{Number(p.price || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Inventory Intelligence">
      <Head title="Inventory Valuation & Stock Intelligence - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Inventory Valuation & Stock Intelligence"
          subtitle="Real-time warehouse asset valuation, low stock alarms, inventory velocity, and movement ledgers."
          badge="Live Stock"
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

        {/* Valuation & Asset KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Retail Stock Value"
            value={`৳${Number(summary.retail_valuation || 0).toLocaleString()}`}
            icon={DollarSign}
            color="amber"
            description="Total current market catalog worth"
          />
          <AdminKpiCard
            title="Active Catalog Items"
            value={summary.total_products || 0}
            icon={Package}
            color="indigo"
            description="Published hardware items in database"
          />
          <AdminKpiCard
            title="Total Stock Units"
            value={Number(summary.total_stock_units || 0).toLocaleString()}
            icon={Boxes}
            color="blue"
            description="Physical units across all warehouses"
          />
          <AdminKpiCard
            title="Low Stock Risk"
            value={summary.low_stock_count || 0}
            icon={AlertTriangle}
            color="rose"
            description="SKUs below safe replenishment limit"
          />
        </div>

        {/* Low Stock Replenishment Table */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
              Low Stock Replenishment Warning Queue
            </h3>
          </div>

          <AdminTable
            columns={stockColumns}
            data={lowStock}
            density={density}
            onDensityChange={setDensity}
            emptyTitle="Stock levels healthy"
            emptyDescription="No hardware products are currently below safety replenishment limits."
          />
        </div>

        {/* Fast vs Slow Movers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Fast-Moving Best Sellers
              </h3>
            </div>
            <div className="space-y-2">
              {fastMoving.length > 0 ? (
                fastMoving.map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.title}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">Stock: {p.stock} units remaining</div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      {p.units_sold || 0} sold
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">No sales data available.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Deadstock / Slow Movers (Last 30 Days)
              </h3>
            </div>
            <div className="space-y-2">
              {slowMoving.length > 0 ? (
                slowMoving.map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.title}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">Stock: {p.stock} units stagnant</div>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-xs">
                      0 sold
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">No deadstock items found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
