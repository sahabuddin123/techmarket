import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import ProductCard from '@/Components/ProductCard';
import { 
  ChevronRight, 
  Globe, 
  Filter, 
  Search, 
  ArrowUpDown, 
  Tag, 
  ShieldCheck,
  Award,
  Sparkles,
  Layers
} from 'lucide-react';

export default function BrandShow({ 
  brand = {}, 
  products = { data: [] }, 
  filterCategories = [], 
  filters = {} 
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const safeFilters = filters || {};
  const [searchTerm, setSearchTerm] = useState(safeFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(safeFilters.category || '');
  const [sortOrder, setSortOrder] = useState(safeFilters.sort || 'latest');

  const handleFilterChange = (cat, sort, search) => {
    router.get(`/brand/${brand.slug || ''}`, {
      category: cat || undefined,
      sort: sort || undefined,
      search: search || undefined,
    }, { preserveState: true, preserveScroll: true });
  };

  const productList = products?.data || [];
  const categoriesList = filterCategories || [];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head>
        <title>{brand.meta_title || `${brand.name || 'Brand'} Products & Official Price in Bangladesh | TechMarket BD`}</title>
        <meta name="description" content={brand.meta_description || `Buy official authentic ${brand.name || 'Brand'} products, laptops, hardware & components with genuine warranty at TechMarket BD.`} />
      </Head>

      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/90 text-xs py-3">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#1c4289] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/brands" className="hover:text-[#1c4289] transition-colors">Brands Directory</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold">{brand.name || 'Brand'}</span>
        </div>
      </div>

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ================= BRAND BANNER & PROFILE CARD ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {brand.banner && (
            <div className="w-full h-40 sm:h-56 md:h-64 bg-slate-900 overflow-hidden relative">
              <img 
                src={brand.banner} 
                alt={brand.name} 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-5 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center space-x-4 sm:space-x-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200 p-2.5 flex items-center justify-center shrink-0 shadow-sm">
                {brand.logo ? (
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Tag className="w-8 h-8 text-[#1c4289]" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                    {brand.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1c4289] border border-blue-200/80 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-[#1c4289]" />
                    <span>Official Brand</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                  {brand.description || `Explore authentic ${brand.name} authorized products, peripherals, and equipment with manufacturer warranty coverage in Bangladesh.`}
                </p>
              </div>
            </div>

            {brand.website_url && (
              <a
                href={brand.website_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Official Website</span>
              </a>
            )}
          </div>
        </div>

        {/* ================= FILTER & SEARCH TOOLBAR ================= */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  handleFilterChange(e.target.value, sortOrder, searchTerm);
                }}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#1c4289] font-medium transition-colors cursor-pointer"
              >
                <option value="">All Product Categories</option>
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  handleFilterChange(selectedCategory, e.target.value, searchTerm);
                }}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#1c4289] font-medium transition-colors cursor-pointer"
              >
                <option value="latest">Latest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Search within brand */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterChange(selectedCategory, sortOrder, searchTerm)}
              placeholder={`Search ${brand.name || 'brand'} items...`}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#1c4289] focus:bg-white transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* ================= PRODUCT GRID ================= */}
        <div>
          {productList.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-2xs space-y-3">
              <Tag className="w-12 h-12 text-slate-300 mx-auto" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                No {brand.name || 'Brand'} products found
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your active search or category filter. Try clearing filters to view all products.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  setSearchTerm('');
                  setSortOrder('latest');
                  handleFilterChange('', 'latest', '');
                }}
                className="mt-2 px-4 py-2 bg-[#1c4289] text-white rounded-xl text-xs font-bold hover:bg-[#15326b] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {products?.links && products.links.length > 3 && (
            <div className="mt-8 flex justify-center items-center flex-wrap gap-1">
              {products.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || '#'}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    link.active
                      ? 'bg-[#1c4289] text-white border-[#1c4289]'
                      : link.url
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
