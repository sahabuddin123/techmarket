import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';

export default function AdminKpiCard({
  title,
  value,
  previousValue,
  change,
  isPositive,
  icon: Icon,
  description,
  comparisonLabel = 'vs last 30 days',
  sparklineData = [],
  progressPercent = null, // for radial progress (e.g. 2.35%)
  color = 'indigo', // 'indigo' | 'blue' | 'emerald' | 'amber' | 'purple' | 'rose'
  loading = false,
  onClick,
  href,
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    );
  }

  const colorVariants = {
    indigo: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      sparkline: '#6366f1',
      sparklineFill: 'rgba(99, 102, 241, 0.1)',
    },
    blue: {
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      sparkline: '#3b82f6',
      sparklineFill: 'rgba(59, 130, 246, 0.1)',
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      sparkline: '#10b981',
      sparklineFill: 'rgba(16, 185, 129, 0.1)',
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      sparkline: '#f59e0b',
      sparklineFill: 'rgba(245, 158, 11, 0.1)',
    },
    purple: {
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      sparkline: '#8b5cf6',
      sparklineFill: 'rgba(139, 92, 246, 0.1)',
    },
    rose: {
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      sparkline: '#ef4444',
      sparklineFill: 'rgba(239, 68, 68, 0.1)',
    },
  };

  const palette = colorVariants[color] || colorVariants.indigo;

  // Auto-generate smooth SVG Sparkline path if array of numbers or dates is provided
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;

    const values = sparklineData.map((d) => (typeof d === 'number' ? d : d.value ?? d.revenue ?? 0));
    const min = Math.min(...values);
    const max = Math.max(...values, min + 1);
    const width = 100;
    const height = 32;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((val - min) / (max - min)) * (height - 6) - 3;
      return `${x},${y}`;
    });

    const dPath = points.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt}`;
      const [prevX, prevY] = arr[i - 1].split(',').map(Number);
      const [currX, currY] = pt.split(',').map(Number);
      const cpX = (prevX + currX) / 2;
      return `${acc} C ${cpX},${prevY} ${cpX},${currY} ${currX},${currY}`;
    }, '');

    return (
      <div className="w-24 h-8 shrink-0">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <path
            d={dPath}
            fill="none"
            stroke={palette.sparkline}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  // Radial progress indicator (e.g. for Conversion Rate)
  const renderRadialProgress = () => {
    if (progressPercent === null || progressPercent === undefined) return null;
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progressPercent)) / 100) * circumference;

    return (
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            className="text-slate-100 dark:text-slate-800"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke={palette.sparkline}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>
    );
  };

  const CardWrapper = href ? 'a' : 'div';

  return (
    <CardWrapper
      href={href}
      onClick={onClick}
      className={`group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 transition-all duration-200 shadow-2xs hover:shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 relative overflow-hidden ${
        onClick || href ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top row: Title and Icon */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 font-sans tracking-tight">
            {title}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-heading">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${palette.iconBg} shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Bottom row: Trend & Sparkline / Radial Progress */}
      <div className="mt-4 flex items-center justify-between pt-1">
        {change !== undefined ? (
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            {isPositive === true || change > 0 ? (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {change > 0 ? `↑ ${change}%` : `${change}%`}
              </span>
            ) : isPositive === false || change < 0 ? (
              <span className="flex items-center text-rose-600 dark:text-rose-400 font-bold font-mono">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {change < 0 ? `↓ ${Math.abs(change)}%` : `${change}%`}
              </span>
            ) : (
              <span className="flex items-center text-slate-400 font-bold font-mono">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                0.0%
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-normal">
              {comparisonLabel}
            </span>
          </div>
        ) : (
          <div className="text-[11.5px] text-slate-400 dark:text-slate-500 font-medium truncate">
            {description || 'Real-time telemetry'}
          </div>
        )}

        {/* Right visualization: Sparkline or Radial Progress */}
        {sparklineData.length > 0 ? renderSparkline() : renderRadialProgress()}
      </div>
    </CardWrapper>
  );
}
