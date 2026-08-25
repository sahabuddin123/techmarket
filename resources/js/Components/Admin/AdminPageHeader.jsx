import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function AdminPageHeader({
  title,
  subtitle,
  badge,
  actions,
  backUrl,
  tabs,
  activeTab,
  onTabChange,
  children,
}) {
  return (
    <div className="space-y-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Back button, Title, Subtitle, Badge */}
        <div className="flex items-start space-x-3">
          {backUrl && (
            <a
              href={backUrl}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors shrink-0 shadow-2xs"
              title="Go Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </a>
          )}

          <div className="space-y-1">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-heading">
                {title}
              </h1>

              {badge && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                  {badge}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions, Date Pickers, Secondary Buttons */}
        {actions && (
          <div className="flex items-center space-x-2 flex-wrap gap-y-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Tabs Bar */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800/60 pt-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isTabActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}
