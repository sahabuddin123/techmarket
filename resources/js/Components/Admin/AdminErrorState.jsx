import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function AdminErrorState({
  statusCode = 500,
  title,
  description,
  onRetry,
  backUrl = '/admin',
}) {
  const getDefaults = () => {
    switch (Number(statusCode)) {
      case 403:
        return {
          title: 'Access Restricted (403)',
          desc: 'You do not have the required role or permission to access this administrative module.',
          icon: ShieldAlert,
        };
      case 404:
        return {
          title: 'Record Not Found (404)',
          desc: 'The requested resource could not be located in the database.',
          icon: AlertTriangle,
        };
      default:
        return {
          title: 'Service Error (500)',
          desc: 'An unexpected system or network error occurred while processing this request.',
          icon: AlertTriangle,
        };
    }
  };

  const defaults = getDefaults();
  const Icon = defaults.icon;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-4 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
          {title || defaults.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
          {description || defaults.desc}
        </p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Action</span>
          </button>
        )}

        {backUrl && (
          <a
            href={backUrl}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </a>
        )}
      </div>
    </div>
  );
}
