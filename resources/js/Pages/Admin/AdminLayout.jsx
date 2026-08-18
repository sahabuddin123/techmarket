import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AdminSidebar from '../../Components/Admin/AdminSidebar';
import AdminHeader from '../../Components/Admin/AdminHeader';
import AdminGlobalSearch from '../../Components/AdminGlobalSearch';
import ToastContainer from '../../Components/Toast/ToastContainer';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function AdminLayout({ children, title, breadcrumbs = [] }) {
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-poppins selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      {/* Sidebar */}
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
        {/* Header */}
        <AdminHeader
          isCollapsed={isCollapsed}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onOpenSearch={() => setIsSearchOpen(true)}
          breadcrumbs={breadcrumbs}
          title={title}
        />

        {/* Global Toast Alert */}
        {activeFlash && (
          <div className="px-4 md:px-6 pt-4">
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-200 ${
                activeFlash.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : activeFlash.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              <div className="flex items-center space-x-2.5 text-xs font-semibold">
                {activeFlash.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : activeFlash.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                )}
                <span>{activeFlash.message}</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveFlash(null)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Command Palette / Search Modal */}
      <AdminGlobalSearch
        isOpen={isSearchOpen}
        setIsOpen={setIsSearchOpen}
      />

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
}
