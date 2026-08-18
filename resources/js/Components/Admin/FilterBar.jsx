import React from 'react';
import { Search, Filter, X, Grid, List } from 'lucide-react';

export default function FilterBar({
  search = '',
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search records by name, SKU, reference...',
  filters = [],
  viewMode,
  onViewModeChange,
  onReset,
  className = '',
}) {
  return (
    <div className={`p-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs ${className}`}>
      {/* Search box */}
      <div className="relative flex-1 min-w-[240px]">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit && onSearchSubmit(search)}
          placeholder={searchPlaceholder}
          className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-slate-800/90 focus:border-amber-500 focus:outline-none placeholder:text-slate-500 font-medium"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        {search && (
          <button
            type="button"
            onClick={() => {
              onSearchChange && onSearchChange('');
              onSearchSubmit && onSearchSubmit('');
            }}
            className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex items-center flex-wrap gap-2">
        {filters.map((f, idx) => (
          <div key={idx} className="relative">
            <select
              value={f.value}
              onChange={(e) => f.onChange && f.onChange(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800/90 focus:border-amber-500 focus:outline-none font-medium cursor-pointer"
            >
              {f.options.map((opt, oIdx) => (
                <option key={oIdx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}

        {/* View Mode Toggle */}
        {viewMode && onViewModeChange && (
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
