import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Plus, Package, ShoppingBag, Users, Ticket, Flame, 
  FileText, ShieldCheck, Wrench, MapPin, ChevronDown 
} from 'lucide-react';

export default function AdminQuickCreate() {
  const { props } = usePage();
  const user = props?.auth?.user || {};
  const userRole = (user?.role || '').toLowerCase();
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const isSuperAdmin = userRole === 'admin' || userRole === 'superadmin' || user?.is_super_admin === true;

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickActions = [
    {
      label: 'New Product',
      href: '/admin/products/create',
      icon: Package,
      permission: 'products.manage',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      label: 'New Order / Checkout',
      href: '/checkout',
      icon: ShoppingBag,
      permission: 'orders.manage',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'New Discount Coupon',
      href: '/admin/coupons/create',
      icon: Ticket,
      permission: 'promotions.manage',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      label: 'New Flash Sale',
      href: '/admin/flash-sales',
      icon: Flame,
      permission: 'promotions.manage',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
    },
    {
      label: 'New CCTV Estimate',
      href: '/cctv-estimator',
      icon: FileText,
      permission: 'cctv.manage',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      label: 'New CCTV Project',
      href: '/admin/cctv/projects',
      icon: ShieldCheck,
      permission: 'cctv.manage',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      label: 'New Site Survey Request',
      href: '/site-survey',
      icon: MapPin,
      permission: 'cctv.manage',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    },
    {
      label: 'New Service RMA Ticket',
      href: '/admin/service-requests',
      icon: Wrench,
      permission: 'service.manage',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
    },
  ];

  const allowedActions = quickActions.filter((action) => {
    if (isSuperAdmin) return true;
    if (!action.permission) return true;
    return permissions.includes(action.permission);
  });

  if (allowedActions.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
        title="Quick Create Action"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Create</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Quick Actions
          </div>
          <div className="space-y-0.5">
            {allowedActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className={`p-1.5 rounded-lg ${action.bg} ${action.color} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
