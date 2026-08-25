import React from 'react';
import { Check, X, AlertCircle, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export default function PriceChangeConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  pendingChanges = {},
  isProcessing = false,
}) {
  if (!isOpen) return null;

  const changeList = Object.values(pendingChanges);
  const totalItems = changeList.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                Confirm Price Updates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are about to update prices for <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalItems} product{totalItems > 1 ? 's' : ''}</span>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Change List Table */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 px-6">
          {changeList.map((item) => {
            const regularChanged = item.regular_price !== undefined && String(item.regular_price) !== String(item.original_regular_price ?? '');
            const sellingChanged = item.selling_price !== undefined && String(item.selling_price) !== String(item.original_selling_price ?? '');

            return (
              <div key={item.product_id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    SKU: {item.sku}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 font-mono">
                  {/* Regular Price diff */}
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Regular</div>
                    {regularChanged ? (
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-slate-400 line-through">৳{Number(item.original_regular_price || 0).toLocaleString()}</span>
                        <ArrowRight className="w-3 h-3 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400">৳{Number(item.regular_price || 0).toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">৳{Number(item.original_regular_price || 0).toLocaleString()} (Unchanged)</span>
                    )}
                  </div>

                  {/* Selling Price diff */}
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selling</div>
                    {sellingChanged ? (
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-slate-400 line-through">৳{Number(item.original_selling_price || 0).toLocaleString()}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">৳{Number(item.selling_price || 0).toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">৳{Number(item.original_selling_price || 0).toLocaleString()} (Unchanged)</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety Note */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>All updates are executed atomically with an audit log snapshot. Stock and existing orders remain untouched.</span>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing || totalItems === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs hover:shadow transition flex items-center gap-2"
            style={{ backgroundColor: 'var(--admin-primary, #4f46e5)' }}
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply & Update {totalItems} Prices</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
