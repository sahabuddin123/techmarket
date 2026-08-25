import React from 'react';
import { Save, RotateCcw, AlertTriangle, Check } from 'lucide-react';

export default function PendingPriceChangesBar({
  pendingCount = 0,
  onOpenConfirm,
  onDiscard,
  isProcessing = false,
}) {
  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-in slide-in-from-bottom-5 duration-200">
      <div className="pointer-events-auto flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl backdrop-blur-md border border-slate-700/60 max-w-xl w-full">
        {/* Left: Pending Count & Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-heading">
              <span>{pendingCount} Price Change{pendingCount > 1 ? 's' : ''} Pending</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400">
              Unsaved modifications in the catalog table
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Discard all pending changes and restore original prices"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <button
            type="button"
            onClick={onOpenConfirm}
            disabled={isProcessing}
            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: 'var(--admin-primary, #4f46e5)' }}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update Prices ({pendingCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
