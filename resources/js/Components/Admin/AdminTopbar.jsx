import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Menu, Search, Plus, ExternalLink, Sun, Moon, 
  HelpCircle, User, Sliders, LogOut, ChevronDown, 
  Sparkles, Laptop, ShieldCheck, LifeBuoy, Store
} from 'lucide-react';
import { useAdminNavigation } from '../../Hooks/useAdminNavigation';
import AdminBreadcrumb from './AdminBreadcrumb';
import AdminQuickCreate from './AdminQuickCreate';
import NotificationBell from './NotificationBell';

export default function AdminTopbar({
  isCollapsed,
  onToggleSidebar,
  onOpenSearch,
  breadcrumbs = [],
  title,
}) {
  const { props } = usePage();
  const auth = props?.auth || {};
  const user = auth?.user || {};
  const { sections, isRouteActive, isSuperAdmin } = useAdminNavigation();

  const currentPath = props?.ziggy?.location || (typeof window !== 'undefined' ? window.location.pathname : '') || '';
  const isPosActive = currentPath === '/admin/pos' || currentPath.startsWith('/admin/pos/') || isRouteActive('/admin/pos');

  const userRole = (user?.role || '').toLowerCase();
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const hasPosAccess = isSuperAdmin ||
    userPermissions.includes('pos.view') ||
    userPermissions.includes('pos.manage') ||
    ['admin', 'superadmin', 'sales', 'finance'].includes(userRole) ||
    sections.some(section => section.items.some(item => item.route === '/admin/pos' || item.id === 'pos_terminal'));

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_theme') || 'light'; // Default to clean light SaaS workspace
    }
    return 'light';
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const profileRef = useRef(null);
  const helpRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setHelpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left: Sidebar Toggle & Context Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <AdminBreadcrumb items={breadcrumbs} />
        </div>
      </div>

      {/* Center: Command Palette Trigger Input */}
      <div className="flex-1 max-w-lg mx-4 hidden lg:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs transition-all shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <span className="text-[12px] font-normal">Search for orders, products, customers...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-2xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: POS, Quick Create, Notifications, Help, Live Store, Theme, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Dedicated POS Operational Shortcut Button */}
        {hasPosAccess && (
          <Link
            href="/admin/pos"
            title="Point of Sale (POS)"
            className={`relative group inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded-[var(--admin-radius,12px)] text-xs font-bold transition-all duration-200 shadow-2xs border cursor-pointer ${
              isPosActive
                ? 'bg-[var(--admin-primary,#4f46e5)] text-white border-transparent shadow-sm'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-[var(--admin-primary,#4f46e5)] hover:text-[var(--admin-primary,#4f46e5)] hover:bg-[var(--admin-primary-light,rgba(79,70,229,0.08))]'
            }`}
            aria-label="Point of Sale (POS)"
          >
            <Store
              className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                isPosActive ? 'text-white' : 'text-[var(--admin-primary,#4f46e5)]'
              }`}
            />
            <span className="hidden sm:inline tracking-wide font-semibold">POS</span>
            {isPosActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden md:inline-block" />
            )}
          </Link>
        )}

        {/* Quick Create Dropdown */}
        <AdminQuickCreate />

        {/* Real-time Enterprise Notification Bell */}
        <NotificationBell />

        {/* Help & Documentation Menu */}
        <div className="relative" ref={helpRef}>
          <button
            type="button"
            onClick={() => setHelpOpen(!helpOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Help & Operations"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {helpOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              <Link
                href="/admin/audit-logs"
                onClick={() => setHelpOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Security Audit Trail</span>
              </Link>
              <Link
                href="/admin/system-health"
                onClick={() => setHelpOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Laptop className="w-4 h-4 text-blue-500" />
                <span>System Health Telemetry</span>
              </Link>
              <Link
                href="/admin/support-tickets"
                onClick={() => setHelpOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LifeBuoy className="w-4 h-4 text-indigo-500" />
                <span>Support Desk</span>
              </Link>
            </div>
          )}
        </div>

        {/* Public Storefront External Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          title="Open Public Storefront"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Live Store</span>
        </a>

        {/* Theme Switcher Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                {user?.name || 'Admin'}
              </div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                {user?.role || 'Super Administrator'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Administrator'}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{user?.email || 'admin@techmarket.com'}</div>
                <span className="inline-block mt-1 text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {user?.role || 'Super Admin'}
                </span>
              </div>

              <Link
                href="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Store Settings</span>
              </Link>

              <Link
                href="/admin/users"
                onClick={() => setProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Roles & Permissions</span>
              </Link>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
