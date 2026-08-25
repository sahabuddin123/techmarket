import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminCommandPalette from './AdminCommandPalette';
import AdminThemeManager from './AdminThemeManager';
import ToastContainer from '../Toast/ToastContainer';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function AdminShell({
  children,
  title,
  breadcrumbs = [],
  className = '',
}) {
  const { props } = usePage();
  const flash = props?.flash || {};

  // Sidebar collapse persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFlash, setActiveFlash] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
  }, [isCollapsed]);

  // Flash notification watcher
  useEffect(() => {
    if (flash?.success) {
      setActiveFlash({ type: 'success', message: flash.success });
    } else if (flash?.error) {
      setActiveFlash({ type: 'error', message: flash.error });
    } else if (flash?.info) {
      setActiveFlash({ type: 'info', message: flash.info });
    }
  }, [flash]);

  return (
    <div className="admin-theme-root min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col transition-colors">
      <AdminThemeManager />
      {/* Persistent Collapsible Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main App Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Persistent Topbar */}
        <AdminTopbar
          isCollapsed={isCollapsed}
          onToggleSidebar={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setIsMobileOpen(!isMobileOpen);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          breadcrumbs={breadcrumbs}
          title={title}
        />

        {/* Global Toast Alert Banner */}
        {activeFlash && (
          <div className="px-4 sm:px-6 lg:px-8 pt-4">
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top duration-200 ${
                activeFlash.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : activeFlash.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
              }`}
            >
              <div className="flex items-center space-x-2.5 text-xs font-semibold">
                {activeFlash.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : activeFlash.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
                <span>{activeFlash.message}</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveFlash(null)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-none min-w-0 space-y-6 ${className}`}>
          {children}
        </main>
      </div>

      {/* Universal Command Palette (Ctrl+K) */}
      <AdminCommandPalette
        isOpen={isSearchOpen}
        setIsOpen={setIsSearchOpen}
      />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}
