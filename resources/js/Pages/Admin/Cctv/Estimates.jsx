import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  FileText,
  Search,
  Filter,
  Trash2,
  Eye,
  X,
  HardDrive,
  Cable,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';

export default function Estimates({ estimates = {}, filters = {} }) {
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [selectedSystem, setSelectedSystem] = useState(filters.system_type || '');

  const handleFilter = () => {
    router.get('/admin/cctv/estimates', {
      search: searchTerm,
      status: selectedStatus,
      system_type: selectedSystem,
    }, { preserveState: true, replace: true });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this estimate?')) {
      router.delete(`/admin/cctv/estimates/${id}`, { preserveScroll: true });
    }
  };

  return (
    <AdminLayout title="CCTV Project Estimates" breadcrumbs={[{ label: 'CCTV Estimator', href: '/admin/cctv' }, { label: 'Estimates' }]}>
      <div className="space-y-6 w-full max-w-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white font-heading">
              Project Estimates Ledger
            </h1>
            <p className="text-xs text-slate-400">
              Audit customer configuration calculations, frozen BOM price snapshots, and compatibility records.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search estimate number or project name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="saved">Saved</option>
            <option value="quoted">Quoted</option>
            <option value="finalized">Finalized</option>
          </select>

          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All System Types</option>
            <option value="ip">IP</option>
            <option value="analog">Analog</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <button
            type="button"
            onClick={handleFilter}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Filter
          </button>
        </div>

        {/* Estimates Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Estimate Number</th>
                  <th className="py-3 px-4">Project & User</th>
                  <th className="py-3 px-4">System</th>
                  <th className="py-3 px-4">Grand Total (BDT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {(!estimates.data || estimates.data.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No project estimates found in database.
                    </td>
                  </tr>
                ) : (
                  estimates.data.map((est) => (
                    <tr key={est.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {est.estimate_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">
                          {est.project_name || 'Surveillance Estimate'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {est.user?.name ? `${est.user.name} (${est.user.email})` : 'Guest Session'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] uppercase font-bold">
                          {est.system_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ৳{Number(est.grand_total || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                          {est.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {new Date(est.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedEstimate(est)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="View BOM Snapshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(est.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Estimate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Estimate Detail BOM */}
        {selectedEstimate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white font-mono">{selectedEstimate.estimate_number}</h2>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold">
                      {selectedEstimate.system_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedEstimate.project_name || 'Surveillance System'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEstimate(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bill of Materials Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Bill of Materials (BOM)</h3>
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-semibold text-slate-400 bg-white dark:bg-slate-900">
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {selectedEstimate.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-white">{item.product_name_snapshot}</div>
                            <div className="text-[10px] text-slate-500 font-mono">SKU: {item.product_sku_snapshot}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] uppercase">{item.product_type}</td>
                          <td className="py-2.5 px-3">{item.quantity} {item.unit}</td>
                          <td className="py-2.5 px-3 font-mono">৳{Number(item.unit_price_snapshot).toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            ৳{Number(item.subtotal_price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Financials */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Subtotal</span>
                  <span className="font-bold text-white">৳{Number(selectedEstimate.subtotal_amount || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Accessories</span>
                  <span className="font-bold text-white">৳{Number(selectedEstimate.accessory_amount || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Installation</span>
                  <span className="font-bold text-white">৳{Number(selectedEstimate.installation_amount || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Grand Total</span>
                  <span className="font-bold text-emerald-400 text-sm">৳{Number(selectedEstimate.grand_total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
