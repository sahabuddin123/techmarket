import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Menu, Search, Plus, ExternalLink, Image as ImageIcon, 
  Bell, Sun, Moon, Laptop, User, Sliders, LogOut, ChevronDown, 
  Package, ShoppingBag, Ticket, Sparkles
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function AdminHeader({
  isCollapsed,
  onToggleMobile,
  onOpenSearch,
  breadcrumbs = [],
  title,
}) {
  const { props } = usePage();
  const auth = props?.auth;

  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_theme') || 'dark';
    }
    return 'dark';
  });

  // Dropdown states
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const quickActionRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickActionRef.current && !quickActionRef.current.contains(e.target)) {
        setQuickActionOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Context Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-400 font-mono">TechMarket</span>
          <span className="text-slate-600">/</span>
          <span className="font-black text-white font-heading tracking-tight">{title || 'Console'}</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
            <span className="text-[11.5px] font-medium">Quick search products, orders, customers, media...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Actions, Theme, Storefront Link, Profile */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Action Button */}
        <div className="relative" ref={quickActionRef}>
          <button
            type="button"
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Action</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${quickActionOpen ? 'rotate-180' : ''}`} />
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              <Link
                href="/admin/products/create"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 font-bold transition-colors"
              >
                <Package className="w-4 h-4 text-blue-400" />
                <span>Add New Product</span>
              </Link>
              <Link
                href="/admin/media"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 font-bold transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>Upload Media Asset</span>
              </Link>
              <Link
                href="/admin/coupons"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 font-bold transition-colors"
              >
                <Ticket className="w-4 h-4 text-rose-400" />
                <span>Create Promo Coupon</span>
              </Link>
              <Link
                href="/admin/flash-sales"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 font-bold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Launch Flash Campaign</span>
              </Link>
              <Link
                href="/admin/header-footer"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 font-bold transition-colors"
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Header & Footer Builder</span>
              </Link>
            </div>
          )}
        </div>

        {/* Media Library Direct Link */}
        <Link
          href="/admin/media"
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title="Central Media Library"
        >
          <ImageIcon className="w-4 h-4" />
        </Link>

        {/* Public Storefront Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-bold transition-colors"
          title="Open Public Storefront"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span>Live Store</span>
        </a>

        {/* Real-time Enterprise Notification Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 p-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
              {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 mr-1" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <div className="font-bold text-white truncate font-heading">{auth?.user?.name || 'Administrator'}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{auth?.user?.email}</div>
              </div>

              <Link
                href="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>System Settings</span>
              </Link>

              <Link
                href="/admin/system-health"
                onClick={() => setProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors"
              >
                <Laptop className="w-4 h-4 text-slate-400" />
                <span>Health Telemetry</span>
              </Link>

              <div className="border-t border-slate-800/80 pt-1 mt-1">
                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-bold transition-colors cursor-pointer text-left"
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
