import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  ArrowUpDown, 
  UploadCloud, 
  DownloadCloud, 
  History, 
  FileSpreadsheet, 
  Package, 
  FolderTree, 
  Tag, 
  Ruler, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Download,
  FileText
} from 'lucide-react';

export default function DataManagementIndex({ stats, recentImports, recentExports, supportedEntities }) {
  const entityIcons = {
    products: Package,
    categories: FolderTree,
    brands: Tag,
    units: Ruler,
  };

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
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3 h-3 animate-spin" /> In Progress</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <Head title="Bulk Data Management — Enterprise Import & Export" />

      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <Link href="/admin" className="hover:text-slate-800 transition">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Data Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              Bulk Data Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enterprise CSV & Excel batch operations, multi-entity import wizard, filtered export studio, and audit ledgers.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/data-management/history"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <History className="w-4 h-4 text-slate-500" />
              History & Logs
            </Link>
            <Link
              href="/admin/data-management/export"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <DownloadCloud className="w-4 h-4 text-indigo-600" />
              Export Studio
            </Link>
            <Link
              href="/admin/data-management/import"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
              style={{ backgroundColor: 'var(--admin-primary, #4f46e5)' }}
            >
              <UploadCloud className="w-4 h-4" />
              Launch Import Wizard
            </Link>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Imports</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_imports.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>{stats.successful_imports} successful</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Exports</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_exports.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Filtered datasets</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rows Imported</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{stats.total_rows_imported.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Records created/updated</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rows Exported</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_rows_exported.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Streamed records</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Engine Status</div>
            <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ready & Idle
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">Async queue enabled</div>
          </div>
        </div>

        {/* Entity Workspaces & Templates Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Supported Entity Workspaces</h2>
              <p className="text-xs text-slate-500 mt-0.5">Download official schema templates or launch entity-focused operations</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              4 Active Processors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {Object.entries(supportedEntities).map(([key, entity]) => {
              const IconComponent = entityIcons[key] || FileSpreadsheet;
              return (
                <div key={key} className="p-5 hover:bg-slate-50/50 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{entity.label}</h3>
                        <span className="text-xs text-slate-500 font-mono">Key: {entity.unique_key.toUpperCase()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">
                      {entity.columns.length} supported attributes with relation auto-resolution.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Templates</div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/data-management/template/${key}/csv`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                        download
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        CSV
                      </a>
                      <a
                        href={`/admin/data-management/template/${key}/xlsx`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-md transition"
                        download
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        XLSX
                      </a>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/admin/data-management/import?entity=${key}`}
                        className="flex-1 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-1"
                      >
                        Import →
                      </Link>
                      <span className="text-slate-300">|</span>
                      <Link
                        href={`/admin/data-management/export?entity=${key}`}
                        className="flex-1 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
                      >
                        Export →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity: Imports & Exports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Imports */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Recent Import Jobs</h3>
              </div>
              <Link href="/admin/data-management/history" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentImports.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No imports executed yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentImports.map((imp) => (
                  <div key={imp.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 capitalize">{imp.entity_type}</span>
                        {getStatusBadge(imp.status)}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {imp.file_name} • {imp.total_rows} total rows
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-slate-700">
                        +{imp.created_rows} / ~{imp.updated_rows}
                      </div>
                      {imp.failed_rows > 0 && (
                        <a
                          href={`/admin/data-management/import/${imp.id}/errors`}
                          className="text-[11px] font-semibold text-rose-600 hover:underline"
                          download
                        >
                          {imp.failed_rows} errors (CSV)
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Exports */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Recent Export Streams</h3>
              </div>
              <Link href="/admin/data-management/history" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentExports.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No exports generated yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentExports.map((exp) => (
                  <div key={exp.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 capitalize">{exp.entity_type}</span>
                        <span className="uppercase text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {exp.file_format}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {exp.file_name}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-slate-700">{exp.total_rows.toLocaleString()} rows</div>
                      <div className="text-[11px] text-slate-400">{new Date(exp.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
