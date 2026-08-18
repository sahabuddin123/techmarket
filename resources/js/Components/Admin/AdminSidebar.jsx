import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  LayoutDashboard, Package, ShoppingBag, Store, Sliders, 
  Image as ImageIcon, FolderTree, Tag, Ticket, Users, Layers, 
  Flame, Star, ShieldAlert, BarChart3, UserCheck, Warehouse,
  TrendingUp, Boxes, UserCog, Activity, LifeBuoy, Menu,
  FileText, BookOpen, Wrench, Landmark, Bot, HelpCircle,
  CreditCard, ShieldCheck, ChevronDown, ChevronRight, Bell, LogOut,
  ExternalLink, Search, Sparkles, Plus, Upload, PanelLeftClose, PanelLeft, Rss,
  Share2, Mail, Cpu, RefreshCw, Truck, MessageSquare, Send, Radio
} from 'lucide-react';

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenSearch,
}) {
  const { props, url: pageUrl } = usePage();
  const auth = props?.auth;
  const currentPath = pageUrl || (typeof window !== 'undefined' ? window.location.pathname : '') || '';

  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupKey) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const navSections = [
    {
      key: 'overview',
      title: 'Overview',
      items: [
        { label: 'Executive Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Sales & Revenue', href: '/admin/reports/sales', icon: BarChart3 },
        { label: 'Operations & Fulfillment', href: '/admin/reports/operations', icon: Activity },
      ],
    },
    {
      key: 'commerce',
      title: 'Commerce & Catalog',
      items: [
        { label: 'Hardware Products', href: '/admin/products', icon: Package, badge: 'Catalog' },
        { label: 'Customer Orders', href: '/admin/orders', icon: ShoppingBag },
        { label: 'Shipments & Dispatch', href: '/admin/shipments', icon: Truck, badge: 'Live' },
        { label: 'Categories Hierarchy', href: '/admin/categories', icon: FolderTree },
        { label: 'Brands & Vendors', href: '/admin/brands', icon: Tag },
        { label: 'Inventory Ledger', href: '/admin/inventory', icon: Warehouse },
        { label: 'Specification Matrix', href: '/admin/specifications', icon: Layers },
      ],
    },
    {
      key: 'content',
      title: 'Content & Media',
      items: [
        { label: 'Header & Footer Builder', href: '/admin/header-footer', icon: Sliders, badge: 'Dynamic' },
        { label: 'Media Library', href: '/admin/media', icon: ImageIcon, badge: 'Central' },
        { label: 'Homepage Builder', href: '/admin/homepage', icon: Store },
        { label: 'Navigation & Mega Menu', href: '/admin/navigation', icon: Menu },
        { label: 'Promotional Banners', href: '/admin/banners', icon: Sparkles },
        { label: 'Blog & Articles', href: '/admin/blog', icon: BookOpen },
        { label: 'CMS Custom Pages', href: '/admin/pages', icon: FileText },
      ],
    },
    {
      key: 'customers',
      title: 'Customers & Support',
      items: [
        { label: 'Customer Intelligence', href: '/admin/customers', icon: Users },
        { label: 'Fraud Checker Lookup', href: '/admin/customers/fraud-checker', icon: ShieldAlert, badge: 'Anti-Fraud' },
        { label: 'Fraud Review Queue', href: '/admin/customers/fraud-reviews', icon: ShieldCheck },
        { label: 'Product Reviews', href: '/admin/reviews', icon: Star },
        { label: 'Support Tickets', href: '/admin/support-tickets', icon: LifeBuoy },
        { label: 'Service & Warranty', href: '/admin/service-requests', icon: Wrench },
        { label: 'Pre-Sales Questions', href: '/admin/questions', icon: HelpCircle },
      ],
    },
    {
      key: 'alerts',
      title: 'Alerts & Notifications',
      items: [
        { label: 'Notification Center', href: '/admin/notifications', icon: Bell, badge: 'Live' },
        { label: 'Notification Rules', href: '/admin/settings/notification-rules', icon: Sliders },
        { label: 'Notification Settings', href: '/admin/settings/notifications', icon: ShieldAlert },
      ],
    },
    {
      key: 'communication',
      title: 'Communication & Alerts',
      items: [
        { label: 'Email Dashboard', href: '/admin/communication/email-dashboard', icon: Mail, badge: 'Live' },
        { label: 'Email Campaigns', href: '/admin/communication/email-campaigns', icon: Send },
        { label: 'Email Templates & Builder', href: '/admin/communication/email-templates', icon: FileText },
        { label: 'Email Delivery Logs', href: '/admin/communication/email-logs', icon: Activity },
        { label: 'SMS Analytics Dashboard', href: '/admin/communication/sms-dashboard', icon: MessageSquare },
        { label: 'Compose & Send SMS', href: '/admin/communication/send-sms', icon: Send },
        { label: 'SMS Templates', href: '/admin/communication/sms-templates', icon: FileText },
        { label: 'SMS Delivery Logs', href: '/admin/communication/sms-logs', icon: Activity },
      ],
    },
    {
      key: 'marketing',
      title: 'Marketing & Growth',
      items: [
        { label: 'Landing Page Hub', href: '/admin/marketing/landing-pages', icon: Sparkles, badge: 'Meta Ads' },
        { label: 'Landing Analytics', href: '/admin/marketing/landing-pages/analytics', icon: BarChart3 },
        { label: 'Campaign Templates', href: '/admin/marketing/landing-pages/templates', icon: Layers },
        { label: 'Analytics & Tracking', href: '/admin/settings/analytics', icon: TrendingUp },
        { label: 'Product Feeds (Meta/Google)', href: '/admin/marketing/feeds', icon: Share2 },
        { label: 'Coupons & Discounts', href: '/admin/coupons', icon: Ticket },
        { label: 'Flash Sale Campaigns', href: '/admin/flash-sales', icon: Flame },
        { label: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: RefreshCw },
        { label: 'Automated Campaigns', href: '/admin/marketing-automations', icon: Mail },
      ],
    },
    {
      key: 'system',
      title: 'System & Security',
      items: [
        { label: 'System Settings', href: '/admin/settings', icon: Sliders },
        { label: 'Email Gateways & Settings', href: '/admin/settings/email', icon: Mail, badge: 'SMTP/API' },
        { label: 'SMS Gateways (BulkSMS/MIM)', href: '/admin/settings/sms-gateways', icon: Radio },
        { label: 'Global SMS Settings', href: '/admin/settings/sms', icon: Sliders },
        { label: 'Courier API Integrations', href: '/admin/settings/courier', icon: Truck, badge: 'Steadfast/Pathao' },
        { label: 'Fraud Detection Rules', href: '/admin/settings/fraud', icon: ShieldAlert },
        { label: 'Payment Gateways', href: '/admin/settings/payment-methods', icon: CreditCard },
        { label: 'System Health & Metrics', href: '/admin/system-health', icon: Cpu },
        { label: 'Admin Roles & Access', href: '/admin/users', icon: UserCog },
        { label: 'Security Audit Trail', href: '/admin/audit-logs', icon: ShieldCheck },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center space-x-3 overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 font-heading text-lg shadow-md shrink-0 group-hover:scale-105 transition-transform">
            TM
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-heading font-black text-white text-sm tracking-tight truncate flex items-center space-x-1.5">
                <span>TECHMARKET</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  OS
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate tracking-wide">
                Enterprise Back-Office
              </div>
            </div>
          )}
        </Link>

        {/* Collapse Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Search Shortcut */}
      {!isCollapsed && onOpenSearch && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-[11px]">Command Palette...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation Links (Custom Thin Scrollbar) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-5">
        {navSections.map((section) => {
          const isGroupCollapsed = collapsedGroups[section.key];

          return (
            <div key={section.key} className="space-y-1">
              {!isCollapsed && (
                <div
                  onClick={() => toggleGroup(section.key)}
                  className="flex items-center justify-between px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-300 font-mono cursor-pointer transition-colors"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform ${
                      isGroupCollapsed ? '-rotate-90' : ''
                    }`}
                  />
                </div>
              )}

              {(!isGroupCollapsed || isCollapsed) && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/admin'
                      ? (currentPath === '/admin' || currentPath === '/admin/dashboard')
                      : (currentPath === item.href || currentPath.startsWith(item.href + '/'));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={`group relative flex items-center ${
                          isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                        } rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/10'
                            : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                          {!isCollapsed && (
                            <span className="truncate text-[12px]">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Card / Bottom Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-amber-400 shrink-0 text-xs shadow-inner">
              {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate font-heading">
                  {auth?.user?.name || 'Administrator'}
                </div>
                <div className="text-[10.5px] font-mono text-emerald-400 capitalize truncate">
                  {auth?.user?.role || 'Admin'}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <Link
              href="/logout"
              method="post"
              as="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-200 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
