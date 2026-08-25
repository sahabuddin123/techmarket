import React from 'react';

export function AdminFormSection({
  title,
  subtitle,
  icon: Icon,
  columns = 1, // 1 | 2 | 3
  className = '',
  children,
}) {
  const colClasses = {
    1: 'grid grid-cols-1 gap-4',
    2: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  }[columns] || 'grid grid-cols-1 gap-4';

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 transition-colors ${className}`}>
      {(title || subtitle) && (
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800/60 space-y-0.5">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={colClasses}>
        {children}
      </div>
    </div>
  );
}

export function AdminFormActions({
  onSave,
  onSaveAndContinue,
  onDraft,
  onCancel,
  cancelHref,
  saveLabel = 'Save Changes',
  saving = false,
  sticky = true,
  className = '',
}) {
  return (
    <div
      className={`${
        sticky ? 'sticky bottom-4 z-20' : ''
      } bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between transition-colors gap-3 ${className}`}
    >
      <div>
        {cancelHref ? (
          <a
            href={cancelHref}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </a>
        ) : onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="flex items-center space-x-2.5">
        {onDraft && (
          <button
            type="button"
            onClick={onDraft}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Save as Draft
          </button>
        )}

        {onSaveAndContinue && (
          <button
            type="button"
            onClick={onSaveAndContinue}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Save & Continue
          </button>
        )}

        <button
          type={onSave ? 'button' : 'submit'}
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
        >
          {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span>{saving ? 'Saving...' : saveLabel}</span>
        </button>
      </div>
    </div>
  );
}
