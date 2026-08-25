import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  History as HistoryIcon, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Download, 
  Eye, 
  X, 
  ArrowLeft,
  Filter
} from 'lucide-react';

export default function DataManagementHistory({ imports, exports, filters, supportedEntities }) {
  const [activeTab, setActiveTab] = useState('imports');
  const [inspectModalItem, setInspectModalItem] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'completed_with_errors':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><AlertCircle className="w-3 h-3" /> Completed w/ Errors</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3" /> Failed</span>;
      case 'processing':
      case 'queued':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3 h-3 animate-spin" /> Processing</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const handleFilterChange = (key, value) => {
    router.get(
      '/admin/data-management/history',
      { ...filters, [key]: value || undefined },
      { preserveState: true, preserveScroll: true }
    );
  };

  return (
    <AdminLayout>
      <Head title="Import & Export History — Enterprise Audit Logs" />

      <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <Link href="/admin/data-management" className="hover:text-slate-800 transition">Data Management</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Audit Logs & History</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <HistoryIcon className="w-6 h-6 text-indigo-600" />
              Import & Export History
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/data-management"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Overview
            </Link>
            <Link
              href="/admin/data-management/import"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              New Import
            </Link>
          </div>
        </div>

        {/* Tab Selector & Filters Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('imports')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'imports'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Bulk Imports ({imports.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exports')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'exports'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <DownloadCloud className="w-4 h-4" />
              Export Streams ({exports.total})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Filter className="w-3.5 h-3.5" />
              Entity:
            </div>
            <select
              value={filters.entity || ''}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
              className="text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 font-medium"
            >
              <option value="">All Entities</option>
              {Object.entries(supportedEntities).map(([k, e]) => (
                <option key={k} value={k}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TAB 1: IMPORTS TABLE */}
        {activeTab === 'imports' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3.5 px-4">Import ID</th>
                    <th className="py-3.5 px-4">Entity</th>
                    <th className="py-3.5 px-4">File Name</th>
                    <th className="py-3.5 px-4">Mode</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Rows Breakdown</th>
                    <th className="py-3.5 px-4">Executed By</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {imports.data.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">
                        No import history found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    imports.data.map((imp) => (
                      <tr key={imp.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{imp.id}</td>
                        <td className="py-3.5 px-4 font-bold text-indigo-600 capitalize">{imp.entity_type}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">{imp.file_name}</td>
                        <td className="py-3.5 px-4">
                          <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {imp.mode?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(imp.status)}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{imp.processed_rows} / {imp.total_rows} processed</div>
                          <div className="text-[11px] text-slate-500">
                            <span className="text-emerald-600 font-bold">+{imp.created_rows}</span> • <span className="text-indigo-600 font-bold">~{imp.updated_rows}</span> • <span className="text-rose-600 font-bold">✕{imp.failed_rows}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{imp.user?.name || 'System Admin'}</td>
                        <td className="py-3.5 px-4 text-slate-500">{new Date(imp.created_at).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {imp.failed_rows > 0 && (
                            <a
                              href={`/admin/data-management/import/${imp.id}/errors`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition"
                              download
                              title="Download Error CSV"
                            >
                              <Download className="w-3 h-3" />
                              Errors
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setInspectModalItem(imp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                          >
                            <Eye className="w-3 h-3" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: EXPORTS TABLE */}
        {activeTab === 'exports' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3.5 px-4">Export ID</th>
                    <th className="py-3.5 px-4">Entity</th>
                    <th className="py-3.5 px-4">File Name</th>
                    <th className="py-3.5 px-4">Format</th>
                    <th className="py-3.5 px-4">Total Rows</th>
                    <th className="py-3.5 px-4">Requested By</th>
                    <th className="py-3.5 px-4">Export Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exports.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        No export streams recorded yet.
                      </td>
                    </tr>
                  ) : (
                    exports.data.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{exp.id}</td>
                        <td className="py-3.5 px-4 font-bold text-indigo-600 capitalize">{exp.entity_type}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-medium">{exp.file_name}</td>
                        <td className="py-3.5 px-4">
                          <span className="uppercase text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {exp.file_format}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{exp.total_rows.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-600">{exp.user?.name || 'Admin'}</td>
                        <td className="py-3.5 px-4 text-slate-500">{new Date(exp.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inspect Modal */}
        {inspectModalItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Import Audit Details — #{inspectModalItem.id} ({inspectModalItem.entity_type})
                </h3>
                <button
                  type="button"
                  onClick={() => setInspectModalItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Created</div>
                  <div className="text-lg font-bold text-emerald-600">+{inspectModalItem.created_rows}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Updated</div>
                  <div className="text-lg font-bold text-indigo-600">~{inspectModalItem.updated_rows}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Skipped</div>
                  <div className="text-lg font-bold text-slate-600">{inspectModalItem.skipped_rows}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Failed</div>
                  <div className="text-lg font-bold text-rose-600">{inspectModalItem.failed_rows}</div>
                </div>
              </div>

              {inspectModalItem.error_summary && inspectModalItem.error_summary.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-900 mb-2">Error Breakdown Sample:</h4>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs text-rose-800">
                    {inspectModalItem.error_summary.map((e, idx) => (
                      <div key={idx}>
                        <span className="font-bold">Row {e.row} ({e.key}):</span> {e.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInspectModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
