import React, { useState, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Store, PackagePlus, ShoppingBag, ShoppingCart, 
  UserPlus, Building2, Boxes, Wallet, ArrowRight, 
  X, Sparkles, FolderTree, Tag, Layers, Users, 
  ArrowLeftRight, ClipboardCheck, Warehouse, Coins, 
  BookOpen, CreditCard, ChevronRight, FileText, Package
} from 'lucide-react';
import { useAdminNavigation } from '../../Hooks/useAdminNavigation';

export default function AdminQuickActions({ lowStockCount = 0, pendingOrdersCount = 0 }) {
  const { props } = usePage();
  const auth = props?.auth || {};
  const user = auth?.user || {};
  const { isSuperAdmin } = useAdminNavigation();

  const userRole = (user?.role || '').toLowerCase();
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Permission validator
  const hasAccess = (permission, fallbackRoles = []) => {
    if (isSuperAdmin || userRole === 'admin' || userRole === 'superadmin' || user?.is_super_admin === true) {
      return true;
    }
    if (permission && userPermissions.includes(permission)) {
      return true;
    }
    if (fallbackRoles.length > 0 && fallbackRoles.includes(userRole)) {
      return true;
    }
    return false;
  };

  // Primary 8 Quick Actions Definition
  const quickActions = useMemo(() => {
    const list = [
      {
        id: 'pos',
        title: 'POS Terminal',
        subtitle: 'Start a new sale',
        icon: Store,
        route: '/admin/pos',
        permission: 'pos.view',
        fallbackRoles: ['sales', 'finance'],
        isPrimary: true,
        isPos: true,
        badgeText: 'Start Sale',
        badgeColor: 'emerald',
      },
      {
        id: 'add_product',
        title: 'Add Product',
        subtitle: 'Create product',
        icon: PackagePlus,
        route: '/admin/products/create',
        permission: 'products.manage',
        fallbackRoles: ['marketing'],
        isPrimary: true,
        badgeText: 'Catalog',
        badgeColor: 'indigo',
      },
      {
        id: 'new_sale',
        title: 'New Sale',
        subtitle: 'Sales orders',
        icon: ShoppingBag,
        route: '/admin/sales',
        permission: 'sales.view',
        fallbackRoles: ['sales', 'finance'],
        isPrimary: true,
        badgeText: pendingOrdersCount > 0 ? `${pendingOrdersCount} pending` : 'Orders',
        badgeColor: 'blue',
      },
      {
        id: 'new_purchase',
        title: 'New Purchase',
        subtitle: 'Purchase order',
        icon: ShoppingCart,
        route: '/admin/purchases',
        permission: 'purchases.view',
        fallbackRoles: ['warehouse', 'finance'],
        isPrimary: true,
        badgeText: 'Procure',
        badgeColor: 'amber',
      },
      {
        id: 'add_customer',
        title: 'Add Customer',
        subtitle: 'New customer',
        icon: UserPlus,
        route: '/admin/customers',
        permission: 'customers.view',
        fallbackRoles: ['sales'],
        isPrimary: false,
        badgeText: 'CRM',
      },
      {
        id: 'add_supplier',
        title: 'Add Supplier',
        subtitle: 'New vendor',
        icon: Building2,
        route: '/admin/suppliers',
        permission: 'suppliers.view',
        fallbackRoles: ['warehouse', 'finance'],
        isPrimary: false,
        badgeText: 'Vendors',
      },
      {
        id: 'stock_adjustment',
        title: 'Stock Adjustment',
        subtitle: 'Adjust inventory',
        icon: Boxes,
        route: '/admin/inventory',
        permission: 'inventory.view',
        fallbackRoles: ['warehouse'],
        isPrimary: false,
        badgeText: lowStockCount > 0 ? `${lowStockCount} low` : 'Stock',
        badgeColor: lowStockCount > 0 ? 'rose' : undefined,
      },
      {
        id: 'add_expense',
        title: 'Add Expense',
        subtitle: 'Record expense',
        icon: Wallet,
        route: '/admin/accounts/expenses',
        permission: 'accounts.view',
        fallbackRoles: ['finance'],
        isPrimary: false,
        badgeText: 'Finance',
      },
    ];

    return list.filter((action) => hasAccess(action.permission, action.fallbackRoles));
  }, [userRole, userPermissions, isSuperAdmin, lowStockCount, pendingOrdersCount]);

  // Grouped Actions for "View All" Modal
  const modalGroups = useMemo(() => {
    const groups = [
      {
        name: 'Commerce & Sales',
        items: [
          { label: 'POS Terminal', route: '/admin/pos', icon: Store, permission: 'pos.view', desc: 'Fast cashier terminal & split tender' },
          { label: 'Sales Operations', route: '/admin/sales', icon: FileText, permission: 'sales.view', desc: 'Commercial invoices & refunds' },
          { label: 'Purchase Orders', route: '/admin/purchases', icon: ShoppingCart, permission: 'purchases.view', desc: 'Vendor procurement & receiving' },
          { label: 'Online Orders', route: '/admin/orders', icon: ShoppingBag, permission: 'orders.manage', desc: 'Customer web orders pipeline' },
        ],
      },
      {
        name: 'Catalog & Taxonomy',
        items: [
          { label: 'Add Product', route: '/admin/products/create', icon: PackagePlus, permission: 'products.manage', desc: 'New hardware & specifications' },
          { label: 'Product Catalog', route: '/admin/products', icon: Package, permission: 'products.manage', desc: 'Price management, SEO & stock' },
          { label: 'Categories', route: '/admin/categories', icon: FolderTree, permission: 'categories.manage', desc: 'Category taxonomy & banners' },
          { label: 'Brands', route: '/admin/brands', icon: Tag, permission: 'brands.manage', desc: 'Authorized manufacturer partners' },
          { label: 'Attributes & Specs', route: '/admin/specifications', icon: Layers, permission: 'specifications.manage', desc: 'Dynamic technical specifications' },
        ],
      },
      {
        name: 'Customers & Suppliers',
        items: [
          { label: 'Customers Registry', route: '/admin/customers', icon: Users, permission: 'customers.view', desc: 'Customer ledgers & credit limits' },
          { label: 'Suppliers Registry', route: '/admin/suppliers', icon: Building2, permission: 'suppliers.view', desc: 'Vendor directory & purchase history' },
        ],
      },
      {
        name: 'Inventory & Multi-Warehouse',
        items: [
          { label: 'Stock Adjustment', route: '/admin/inventory', icon: Boxes, permission: 'inventory.view', desc: 'Physical audit adjustments' },
          { label: 'Stock Transfers', route: '/admin/inventory/transfers', icon: ArrowLeftRight, permission: 'inventory.view', desc: 'Inter-warehouse transfers' },
          { label: 'Stock Counts', route: '/admin/inventory/counts', icon: ClipboardCheck, permission: 'inventory.view', desc: 'Cyclic stock verification' },
          { label: 'Warehouses', route: '/admin/warehouses', icon: Warehouse, permission: 'warehouses.view', desc: 'Depot & location setup' },
        ],
      },
      {
        name: 'Finance & Double-Entry Accounts',
        items: [
          { label: 'Record Expense', route: '/admin/accounts/expenses', icon: Wallet, permission: 'accounts.view', desc: 'Operating & administrative expenses' },
          { label: 'Record Income', route: '/admin/accounts/income', icon: Coins, permission: 'accounts.view', desc: 'Service & non-sales revenue' },
          { label: 'Chart of Accounts', route: '/admin/accounts/chart-of-accounts', icon: BookOpen, permission: 'accounts.view', desc: 'General ledger account hierarchy' },
          { label: 'Transactions Ledger', route: '/admin/accounts/transactions', icon: CreditCard, permission: 'accounts.view', desc: 'Double-entry journal audit trail' },
        ],
      },
    ];

    return groups.map((g) => ({
      ...g,
      items: g.items.filter((item) => hasAccess(item.permission)),
    })).filter((g) => g.items.length > 0);
  }, [userRole, userPermissions, isSuperAdmin]);

  if (quickActions.length === 0) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[var(--admin-radius,16px)] p-4 sm:p-5 shadow-2xs transition-colors select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[var(--admin-primary,#4f46e5)] shadow-xs" />
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight font-heading">
              Quick Actions
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              Frequently used operations and enterprise workflows
            </p>
          </div>
        </div>

        {/* View All Shortcut */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1 text-xs font-bold text-[var(--admin-primary,#4f46e5)] hover:text-[var(--admin-primary-hover,#4338ca)] transition-colors cursor-pointer group px-2 py-1 rounded-lg hover:bg-[var(--admin-primary-light,rgba(79,70,229,0.08))]"
          aria-label="View all operations"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Dynamic Actions Grid (Fluid & Responsive) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          if (action.isPos) {
            // High-impact POS Operational Card
            return (
              <Link
                key={action.id}
                href={action.route}
                className="group relative flex flex-col justify-between p-3 rounded-[var(--admin-radius,12px)] border transition-all duration-200 shadow-xs cursor-pointer bg-gradient-to-br from-[var(--admin-primary,#4f46e5)] to-[var(--admin-secondary,#6366f1)] text-white border-transparent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner group-hover:rotate-6 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-400 text-slate-950 shadow-2xs font-mono">
                    {action.badgeText}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-black tracking-tight leading-snug">
                    {action.title}
                  </div>
                  <div className="text-[10px] text-white/80 font-normal leading-tight truncate">
                    {action.subtitle}
                  </div>
                </div>
              </Link>
            );
          }

          if (action.isPrimary) {
            // Primary Elevated Action Cards
            return (
              <Link
                key={action.id}
                href={action.route}
                className="group relative flex flex-col justify-between p-3 rounded-[var(--admin-radius,12px)] border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-[var(--admin-primary,#4f46e5)] transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[var(--admin-primary-light,rgba(79,70,229,0.08))] text-[var(--admin-primary,#4f46e5)] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-[var(--admin-primary,#4f46e5)] group-hover:text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  {action.badgeText && (
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono">
                      {action.badgeText}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[var(--admin-primary,#4f46e5)] transition-colors leading-snug">
                    {action.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-tight truncate">
                    {action.subtitle}
                  </div>
                </div>
              </Link>
            );
          }

          // Secondary Action Cards
          return (
            <Link
              key={action.id}
              href={action.route}
              className="group relative flex flex-col justify-between p-3 rounded-[var(--admin-radius,12px)] border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors group-hover:text-[var(--admin-primary,#4f46e5)] group-hover:bg-[var(--admin-primary-light,rgba(79,70,229,0.08))]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {action.badgeText && (
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded font-mono ${
                    action.badgeColor === 'rose'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {action.badgeText}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[var(--admin-primary,#4f46e5)] transition-colors leading-snug">
                  {action.title}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight truncate">
                  {action.subtitle}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* "View All" Grouped Operations Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-[var(--admin-primary-light,rgba(79,70,229,0.08))] text-[var(--admin-primary,#4f46e5)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                    All Authorized Operations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Quick navigation directory based on your administrative privileges
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Grouped Operations Directory */}
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
              {modalGroups.map((group) => (
                <div key={group.name} className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono px-1">
                    {group.name}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.route}
                          href={item.route}
                          onClick={() => setIsModalOpen(false)}
                          className="group flex items-start space-x-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[var(--admin-primary,#4f46e5)] bg-slate-50/40 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-2xs"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-[var(--admin-primary,#4f46e5)] group-hover:text-white group-hover:border-transparent transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[var(--admin-primary,#4f46e5)] transition-colors flex items-center justify-between">
                              <span className="truncate">{item.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight truncate mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/30">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
