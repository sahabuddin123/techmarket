import React, { useState } from 'react';

/**
 * Reusable Pure SVG Chart Suite for Admin Analytics
 */

// =========================================================================
// 1. AREA & LINE CHART (with smooth Bézier curves & gradient fills)
// =========================================================================
export function AreaLineChart({
  data = [],
  series = [{ key: 'revenue', label: 'This Period', color: '#6366f1' }],
  xAxisKey = 'label',
  height = 240,
  showGrid = true,
  formatValue = (val) => Number(val).toLocaleString(),
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-slate-400">
        No chart data available
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find overall min and max
  let allValues = [];
  series.forEach((s) => {
    data.forEach((d) => {
      const v = Number(d[s.key] || 0);
      allValues.push(v);
    });
  });

  const maxVal = Math.max(...allValues, 1);
  const minVal = 0;

  // Grid steps (4 horizontal guide lines)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: minVal + ratio * (maxVal - minVal),
    y: padding.top + chartHeight - ratio * chartHeight,
  }));

  const getX = (index) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    return padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          {series.map((s, idx) => (
            <linearGradient key={`grad-${idx}`} id={`area-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal Grid lines */}
        {showGrid &&
          yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={padding.left + chartWidth}
                y2={tick.y}
                className="stroke-slate-100 dark:stroke-slate-800/80"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 3}
                textAnchor="end"
                className="fill-slate-400 text-[9px] font-mono"
              >
                {tick.value >= 1000 ? `${(tick.value / 1000).toFixed(0)}k` : Math.round(tick.value)}
              </text>
            </g>
          ))}

        {/* Series Areas and Lines */}
        {series.map((s) => {
          const points = data.map((d, i) => ({
            x: getX(i),
            y: getY(Number(d[s.key] || 0)),
          }));

          // Construct Bézier curve path
          const pathD = points.reduce((acc, pt, i, arr) => {
            if (i === 0) return `M ${pt.x},${pt.y}`;
            const prev = arr[i - 1];
            const cpX = (prev.x + pt.x) / 2;
            return `${acc} C ${cpX},${prev.y} ${cpX},${pt.y} ${pt.x},${pt.y}`;
          }, '');

          const areaD = `${pathD} L ${points[points.length - 1].x},${padding.top + chartHeight} L ${points[0].x},${padding.top + chartHeight} Z`;

          return (
            <g key={s.key}>
              {/* Area Gradient Fill */}
              <path d={areaD} fill={`url(#area-grad-${s.key})`} />

              {/* Curve Line */}
              <path
                d={pathD}
                fill="none"
                stroke={s.color}
                strokeWidth={s.strokeWidth || 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data dots on points */}
              {points.map((pt, pIdx) => (
                <circle
                  key={pIdx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === pIdx ? 4.5 : 2}
                  fill={hoveredIndex === pIdx ? s.color : '#ffffff'}
                  stroke={s.color}
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              ))}
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          // Show every Nth label if too many items
          const showStep = Math.ceil(data.length / 7);
          if (i % showStep !== 0 && i !== data.length - 1) return null;

          return (
            <text
              key={i}
              x={getX(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[9.5px] font-sans"
            >
              {d[xAxisKey] || ''}
            </text>
          );
        })}

        {/* Invisible vertical hover zones */}
        {data.map((_, i) => {
          const x = getX(i);
          const colWidth = chartWidth / data.length;
          return (
            <rect
              key={`zone-${i}`}
              x={x - colWidth / 2}
              y={padding.top}
              width={colWidth}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
              className="cursor-pointer"
            />
          );
        })}

        {/* Hover Crosshair Guide */}
        {hoveredIndex !== null && (
          <line
            x1={getX(hoveredIndex)}
            y1={padding.top}
            x2={getX(hoveredIndex)}
            y2={padding.top + chartHeight}
            className="stroke-indigo-500/50"
            strokeDasharray="2 2"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-full bg-slate-900 text-white rounded-xl p-2 shadow-xl border border-slate-800 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${((getX(hoveredIndex)) / width) * 100}%`,
            top: `${(padding.top + 20)}px`,
          }}
        >
          <div className="font-bold text-[11px] text-slate-300 border-b border-slate-800 pb-1">
            {data[hoveredIndex][xAxisKey]}
          </div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center space-x-2 text-[11px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-slate-400">{s.label}:</span>
              <span className="font-bold font-mono text-white">
                {formatValue(data[hoveredIndex][s.key] || 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 2. DONUT & PIE CHART (with center KPI metric & legend)
// =========================================================================
export function DonutPieChart({
  data = [],
  centerTitle = '',
  centerSubtitle = '',
  size = 180,
  strokeWidth = 24,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-xs text-slate-400">
        No distribution data available
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const slices = data.map((item) => {
    const value = Number(item.value) || 0;
    const percent = total > 0 ? value / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent * circumference);
    accumulatedPercent += percent;

    return {
      ...item,
      value,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 select-none">
      {/* Donut SVG */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color || '#6366f1'}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-heading leading-tight">
            {hoveredIdx !== null ? slices[hoveredIdx].value.toLocaleString() : (centerTitle || total.toLocaleString())}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider font-mono">
            {hoveredIdx !== null ? slices[hoveredIdx].label : (centerSubtitle || 'Total')}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-1.5 min-w-[130px]">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
              hoveredIdx === idx ? 'bg-slate-100 dark:bg-slate-800' : ''
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{slice.label}</span>
            </div>
            <div className="text-right ml-2 font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
              {slice.value} <span className="text-[10px] text-slate-400 font-normal">({slice.percent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 3. BAR CHART (Vertical)
// =========================================================================
export function BarChart({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  color = '#6366f1',
  height = 200,
  formatValue = (val) => Number(val).toLocaleString(),
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="w-full flex items-end space-x-2 pt-4 pb-2" style={{ height }}>
      {data.map((item, idx) => {
        const val = Number(item[valueKey]) || 0;
        const heightPct = Math.max(4, (val / max) * 100);

        return (
          <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
            <div className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 transition-opacity mb-1">
              {formatValue(val)}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-lg overflow-hidden flex items-end h-full">
              <div
                className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: item.color || color,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 truncate max-w-full font-sans">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
