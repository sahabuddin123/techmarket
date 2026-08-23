import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Tag,
  Search,
  Filter,
  Eye,
  X,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';

export default function Quotes({ quotes = {}, filters = {} }) {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

  const handleFilter = () => {
    router.get('/admin/cctv/quotes', {
      search: searchTerm,
      status: selectedStatus,
    }, { preserveState: true, replace: true });
  };

  return (
    <AdminLayout title="Commercial CCTV Quotes" breadcrumbs={[{ label: 'CCTV Estimator', href: '/admin/cctv' }, { label: 'Quotes' }]}>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white font-heading">
              Commercial CCTV Quotes
            </h1>
            <p className="text-xs text-slate-400">
              Manage formal commercial quotations, validity periods, customer discounts, and conversions to orders.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search quote number, customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="accepted">Accepted</option>
            <option value="converted_to_order">Converted to Order</option>
            <option value="expired">Expired</option>
          </select>

          <button
            type="button"
            onClick={handleFilter}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Filter
          </button>
        </div>

        {/* Quotes Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-4">Customer & Organization</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Grand Total (BDT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {(!quotes.data || quotes.data.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No commercial quotes recorded in the database.
                    </td>
                  </tr>
                ) : (
                  quotes.data.map((qte) => (
                    <tr key={qte.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {qte.quote_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{qte.customer_name}</div>
                        <div className="text-[10px] text-slate-500">{qte.company_name || 'Individual Client'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {qte.customer_phone}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ৳{Number(qte.grand_total || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-[10px] uppercase font-bold">
                          {qte.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {qte.valid_until ? new Date(qte.valid_until).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedQuote(qte)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                          title="View Quote Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Quote Detail */}
        {selectedQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white font-mono">{selectedQuote.quote_number}</h2>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] uppercase font-bold">
                      {selectedQuote.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Customer: {selectedQuote.customer_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Financial Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Hardware & Accessories Subtotal</span>
                  <span className="text-white">৳{Number(selectedQuote.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Installation & Labor</span>
                  <span className="text-white">৳{Number(selectedQuote.installation_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Special Discount</span>
                  <span className="text-rose-400">-৳{Number(selectedQuote.discount_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax / Shipping</span>
                  <span className="text-white">৳{Number(selectedQuote.tax_amount || 0 + selectedQuote.shipping_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                  <span className="text-white">Official Grand Total</span>
                  <span className="text-emerald-400">৳{Number(selectedQuote.grand_total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Terms and Conditions */}
              {selectedQuote.terms_and_conditions && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-slate-300">Terms & Conditions</h3>
                  <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-sans">
                    {selectedQuote.terms_and_conditions}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
