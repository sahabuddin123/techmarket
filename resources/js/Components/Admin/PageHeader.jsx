import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  badge,
  icon: Icon,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
      <div className="space-y-1.5">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-400">
            <Link href="/admin" className="hover:text-slate-200 transition-colors flex items-center">
              <Home className="w-3 h-3 mr-1 text-slate-500" />
              <span>Admin</span>
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-slate-200 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-300 font-bold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title & Badge */}
        <div className="flex items-center space-x-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight font-heading flex items-center space-x-2.5">
            <span>{title}</span>
            {badge && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
                {badge}
              </span>
            )}
          </h1>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-slate-400 max-w-2xl font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions toolbar */}
      {actions && (
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
