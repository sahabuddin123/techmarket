import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are currently no records matching your request or filter criteria.',
  action,
  className = '',
}) {
  return (
    <div className={`p-10 text-center flex flex-col items-center justify-center space-y-3 bg-slate-900/50 border border-dashed border-slate-800/80 rounded-2xl ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      
      <div className="max-w-sm space-y-1">
        <div className="text-sm font-bold text-slate-200 font-heading">
          {title}
        </div>
        <div className="text-xs text-slate-400 leading-relaxed font-normal">
          {description}
        </div>
      </div>

      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}
