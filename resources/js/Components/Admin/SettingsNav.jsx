import React from 'react';
import { Link } from '@inertiajs/react';
import { 
  Sliders, Globe, ShoppingBag, Search, BarChart3, 
  Share2, Mail, ShieldAlert, Cpu, Lock
} from 'lucide-react';

export default function SettingsNav({ activeSection = 'general' }) {
  const sections = [
    { key: 'general', label: 'General & Store Identity', href: '/admin/settings', icon: Sliders },
    { key: 'storefront', label: 'Storefront & Homepage', href: '/admin/homepage', icon: Globe },
    { key: 'commerce', label: 'Payment & Gateway Providers', href: '/admin/settings/payment-methods', icon: ShoppingBag },
    { key: 'seo', label: 'SEO & Search Engine Setup', href: '/admin/settings/seo', icon: Search },
    { key: 'analytics', label: 'Analytics, GA4 & Meta Pixel', href: '/admin/settings/analytics', icon: BarChart3 },
    { key: 'feeds', label: 'Product Feeds & Meta Catalog', href: '/admin/marketing/feeds', icon: Share2 },
    { key: 'notifications', label: 'Automated Notifications', href: '/admin/marketing-automations', icon: Mail },
    { key: 'system', label: 'System Health & Telemetry', href: '/admin/system-health', icon: Cpu },
    { key: 'security', label: 'Access Roles & Permissions', href: '/admin/users', icon: Lock },
    { key: 'audit', label: 'Security & Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 space-y-1 shadow-2xs">
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
        Settings Center
      </div>

      {sections.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.key;

        return (
          <Link
            key={sec.key}
            href={sec.href}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">{sec.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
