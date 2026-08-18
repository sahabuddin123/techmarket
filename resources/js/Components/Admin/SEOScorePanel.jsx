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
    if (sc >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (sc >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getScoreLabel = (sc) => {
    if (sc >= 80) return 'SEO Optimized';
    if (sc >= 50) return 'Needs Improvement';
    return 'Action Required';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-xs">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-mono font-black text-lg ${getScoreColor(score)}`}>
            {score}
          </div>
          <div>
            <div className="text-sm font-black text-white font-heading">
              SEO Health Score
            </div>
            <div className="text-[11px] font-bold text-slate-400 font-mono">
              {getScoreLabel(score)}
            </div>
          </div>
        </div>

        {onGenerateAuto && (
          <button
            type="button"
            onClick={onGenerateAuto}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Optimizing...' : 'Auto-Generate'}</span>
          </button>
        )}
      </div>

      {/* Live SERP Preview Box */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
        <div className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5 pb-1 border-b border-slate-900">
          <Search className="w-3 h-3 text-slate-400" />
          <span>Google Search SERP Preview</span>
        </div>
        <div className="text-[11px] text-emerald-400 font-mono truncate pt-1">
          https://techmarketbd.com/product/{slug || 'product-slug'}
        </div>
        <div className="text-sm font-semibold text-blue-400 hover:underline truncate cursor-pointer font-heading">
          {title || 'Product Title — TechMarket BD'}
        </div>
        <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {description || 'Comprehensive hardware specifications, official Bangladesh warranty, instant EMI plans, and doorstep fast delivery from TechMarket BD.'}
        </div>
      </div>

      {/* SEO Checklist */}
      {checklist && checklist.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono">
            Readiness Checklist
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                  item.passed
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
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
