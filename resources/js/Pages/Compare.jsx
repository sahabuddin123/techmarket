import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  ArrowRightLeft, ShoppingCart, Trash2, ChevronRight, Check, 
  AlertTriangle, X, Plus, Search, ChevronDown, ChevronUp,
  Sparkles, ShieldCheck
} from 'lucide-react';

export default function Compare({ products = [], specMatrix = [], maxCompare = 4, compareCount = 0 }) {
  const { flash = {} } = usePage().props;
  const [cartOpen, setCartOpen] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [addedProductId, setAddedProductId] = useState(null);

  // Live Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Collapsed spec groups state
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/compare/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error searching products for comparison', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddProduct = (productId) => {
    router.post('/compare/add', { product_id: productId }, {
      preserveScroll: true,
      onSuccess: () => {
        setSearchQuery('');
        setShowDropdown(false);
      }
    });
  };

  const handleAddToCart = (product) => {
    if (!product || product.stock <= 0) return;

    router.post('/cart/add', { product_id: product.id, quantity: 1 }, {
      preserveScroll: true,
      onSuccess: () => {
        setAddedProductId(product.id);
        setTimeout(() => setAddedProductId(null), 2000);
      }
    });
  };

  const handleRemove = (productId) => {
    router.post(`/compare/remove/${productId}`, {}, {
      preserveScroll: true,
    });
  };

  const handleClearAll = () => {
    if (products.length === 0) return;
    if (confirm('Are you sure you want to clear all products from the comparison list?')) {
      router.post('/compare/clear');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#1e293b] font-sans flex flex-col antialiased selection:bg-[#0084ff] selection:text-white">
      <Head title="Product Specification Comparison - TechMarket BD" />

      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Main Container */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 py-5 space-y-4">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center space-x-2 text-[12px] text-[#64748b]">
          <Link href="/" className="hover:text-[#0084ff] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#94a3b8]" />
          <Link href="/catalog" className="hover:text-[#0084ff] transition-colors">Catalog</Link>
          <ChevronRight className="w-3 h-3 text-[#94a3b8]" />
          <span className="text-[#1e293b] font-semibold">Product Comparison</span>
        </nav>

        {/* Flash Messages */}
        {flash?.success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-[6px] flex items-center space-x-2 shadow-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{flash.success}</span>
          </div>
        )}
        {flash?.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold px-4 py-2.5 rounded-[6px] flex items-center space-x-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{flash.error}</span>
          </div>
        )}

        {/* TOP TOOLBAR: Header & Search & Add */}
        <div className="bg-white border border-[#d9dde3] rounded-[6px] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-[17px] sm:text-[19px] font-black text-[#1e293b] tracking-tight flex items-center space-x-2">
                <span>Compare Products</span>
                <span className="text-xs bg-[#e2e8f0] text-[#334155] font-bold px-2 py-0.5 rounded-full">
                  {products.length} of {maxCompare}
                </span>
              </h1>
              <p className="text-[11.5px] text-[#64748b] mt-0.5">
                Compare detailed technical specifications, pricing, and hardware features side-by-side.
              </p>
            </div>

            {/* Clear All action */}
            {products.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[#dc2626] hover:text-[#b91c1c] text-xs font-bold flex items-center space-x-1 transition-colors self-start sm:self-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Search & Add Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div ref={searchRef} className="relative flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                  placeholder="Search & Add Product to Compare (e.g. Ryzen 9, Vivobook, RTX 4070)..."
                  disabled={products.length >= maxCompare}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded px-3.5 pl-9 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0084ff] focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isSearching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                    Searching...
                  </span>
                )}
              </div>

              {/* Live Search Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#cbd5e1] rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      {isSearching ? 'Searching catalog...' : 'No matching products found.'}
                    </div>
                  ) : (
                    searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleAddProduct(item.id)}
                        className="p-2.5 flex items-center justify-between hover:bg-blue-50/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 object-contain rounded border border-slate-200 bg-white p-0.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                              <span>{item.brand || 'Hardware'}</span>
                              <span>•</span>
                              <span className="font-bold text-[#d32f2f]">৳{Number(item.price).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="bg-[#0084ff] hover:bg-[#0070d6] text-white text-[11px] font-bold px-3 py-1.5 rounded shrink-0 transition-colors shadow-2xs"
                        >
                          + Compare
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Differences Switch */}
            {products.length > 1 && (
              <label className="inline-flex items-center space-x-2 cursor-pointer select-none text-xs text-slate-700 font-medium shrink-0">
                <input
                  type="checkbox"
                  checked={highlightDifferences}
                  onChange={(e) => setHighlightDifferences(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0084ff] focus:ring-[#0084ff] border-slate-300"
                />
                <span>Highlight Differences</span>
              </label>
            )}
          </div>
        </div>

        {/* COMPARISON CONTENT / EMPTY STATE */}
        {products.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white border border-[#d9dde3] rounded-[6px] p-12 text-center shadow-xs space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center mx-auto text-[#64748b]">
              <ArrowRightLeft className="w-8 h-8 text-[#0084ff]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-[17px] font-bold text-[#1e293b]">No Products in Comparison</h2>
              <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
                You haven't added any products to compare yet. Use the search bar above or browse through our catalog and click the compare icon to compare up to 4 items side-by-side.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center space-x-2 bg-[#0084ff] hover:bg-[#0070d6] text-white text-xs font-bold px-6 py-2.5 rounded shadow-xs transition-colors"
              >
                <span>Browse Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* SIDE BY SIDE COMPARISON TABLE */
          <div className="bg-white border border-[#d9dde3] rounded-[6px] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                
                {/* 1. PRODUCT HEADER CARDS ROW */}
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] divide-x divide-[#e2e8f0]">
                    <th className="p-4 w-[180px] sm:w-[220px] font-bold text-[#475569] uppercase tracking-wider text-[11px] align-top bg-[#f1f5f9]/70">
                      <div className="space-y-2 sticky top-0">
                        <span className="block text-[13px] font-extrabold text-[#1e293b]">Product Overview</span>
                        <p className="text-[10px] text-[#64748b] font-normal normal-case leading-relaxed">
                          Side-by-side spec comparison table. Scroll horizontally if comparing multiple models.
                        </p>
                      </div>
                    </th>

                    {products.map((product) => {
                      const isAdded = addedProductId === product.id;

                      return (
                        <th key={product.id} className="p-4 align-top w-[260px] sm:w-[280px] min-w-[240px]">
                          <div className="space-y-3 flex flex-col justify-between h-full text-left">
                            
                            {/* Top row: Remove Button */}
                            <div className="flex items-center justify-between">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                              </span>

                              <button
                                onClick={() => handleRemove(product.id)}
                                className="w-5 h-5 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Remove from comparison"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Product Image */}
                            <div className="w-full h-36 bg-white border border-[#e2e8f0] rounded p-2 flex items-center justify-center overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                              />
                            </div>

                            {/* Title & Link */}
                            <div className="space-y-1">
                              <Link
                                href={`/product/${product.slug}`}
                                className="text-[13px] font-bold text-[#0084ff] hover:underline line-clamp-2 leading-snug block"
                                title={product.title}
                              >
                                {product.title}
                              </Link>
                              
                              {/* Price Row */}
                              <div className="flex items-baseline space-x-2 pt-0.5">
                                <span className="text-[15px] font-black text-[#d32f2f]">
                                  ৳{Number(product.price).toLocaleString()}
                                </span>
                                {product.regular_price > product.price && (
                                  <span className="text-[11.5px] text-[#94a3b8] line-through font-normal">
                                    ৳{Number(product.regular_price).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Button: Add to Cart */}
                            <div className="pt-2">
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={!product.in_stock}
                                className={`w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer ${
                                  !product.in_stock
                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    : isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#0084ff] hover:bg-[#0070d6] text-white'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added to Cart!</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                                  </>
                                )}
                              </button>
                            </div>

                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* 2. SPECIFICATION MATRIX BODY */}
                <tbody className="divide-y divide-[#edf0f5]">
                  {specMatrix.map((group, groupIdx) => {
                    const isCollapsed = collapsedGroups[group.group_name];

                    return (
                      <React.Fragment key={groupIdx}>
                        {/* Blue Category Header Bar */}
                        <tr 
                          onClick={() => toggleGroup(group.group_name)}
                          className="bg-[#0084ff] text-white cursor-pointer select-none hover:bg-[#0070d6] transition-colors"
                        >
                          <td 
                            colSpan={products.length + 1} 
                            className="px-4 py-2 text-xs font-bold tracking-wide"
                          >
                            <div className="flex items-center justify-between">
                              <span className="uppercase">{group.group_name}</span>
                              {isCollapsed ? (
                                <ChevronDown className="w-4 h-4 text-white/80" />
                              ) : (
                                <ChevronUp className="w-4 h-4 text-white/80" />
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Attribute Rows */}
                        {!isCollapsed && group.rows.map((row, rowIdx) => {
                          const isDiff = highlightDifferences && row.has_difference && products.length > 1;

                          return (
                            <tr 
                              key={rowIdx}
                              className={`divide-x divide-[#edf0f5] transition-colors ${
                                isDiff ? 'bg-amber-50/70 hover:bg-amber-100/70' : 'hover:bg-[#fbfcfd]'
                              }`}
                            >
                              {/* Attribute Label */}
                              <td className="p-3 font-bold text-[#334155] bg-[#f8fafc] w-[180px] sm:w-[220px] align-top text-[11.5px]">
                                <div className="flex items-center space-x-1.5">
                                  <span>{row.label}</span>
                                  {isDiff && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Values differ between products" />
                                  )}
                                </div>
                              </td>

                              {/* Product Values */}
                              {row.values.map((val, valIdx) => (
                                <td 
                                  key={valIdx} 
                                  className={`p-3 text-[#1e293b] leading-relaxed align-top text-[11.5px] ${
                                    isDiff ? 'font-semibold text-[#0084ff]' : ''
                                  }`}
                                >
                                  {val || '—'}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>

                {/* 3. BOTTOM ACTIONS ROW */}
                <tfoot>
                  <tr className="bg-[#f8fafc] border-t border-[#e2e8f0] divide-x divide-[#e2e8f0]">
                    <td className="p-4 bg-[#f1f5f9]/70 font-bold text-xs text-slate-700">
                      Actions
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-4">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.in_stock}
                          className="w-full py-2 px-3 rounded text-xs font-bold bg-[#0084ff] hover:bg-[#0070d6] text-white flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tfoot>

              </table>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
