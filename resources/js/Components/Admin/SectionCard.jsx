import React from 'react';

export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = '',
  noPadding = false,
  badge,
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs transition-all ${className}`}>
      {(title || actions || Icon) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center space-x-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2 font-heading">
                <span>{title}</span>
                {badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <div className="text-[11.5px] text-slate-500 font-normal mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center space-x-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
}
