import React from 'react';
import { 
  Search, Filter, ArrowUpDown, LayoutGrid, List, 
  Download, Upload, RefreshCw, Plus, X 
} from 'lucide-react';

export default function AdminPageToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filtersActiveCount = 0,
  onToggleFilters,
  sortOptions = [],
  currentSort,
  onSortChange,
  viewMode, // 'list' | 'grid'
  onViewModeChange,
  bulkSelectionCount = 0,
  bulkActions = [],
  onExport,
  onImport,
  onRefresh,
  createLabel,
  onCreateClick,
  createHref,
  children,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 shadow-2xs space-y-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search & Filter Trigger */}
        <div className="flex items-center space-x-2 flex-1 max-w-lg">
          {onSearchChange !== undefined && (
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {onToggleFilters && (
            <button
              type="button"
              onClick={onToggleFilters}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filtersActiveCount > 0
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {filtersActiveCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-mono">
                  {filtersActiveCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right: Sort, View, Export, Refresh, Create */}
        <div className="flex items-center space-x-2 flex-wrap justify-end gap-y-2">
          {/* Sorting */}
          {sortOptions.length > 0 && (
            <div className="relative">
              <select
                value={currentSort || ''}
                onChange={(e) => onSortChange && onSortChange(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Grid / List View Switcher */}
          {onViewModeChange && (
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Export Button */}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Export Dataset"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Import Button */}
          {onImport && (
            <button
              type="button"
              onClick={onImport}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Import Data"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Create Button */}
          {(createLabel || createHref) && (
            createHref ? (
              <a
                href={createHref}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{createLabel || 'Create'}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={onCreateClick}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{createLabel || 'Create'}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Bulk Actions Banner when items are checked */}
      {bulkSelectionCount > 0 && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in duration-150">
          <span className="font-semibold">
            {bulkSelectionCount} {bulkSelectionCount === 1 ? 'item' : 'items'} selected
          </span>

          <div className="flex items-center space-x-2">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  action.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
