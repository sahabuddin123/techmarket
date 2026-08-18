import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Warehouse, Download, DollarSign, Package, AlertTriangle, 
  Boxes, ArrowDownRight, ArrowUpRight, CheckCircle2, Zap, Clock 
} from 'lucide-react';

export default function InventoryReport({ reportData }) {
  const summary = reportData?.catalog_summary || {};
  const movements = reportData?.movements_by_type || {};
  const lowStock = reportData?.low_stock_products || [];
  const outOfStock = reportData?.out_of_stock_products || [];
  const fastMoving = reportData?.fast_moving || [];
  const slowMoving = reportData?.slow_moving || [];

  const exportUrl = '/admin/reports/export?type=inventory';

  return (
    <AdminLayout title="Inventory Intelligence & Valuation">
      <Head title="Inventory Valuation & Stock Intelligence - Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Warehouse className="w-6 h-6 text-purple-500" />
              <span>INVENTORY INTELLIGENCE & VALUATION</span>
            </h1>
            <p className="text-xs text-slate-400">
              Live warehouse valuation, stock velocity, movement ledgers, and critical replenishment alerts.
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

        {/* VALUATION & ASSET KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Retail Stock Value</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ৳{Number(summary.retail_valuation || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Current market asset worth</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Cost Basis Valuation</span>
              <Boxes className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">
              ৳{Number(summary.cost_valuation || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Total capital invested in inventory</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Total Stock Units</span>
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {Number(summary.total_stock_units || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Across {summary.total_products || 0} unique SKUs</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Projected Margin</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ৳{Number(summary.potential_margin || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Gross margin upon sell-through</div>
          </div>
        </div>

        {/* STOCK MOVEMENTS BY TYPE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-indigo-400" />
            <span>Inventory Movement Ledger Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries(movements).map(([type, m]) => (
              <div key={type} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-slate-300 uppercase text-[11px] tracking-wide">{type.replace('_', ' ')}</div>
                <div className="text-lg font-black text-white font-mono">{m.units} <span className="text-[10px] text-slate-400 font-normal">units</span></div>
                <div className="text-[10px] text-slate-500 font-mono">{m.count} recorded events</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAST MOVING VS SLOW MOVING INVENTORY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fast Moving Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Fast Moving Inventory (Highest Velocity)</span>
            </h3>

            <div className="space-y-2 text-xs">
              {fastMoving.length > 0 ? (
                fastMoving.map((p, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white line-clamp-1">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.sku} • In Stock: {p.current_stock}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-amber-400">{p.outflow_units} units moved</div>
                      <div className="text-[10px] text-slate-500">{p.movement_count} events</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">No high velocity movements recorded in 30 days.</div>
              )}
            </div>
          </div>

          {/* Slow Moving Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Slow Moving Inventory (Capital Tied Up)</span>
            </h3>

            <div className="space-y-2 text-xs">
              {slowMoving.length > 0 ? (
                slowMoving.map((p, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white line-clamp-1">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-300">{p.current_stock} units held</div>
                      <div className="text-[10px] text-amber-400">৳{Number(p.price).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">No stagnant stock detected.</div>
              )}
            </div>
          </div>
        </div>

        {/* LOW STOCK & OUT OF STOCK RISK TABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Stock (1-5) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Low Stock Alerts (1 - 5 Units Remaining)</span>
            </h3>

            <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {lowStock.length > 0 ? (
                lowStock.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white line-clamp-1">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.sku} • ৳{Number(p.price).toLocaleString()}</div>
                    </div>
                    <div className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                      {p.stock} units
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">No low stock items.</div>
              )}
            </div>
          </div>

          {/* Out of Stock (<= 0) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Out of Stock Alerts (Restock Urgent)</span>
            </h3>

            <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {outOfStock.length > 0 ? (
                outOfStock.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white line-clamp-1">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.sku} • ৳{Number(p.price).toLocaleString()}</div>
                    </div>
                    <div className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
                      0 units
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">No out-of-stock items.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
