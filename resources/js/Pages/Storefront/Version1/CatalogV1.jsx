import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import QuickViewModal from '@/Components/QuickViewModal';
import {
  Search, RotateCcw, ChevronRight, ChevronDown, ChevronUp, ShoppingCart,
  Heart, Check, Tag, HelpCircle, Table as TableIcon,
  ShieldCheck, Eye, Filter, ArrowRightLeft, FolderTree, X, Plus, Minus
} from 'lucide-react';

export default function CatalogV1(props) {
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

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0 && !product.is_deal_of_day) return;

    router.post('/cart/add', { product_id: product.id, quantity: 1 }, {
      preserveScroll: true,
      onSuccess: () => {
        router.visit('/checkout');
      }
    });
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
    <div className="min-h-screen bg-[#f2f4f8] text-[#333] font-sans flex flex-col selection:bg-[#0084ff] selection:text-white">
      <Head>
        <title>{category?.seo_title || `${displayTitle} | TechMarket BD`}</title>
        <meta
          name="description"
          content={category?.meta_description || `Explore latest ${displayTitle} prices, official warranty, specifications, and special discounts at TechMarket BD.`}
        />
        {category?.meta_keywords && <meta name="keywords" content={category.meta_keywords} />}
      </Head>

      {/* 1. FULL WIDTH HEADER & CATEGORY NAVIGATION */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* CENTERED MAIN CONTENT CONTAINER (High Density max-w-[1640px]) */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 py-4 space-y-4">
        
        {/* 2. BREADCRUMB (Home > Category > Subcategory) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[#666] overflow-x-auto py-1 select-none">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#999] font-normal shrink-0">&gt;</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-[#111] truncate">{bc.label}</span>
              ) : (
                <Link href={bc.url} className="hover:text-[#0066cc] transition-colors shrink-0">
                  {bc.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* FLASH SALE PROMOTIONAL CAMPAIGN BANNER */}
        {isFlashSale && (
          <div className="bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#ea580c] text-white rounded-[3px] p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Tag className="w-4 h-4 fill-current text-white" />
              </div>
              <div>
                <span className="font-black text-sm sm:text-base block leading-tight">{displayTitle}</span>
                <span className="text-[11px] sm:text-xs text-orange-100 font-medium">
                  Showing {totalCount} live flash deals with limited stock & special discounts
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-900">
              <span className="text-[9px] font-black text-white uppercase tracking-wider mr-1 hidden sm:inline">OFFER RUNNING</span>
              <div className="bg-white rounded px-2 py-1 text-center min-w-[32px]">
                <span className="block text-xs font-black leading-tight text-slate-900">HOT</span>
                <span className="block text-[7px] text-slate-500 uppercase font-bold">DEALS</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. CATEGORY TITLE + SHORT DESCRIPTION */}
        <div className="bg-transparent space-y-1 pb-1">
          <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111] tracking-tight leading-snug">
            {displayTitle}
          </h1>

          {displaySubtitle && (
            <p className="text-[12px] text-[#555] leading-relaxed max-w-5xl">
              {displaySubtitle}
            </p>
          )}

          {/* BRAND / SUBCATEGORY QUICK LINKS (Lightweight text links with | separators) */}
          {(brands.length > 0 || subcategories.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#0066cc] font-normal pt-1 select-none">
              {/* If subcategories exist, render them */}
              {subcategories.map((sub, sIdx) => (
                <React.Fragment key={`sub-${sub.id}`}>
                  {sIdx > 0 && <span className="text-[#ccc] select-none">|</span>}
                  <Link
                    href={`/category/${sub.slug}`}
                    className="hover:underline text-[#0066cc] hover:text-[#004080] transition-colors"
                  >
                    {sub.name}
                  </Link>
                </React.Fragment>
              ))}

              {/* Brands Quick Links */}
              {brands.slice(0, 12).map((b, idx) => {
                const isSelected = selectedBrands.includes(b.slug);
                const hasPipes = subcategories.length > 0 || idx > 0;
                return (
                  <React.Fragment key={`b-${b.id}`}>
                    {hasPipes && <span className="text-[#ccc] select-none">|</span>}
                    <button
                      type="button"
                      onClick={() => toggleBrand(b.slug)}
                      className={`hover:underline transition-colors ${
                        isSelected ? 'font-bold text-[#d32f2f] underline' : 'text-[#0066cc] hover:text-[#004080]'
                      }`}
                    >
                      {b.name} {category?.name || 'AC'}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. MAIN LAYOUT: LEFT FILTER SIDEBAR + RIGHT PRODUCT AREA */}
        <div className="flex flex-col lg:flex-row gap-3.5 items-start">

          {/* ================= LEFT FILTER SIDEBAR (Narrow & Compact 225px) ================= */}
          <aside className="hidden lg:block w-[225px] shrink-0 space-y-2 text-[12px]">
            <div className="bg-white rounded-[3px] border border-[#e2e8f0] p-3 shadow-none space-y-2.5">
              
              {/* Sidebar Header: "Filters" on left, "Clear All" on right */}
              <div className="flex items-center justify-between pb-2 border-b border-[#eee]">
                <span className="font-bold text-[13px] text-[#111] uppercase tracking-wide">Filters</span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-[11px] text-[#0066cc] hover:underline font-normal transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* FILTER GROUP: CATEGORIES */}
              {(subcategories.length > 0 || (!category && categories.length > 0)) && (
                <div className="border-b border-[#eee] pb-2">
                  <button
                    type="button"
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between text-[12px] font-bold text-[#222] py-1 select-none"
                  >
                    <span>Categories</span>
                    {openSections.categories ? <ChevronUp className="w-3.5 h-3.5 text-[#888]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#888]" />}
                  </button>

                  {openSections.categories && (
                    <div className="mt-1 space-y-0.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {(subcategories.length > 0 ? subcategories : categories).map(cat => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="flex items-center justify-between text-[12px] text-[#444] hover:text-[#0066cc] py-0.5 group transition-colors"
                        >
                          <span className="truncate group-hover:underline">{cat.name}</span>
                          {cat.count !== undefined && (
                            <span className="text-[11px] text-[#999]">({cat.count})</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FILTER GROUP: AVAILABILITY */}
              <div className="border-b border-[#eee] pb-2">
                <button
                  type="button"
                  onClick={() => toggleSection('availability')}
                  className="w-full flex items-center justify-between text-[12px] font-bold text-[#222] py-1 select-none"
                >
                  <span>Availability</span>
                  {openSections.availability ? <ChevronUp className="w-3.5 h-3.5 text-[#888]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#888]" />}
                </button>

                {openSections.availability && (
                  <div className="mt-1 space-y-1">
                    {[
                      { key: 'in_stock', label: 'In Stock', count: availabilityCounts.in_stock },
                      { key: 'out_of_stock', label: 'Out of Stock', count: availabilityCounts.out_of_stock || 0 },
                      { key: 'pre_order', label: 'Pre-Order', count: availabilityCounts.pre_order },
                      { key: 'upcoming', label: 'Up Coming', count: availabilityCounts.upcoming },
                    ].map(item => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between text-[12px] text-[#444] hover:text-[#111] cursor-pointer select-none py-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAvailability.includes(item.key)}
                            onChange={() => toggleAvailability(item.key)}
                            className="rounded-[2px] border-[#cbd5e1] text-[#0084ff] focus:ring-[#0084ff] w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className={selectedAvailability.includes(item.key) ? 'font-bold text-[#111]' : ''}>
                            {item.label}
                          </span>
                        </div>
                        {item.count !== undefined && (
                          <span className="text-[11px] text-[#888]">({item.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* FILTER GROUP: PRICE RANGE */}
              <div className="border-b border-[#eee] pb-2.5">
                <button
                  type="button"
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between text-[12px] font-bold text-[#222] py-1 select-none"
                >
                  <span>Price Range</span>
                  {openSections.price ? <ChevronUp className="w-3.5 h-3.5 text-[#888]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#888]" />}
                </button>

                {openSections.price && (
                  <form onSubmit={handlePriceApply} className="mt-1.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#888] font-bold text-[11px]">৳</span>
                        <input
                          type="number"
                          placeholder={String(priceBounds.min)}
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          onBlur={handlePriceApply}
                          className="w-full pl-5 pr-1 py-1 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#0084ff] font-medium text-center"
                        />
                      </div>
                      <span className="text-[#888] text-[11px]">—</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#888] font-bold text-[11px]">৳</span>
                        <input
                          type="number"
                          placeholder={String(priceBounds.max)}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          onBlur={handlePriceApply}
                          className="w-full pl-5 pr-1 py-1 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#0084ff] font-medium text-center"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* FILTER GROUP: BRANDS */}
              {brands.length > 0 && (
                <div className="border-b border-[#eee] pb-2">
                  <button
                    type="button"
                    onClick={() => toggleSection('brands')}
                    className="w-full flex items-center justify-between text-[12px] font-bold text-[#222] py-1 select-none"
                  >
                    <span>Brand</span>
                    {openSections.brands ? <ChevronUp className="w-3.5 h-3.5 text-[#888]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#888]" />}
                  </button>

                  {openSections.brands && (
                    <div className="mt-1 space-y-1">
                      {brands.length > 6 && (
                        <div className="relative mb-1.5">
                          <input
                            type="text"
                            placeholder="Search Brand..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="w-full pl-6 pr-2 py-0.5 text-[11px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#0084ff]"
                          />
                          <Search className="w-3 h-3 text-[#888] absolute left-1.5 top-1/2 -translate-y-1/2" />
                        </div>
                      )}

                      <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                        {filteredBrands.map(b => (
                          <label
                            key={b.id}
                            className="flex items-center justify-between text-[12px] text-[#444] hover:text-[#111] cursor-pointer select-none py-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(b.slug)}
                                onChange={() => toggleBrand(b.slug)}
                                className="rounded-[2px] border-[#cbd5e1] text-[#0084ff] focus:ring-[#0084ff] w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className={selectedBrands.includes(b.slug) ? 'font-bold text-[#111]' : ''}>
                                {b.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#888]">({b.count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC CATEGORY SPECIFICATION ATTRIBUTE FILTERS */}
              {filterGroups.map(group => {
                const isExpanded = openSections[group.id] !== false;
                const activeInGroup = selectedSpecs[group.id]
                  ? (Array.isArray(selectedSpecs[group.id]) ? selectedSpecs[group.id] : selectedSpecs[group.id].split(','))
                  : [];

                return (
                  <div key={group.id} className="border-b border-[#eee] pb-2">
                    <button
                      type="button"
                      onClick={() => toggleSection(group.id)}
                      className="w-full flex items-center justify-between text-[12px] font-bold text-[#222] py-1 select-none"
                    >
                      <span>{group.name}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#888]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#888]" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                        {group.options.map((opt, idx) => (
                          <label
                            key={idx}
                            className="flex items-center justify-between text-[12px] text-[#444] hover:text-[#111] cursor-pointer select-none py-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={activeInGroup.includes(opt.value)}
                                onChange={() => toggleSpec(group.id, opt.value)}
                                className="rounded-[2px] border-[#cbd5e1] text-[#0084ff] focus:ring-[#0084ff] w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className={activeInGroup.includes(opt.value) ? 'font-bold text-[#111]' : ''}>
                                {opt.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#888]">({opt.count})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Full Width Bottom "Clear All" Button */}
              <button
                type="button"
                onClick={handleResetAll}
                className="w-full py-1.5 bg-[#0084ff] hover:bg-[#0084ff] text-white text-[12px] font-bold rounded-[3px] shadow-none transition-colors text-center mt-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </aside>

          {/* ================= RIGHT PRODUCT LISTING AREA ================= */}
          <section className="flex-1 min-w-0 space-y-2">
            
            {/* 5. TOP TOOLBAR: SEARCH & SORT (Pixel Perfect Density) */}
            <div className="bg-white rounded-[3px] border border-[#e2e8f0] p-2 flex items-center justify-between gap-2.5 shadow-none">
              
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-2.5 py-1 rounded-[3px] border border-[#cbd5e1] bg-white text-[12px] font-bold text-[#444] flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5 text-[#0084ff]" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#0084ff] text-white text-[10px]">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Search by product name input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyFilters({ search, page: 1 });
                }}
                className="relative flex-1 max-w-sm"
              >
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-3 pr-7 py-1 text-[12px] rounded-[3px] border border-[#cbd5e1] focus:outline-none focus:border-[#0084ff] text-[#333] placeholder-[#999]"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333]">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Sort & Per-page Dropdown */}
              <div className="flex items-center gap-2 text-[12px]">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    applyFilters({ sort: e.target.value, page: 1 });
                  }}
                  className="text-[12px] rounded-[3px] border border-[#cbd5e1] py-1 px-2 bg-white focus:outline-none focus:border-[#0084ff] font-medium text-[#444] cursor-pointer"
                >
                  <option value="default">Default</option>
                  <option value="price_asc">Price (Low &gt; High)</option>
                  <option value="price_desc">Price (High &gt; Low)</option>
                  <option value="latest">Latest</option>
                  <option value="bestseller">Popular / Best Selling</option>
                  <option value="discount">Highest Discount</option>
                  <option value="title_asc">Name (A - Z)</option>
                  <option value="title_desc">Name (Z - A)</option>
                </select>
              </div>
            </div>

            {/* 6. PRODUCT GRID — EXACTLY 4 COLUMNS ON DESKTOP (High Visual Fidelity) */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {products.map((product) => {
                  const currentPrice = Number(product.flash_price || product.price || 0);
                  const regularPrice = Number(product.regular_price || 0);
                  const savings = regularPrice > currentPrice ? regularPrice - currentPrice : 0;
                  const isAdded = addedProductId === product.id;
                  const isOutOfStock = product.stock <= 0 && !product.is_deal_of_day;

                  // Parse key specifications
                  const specsList = Array.isArray(product.key_specs)
                    ? product.key_specs
                    : (typeof product.key_specs === 'object' && product.key_specs !== null
                      ? Object.entries(product.key_specs).map(([k, v]) => `${k}: ${v}`)
                      : []);

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-[3px] border border-[#e2e8f0] hover:border-[#0084ff] hover:shadow-md transition-all duration-150 flex flex-col justify-between overflow-hidden relative p-3 select-none"
                    >
                      {/* Top Badges & Actions */}
                      <div className="flex items-start justify-between min-h-[18px] mb-1">
                        {savings > 0 ? (
                          <span className="bg-[#0084ff] text-white font-bold text-[10px] px-1.5 py-0.5 rounded-[2px] inline-block">
                            Save: ৳{savings.toLocaleString()}
                          </span>
                        ) : (
                          <div className="h-3"></div>
                        )}

                        {/* Top Wishlist, Compare & QuickView Actions */}
                        <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleWishlist(e, product)}
                            className="p-1 rounded hover:bg-slate-100 text-[#999] hover:text-rose-500 transition-colors cursor-pointer"
                            title="Add to Wishlist"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCompare(e, product)}
                            className="p-1 rounded hover:bg-slate-100 text-[#999] hover:text-[#0084ff] transition-colors cursor-pointer"
                            title="Add to Compare"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                            className="p-1 rounded hover:bg-slate-100 text-[#999] hover:text-[#0084ff] transition-colors cursor-pointer"
                            title="Quick View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Centered Product Image with Official Badge */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="aspect-square w-full flex items-center justify-center p-1.5 bg-white relative overflow-hidden group"
                      >
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop'}
                          alt={product.title}
                          className="w-full h-full object-contain group-hover:scale-104 transition-transform duration-200"
                          loading="lazy"
                        />

                        {/* Official Warranty Badge */}
                        <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 bg-white/90 border border-blue-900/30 rounded-[2px] px-1 py-0.5 text-[8px] font-black text-blue-900">
                          <ShieldCheck className="w-2.5 h-2.5 text-blue-800" />
                          <span>OFFICIAL</span>
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="mt-1.5 flex-1 flex flex-col justify-between space-y-1.5">
                        {/* Title */}
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-[12px] font-semibold text-[#111] hover:text-[#0066cc] transition-colors line-clamp-2 leading-snug min-h-[32px]"
                          title={product.title}
                        >
                          {product.title}
                        </Link>

                        {/* Key Specs Highlights */}
                        {specsList.length > 0 && (
                          <ul className="space-y-0.5 text-[11px] text-[#666] py-0.5">
                            {specsList.slice(0, 4).map((spec, sIdx) => (
                              <li key={sIdx} className="truncate flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#888] shrink-0"></span>
                                <span className="truncate">{spec}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Price Row */}
                        <div className="flex items-baseline gap-1.5 pt-1 border-t border-[#eee]">
                          <span className="text-[14px] sm:text-[15px] font-bold text-[#d32f2f] leading-none">
                            ৳{currentPrice.toLocaleString()}
                          </span>
                          {regularPrice > currentPrice && (
                            <span className="text-[11px] text-[#999] line-through leading-none">
                              ৳{regularPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: Add to Cart & Buy Now */}
                        <div className="pt-1 flex items-center gap-1.5">
                          {isOutOfStock ? (
                            <button
                              disabled
                              className="w-full py-1.5 px-2 rounded-[3px] bg-red-50 text-red-400 border border-red-200 text-[11px] font-bold cursor-not-allowed text-center"
                            >
                              Out of Stock
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleAddToCart(e, product)}
                                className={`flex-1 py-1.5 px-2 rounded-[3px] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#0084ff] hover:bg-[#0070d6] text-white'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3 h-3" />
                                    <span>Add to Cart</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleBuyNow(e, product)}
                                className="flex-1 py-1.5 px-2 rounded-[3px] bg-[#ff6a00] hover:bg-[#e55f00] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                              >
                                <Zap className="w-3 h-3 fill-current" />
                                <span>Buy Now</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-[3px] border border-[#e2e8f0] p-10 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">No products match your selected filters</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try adjusting your price range, clearing selected brands, or searching with another keyword.
                </p>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-3.5 py-1.5 bg-[#0084ff] hover:bg-[#0084ff] text-white text-xs font-bold rounded-[3px] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* 7. BOTTOM TOOLBAR & SERVER PAGINATION */}
            <div className="bg-white rounded-[3px] border border-[#e2e8f0] p-2 flex flex-col sm:flex-row items-center justify-between gap-2 mt-3">
              <div className="flex items-center gap-2 text-[12px] text-[#666]">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    applyFilters({ per_page: Number(e.target.value), page: 1 });
                  }}
                  className="rounded-[3px] border border-[#cbd5e1] py-0.5 px-1.5 text-[11px] bg-white focus:outline-none focus:border-[#0084ff] font-medium cursor-pointer"
                >
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={20}>20</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
                <span className="text-[12px]">
                  Showing <span className="font-bold text-[#111]">{products.length}</span> of{' '}
                  <span className="font-bold text-[#111]">{totalCount}</span> items
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
                      className={`px-2.5 py-1 text-[12px] font-semibold rounded-[3px] border transition-colors cursor-pointer ${
                        link.active
                          ? 'bg-[#0084ff] text-white border-[#0084ff]'
                          : link.url
                          ? 'bg-white text-[#444] border-[#cbd5e1] hover:bg-[#f8fafc]'
                          : 'bg-gray-100 text-[#999] border-gray-200 cursor-not-allowed'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ================= 8. DYNAMIC CATEGORY SEO CONTENT AREA ================= */}
        {(contentSections.length > 0 || priceTables.length > 0 || faqs.length > 0 || category?.seo_intro) && (
          <section className="bg-white rounded-[3px] border border-[#e2e8f0] p-4 sm:p-6 space-y-4 mt-4 text-[12px] text-[#444]">
            
            {/* Dynamic Intro Paragraph */}
            {category?.seo_intro && (
              <div className="prose prose-xs max-w-none text-[12px] text-[#555] leading-relaxed border-b border-[#eee] pb-3">
                <div dangerouslySetInnerHTML={{ __html: category.seo_intro }} />
              </div>
            )}

            {/* DYNAMIC CONTENT SECTIONS (Editorial Style) */}
            {contentSections.map((sec) => (
              <div key={sec.id} className="space-y-1.5">
                {sec.heading && (
                  <h2 className="text-[13px] sm:text-[14px] font-bold text-[#111]">
                    {sec.heading}
                  </h2>
                )}
                {sec.content && (
                  <div
                    className="text-[12px] text-[#555] leading-relaxed prose prose-xs max-w-none"
                    dangerouslySetInnerHTML={{ __html: sec.content }}
                  />
                )}
              </div>
            ))}

            {/* DYNAMIC CATEGORY PRICE TABLE */}
            {priceTables.length > 0 && (
              <div className="space-y-2 pt-1">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-[#111] flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-[#0084ff]" />
                  <span>{displayTitle} Price List in Bangladesh (2026)</span>
                </h3>

                <div className="overflow-x-auto rounded-[3px] border border-[#e2e8f0]">
                  <table className="w-full text-[12px] text-left">
                    <thead>
                      <tr className="bg-[#f8fafc] text-[#333] font-bold uppercase text-[11px] border-b border-[#e2e8f0]">
                        <th className="p-2.5">Product Name</th>
                        <th className="p-2.5">Key Specs</th>
                        <th className="p-2.5 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0] text-[12px]">
                      {priceTables.map((row) => (
                        <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="p-2.5 font-semibold text-[#111]">
                            {row.url ? (
                              <Link href={row.url} className="hover:text-[#0066cc] transition-colors">
                                {row.product_name}
                              </Link>
                            ) : (
                              row.product_name
                            )}
                          </td>
                          <td className="p-2.5 text-[#666]">{row.specs || '—'}</td>
                          <td className="p-2.5 text-right font-bold text-[#d32f2f] whitespace-nowrap">
                            ৳{Number(row.price || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DYNAMIC FAQ ACCORDION SECTION */}
            {faqs.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-[#eee]">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-[#111] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#0084ff]" />
                  <span>Frequently Asked Questions ({category?.name || 'Products'})</span>
                </h3>

                <div className="space-y-1.5">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-[3px] border border-[#e2e8f0] overflow-hidden transition-all duration-150"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                          className="w-full flex items-center justify-between p-2.5 text-left text-[12px] font-bold text-[#111] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-[#0084ff] font-bold">Q.</span>
                            <span>{faq.question}</span>
                          </span>
                          {isOpen ? (
                            <Minus className="w-3.5 h-3.5 text-[#666] shrink-0" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-[#888] shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="p-2.5 bg-white text-[12px] text-[#555] leading-relaxed border-t border-[#e2e8f0]">
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
            <div className="p-3 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50">
              <span className="font-bold text-xs text-[#111] uppercase">Filters</span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body with filters */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {/* Categories */}
              {(subcategories.length > 0 || (!category && categories.length > 0)) && (
                <div className="border-b border-gray-100 pb-2.5">
                  <span className="font-bold text-[#111] block mb-1.5 text-xs">Categories</span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {(subcategories.length > 0 ? subcategories : categories).map(cat => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex items-center justify-between py-0.5 text-[11px] text-[#444] hover:text-[#0066cc]"
                      >
                        <span>{cat.name}</span>
                        {cat.count !== undefined && <span className="text-gray-400">({cat.count})</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Price */}
              <div className="border-b border-gray-100 pb-2.5">
                <span className="font-bold text-[#111] block mb-1.5 text-xs">Price Range</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-1 text-xs rounded border border-gray-300"
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-1 text-xs rounded border border-gray-300"
                  />
                </div>
              </div>

              {/* Mobile Availability */}
              <div className="border-b border-gray-100 pb-2.5">
                <span className="font-bold text-[#111] block mb-1.5 text-xs">Availability</span>
                {['in_stock', 'out_of_stock', 'pre_order', 'upcoming'].map(key => (
                  <label key={key} className="flex items-center gap-2 py-0.5 text-[11px]">
                    <input
                      type="checkbox"
                      checked={selectedAvailability.includes(key)}
                      onChange={() => toggleAvailability(key)}
                      className="rounded text-[#0084ff]"
                    />
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>

              {/* Mobile Brands */}
              {brands.length > 0 && (
                <div className="border-b border-gray-100 pb-2.5">
                  <span className="font-bold text-[#111] block mb-1.5 text-xs">Brands</span>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {brands.map(b => (
                      <label key={b.id} className="flex items-center justify-between py-0.5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(b.slug)}
                            onChange={() => toggleBrand(b.slug)}
                            className="rounded text-[#0084ff]"
                          />
                          <span>{b.name}</span>
                        </div>
                        <span className="text-gray-400">({b.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3 border-t border-[#e2e8f0] bg-gray-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => { handleResetAll(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-1.5 rounded-[3px] border border-gray-300 font-bold text-xs text-[#444] bg-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => { handlePriceApply(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-1.5 rounded-[3px] bg-[#0084ff] text-white font-bold text-xs"
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

      {/* 9. DARK FOOTER */}
      <Footer />
    </div>
  );
}
