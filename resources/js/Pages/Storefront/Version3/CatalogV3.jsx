import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import NavbarV3 from './Components/NavbarV3';
import FooterV3 from './Components/FooterV3';
import CartDrawer from '@/Components/CartDrawer';
import ProductCardV3 from './Components/ProductCardV3';
import MobileBottomNavV3 from './Components/MobileBottomNavV3';
import { 
  ChevronRight, ChevronDown, Search, SlidersHorizontal, 
  LayoutGrid, Grid3X3, Grid2X2, X, Filter 
} from 'lucide-react';

export default function CatalogV3({
  products = { data: [], total: 0, links: [], current_page: 1, last_page: 1 },
  categories = [],
  brands = [],
  currentCategory = null,
  currentBrand = null,
  filters = {},
  priceRange = { min: 0, max: 200000 },
  settings = {},
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Price filter state
  const minLimit = Number(priceRange?.min || 0);
  const maxLimit = Number(priceRange?.max || 50000);
  const [minPrice, setMinPrice] = useState(Number(filters.min_price || minLimit));
  const [maxPrice, setMaxPrice] = useState(Number(filters.max_price || maxLimit));

  // Brand search state
  const [brandSearch, setBrandSearch] = useState('');
  
  // Grid columns state (3 or 4)
  const [gridCols, setGridCols] = useState(4);
  const [perPage, setPerPage] = useState(filters.per_page || 12);
  const [sortBy, setSortBy] = useState(filters.sort || 'default');

  // Category accordion expansion
  const [expandedCats, setExpandedCats] = useState({});

  const toggleCategoryExpand = (catId) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const applyFilters = (newParams = {}) => {
    const query = {
      ...filters,
      min_price: minPrice,
      max_price: maxPrice,
      sort: sortBy !== 'default' ? sortBy : undefined,
      per_page: perPage,
      ...newParams,
    };

    // Remove undefined or null keys
    Object.keys(query).forEach(key => {
      if (query[key] === undefined || query[key] === null || query[key] === '') {
        delete query[key];
      }
    });

    router.get('/catalog', query, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handlePriceFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters({ min_price: minPrice, max_price: maxPrice });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    applyFilters({ sort: val !== 'default' ? val : undefined });
  };

  const handlePerPageChange = (count) => {
    setPerPage(count);
    applyFilters({ per_page: count });
  };

  const handleCategorySelect = (slug) => {
    applyFilters({ category: slug, page: 1 });
  };

  const handleBrandSelect = (slug) => {
    const newBrand = filters.brand === slug ? undefined : slug;
    applyFilters({ brand: newBrand, page: 1 });
  };

  // Filtered brands for brand search
  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const productList = products.data || (Array.isArray(products) ? products : []);

  return (
    <div className="storefront-v3 min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col selection:bg-[#0153FD] selection:text-white">
      <Head title={`${currentCategory ? currentCategory.name : 'Shop'} - ${settings.site_name || 'TechMarket BD'}`} />

      {/* 1. Navbar */}
      <NavbarV3 onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* 2. Breadcrumbs matching Screenshot 2: Home / Shop */}
      <div className="w-full bg-white border-b border-slate-100 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#0153FD] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{currentCategory ? currentCategory.name : 'Shop'}</span>
          {currentBrand && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#0153FD] font-semibold">{currentBrand.name}</span>
            </>
          )}
        </div>
      </div>

      {/* 3. Main Catalog Layout */}
      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT FILTER SIDEBAR (Screenshot 2) */}
          {/* ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Filter by Price Container */}
            <div className="bg-white border border-[#8BB1FF]/70 rounded-[20px] p-5 shadow-[0_0_15px_rgba(202,224,255,0.6)] space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Filter By Price
              </h3>

              <form onSubmit={handlePriceFilterSubmit} className="space-y-4">
                {/* Visual Dual-Range Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#0153FD] h-1.5 bg-blue-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold pt-1">
                  <div>
                    Price: <span className="font-bold text-slate-900">{minPrice}৳</span> — <span className="font-bold text-[#0153FD]">{maxPrice}৳</span>
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#0153FD] hover:text-white text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Filter
                  </button>
                </div>
              </form>
            </div>

            {/* Product Categories Sidebar */}
            <div className="bg-white border border-[#8BB1FF]/70 rounded-[20px] p-5 shadow-[0_0_15px_rgba(202,224,255,0.6)] space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Product Categories
              </h3>

              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 text-xs">
                {categories.map((cat) => {
                  const isSelected = filters.category === cat.slug;
                  const hasChildren = cat.children && cat.children.length > 0;
                  const isExpanded = expandedCats[cat.id];

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between group py-1">
                        <button
                          type="button"
                          onClick={() => handleCategorySelect(cat.slug)}
                          className={`text-left transition-colors truncate flex-1 ${
                            isSelected
                              ? 'text-[#0153FD] font-bold'
                              : 'text-slate-600 hover:text-[#0153FD]'
                          }`}
                        >
                          {cat.name}
                        </button>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpand(cat.id)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Sub-categories */}
                      {hasChildren && isExpanded && (
                        <div className="pl-3 space-y-1 border-l-2 border-blue-100 ml-1">
                          {cat.children.map((child) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleCategorySelect(child.slug)}
                              className={`block text-left text-[11px] py-0.5 truncate transition-colors ${
                                filters.category === child.slug
                                  ? 'text-[#0153FD] font-bold'
                                  : 'text-slate-500 hover:text-[#0153FD]'
                              }`}
                            >
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="bg-white border border-[#8BB1FF]/70 rounded-[20px] p-5 shadow-[0_0_15px_rgba(202,224,255,0.6)] space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Brand
              </h3>

              {/* Find a brand input */}
              <div className="relative">
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Find a Brand"
                  className="w-full bg-[#f8fafc] text-xs text-slate-800 placeholder-slate-400 pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:border-[#0153FD] focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              {/* Brand Tag List */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-48 overflow-y-auto">
                {filteredBrands.map((brand) => {
                  const isSelected = filters.brand === brand.slug;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => handleBrandSelect(brand.slug)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'bg-[#0153FD] text-white font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0153FD]'
                      }`}
                    >
                      {brand.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* ========================================================================= */}
          {/* RIGHT PRODUCT GRID AREA */}
          {/* ========================================================================= */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Top Shop Bar matching Screenshot 2 */}
            <div className="bg-white border border-[#8BB1FF]/70 rounded-[20px] p-4 sm:p-5 shadow-[0_0_15px_rgba(202,224,255,0.6)] flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Title & Mobile Filter Trigger */}
              <div className="flex items-center justify-between w-full sm:w-auto">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Shop
                </h1>

                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 rounded-lg bg-blue-50 text-[#0153FD] text-xs font-bold flex items-center space-x-1.5 border border-blue-200"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Right Controls: Show count + Grid View + Sorting */}
              <div className="flex items-center space-x-4 text-xs font-medium text-slate-600">
                {/* Show Items Selector */}
                <div className="hidden md:flex items-center space-x-1.5">
                  <span className="text-slate-400">Show :</span>
                  {[9, 12, 18, 24].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handlePerPageChange(count)}
                      className={`hover:text-[#0153FD] cursor-pointer transition-colors ${
                        perPage === count ? 'font-bold text-[#0153FD]' : 'text-slate-600'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>

                {/* Grid Layout Toggles */}
                <div className="hidden sm:flex items-center space-x-1 border-l border-slate-200 pl-3">
                  <button
                    type="button"
                    onClick={() => setGridCols(3)}
                    className={`p-1.5 rounded-md transition-colors ${
                      gridCols === 3 ? 'bg-blue-50 text-[#0153FD]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="3 Columns"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGridCols(4)}
                    className={`p-1.5 rounded-md transition-colors ${
                      gridCols === 4 ? 'bg-blue-50 text-[#0153FD]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="4 Columns"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                {/* Sorting Dropdown */}
                <div className="border-l border-slate-200 pl-3">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="bg-[#f8fafc] text-xs text-slate-800 font-semibold py-1.5 px-3 rounded-lg border border-slate-200 focus:border-[#0153FD] focus:outline-none cursor-pointer"
                  >
                    <option value="default">Default sorting</option>
                    <option value="latest">Sort by latest</option>
                    <option value="price_low">Price: low to high</option>
                    <option value="price_high">Price: high to low</option>
                    <option value="popularity">Sort by popularity</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Badges */}
            {(filters.category || filters.brand || filters.search || filters.min_price || filters.max_price) && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Active filters:</span>
                {filters.category && (
                  <span className="bg-blue-50 text-[#0153FD] px-2.5 py-1 rounded-full border border-blue-200 font-semibold flex items-center space-x-1">
                    <span>Category: {filters.category}</span>
                    <button onClick={() => applyFilters({ category: undefined })}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.brand && (
                  <span className="bg-blue-50 text-[#0153FD] px-2.5 py-1 rounded-full border border-blue-200 font-semibold flex items-center space-x-1">
                    <span>Brand: {filters.brand}</span>
                    <button onClick={() => applyFilters({ brand: undefined })}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.search && (
                  <span className="bg-blue-50 text-[#0153FD] px-2.5 py-1 rounded-full border border-blue-200 font-semibold flex items-center space-x-1">
                    <span>Search: "{filters.search}"</span>
                    <button onClick={() => applyFilters({ search: undefined })}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={() => router.get('/catalog')}
                  className="text-rose-500 hover:underline font-bold text-[11px] ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid */}
            {productList.length === 0 ? (
              <div className="bg-white border border-[#8BB1FF]/70 rounded-[20px] p-12 text-center shadow-[0_0_15px_rgba(202,224,255,0.6)] space-y-3">
                <div className="text-base font-bold text-slate-800">No products found</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We couldn't find any products matching your selected filter criteria. Try adjusting your filters.
                </p>
                <button
                  onClick={() => router.get('/catalog')}
                  className="px-5 py-2 bg-[#0153FD] text-white rounded-full text-xs font-bold hover:bg-[#0042cf] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 sm:gap-4`}>
                {productList.map((product) => (
                  <ProductCardV3 key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {products.links && products.links.length > 3 && (
              <div className="flex justify-center items-center space-x-1 pt-6">
                {products.links.map((link, idx) => {
                  if (!link.url && !link.label) return null;
                  return (
                    <Link
                      key={idx}
                      href={link.url || '#'}
                      preserveScroll
                      preserveState
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        link.active
                          ? 'bg-[#0153FD] text-white shadow-xs'
                          : link.url
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <FooterV3 onOpenCart={() => setCartOpen(true)} />

      {/* 5. Mobile Bottom Nav */}
      <MobileBottomNavV3 onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
