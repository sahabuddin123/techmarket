import React from 'react';

export default function StatusBadge({ status, label, size = 'sm', variant }) {
  const normalized = (status || label || '').toString().toLowerCase().trim();

  // Color mapping logic
  const getStyles = () => {
    if (variant) return variant;

    switch (normalized) {
      case 'active':
      case 'published':
      case 'delivered':
      case 'completed':
      case 'paid':
      case 'in_stock':
      case 'excellent':
      case 'resolved':
      case 'healthy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

      case 'pending':
      case 'processing':
      case 'under_review':
      case 'draft':
      case 'fair':
      case 'low_stock':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';

      case 'cancelled':
      case 'failed':
      case 'out_of_stock':
      case 'critical':
      case 'poor':
      case 'spam':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';

      case 'shipped':
      case 'in_transit':
      case 'info':
      case 'good':
      case 'featured':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';

      case 'admin':
      case 'superadmin':
      case 'manager':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';

      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
    }
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9.5px]',
    sm: 'px-2 py-0.5 text-[10.5px]',
    md: 'px-2.5 py-1 text-xs',
  }[size] || 'px-2 py-0.5 text-[10.5px]';

  const displayLabel = label || status || 'Unknown';

  return (
    <span className={`inline-flex items-center font-bold tracking-tight rounded-md border ${sizeClasses} ${getStyles()} uppercase font-mono`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {displayLabel}
    </span>
  );
}
