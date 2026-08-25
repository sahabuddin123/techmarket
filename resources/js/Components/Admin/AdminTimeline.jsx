import React from 'react';
import { Clock, User, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export default function AdminTimeline({
  events = [],
  emptyMessage = 'No activity events recorded yet.',
  className = '',
}) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 font-medium">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 ${className}`}>
      {events.map((event, idx) => {
        return (
          <div key={idx} className="relative flex items-start space-x-3 pl-8">
            {/* Timeline Dot / Icon */}
            <div className="absolute left-1.5 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center shadow-2xs" />

            {/* Event Card */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {event.title || event.action || 'System Event'}
                  </span>
                  {event.tag && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {event.tag}
                    </span>
                  )}
                </div>

                <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-mono flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {event.timestamp || event.created_at || 'Just now'}
                </span>
              </div>

              {event.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                  {event.description}
                </p>
              )}

              {event.user && (
                <div className="pt-1 flex items-center space-x-1.5 text-[11px] text-slate-400">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>By <strong className="text-slate-700 dark:text-slate-200">{event.user.name || event.user}</strong></span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
