import React from 'react';
import { usePage, Link } from '@inertiajs/react';

export default function AdminLogo({
  isCollapsed = false,
  showText = true,
  className = '',
  linkHref = '/admin',
}) {
  const { props } = usePage();
  const settings = props?.settings || {};

  const brandName = settings.admin_brand_name || settings.site_name || 'TechMarket';
  const logoUrl = settings.admin_logo || settings.site_logo || '';
  const brandInitials = brandName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'TM';

  const logoMark = logoUrl ? (
    <img
      src={logoUrl}
      alt={brandName}
      className="max-h-8 max-w-full object-contain rounded-lg"
    />
  ) : (
    <div 
      className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-white font-heading text-base shadow-sm shrink-0 transition-transform group-hover:scale-105"
      style={{
        background: 'linear-gradient(135deg, var(--admin-primary, #4f46e5) 0%, var(--admin-secondary, #6366f1) 50%, var(--admin-accent, #8b5cf6) 100%)',
      }}
    >
      {brandInitials}
    </div>
  );

  const content = (
    <div className={`flex items-center space-x-3 overflow-hidden group ${className}`}>
      {logoMark}

      {!isCollapsed && showText && (
        <div className="truncate">
          <div className="font-heading font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight truncate flex items-center space-x-1.5">
            <span className="truncate">{brandName}</span>
            <span 
              className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border"
              style={{
                backgroundColor: 'var(--admin-primary-light, #eef2ff)',
                color: 'var(--admin-primary, #4f46e5)',
                borderColor: 'color-mix(in srgb, var(--admin-primary) 30%, transparent)',
              }}
            >
              ADMIN
            </span>
          </div>
          <div className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium truncate">
            Enterprise Commerce
          </div>
        </div>
      )}
    </div>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
