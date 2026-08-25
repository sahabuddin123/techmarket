import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, HelpCircle, Globe, Search } from 'lucide-react';

export default function SEOScorePanel({
  score = 0,
  checklist = [],
  title = '',
  description = '',
  slug = '',
  onGenerateAuto,
  isGenerating = false,
}) {
  const getScoreColor = (sc) => {
    if (sc >= 80) return 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/60';
    if (sc >= 50) return 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950/60';
    return 'text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:bg-rose-950/60';
  };

  const getScoreLabel = (sc) => {
    if (sc >= 80) return 'SEO Optimized';
    if (sc >= 50) return 'Needs Improvement';
    return 'Action Required';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-mono font-black text-lg ${getScoreColor(score)}`}>
            {score}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              SEO Health Score
            </div>
            <div className="text-[11px] font-bold text-slate-500 font-mono">
              {getScoreLabel(score)}
            </div>
          </div>
        </div>

        {onGenerateAuto && (
          <button
            type="button"
            onClick={onGenerateAuto}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Optimizing...' : 'Auto-Generate'}</span>
          </button>
        )}
      </div>

      {/* Live SERP Preview Box */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
        <div className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5 pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
          <Search className="w-3 h-3 text-slate-400" />
          <span>Google Search SERP Preview</span>
        </div>
        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate pt-1">
          https://techmarketbd.com/product/{slug || 'product-slug'}
        </div>
        <div className="text-sm font-semibold text-blue-600 hover:underline truncate cursor-pointer font-heading">
          {title || 'Product Title — TechMarket BD'}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {description || 'Comprehensive hardware specifications, official Bangladesh warranty, instant EMI plans, and doorstep fast delivery from TechMarket BD.'}
        </div>
      </div>

      {/* SEO Checklist */}
      {checklist && checklist.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Readiness Checklist
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                  item.passed
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="truncate text-[11.5px] font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
