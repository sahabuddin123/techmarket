import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  Search, ChevronRight, ChevronDown, Check, X, 
  SlidersHorizontal, Filter, AlertCircle, ShoppingBag, Plus
} from 'lucide-react';

export default function ComponentChoose({
  slot = {},
  products = { data: [] },
  availableBrands = [],
  priceBounds = { min: 0, max: 100000 },
  filters = {},
  sort = 'default',
  search = '',
  currentSelected = null,
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [selectedBrands, setSelectedBrands] = useState(
    filters.brands ? (Array.isArray(filters.brands) ? filters.brands : filters.brands.split(',')) : []
  );
  const [selectedAvailability, setSelectedAvailability] = useState(
    filters.availability ? (Array.isArray(filters.availability) ? filters.availability : filters.availability.split(',')) : []
  );
  const [priceRange, setPriceRange] = useState({
    min: filters.min_price !== undefined && filters.min_price !== null ? Number(filters.min_price) : priceBounds.min,
    max: filters.max_price !== undefined && filters.max_price !== null ? Number(filters.max_price) : priceBounds.max,
  });

  // Accordion toggle states
  const [openSections, setOpenSections] = useState({
    availability: true,
    price: true,
    brands: true,
    processor_model: true,
    cores: true,
    threads: true,
    socket: true,
    generation: true,
    clock_speed: true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync search input after debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm !== (search || '')) {
        applyQuery({ search: searchTerm || undefined });
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const applyQuery = (newParams = {}) => {
    const params = {
      search: searchTerm || undefined,
      sort: sort !== 'default' ? sort : undefined,
      brands: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
      availability: selectedAvailability.length > 0 ? selectedAvailability.join(',') : undefined,
      min_price: priceRange.min > priceBounds.min ? priceRange.min : undefined,
      max_price: priceRange.max < priceBounds.max ? priceRange.max : undefined,
      ...newParams,
    };

    // Remove undefined
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);

    router.get(
      `/pc-builder/build/component/choose/${slot.key}`,
      params,
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleBrandToggle = (brandSlug) => {
    const nextBrands = selectedBrands.includes(brandSlug)
      ? selectedBrands.filter(b => b !== brandSlug)
      : [...selectedBrands, brandSlug];
    
    setSelectedBrands(nextBrands);
    applyQuery({ brands: nextBrands.length > 0 ? nextBrands.join(',') : undefined });
  };

  const handleAvailabilityToggle = (status) => {
    const nextAvail = selectedAvailability.includes(status)
      ? selectedAvailability.filter(a => a !== status)
      : [...selectedAvailability, status];
    
    setSelectedAvailability(nextAvail);
    applyQuery({ availability: nextAvail.length > 0 ? nextAvail.join(',') : undefined });
  };

  const handleSortChange = (newSort) => {
    applyQuery({ sort: newSort });
  };

  const handlePriceCommit = () => {
    applyQuery({
      min_price: priceRange.min > priceBounds.min ? priceRange.min : undefined,
      max_price: priceRange.max < priceBounds.max ? priceRange.max : undefined,
    });
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedAvailability([]);
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });

    router.get(
      `/pc-builder/build/component/choose/${slot.key}`,
      {},
      { preserveState: false, preserveScroll: false }
    );
  };

  const handleAddProduct = (product) => {
    router.post(`/pc-builder/add/${slot.key}/${product.id}`);
  };

  const pageTitle = currentSelected
    ? `Component Change - ${slot.title}`
    : `Component Choose - ${slot.title}`;

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#1e293b] font-sans flex flex-col antialiased">
      <Head title={`${pageTitle} - TechMarket BD PC Builder`} />

      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1300px] w-full mx-auto px-4 py-5 space-y-4">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center space-x-2 text-[12px] text-[#64748b]">
          <Link href="/" className="hover:text-[#0084ff]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/pc-builder" className="hover:text-[#0084ff]">PC Builder</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1e293b] font-semibold">{pageTitle}</span>
        </nav>

        {/* 2-COLUMN LAYOUT: SIDEBAR FILTERS + PRODUCTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="lg:col-span-3 bg-white border border-[#d9dde3] rounded-[8px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <h2 className="text-[15px] font-bold text-[#1e293b]">Filters</h2>
              <button
                onClick={handleClearAllFilters}
                className="text-[12px] font-semibold text-[#274a7d] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => toggleSection('availability')}
                className="w-full flex items-center justify-between text-[13px] font-bold text-[#1e293b]"
              >
                <span>Availability</span>
                <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform ${openSections.availability ? '' : '-rotate-90'}`} />
              </button>

              {openSections.availability && (
                <div className="space-y-2 text-xs text-[#475569] pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedAvailability.includes('in_stock')}
                      onChange={() => handleAvailabilityToggle('in_stock')}
                      className="w-3.5 h-3.5 rounded text-[#274a7d] focus:ring-[#274a7d] border-[#cbd5e1]"
                    />
                    <span>In Stock</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedAvailability.includes('pre_order')}
                      onChange={() => handleAvailabilityToggle('pre_order')}
                      className="w-3.5 h-3.5 rounded text-[#274a7d] focus:ring-[#274a7d] border-[#cbd5e1]"
                    />
                    <span>Pre-Order</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedAvailability.includes('upcoming')}
                      onChange={() => handleAvailabilityToggle('upcoming')}
                      className="w-3.5 h-3.5 rounded text-[#274a7d] focus:ring-[#274a7d] border-[#cbd5e1]"
                    />
                    <span>Up Coming</span>
                  </label>
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-[13px] font-bold text-[#1e293b]"
              >
                <span>Price Range</span>
                <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform ${openSections.price ? '' : '-rotate-90'}`} />
              </button>

              {openSections.price && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex-1 relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">৳</span>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                        onBlur={handlePriceCommit}
                        className="w-full pl-6 pr-2 py-1.5 text-xs border border-[#cbd5e1] rounded-[4px] focus:ring-1 focus:ring-[#274a7d]"
                      />
                    </div>
                    <span className="text-[#94a3b8] text-xs">to</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">৳</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        onBlur={handlePriceCommit}
                        className="w-full pl-6 pr-2 py-1.5 text-xs border border-[#cbd5e1] rounded-[4px] focus:ring-1 focus:ring-[#274a7d]"
                      />
                    </div>
                  </div>

                  {/* Range slider */}
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={priceRange.max}
                    onChange={(e) => {
                      setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }));
                    }}
                    onMouseUp={handlePriceCommit}
                    onTouchEnd={handlePriceCommit}
                    className="w-full accent-[#274a7d] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Brands Filter */}
            {availableBrands.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => toggleSection('brands')}
                  className="w-full flex items-center justify-between text-[13px] font-bold text-[#1e293b]"
                >
                  <span>Brands</span>
                  <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform ${openSections.brands ? '' : '-rotate-90'}`} />
                </button>

                {openSections.brands && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs text-[#475569] pr-1">
                    {availableBrands.map((b) => (
                      <label key={b.id} className="flex items-center space-x-2 cursor-pointer select-none hover:text-[#1e293b]">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b.slug)}
                          onChange={() => handleBrandToggle(b.slug)}
                          className="w-3.5 h-3.5 rounded text-[#274a7d] focus:ring-[#274a7d] border-[#cbd5e1]"
                        />
                        <span>{b.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category Spec Placeholders (Accordions) */}
            {slot.key === 'processor' && (
              <>
                <CollapsibleFilterRow title="Processor Model" />
                <CollapsibleFilterRow title="Number of Thread" />
                <CollapsibleFilterRow title="Number of Cores" />
                <CollapsibleFilterRow title="Socket" />
                <CollapsibleFilterRow title="Generation/Series" />
                <CollapsibleFilterRow title="Clock Speed" />
              </>
            )}

            {slot.key === 'motherboard' && (
              <>
                <CollapsibleFilterRow title="Socket" />
                <CollapsibleFilterRow title="Chipset" />
                <CollapsibleFilterRow title="Form Factor" />
                <CollapsibleFilterRow title="Memory Slots" />
              </>
            )}

            {slot.key === 'ram' && (
              <>
                <CollapsibleFilterRow title="Capacity" />
                <CollapsibleFilterRow title="RAM Type (DDR4 / DDR5)" />
                <CollapsibleFilterRow title="Bus Speed" />
              </>
            )}

            {/* Clear All Bottom Button */}
            <div className="pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="w-full bg-[#274a7d] hover:bg-[#1d375d] text-white text-[12.5px] font-bold py-2 rounded-[4px] transition-colors shadow-xs"
              >
                Clear All
              </button>
            </div>
          </aside>

          {/* RIGHT MAIN AREA: SEARCH, SORT & PRODUCT GRID */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* SEARCH BAR & SORT BAR */}
            <div className="bg-white border border-[#d9dde3] rounded-[8px] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product name..."
                  className="w-full text-xs pl-3 pr-9 py-2 border border-[#cbd5e1] rounded-[4px] focus:ring-1 focus:ring-[#274a7d] focus:border-[#274a7d]"
                />
                <Search className="w-4 h-4 text-[#94a3b8] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2 shrink-0">
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-xs py-2 pl-3 pr-8 border border-[#cbd5e1] rounded-[4px] focus:ring-1 focus:ring-[#274a7d] bg-white text-[#334155] cursor-pointer"
                >
                  <option value="default">Default / Featured</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="name_a_z">Name: A–Z</option>
                  <option value="name_z_a">Name: Z–A</option>
                </select>
              </div>
            </div>

            {/* PRODUCT CARDS GRID */}
            {products.data && products.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.data.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-[#d9dde3] hover:border-[#274a7d] rounded-[8px] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between relative group"
                  >
                    {/* Top Savings Badge */}
                    {product.savings > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-[#059669] text-white text-[10px] font-bold px-2 py-0.5 rounded-[3px] shadow-xs z-10">
                        Save: ৳{product.savings.toLocaleString()}
                      </span>
                    )}

                    <div>
                      {/* Product Image */}
                      <div className="h-36 w-full flex items-center justify-center mb-3 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Product Title */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="text-[12.5px] font-bold text-[#1e293b] hover:text-[#0084ff] line-clamp-2 leading-tight mb-2 min-h-[34px]"
                        title={product.title}
                      >
                        {product.title}
                      </Link>

                      {/* Key Specs Bullets */}
                      {product.key_specs && product.key_specs.length > 0 && (
                        <ul className="text-[10.5px] text-[#64748b] space-y-1 mb-3 list-disc list-inside">
                          {product.key_specs.map((spec, idx) => (
                            <li key={idx} className="truncate">
                              {spec}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Price and Add Button */}
                    <div className="space-y-2.5 pt-2 border-t border-[#f1f5f9]">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-[14px] font-black text-[#d32f2f]">
                          ৳{product.price.toLocaleString()}
                        </span>
                        {product.regular_price > product.price && (
                          <span className="text-[11px] text-[#94a3b8] line-through">
                            ৳{product.regular_price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className="w-full bg-[#274a7d] hover:bg-[#1d375d] text-white text-[12px] font-bold py-2 rounded-[4px] flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add To PC Builder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#d9dde3] rounded-[8px] p-12 text-center text-[#8b95a5] space-y-3 shadow-xs">
                <ShoppingBag className="w-12 h-12 mx-auto text-[#cbd5e1]" />
                <p className="text-[14px] font-bold text-[#475569]">
                  No products found matching the selected filters.
                </p>
                <p className="text-xs text-[#8b95a5]">
                  Try clearing some filter criteria or adjusting your search term.
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-xs font-semibold px-4 py-2 rounded-[4px] inline-block shadow-xs transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* PAGINATION */}
            {products.links && products.links.length > 3 && (
              <div className="flex items-center justify-center space-x-1 pt-4">
                {products.links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url || '#'}
                    preserveState
                    preserveScroll
                    className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] border ${
                      link.active
                        ? 'bg-[#274a7d] text-white border-[#274a7d]'
                        : link.url
                        ? 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function CollapsibleFilterRow({ title }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5 pt-3 border-t border-[#f1f5f9]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-[13px] font-bold text-[#1e293b]"
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
    </div>
  );
}
