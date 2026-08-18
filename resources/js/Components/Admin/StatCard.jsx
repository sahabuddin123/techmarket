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
  color = 'amber',
  onClick,
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
        isClickable ? 'cursor-pointer' : ''
      }`}
    >
      {/* Subtle glowing accent line on top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 font-sans">
            {title}
          </div>
          <div className="text-2xl font-black tracking-tight text-white font-heading">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 text-amber-400 group-hover:text-amber-300 group-hover:scale-105 transition-all shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Footer / Trend Breakdown */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            {isPositive === true ? (
              <span className="flex items-center text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{change}%
              </span>
            ) : isPositive === false ? (
              <span className="flex items-center text-rose-400 font-bold">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {change}%
              </span>
            ) : (
              <span className="flex items-center text-slate-400 font-bold">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                {change}%
              </span>
            )}
            <span className="text-slate-500 text-[10.5px]">vs previous cycle</span>
          </div>
        ) : (
          <div className="text-slate-500 text-[11px] truncate">
            {description || 'Real-time telemetry'}
          </div>
        )}

        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
