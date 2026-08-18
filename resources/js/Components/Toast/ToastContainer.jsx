import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Expose global window helper for adding toasts
    window.addAppToast = (toast) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 5);
      const newToast = {
        id,
        type: toast.type || 'info', // success, error, warning, critical, info
        title: toast.title,
        message: toast.message,
        actionUrl: toast.actionUrl,
        actionLabel: toast.actionLabel || 'View',
        duration: toast.duration ?? (toast.type === 'critical' ? 0 : 5000), // 0 = persistent
      };

      setToasts(prev => [newToast, ...prev.slice(0, 4)]); // max 5 stacked toasts
    };

    return () => {
      delete window.addAppToast;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const timers = toasts.map(t => {
      if (t.duration > 0) {
        return setTimeout(() => removeToast(t.id), t.duration);
      }
      return null;
    });

    return () => timers.forEach(timer => timer && clearTimeout(timer));
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full font-sans pointer-events-none">
      {toasts.map(t => {
        const isCritical = t.type === 'critical';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';
        const isSuccess = t.type === 'success';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start space-x-3 transition-all animate-in slide-in-from-right duration-200 ${
              isCritical
                ? 'bg-rose-950/90 border-rose-500/80 text-rose-100 ring-2 ring-rose-500/40'
                : isError
                ? 'bg-red-950/90 border-red-500/60 text-red-100'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-100'
                : isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isCritical ? <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" /> :
               isError ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
               isWarning ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
               isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
               <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              {t.title && <h5 className="font-extrabold text-xs leading-tight">{t.title}</h5>}
              <p className="text-[11px] opacity-90 leading-relaxed">{t.message}</p>
              
              {t.actionUrl && (
                <a
                  href={t.actionUrl}
                  className="inline-block pt-1 text-[10px] font-black underline tracking-wide"
                >
                  {t.actionLabel} →
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
