import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

export default function AdminBreadcrumb({ items = [], className = '' }) {
  const { url } = usePage();
  const currentPath = url || (typeof window !== 'undefined' ? window.location.pathname : '') || '';

  // If custom items are passed, use them; otherwise auto-generate from path
  const breadcrumbs = React.useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }

    const segments = currentPath.split('?')[0].split('/').filter(Boolean);
    if (segments.length === 0 || segments[0] !== 'admin') {
      return [{ label: 'Admin', href: '/admin' }];
    }

    const list = [{ label: 'Dashboard', href: '/admin' }];
    let accPath = '/admin';

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      accPath += `/${seg}`;
      
      // Format human-readable title
      let label = seg
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      // If segment looks like an ID, label it #ID
      if (/^\d+$/.test(seg)) {
        label = `#${seg}`;
      }

      list.push({
        label,
        href: i === segments.length - 1 ? null : accPath,
      });
    }

    return list;
  }, [items, currentPath]);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium ${className}`}>
      <Link
        href="/admin"
        className="p-1 rounded hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;

        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            {isLast || !crumb.href ? (
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors truncate max-w-[150px]"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
