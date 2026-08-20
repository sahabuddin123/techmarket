import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import NavbarV2 from './Components/NavbarV2';
import FooterV2 from './Components/FooterV2';
import CartDrawer from '@/Components/CartDrawer';
import QuickViewModal from '@/Components/QuickViewModal';
import { trackAddToCart } from '@/lib/tracking';
import {
  Search, RotateCcw, ChevronRight, ChevronDown, ChevronUp, ShoppingCart,
  Heart, Check, Tag, HelpCircle, Table as TableIcon,
  ShieldCheck, Eye, Filter, ArrowRightLeft, FolderTree, X, Plus, Minus,
  SlidersHorizontal, Package, Sparkles
} from 'lucide-react';

export default function CatalogV2(props) {
  // Normalize incoming props with complete null-safety
  const category = props?.category || null;
  const breadcrumbs = Array.isArray(props?.breadcrumbs) && props.breadcrumbs.length > 0
    ? props.breadcrumbs
    : [{ label: 'Home', url: '/' }, { label: 'Shop', url: '/shop' }];
  const productsData = props?.products || { data: [], links: [] };
  const products = Array.isArray(productsData.data) ? productsData.data : [];
  const categories = Array.isArray(props?.categories) ? props.categories : [];
  const subcategories = Array.isArray(props?.subcategories) ? props.subcategories : [];
  const brands = Array.isArray(props?.brands) ? props.brands : [];
  const availabilityCounts = props?.availabilityCounts || { in_stock: 0, out_of_stock: 0, pre_order: 0, upcoming: 0, all: 0 };
  const filterGroups = Array.isArray(props?.filterGroups) ? props.filterGroups : [];
  const priceBounds = props?.priceBounds || { min: 0, max: 200000 };
  const contentSections = Array.isArray(props?.contentSections) ? props.contentSections : [];
  const priceTables = Array.isArray(props?.priceTables) ? props.priceTables : [];
  const faqs = Array.isArray(props?.faqs) ? props.faqs : [];
  const incomingFilters = props?.filters || {};

  // Component UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [addedProductId, setAddedProductId] = useState(null);

  // Search, Price, Brand, Availability & Spec Filter State
  const [search, setSearch] = useState(incomingFilters.search || '');
  const [minPrice, setMinPrice] = useState(incomingFilters.min_price || '');
  const [maxPrice, setMaxPrice] = useState(incomingFilters.max_price || '');
  const [selectedBrands, setSelectedBrands] = useState(
    Array.isArray(incomingFilters.brand)
      ? incomingFilters.brand
      : (incomingFilters.brand ? incomingFilters.brand.split(',') : [])
  );
  const [selectedAvailability, setSelectedAvailability] = useState(
    Array.isArray(incomingFilters.availability)
      ? incomingFilters.availability
      : (incomingFilters.availability ? incomingFilters.availability.split(',') : [])
  );
  const [selectedSpecs, setSelectedSpecs] = useState(
    incomingFilters.specs && typeof incomingFilters.specs === 'object' ? incomingFilters.specs : {}
  );
  const [sort, setSort] = useState(incomingFilters.sort || 'default');
  const [perPage, setPerPage] = useState(incomingFilters.per_page || 16);

  // Collapsible sidebar accordion sections
  const [openSections, setOpenSections] = useState({
    categories: true,
    availability: true,
    price: true,
    brands: true,
    ...filterGroups.reduce((acc, g) => ({ ...acc, [g.id]: true }), {})
  });

  // Search inside brand filter
  const [brandSearch, setBrandSearch] = useState('');

  // FAQ Accordion open index (default first open)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Synchronize state when incoming props update
  useEffect(() => {
    setSearch(incomingFilters.search || '');
    setMinPrice(incomingFilters.min_price || '');
    setMaxPrice(incomingFilters.max_price || '');
    setSelectedBrands(
      Array.isArray(incomingFilters.brand)
        ? incomingFilters.brand
        : (incomingFilters.brand ? incomingFilters.brand.split(',') : [])
    );
    setSelectedAvailability(
      Array.isArray(incomingFilters.availability)
        ? incomingFilters.availability
        : (incomingFilters.availability ? incomingFilters.availability.split(',') : [])
    );
    setSelectedSpecs(incomingFilters.specs && typeof incomingFilters.specs === 'object' ? incomingFilters.specs : {});
    setSort(incomingFilters.sort || 'default');
    setPerPage(incomingFilters.per_page || 16);
  }, [incomingFilters]);

  // Toggle filter section collapse
  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Base URL for queries
  const baseUrl = category ? `/category/${category.slug}` : '/shop';

  // Apply updated parameters
  const applyFilters = (overrides = {}) => {
    const params = {
      search: overrides.search !== undefined ? overrides.search : search,
      brand: overrides.brand !== undefined ? overrides.brand : selectedBrands,
      availability: overrides.availability !== undefined ? overrides.availability : selectedAvailability,
      min_price: overrides.min_price !== undefined ? overrides.min_price : minPrice,
      max_price: overrides.max_price !== undefined ? overrides.max_price : maxPrice,
      sort: overrides.sort !== undefined ? overrides.sort : sort,
      per_page: overrides.per_page !== undefined ? overrides.per_page : perPage,
      specs: overrides.specs !== undefined ? overrides.specs : selectedSpecs,
      page: overrides.page !== undefined ? overrides.page : 1,
    };

    // Clean empty values
    if (!params.search) delete params.search;
    if (!params.brand || (Array.isArray(params.brand) && params.brand.length === 0)) delete params.brand;
    if (!params.availability || (Array.isArray(params.availability) && params.availability.length === 0)) delete params.availability;
    if (!params.min_price) delete params.min_price;
    if (!params.max_price) delete params.max_price;
    if (!params.sort || params.sort === 'default') delete params.sort;
    if (params.per_page === 16) delete params.per_page;
    if (!params.specs || Object.keys(params.specs).length === 0) delete params.specs;
    if (params.page === 1) delete params.page;

    router.get(baseUrl, params, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Checkbox toggle helpers
  const toggleBrand = (brandSlug) => {
    const next = selectedBrands.includes(brandSlug)
      ? selectedBrands.filter(b => b !== brandSlug)
      : [...selectedBrands, brandSlug];
    setSelectedBrands(next);
    applyFilters({ brand: next, page: 1 });
  };

  const toggleAvailability = (val) => {
    const next = selectedAvailability.includes(val)
      ? selectedAvailability.filter(a => a !== val)
      : [...selectedAvailability, val];
    setSelectedAvailability(next);
    applyFilters({ availability: next, page: 1 });
  };

  const toggleSpec = (groupId, optionVal) => {
    const current = selectedSpecs[groupId]
      ? (Array.isArray(selectedSpecs[groupId]) ? selectedSpecs[groupId] : selectedSpecs[groupId].split(','))
      : [];
    const next = current.includes(optionVal)
      ? current.filter(v => v !== optionVal)
      : [...current, optionVal];

    const updatedSpecs = { ...selectedSpecs };
    if (next.length > 0) {
      updatedSpecs[groupId] = next;
    } else {
      delete updatedSpecs[groupId];
    }

    setSelectedSpecs(updatedSpecs);
    applyFilters({ specs: updatedSpecs, page: 1 });
  };

  const handlePriceApply = (e) => {
    if (e) e.preventDefault();
    applyFilters({ min_price: minPrice, max_price: maxPrice, page: 1 });
  };

  const handleResetAll = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrands([]);
    setSelectedAvailability([]);
    setSelectedSpecs({});
    setSort('default');
    router.get(baseUrl, {}, { preserveState: true, preserveScroll: true });
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    trackAddToCart(product, 1);

    router.post('/cart/add', { product_id: product.id, quantity: 1 }, {
      preserveScroll: true,
      onSuccess: () => {
        setAddedProductId(product.id);
        setTimeout(() => setAddedProductId(null), 1800);
      }
    });
  };

  const handleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    router.post('/wishlist/toggle', { product_id: product.id }, { preserveScroll: true });
  };

  const handleCompare = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    router.post('/compare/add', { product_id: product.id }, { preserveScroll: true });
  };

  // Filtered Brand list based on search
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    return brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brands, brandSearch]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (minPrice || maxPrice) count++;
    count += selectedBrands.length;
    count += selectedAvailability.length;
    Object.values(selectedSpecs).forEach(v => {
      if (Array.isArray(v)) count += v.length;
      else if (v) count++;
    });
    return count;
  }, [search, minPrice, maxPrice, selectedBrands, selectedAvailability, selectedSpecs]);

  // Page title and subtitle
  const isFlashSale = Boolean(props?.isFlashSale);
  const flashSaleTitle = props?.flashSaleTitle || 'Flash Sale Deals in Bangladesh';
  const displayTitle = isFlashSale 
    ? flashSaleTitle 
    : (category?.page_title || (category?.name ? `${category.name} Price in Bangladesh` : 'All Products Price in Bangladesh'));
  const displaySubtitle = isFlashSale
    ? 'Limited-time mega flash sale and exclusive discount deals on genuine tech products in Bangladesh. Grab authentic gear with official manufacturer warranty at unbeatable promotional prices!'
    : (category?.subtitle || category?.seo_intro || (category?.name
        ? `Explore latest ${category.name} models, genuine warranty, specifications, and special discounts in Bangladesh at TechMarket BD.`
        : `Browse latest computer hardware, laptops, desktops, and components in Bangladesh. Explore competitive prices starting from ৳${priceBounds.min.toLocaleString()} BDT to ৳${priceBounds.max.toLocaleString()} BDT with official manufacturer warranty at TechMarket BD.`));
  const totalCount = productsData.total ?? products.length;

  return (
    <div className="storefront-v2 min-h-screen bg-[#f3f6fa] text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Head>
        <title>{category?.seo_title || `${displayTitle} | TechMarket BD`}</title>
        <meta
          name="description"
          content={category?.meta_description || `Explore latest ${displayTitle} prices, official warranty, specifications, and special discounts at TechMarket BD.`}
        />
        {category?.meta_keywords && <meta name="keywords" content={category.meta_keywords} />}
      </Head>

      {/* 1. Header (Storefront Version 2 Header) */}
      <NavbarV2 onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MAIN CONTAINER (Matching HomeV2 max-w-[1360px]) */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* 2. MODERN BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto py-1 select-none">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-bold text-slate-900 truncate">{bc.label}</span>
              ) : (
                <Link href={bc.url} className="hover:text-blue-600 transition-colors font-medium shrink-0">
                  {bc.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* 3. CATEGORY HERO / HEADER (Modern White Surface Card) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">
                  {displayTitle}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100">
                  {totalCount} Items
                </span>
              </div>

              {displaySubtitle && (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {displaySubtitle}
                </p>
              )}
            </div>

            {/* Price Table / Category Quick Tag if available */}
            {category?.banner && (
              <div className="hidden lg:block w-36 h-24 rounded-xl overflow-hidden border border-slate-200/80 shrink-0">
                <img src={category.banner} alt={category.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Subcategories Quick Chips */}
          {(subcategories.length > 0 || brands.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-100 select-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Explore:</span>
              
              {/* Subcategories */}
              {subcategories.map((sub) => (
                <Link
                  key={`sub-${sub.id}`}
                  href={`/category/${sub.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/80 hover:border-blue-200 text-xs font-bold transition-all shadow-2xs"
                >
                  <span>{sub.name}</span>
                  {sub.count !== undefined && (
                    <span className="text-[10px] text-slate-400 font-medium">({sub.count})</span>
                  )}
                </Link>
              ))}

              {/* Brands Quick Filter Pills */}
              {brands.slice(0, 8).map((b) => {
                const isSelected = selectedBrands.includes(b.slug);
                return (
                  <button
                    key={`b-${b.id}`}
                    type="button"
                    onClick={() => toggleBrand(b.slug)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border border-blue-600 shadow-blue-500/20'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/80 hover:border-blue-200'
                    }`}
                  >
                    <span>{b.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. MAIN LAYOUT: LEFT FILTER SIDEBAR + RIGHT PRODUCT LISTING */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ================= LEFT FILTER SIDEBAR (Modern 270px Panel) ================= */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 space-y-4 text-xs font-sans">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span className="font-black text-sm text-slate-900 uppercase tracking-wider">Filters</span>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* FILTER: CATEGORIES */}
              {(subcategories.length > 0 || (!category && categories.length > 0)) && (
                <div className="border-b border-slate-100 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1 select-none cursor-pointer"
                  >
                    <span>Categories</span>
                    {openSections.categories ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openSections.categories && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {(subcategories.length > 0 ? subcategories : categories).map(cat => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="flex items-center justify-between text-xs text-slate-600 hover:text-blue-600 py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <span className="truncate group-hover:font-bold">{cat.name}</span>
                          {cat.count !== undefined && (
                            <span className="text-[11px] text-slate-400 font-medium">({cat.count})</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FILTER: AVAILABILITY */}
              <div className="border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => toggleSection('availability')}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1 select-none cursor-pointer"
                >
                  <span>Availability</span>
                  {openSections.availability ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.availability && (
                  <div className="mt-2 space-y-1.5">
                    {[
                      { key: 'in_stock', label: 'In Stock', count: availabilityCounts.in_stock },
                      { key: 'out_of_stock', label: 'Out of Stock', count: availabilityCounts.out_of_stock || 0 },
                      { key: 'pre_order', label: 'Pre-Order', count: availabilityCounts.pre_order },
                      { key: 'upcoming', label: 'Up Coming', count: availabilityCounts.upcoming },
                    ].map(item => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between text-xs text-slate-700 hover:text-blue-600 cursor-pointer select-none py-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAvailability.includes(item.key)}
                            onChange={() => toggleAvailability(item.key)}
                            className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                          <span className={selectedAvailability.includes(item.key) ? 'font-bold text-blue-600' : 'font-medium'}>
                            {item.label}
                          </span>
                        </div>
                        {item.count !== undefined && (
                          <span className="text-[11px] text-slate-400 font-medium">({item.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* FILTER: PRICE RANGE */}
              <div className="border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1 select-none cursor-pointer"
                >
                  <span>Price Range</span>
                  {openSections.price ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.price && (
                  <form onSubmit={handlePriceApply} className="mt-2.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          placeholder={String(priceBounds.min)}
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          onBlur={handlePriceApply}
                          className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-semibold text-center"
                        />
                      </div>
                      <span className="text-slate-400 font-bold">—</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          placeholder={String(priceBounds.max)}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          onBlur={handlePriceApply}
                          className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-semibold text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs rounded-xl border border-blue-200 hover:border-blue-600 transition-all cursor-pointer"
                    >
                      Apply Price
                    </button>
                  </form>
                )}
              </div>

              {/* FILTER: BRANDS */}
              {brands.length > 0 && (
                <div className="border-b border-slate-100 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleSection('brands')}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1 select-none cursor-pointer"
                  >
                    <span>Brand</span>
                    {openSections.brands ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openSections.brands && (
                    <div className="mt-2 space-y-1.5">
                      {brands.length > 6 && (
                        <div className="relative mb-2">
                          <input
                            type="text"
                            placeholder="Search Brand..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        </div>
                      )}

                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filteredBrands.map(b => (
                          <label
                            key={b.id}
                            className="flex items-center justify-between text-xs text-slate-700 hover:text-blue-600 cursor-pointer select-none py-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(b.slug)}
                                onChange={() => toggleBrand(b.slug)}
                                className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                              />
                              <span className={selectedBrands.includes(b.slug) ? 'font-bold text-blue-600' : 'font-medium'}>
                                {b.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">({b.count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC ATTRIBUTE SPECIFICATION FILTERS */}
              {filterGroups.map(group => {
                const isExpanded = openSections[group.id] !== false;
                const activeInGroup = selectedSpecs[group.id]
                  ? (Array.isArray(selectedSpecs[group.id]) ? selectedSpecs[group.id] : selectedSpecs[group.id].split(','))
                  : [];

                return (
                  <div key={group.id} className="border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={() => toggleSection(group.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1 select-none cursor-pointer"
                    >
                      <span>{group.name}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {group.options.map((opt, idx) => (
                          <label
                            key={idx}
                            className="flex items-center justify-between text-xs text-slate-700 hover:text-blue-600 cursor-pointer select-none py-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={activeInGroup.includes(opt.value)}
                                onChange={() => toggleSpec(group.id, opt.value)}
                                className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                              />
                              <span className={activeInGroup.includes(opt.value) ? 'font-bold text-blue-600' : 'font-medium'}>
                                {opt.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">({opt.count})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom Clear All CTA */}
              <button
                type="button"
                onClick={handleResetAll}
                className="w-full py-2.5 bg-[#0b1a36] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all text-center mt-2 cursor-pointer uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* ================= RIGHT PRODUCT LISTING AREA ================= */}
          <section className="flex-1 min-w-0 space-y-4">
            
            {/* 5. TOOLBAR: SEARCH & SORTING */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              
              {/* Left: Mobile Filter Button & Items Count */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 flex items-center gap-2 shadow-2xs"
                >
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  Showing <strong className="text-slate-900 font-black">{products.length}</strong> of <strong className="text-slate-900 font-black">{totalCount}</strong> Products
                </span>
              </div>

              {/* Center: Search input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyFilters({ search, page: 1 });
                }}
                className="relative flex-1 max-w-xs"
              >
                <input
                  type="text"
                  placeholder="Search in this category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-800 placeholder-slate-400 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </form>

              {/* Right: Sorting Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden xl:inline">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    applyFilters({ sort: e.target.value, page: 1 });
                  }}
                  className="text-xs font-bold rounded-xl border border-slate-200 py-1.5 px-3 bg-white focus:outline-none focus:border-blue-600 text-slate-800 cursor-pointer shadow-2xs"
                >
                  <option value="default">Featured / Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="latest">Latest Arrivals</option>
                  <option value="bestseller">Popular / Best Sellers</option>
                  <option value="discount">Highest Discount</option>
                  <option value="title_asc">Name: A to Z</option>
                  <option value="title_desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-xs select-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active:</span>
                
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-xs shadow-2xs">
                    <span>Search: {search}</span>
                    <button type="button" onClick={() => { setSearch(''); applyFilters({ search: '', page: 1 }); }} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedBrands.map(b => (
                  <span key={`chip-${b}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-xs shadow-2xs">
                    <span>Brand: {b}</span>
                    <button type="button" onClick={() => toggleBrand(b)} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedAvailability.map(a => (
                  <span key={`chip-${a}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-xs shadow-2xs capitalize">
                    <span>{a.replace(/_/g, ' ')}</span>
                    <button type="button" onClick={() => toggleAvailability(a)} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-xs shadow-2xs">
                    <span>Price: ৳{minPrice || 0} - ৳{maxPrice || 'Max'}</span>
                    <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); applyFilters({ min_price: '', max_price: '', page: 1 }); }} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs text-rose-600 hover:underline font-bold ml-auto"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* 6. MODERN RESPONSIVE PRODUCT GRID (4 Columns Matching HomeV2) */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product) => {
                  const currentPrice = Number(product.flash_price || product.price || 0);
                  const regularPrice = Number(product.regular_price || 0);
                  const savings = regularPrice > currentPrice ? regularPrice - currentPrice : 0;
                  const isAdded = addedProductId === product.id;
                  const isOutOfStock = product.stock <= 0 && !product.is_deal_of_day;

                  // Determine badge
                  let badge = null;
                  if (product.is_featured) badge = { text: 'FEATURED', bg: 'bg-blue-600' };
                  if (product.is_deal_of_day) badge = { text: 'HOT DEAL', bg: 'bg-amber-600' };
                  if (savings > 0) badge = { text: 'SALE', bg: 'bg-rose-500' };

                  return (
                    <div
                      key={product.id}
                      className="storefront-v2-product-card bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between p-3.5 group relative font-sans select-none"
                    >
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between z-10 mb-2">
                        {badge ? (
                          <span className={`${badge.bg} text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs`}>
                            {badge.text}
                          </span>
                        ) : (
                          <span />
                        )}

                        {/* Actions (Wishlist, Compare, QuickView) */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={(e) => handleWishlist(e, product)}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-2xs"
                            title="Add to Wishlist"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCompare(e, product)}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors shadow-2xs"
                            title="Add to Compare"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
                            title="Quick View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Product Image Area */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="block aspect-square w-full rounded-xl bg-slate-50/70 p-3 flex items-center justify-center relative overflow-hidden group/img"
                      >
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop'}
                          alt={product.title}
                          className="max-h-full max-w-full object-contain group-hover/img:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="pt-3 flex flex-col justify-between flex-1">
                        {product.brand?.name && (
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 truncate block">
                            {product.brand.name}
                          </span>
                        )}

                        <Link
                          href={`/product/${product.slug}`}
                          className="font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2.5"
                          title={product.title}
                        >
                          {product.title}
                        </Link>

                        {/* Price & Add to Cart */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 mt-auto">
                          <div>
                            <div className="text-sm sm:text-base font-black text-blue-600 tracking-tight">
                              ৳{currentPrice.toLocaleString()}
                            </div>
                            {regularPrice > currentPrice && (
                              <div className="text-[11px] text-slate-400 line-through -mt-0.5">
                                ৳{regularPrice.toLocaleString()}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={isOutOfStock || isAdded}
                            aria-label="Add to cart"
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                              isAdded
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : isOutOfStock
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 hover:border-blue-600'
                            }`}
                          >
                            {isAdded ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <ShoppingCart className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">No products match your selected filters</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your price range, clearing selected brands, or searching with another keyword.
                </p>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* 7. BOTTOM TOOLBAR & SERVER PAGINATION */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    applyFilters({ per_page: Number(e.target.value), page: 1 });
                  }}
                  className="rounded-xl border border-slate-200 py-1 px-2 text-xs bg-white focus:outline-none focus:border-blue-600 font-bold cursor-pointer"
                >
                  <option value={12}>12 per page</option>
                  <option value={16}>16 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
                <span className="text-xs font-medium">
                  Showing <strong className="text-slate-900 font-bold">{products.length}</strong> of <strong className="text-slate-900 font-bold">{totalCount}</strong> items
                </span>
              </div>

              {productsData.links && productsData.links.length > 3 && (
                <div className="flex items-center gap-1">
                  {productsData.links.map((link, idx) => (
                    <button
                      key={idx}
                      disabled={!link.url || link.active}
                      onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                        link.active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                          : link.url
                          ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ================= 8. DYNAMIC CATEGORY SEO EDITORIAL & FAQ ================= */}
        {(contentSections.length > 0 || priceTables.length > 0 || faqs.length > 0 || category?.seo_intro) && (
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs text-xs text-slate-600">
            
            {/* Dynamic Intro Paragraph */}
            {category?.seo_intro && (
              <div className="prose prose-sm max-w-none text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-4">
                <div dangerouslySetInnerHTML={{ __html: category.seo_intro }} />
              </div>
            )}

            {/* DYNAMIC CONTENT SECTIONS */}
            {contentSections.map((sec) => (
              <div key={sec.id} className="space-y-2">
                {sec.heading && (
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    {sec.heading}
                  </h2>
                )}
                {sec.content && (
                  <div
                    className="text-xs text-slate-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: sec.content }}
                  />
                )}
              </div>
            ))}

            {/* DYNAMIC CATEGORY PRICE TABLE */}
            {priceTables.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-blue-600" />
                  <span>{displayTitle} Price List in Bangladesh (2026)</span>
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-extrabold uppercase text-[11px] border-b border-slate-200">
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Key Specs</th>
                        <th className="p-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {priceTables.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-bold text-slate-900">
                            {row.url ? (
                              <Link href={row.url} className="hover:text-blue-600 transition-colors">
                                {row.product_name}
                              </Link>
                            ) : (
                              row.product_name
                            )}
                          </td>
                          <td className="p-3 text-slate-500">{row.specs || '—'}</td>
                          <td className="p-3 text-right font-black text-blue-600 whitespace-nowrap">
                            ৳{Number(row.price || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DYNAMIC FAQ ACCORDION */}
            {faqs.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Frequently Asked Questions ({category?.name || 'Products'})</span>
                </h3>

                <div className="space-y-2">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-slate-200/90 overflow-hidden transition-all duration-150"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                          className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-blue-600 font-black">Q.</span>
                            <span>{faq.question}</span>
                          </span>
                          {isOpen ? (
                            <Minus className="w-4 h-4 text-slate-500 shrink-0" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ================= MOBILE FILTER DRAWER ================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Filters</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body with filters */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Categories */}
              {(subcategories.length > 0 || (!category && categories.length > 0)) && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="font-extrabold text-slate-900 block mb-2 text-xs uppercase tracking-wider">Categories</span>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {(subcategories.length > 0 ? subcategories : categories).map(cat => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex items-center justify-between py-1 text-xs text-slate-600 hover:text-blue-600"
                      >
                        <span>{cat.name}</span>
                        {cat.count !== undefined && <span className="text-slate-400">({cat.count})</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Price */}
              <div className="border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-900 block mb-2 text-xs uppercase tracking-wider">Price Range</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 font-bold"
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Mobile Availability */}
              <div className="border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-900 block mb-2 text-xs uppercase tracking-wider">Availability</span>
                <div className="space-y-1.5">
                  {['in_stock', 'out_of_stock', 'pre_order', 'upcoming'].map(key => (
                    <label key={key} className="flex items-center gap-2 py-0.5 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(key)}
                        onChange={() => toggleAvailability(key)}
                        className="rounded-md text-blue-600"
                      />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Brands */}
              {brands.length > 0 && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="font-extrabold text-slate-900 block mb-2 text-xs uppercase tracking-wider">Brands</span>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {brands.map(b => (
                      <label key={b.id} className="flex items-center justify-between py-0.5 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(b.slug)}
                            onChange={() => toggleBrand(b.slug)}
                            className="rounded-md text-blue-600"
                          />
                          <span>{b.name}</span>
                        </div>
                        <span className="text-slate-400">({b.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => { handleResetAll(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-extrabold text-xs text-slate-700 bg-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => { handlePriceApply(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* 9. Footer (Storefront Version 2 Footer with AI Chatbot) */}
      <FooterV2 onOpenCart={() => setIsCartOpen(true)} />
    </div>
  );
}
