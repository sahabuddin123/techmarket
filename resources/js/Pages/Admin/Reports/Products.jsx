import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Package, BarChart3, Download, TrendingUp, 
  AlertTriangle, FolderTree, Tag, PackageCheck, Layers 
} from 'lucide-react';

export default function ProductsReport({ reportData, filters }) {
  const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || 'last_30_days');

  const bestSelling = reportData?.best_selling || [];
  const highestRevenue = reportData?.highest_revenue || [];
  const lowestSelling = reportData?.lowest_selling || [];
  const zeroSalesProducts = reportData?.zero_sales_products || [];
  const categoryPerformance = reportData?.category_performance || [];
  const brandPerformance = reportData?.brand_performance || [];
  const range = reportData?.range || {};

  const handleFilterChange = (period) => {
    setSelectedPeriod(period);
    router.get('/admin/reports/products', { period }, { preserveState: true, replace: true });
  };

  const exportUrl = `/admin/reports/export?type=products&period=${selectedPeriod}`;

  return (
    <AdminLayout title="Product Performance Intelligence">
      <Head title="Product Performance Reports - Admin" />

      <div className="space-y-6">
        {/* Title and Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-amber-500" />
              <span>PRODUCT PERFORMANCE INTELLIGENCE</span>
            </h1>
            <p className="text-xs text-slate-400">
              Sales velocity, high-margin items, and zero-traction catalog analysis for period: <span className="text-amber-400 font-bold">{range.label || selectedPeriod}</span>
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

        {/* TOP SELLING & HIGHEST REVENUE TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Selling by Units */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>Top Selling Hardware Products (Units)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                    <th className="p-2.5">Product & SKU</th>
                    <th className="p-2.5 text-center">Units Sold</th>
                    <th className="p-2.5 text-right">Revenue (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bestSelling.length > 0 ? (
                    bestSelling.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-2.5">
                          <div className="font-bold text-white line-clamp-1">{p.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.sku} • Stock: {p.current_stock}</div>
                        </td>
                        <td className="p-2.5 text-center font-black text-emerald-400 font-mono">{p.units_sold}</td>
                        <td className="p-2.5 text-right font-black text-amber-400 font-mono">৳{Number(p.total_revenue).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500">No sales recorded in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highest Revenue Generators */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Highest Revenue Generators (BDT)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                    <th className="p-2.5">Product & SKU</th>
                    <th className="p-2.5 text-center">Orders</th>
                    <th className="p-2.5 text-right">Total Revenue (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {highestRevenue.length > 0 ? (
                    highestRevenue.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-2.5">
                          <div className="font-bold text-white line-clamp-1">{p.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.sku} • Unit: ৳{Number(p.price).toLocaleString()}</div>
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-300">{p.order_count}</td>
                        <td className="p-2.5 text-right font-black text-amber-400 font-mono">৳{Number(p.total_revenue).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500">No revenue records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CATEGORY & BRAND PERFORMANCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Performance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span>Performance by Category</span>
            </h3>

            <div className="space-y-2 text-xs">
              {categoryPerformance.length > 0 ? (
                categoryPerformance.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{c.category_name}</div>
                      <div className="text-[10px] text-slate-400">{c.product_count} products • {c.units_sold} sold</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-amber-400">৳{Number(c.total_revenue).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Stock: {c.total_stock}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">No category sales recorded.</div>
              )}
            </div>
          </div>

          {/* Brand Performance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span>Performance by Brand</span>
            </h3>

            <div className="space-y-2 text-xs">
              {brandPerformance.length > 0 ? (
                brandPerformance.map((b, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{b.brand_name}</div>
                      <div className="text-[10px] text-slate-400">{b.product_count} products • {b.units_sold} sold</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-amber-400">৳{Number(b.total_revenue).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">No brand sales recorded in this period.</div>
              )}
            </div>
          </div>
        </div>

        {/* ZERO SALES CATALOG ITEMS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Zero Sales Catalog Items (Opportunity & Stagnation Alert)
              </h3>
            </div>
            <span className="text-xs text-slate-400">{zeroSalesProducts.length} items with 0 sales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Price (BDT)</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3 text-right">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {zeroSalesProducts.length > 0 ? (
                  zeroSalesProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white font-sans">{p.title}</td>
                      <td className="p-3 text-slate-300">{p.sku}</td>
                      <td className="p-3 text-amber-400">৳{Number(p.price).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.stock <= 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-500 font-sans">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">All catalog products have sales!</td>
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
