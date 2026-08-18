import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { BarChart3, TrendingUp, AlertTriangle, PackageCheck } from 'lucide-react';

export default function AdminReports({ salesByMonth, topSellingProducts, lowStockProducts }) {
  return (
    <AdminLayout title="Sales & Inventory Reports Analytics">
      <Head title="Sales & Analytics Reports - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            <span>ENTERPRISE SALES & INVENTORY REPORTS</span>
          </h1>
          <p className="text-xs text-slate-400">Database-calculated monthly revenue, top performing hardware items, and inventory risk reports.</p>
        </div>

        {/* MONTHLY REVENUE REPORT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Monthly Revenue Breakdown (BDT ৳)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3">Month</th>
                  <th className="p-3">Completed Orders</th>
                  <th className="p-3 text-right">Total Revenue (BDT ৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {salesByMonth && salesByMonth.length > 0 ? (
                  salesByMonth.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{s.month}</td>
                      <td className="p-3 text-slate-300">{s.order_count} Orders</td>
                      <td className="p-3 text-right font-black text-amber-400">৳{Number(s.revenue).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-500">No monthly sales recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP SELLING PRODUCTS & LOW STOCK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-amber-400" />
              <span>Top Selling Hardware Products</span>
            </h3>

            <div className="space-y-2 text-xs">
              {topSellingProducts && topSellingProducts.map((p, i) => (
                <div key={i} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{p.title}</div>
                    <div className="text-[10px] text-slate-400">{p.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">{p.total_sold} Sold</div>
                    <div className="text-[10px] text-slate-400">৳{Number(p.price).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Low Stock Alert Report</span>
            </h3>

            <div className="space-y-2 text-xs">
              {lowStockProducts && lowStockProducts.map((p, i) => (
                <div key={i} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{p.title}</div>
                    <div className="text-[10px] text-slate-400">{p.sku}</div>
                  </div>
                  <div className="font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {p.stock} Units Left
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
