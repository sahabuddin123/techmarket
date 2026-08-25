import React from 'react';

export function AdminTableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800" />
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="py-3 px-4 flex items-center justify-between space-x-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
    </div>
  );
}

export function AdminDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-2/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl col-span-2" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}
