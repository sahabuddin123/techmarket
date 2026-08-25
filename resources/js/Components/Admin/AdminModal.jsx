import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Standardized Admin Modal Size Hierarchy:
 * - 'sm' : max-width 480px (Confirmations, Deletes, Simple status)
 * - 'md' : max-width 600px (Simple standard forms: Brand, Category, Unit)
 * - 'lg' : max-width 740px (Default: Supplier, Customer, Expense, PO, Inventory)
 * - 'xl' : max-width 880px (POS Payment, Invoice Preview, Complex workflows)
 * - '2xl': max-width 960px (Rich multi-column analytics / complex builders)
 * - 'full': max-width 1140px (Genuine full-width workspaces)
 */
const MODAL_SIZE_CLASSES = {
  sm: 'max-w-[480px]',
  md: 'max-w-[600px]',
  lg: 'max-w-[740px]',
  xl: 'max-w-[880px]',
  '2xl': 'max-w-[960px]',
  full: 'max-w-[1140px]',

  // Legacy Tailwind alias normalizations (strictly bounded to prevent 1400px+ blowouts)
  'max-w-sm': 'max-w-[480px]',
  'max-w-md': 'max-w-[600px]',
  'max-w-lg': 'max-w-[740px]',
  'max-w-xl': 'max-w-[800px]',
  'max-w-2xl': 'max-w-[760px]',
  'max-w-3xl': 'max-w-[840px]',
  'max-w-4xl': 'max-w-[880px]',
  'max-w-5xl': 'max-w-[960px]',
  'max-w-6xl': 'max-w-[1040px]',
  'max-w-7xl': 'max-w-[1140px]',
  'max-w-full': 'max-w-[1140px]',
};

export default function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon = null,
  children,
  size = 'lg',
  maxWidth, // Legacy fallback prop
  footer,
}) {
  // Determine normalized size class
  const resolvedSizeClass = 
    MODAL_SIZE_CLASSES[size] || 
    (maxWidth ? MODAL_SIZE_CLASSES[maxWidth] || maxWidth : MODAL_SIZE_CLASSES.lg);

  // Escape key & Body scroll-lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Premium Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Modal Container */}
      <div
        className={`relative w-[calc(100vw-24px)] sm:w-[calc(100vw-32px)] ${resolvedSizeClass} bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[var(--admin-radius,16px)] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[calc(100vh-32px)] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-150`}
        style={{ fontFamily: 'var(--admin-font-family, inherit)' }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            {Icon && (
              <div className="w-7 h-7 rounded-xl bg-[var(--admin-primary-light,rgba(79,70,229,0.08))] text-[var(--admin-primary,#4f46e5)] flex items-center justify-center shrink-0">
                {typeof Icon === 'function' ? <Icon className="w-3.5 h-3.5" /> : Icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close dialog (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-5 py-4 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
