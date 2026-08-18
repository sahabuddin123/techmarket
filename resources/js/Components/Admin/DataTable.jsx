import React from 'react';
import { Link, router } from '@inertiajs/react';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  pagination,
  emptyTitle,
  emptyDescription,
  emptyAction,
  className = '',
  onRowClick,
}) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-4 py-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {items.length > 0 ? (
                items.map((row, rIdx) => (
                  <tr
                    key={row.id || rIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-slate-800/40 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-4 py-3.5 text-slate-200 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.cellClassName || ''}`}
                      >
                        {col.render ? col.render(row, rIdx) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                      className="border-none rounded-none bg-transparent"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.links && pagination.links.length > 3 && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1 font-medium">
          <div>
            Showing <span className="font-bold text-white font-mono">{pagination.from || 0}</span> to <span className="font-bold text-white font-mono">{pagination.to || 0}</span> of <span className="font-bold text-white font-mono">{pagination.total || 0}</span> entries
          </div>

          <div className="flex items-center space-x-1 font-mono">
            {pagination.links.map((link, idx) => (
              <button
                key={idx}
                disabled={!link.url || link.active}
                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  link.active
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : link.url
                    ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 cursor-pointer'
                    : 'bg-slate-950 text-slate-700 opacity-40 cursor-not-allowed'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
