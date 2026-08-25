import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
  ArrowUpDown, ArrowUp, ArrowDown, Check, 
  ChevronLeft, ChevronRight, Eye, MoreHorizontal 
} from 'lucide-react';
import AdminEmptyState from './AdminEmptyState';

export default function AdminTable({
  columns = [],
  data = [],
  pagination,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  idKey = 'id',
  sortBy,
  sortDirection = 'asc',
  onSort,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your filter criteria.',
  emptyAction,
  className = '',
  onRowClick,
  density = 'comfortable', // 'compact' | 'comfortable' | 'spacious'
  onDensityChange,
  stickyHeader = false,
}) {
  const items = Array.isArray(data) ? data : [];
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const map = {};
    columns.forEach((c, idx) => {
      map[c.accessor || idx] = c.visible !== false;
    });
    return map;
  });

  const [colMenuOpen, setColMenuOpen] = useState(false);

  // Density padding maps
  const densityPadding = {
    compact: 'py-2 px-3 text-xs',
    comfortable: 'py-3.5 px-4 text-xs',
    spacious: 'py-5 px-5 text-sm',
  }[density] || 'py-3.5 px-4 text-xs';

  const visibleColumns = columns.filter((col, idx) => columnVisibility[col.accessor || idx] !== false);

  // Selection helpers
  const allSelected = items.length > 0 && items.every((row) => selectedIds.includes(row[idKey]));
  const isIndeterminate = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = (e) => {
    if (!onSelectChange) return;
    if (e.target.checked) {
      const allIds = items.map((row) => row[idKey]);
      onSelectChange(allIds);
    } else {
      onSelectChange([]);
    }
  };

  const handleRowSelect = (rowId, e) => {
    e.stopPropagation();
    if (!onSelectChange) return;
    if (selectedIds.includes(rowId)) {
      onSelectChange(selectedIds.filter((id) => id !== rowId));
    } else {
      onSelectChange([...selectedIds, rowId]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Table Card Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs transition-colors">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`bg-slate-50/90 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800 font-mono ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
                {/* Select All Checkbox */}
                {selectable && (
                  <th className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => el && (el.indeterminate = isIndeterminate)}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                )}

                {/* Column Headers */}
                {visibleColumns.map((col, idx) => {
                  const isSorted = sortBy && col.accessor === sortBy;

                  return (
                    <th
                      key={idx}
                      className={`px-4 py-3.5 font-bold ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.sortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-200' : ''} ${col.headerClassName || ''}`}
                      onClick={() => col.sortable && onSort && onSort(col.accessor)}
                    >
                      <div className={`flex items-center space-x-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-400 shrink-0">
                            {isSorted ? (
                              sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`} className="animate-pulse">
                    {selectable && <td className="px-4 py-3.5 text-center"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>}
                    {visibleColumns.map((_, cIdx) => (
                      <td key={`skel-c-${cIdx}`} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length > 0 ? (
                items.map((row, rIdx) => {
                  const isChecked = selectedIds.includes(row[idKey]);

                  return (
                    <tr
                      key={row[idKey] || rIdx}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`transition-colors ${
                        isChecked ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      } ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                      {selectable && (
                        <td className="w-10 px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleRowSelect(row[idKey], e)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                      )}

                      {visibleColumns.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className={`${densityPadding} text-slate-700 dark:text-slate-200 ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          } ${col.cellClassName || ''}`}
                        >
                          {col.render ? col.render(row, rIdx) : row[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="p-0">
                    <AdminEmptyState
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

      {/* Table Footer: Density Toggle & Server-side Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1 pt-1 font-medium">
        {/* Left: Summary Info */}
        <div className="flex items-center space-x-3">
          {pagination ? (
            <div>
              Showing <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{pagination.from || 0}</span> to <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{pagination.to || 0}</span> of <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{pagination.total || 0}</span> records
            </div>
          ) : (
            <div>Total <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{items.length}</span> records</div>
          )}

          {/* Density Switch */}
          {onDensityChange && (
            <div className="hidden sm:flex items-center space-x-1 pl-3 border-l border-slate-200 dark:border-slate-800 text-[11px]">
              <span className="text-slate-400">Density:</span>
              {['compact', 'comfortable', 'spacious'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDensityChange(d)}
                  className={`px-1.5 py-0.5 rounded capitalize ${
                    density === d ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pagination Controls */}
        {pagination && pagination.links && pagination.links.length > 3 && (
          <div className="flex items-center space-x-1 font-mono">
            {pagination.links.map((link, idx) => (
              <button
                key={idx}
                disabled={!link.url || link.active}
                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  link.active
                    ? 'bg-indigo-600 text-white font-black shadow-2xs'
                    : link.url
                    ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-400 opacity-40 cursor-not-allowed border border-transparent'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
