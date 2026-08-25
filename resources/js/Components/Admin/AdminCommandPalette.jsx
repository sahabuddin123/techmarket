import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { 
  Search, X, Package, ShoppingBag, Users, ShieldCheck, 
  Tag, ArrowRight, Loader2, Command, CornerDownLeft, Sparkles, Sliders
} from 'lucide-react';
import { ADMIN_NAV_ITEMS } from '../../Core/Navigation/adminNavigationRegistry';

export default function AdminCommandPalette({ isOpen, setIsOpen }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    pages: [],
    products: [],
    orders: [],
    customers: [],
    cctv_projects: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Keyboard shortcut listener for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ pages: [], products: [], orders: [], customers: [], cctv_projects: [] });
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      // Default: show top pages / quick navigation
      setResults({
        pages: ADMIN_NAV_ITEMS.slice(0, 6).map((item) => ({
          title: item.label,
          url: item.route,
          type: 'Navigation',
          description: item.description,
        })),
        products: [],
        orders: [],
        customers: [],
        cctv_projects: [],
      });
      return;
    }

    // Filter registry pages locally
    const filteredPages = ADMIN_NAV_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5).map((item) => ({
      title: item.label,
      url: item.route,
      type: 'Page',
      description: item.description,
    }));

    setLoading(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const response = await axios.get('/admin/search', {
          params: { query: query.trim() },
        });

        if (response.data && response.data.results) {
          setResults({
            pages: filteredPages,
            products: response.data.results.products || [],
            orders: response.data.results.orders || [],
            customers: response.data.results.customers || [],
            cctv_projects: response.data.results.cctv_projects || [],
          });
        } else {
          setResults({
            pages: filteredPages,
            products: [],
            orders: [],
            customers: [],
            cctv_projects: [],
          });
        }
      } catch (err) {
        // Fallback to local page filtering if backend search isn't ready or network error
        setResults({
          pages: filteredPages,
          products: [],
          orders: [],
          customers: [],
          cctv_projects: [],
        });
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Flatten items for keyboard arrow navigation
  const flatItems = React.useMemo(() => {
    const list = [];
    if (results.pages?.length) list.push(...results.pages.map(i => ({ ...i, category: 'Pages' })));
    if (results.products?.length) list.push(...results.products.map(i => ({ ...i, category: 'Products' })));
    if (results.orders?.length) list.push(...results.orders.map(i => ({ ...i, category: 'Orders' })));
    if (results.customers?.length) list.push(...results.customers.map(i => ({ ...i, category: 'Customers' })));
    if (results.cctv_projects?.length) list.push(...results.cctv_projects.map(i => ({ ...i, category: 'CCTV Projects' })));
    return list;
  }, [results]);

  const handleSelect = (item) => {
    if (!item) return;
    setIsOpen(false);
    if (item.url) {
      router.visit(item.url);
    }
  };

  const handleKeyDownInInput = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(flatItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div 
        onClick={() => setIsOpen(false)} 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150" 
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInInput}
            placeholder="Search orders, products, customers, CCTV projects, pages... (Ctrl+K)"
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
          />
          {loading && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {flatItems.length === 0 && !loading && (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">No results found</div>
              <div className="text-xs text-slate-400">Try searching for an order number, customer name, SKU, or navigation page.</div>
            </div>
          )}

          {/* Group: Pages */}
          {results.pages?.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Admin Navigation & Modules
              </div>
              {results.pages.map((item, idx) => {
                const globalIdx = flatItems.indexOf(item);
                const isSelected = globalIdx === selectedIndex;
                return (
                  <div
                    key={`page-${idx}`}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                        {item.description && <div className="text-[11px] text-slate-400 truncate">{item.description}</div>}
                      </div>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Group: Products */}
          {results.products?.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Catalog Products
              </div>
              {results.products.map((item, idx) => {
                const globalIdx = flatItems.indexOf(item);
                const isSelected = globalIdx === selectedIndex;
                return (
                  <div
                    key={`prod-${idx}`}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku || 'N/A'} • ৳ {Number(item.price || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Group: Orders */}
          {results.orders?.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Customer Orders
              </div>
              {results.orders.map((item, idx) => {
                const globalIdx = flatItems.indexOf(item);
                const isSelected = globalIdx === selectedIndex;
                return (
                  <div
                    key={`ord-${idx}`}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">#{item.order_number || item.id}</div>
                        <div className="text-[10px] text-slate-400">{item.customer_name || 'Customer'} • ৳ {Number(item.total_amount || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.status || 'Active'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Group: CCTV Projects */}
          {results.cctv_projects?.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                CCTV Projects
              </div>
              {results.cctv_projects.map((item, idx) => {
                const globalIdx = flatItems.indexOf(item);
                const isSelected = globalIdx === selectedIndex;
                return (
                  <div
                    key={`cctv-${idx}`}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.project_name || item.code}</div>
                        <div className="text-[10px] text-slate-400">{item.client_name || 'Client Project'}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center space-x-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">ESC</kbd> to close</span>
          </div>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold font-sans">Enterprise Telemetry</span>
        </div>
      </div>
    </div>
  );
}
