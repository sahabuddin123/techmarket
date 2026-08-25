import React from 'react';

export default function AdminStatusBadge({
  status,
  label,
  size = 'sm',
  variant,
  showDot = true,
  className = '',
}) {
  const rawStatus = (status || label || '').toString().toLowerCase().trim();

  // Semantic styles for status badges
  const getBadgeStyle = () => {
    if (variant) return variant;

    switch (rawStatus) {
      // Success / Complete / Active
      case 'active':
      case 'published':
      case 'delivered':
      case 'completed':
      case 'paid':
      case 'in_stock':
      case 'approved':
      case 'resolved':
      case 'healthy':
      case 'operational':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

      // Warning / Pending / In-progress
      case 'pending':
      case 'processing':
      case 'packed':
      case 'draft':
      case 'low_stock':
      case 'scheduled':
      case 'assigned':
      case 'in_progress':
      case 'under_review':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';

      // Danger / Cancelled / Error
      case 'cancelled':
      case 'failed':
      case 'rejected':
      case 'out_of_stock':
      case 'critical':
      case 'high_risk':
      case 'urgent':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';

      // Info / Shipped / Blue
      case 'shipped':
      case 'in_transit':
      case 'info':
      case 'good':
      case 'featured':
      case 'saved':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';

      // Purple / Admin / VIP
      case 'admin':
      case 'superadmin':
      case 'manager':
      case 'vip':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';

      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9.5px]',
    sm: 'px-2 py-0.5 text-[10.5px]',
    md: 'px-2.5 py-1 text-xs',
  }[size] || 'px-2 py-0.5 text-[10.5px]';

  const displayLabel = label || status || 'Unknown';

  return (
    <span
      className={`inline-flex items-center font-semibold tracking-tight rounded-md border ${sizeClasses} ${getBadgeStyle()} uppercase font-mono ${className}`}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80 shrink-0" />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
