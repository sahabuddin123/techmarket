import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function AdminEmptyState({
  title = 'No records found',
  description = 'No items match your criteria or none have been created yet.',
  icon: Icon = PackageOpen,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 transition-colors ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-heading">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
          {description}
        </p>
      </div>

      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}
