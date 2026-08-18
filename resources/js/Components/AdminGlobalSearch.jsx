import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { 
  Search, X, Loader2, ShoppingBag, Package, Users, 
  FolderTree, Tag, Ticket, FileText, ArrowRight, CornerDownLeft 
} from 'lucide-react';

export default function AdminGlobalSearch({ isOpen: controlledIsOpen, setIsOpen: controlledSetIsOpen }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const inputRef = useRef(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({});
      setTotalCount(0);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({});
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      axios
        .get('/admin/search', { params: { q: query.trim() } })
        .then((res) => {
          setResults(res.data.results || {});
          setTotalCount(res.data.total_results || 0);
        })
        .catch(() => {
          setResults({});
          setTotalCount(0);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = (url) => {
    setIsOpen(false);
    router.visit(url);
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'orders':
        return <ShoppingBag className="w-4 h-4 text-indigo-400" />;
      case 'products':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'customers':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'categories':
        return <FolderTree className="w-4 h-4 text-blue-400" />;
      case 'brands':
        return <Tag className="w-4 h-4 text-purple-400" />;
      case 'coupons':
        return <Ticket className="w-4 h-4 text-rose-400" />;
      case 'content':
        return <FileText className="w-4 h-4 text-teal-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      {/* Header Search Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 px-3.5 py-2 rounded-xl text-xs transition-all w-full max-w-xs shadow-inner group"
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
        <span className="flex-1 text-left font-medium">Quick search anything...</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Global Search Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <Search className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders, products, customers, categories, brands, coupons..."
                className="w-full bg-transparent border-0 text-white placeholder-slate-500 text-sm focus:ring-0 focus:outline-none p-0"
              />
              {loading && <Loader2 className="w-4 h-4 text-amber-500 animate-spin mr-2 shrink-0" />}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-slate-500 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-2 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
              >
                ESC
              </button>
            </div>

            {/* Search Results Content */}
            <div className="overflow-y-auto p-4 space-y-5 custom-scrollbar flex-1">
              {query.trim().length >= 2 && totalCount === 0 && !loading && (
                <div className="text-center py-10 space-y-2 text-slate-500">
                  <Search className="w-8 h-8 mx-auto text-slate-600 stroke-1" />
                  <div className="text-sm font-bold text-slate-400">No matching records found</div>
                  <div className="text-xs">Try searching by product SKU, customer phone, or order ID.</div>
                </div>
              )}

              {query.trim().length < 2 && (
                <div className="py-6 px-2 text-center text-slate-500 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Searchable Entities</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-slate-300">
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Orders & Phone</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-slate-300">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span>SKU & Products</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Customers</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-slate-300">
                      <Ticket className="w-3.5 h-3.5 text-rose-400" />
                      <span>Coupons</span>
                    </div>
                  </div>
                </div>
              )}

              {Object.entries(results || {}).map(([group, items]) => {
                if (!items || items.length === 0) return null;
                return (
                  <div key={group} className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-wider text-slate-400 px-2">
                      {getEntityIcon(group)}
                      <span>{group} ({items.length})</span>
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button
                          key={item.id + (item.url || '')}
                          onClick={() => handleSelect(item.url)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 flex items-center justify-between group transition-all"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="text-xs font-bold text-white group-hover:text-amber-400 truncate flex items-center space-x-2">
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px]">↑↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CornerDownLeft className="w-3 h-3 text-slate-400" />
                  <span>Select</span>
                </span>
              </div>
              <div>TechMarket BD Global Search</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
