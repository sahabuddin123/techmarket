import React, { useState } from 'react';
import { Maximize2, Minimize2, Download, MoreVertical } from 'lucide-react';

export default function AdminChartCard({
  title,
  subtitle,
  icon: Icon,
  actions,
  filterDropdown,
  loading = false,
  empty = false,
  emptyMessage = 'No telemetry data available for this range',
  className = '',
  children,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs transition-colors flex flex-col justify-between ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl overflow-y-auto' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {filterDropdown}
          {actions}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="h-48 flex items-center justify-center space-y-2 animate-pulse">
            <div className="w-full h-36 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        ) : empty ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{emptyMessage}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
