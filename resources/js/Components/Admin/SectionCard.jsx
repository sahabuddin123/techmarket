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
    <div className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xs hover:border-slate-700/80 transition-all ${className}`}>
      {(title || actions || Icon) && (
        <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-sm font-black text-white tracking-tight flex items-center space-x-2 font-heading">
                <span>{title}</span>
                {badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-amber-400">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <div className="text-[11px] text-slate-400 font-normal mt-0.5">
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
