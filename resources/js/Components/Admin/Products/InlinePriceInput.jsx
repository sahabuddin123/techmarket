import React from 'react';

/**
 * Compact Inline Price Input with Currency Prefix & Modification Highlight
 */
export default function InlinePriceInput({
  value,
  originalValue,
  onChange,
  error,
  placeholder = '0.00',
  disabled = false,
  label = '',
}) {
  const isModified = value !== undefined && value !== null && String(value) !== String(originalValue ?? '');

  return (
    <div className="relative group/price min-w-[130px] max-w-[155px]">
      <div className="relative flex items-center">
        <span 
          className={`absolute left-2.5 text-xs font-bold transition-colors select-none pointer-events-none ${
            error 
              ? 'text-rose-500' 
              : isModified 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          ৳
        </span>

        <input
          type="number"
          step="any"
          min="0"
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold rounded-lg transition-all focus:outline-none focus:ring-2 ${
            error
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 text-rose-800 dark:text-rose-200 ring-rose-400/40'
              : isModified
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 ring-amber-400/40'
                : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-indigo-500/30'
          } border shadow-2xs`}
        />

        {isModified && (
          <span 
            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-xs pointer-events-none animate-pulse" 
            title="Unsaved Change" 
          />
        )}
      </div>

      {/* Unsaved / Modified tag */}
      {isModified && !error && (
        <div className="flex items-center justify-between text-[9.5px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5 px-0.5">
          <span>Unsaved</span>
          <span className="font-mono text-slate-400 line-through">৳{Number(originalValue || 0).toLocaleString()}</span>
        </div>
      )}

      {/* Row-specific error */}
      {error && (
        <div className="text-[10px] font-medium text-rose-600 dark:text-rose-400 mt-0.5 leading-tight px-0.5">
          {error}
        </div>
      )}
    </div>
  );
}
