import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  previousValue,
  change,
  isPositive,
  icon: Icon,
  description,
  badge,
  trend,
  color = 'indigo',
  onClick,
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl p-5 transition-all duration-200 shadow-2xs hover:shadow-sm ${
        isClickable ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] font-bold uppercase tracking-wider text-slate-500 font-sans">
            {title}
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-heading">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-all shadow-2xs">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Footer / Trend Breakdown */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            {isPositive === true || change > 0 ? (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{change}%
              </span>
            ) : isPositive === false || change < 0 ? (
              <span className="flex items-center text-rose-600 dark:text-rose-400 font-bold">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {change}%
              </span>
            ) : (
              <span className="flex items-center text-slate-400 font-bold">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                {change}%
              </span>
            )}
            <span className="text-slate-400 text-[10.5px]">vs previous cycle</span>
          </div>
        ) : (
          <div className="text-slate-400 text-[11px] truncate">
            {description || 'Real-time telemetry'}
          </div>
        )}

        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
