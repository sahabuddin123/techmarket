import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import ProductCard from '../../Components/ProductCard';
import { ChevronRight, Globe, Filter, Search, ArrowUpDown, Tag } from 'lucide-react';

export default function BrandShow({ brand, products, categories = [], filters = {} }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [sortOrder, setSortOrder] = useState(filters.sort || 'latest');

  const handleFilterChange = (cat, sort, search) => {
    router.get(`/brand/${brand.slug}`, {
      category: cat || undefined,
      sort: sort || undefined,
      search: search || undefined,
    }, { preserveState: true });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Head title={brand.meta_title || `${brand.name} Price in Bangladesh - TechMarket BD`} />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 text-xs py-2.5">
        <div className="max-w-[1440px] mx-auto px-4 flex items-center space-x-2 text-slate-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/brands" className="hover:text-blue-600">Brands</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">{brand.name}</span>
        </div>
      </div>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8 space-y-8">
        {/* Brand Banner & Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {brand.banner && (
            <div className="w-full h-44 md:h-64 bg-slate-900 overflow-hidden relative">
              <img src={brand.banner} alt={brand.name} className="w-full h-full object-cover opacity-85" />
            </div>
          )}

          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-center shrink-0 shadow-sm">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <Tag className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {brand.name}
                </h1>
                <p className="text-xs text-slate-500 max-w-2xl">
                  {brand.description || `Official ${brand.name} authorized products with manufacturer warranty in Bangladesh.`}
                </p>
              </div>
            </div>

            {brand.website_url && (
              <a
                href={brand.website_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Official Website</span>
              </a>
            )}
          </div>
        </div>

        {/* Filter & Sorting Controls Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  handleFilterChange(e.target.value, sortOrder, searchTerm);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  handleFilterChange(selectedCategory, e.target.value, searchTerm);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="latest">Latest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Search within brand */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterChange(selectedCategory, sortOrder, searchTerm)}
              placeholder={`Search ${brand.name} products...`}
              className="w-full pl-8 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Product Grid */}
        <div>
          {products?.data?.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
              <Tag className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-800">No {brand.name} products found</div>
              <p className="text-xs text-slate-500">Try changing category filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {products?.data?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {products?.links && products.links.length > 3 && (
            <div className="mt-8 flex justify-center space-x-1">
              {products.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || '#'}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    link.active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : link.url
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
