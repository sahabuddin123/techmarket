import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { Search, ChevronRight, Sparkles, Tag, ArrowRight } from 'lucide-react';

export default function BrandsIndex({ brands = [], featuredBrands = [], filters = {} }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const currentLetter = filters.letter || 'all';

  const alphabet = ['all', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/brands', { search: searchTerm, letter: currentLetter !== 'all' ? currentLetter : undefined }, { preserveState: true });
  };

  const handleLetterSelect = (letter) => {
    router.get('/brands', { search: searchTerm || undefined, letter: letter !== 'all' ? letter : undefined }, { preserveState: true });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Head title="All Brands Directory - TechMarket BD" />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 text-xs py-2.5">
        <div className="max-w-[1440px] mx-auto px-4 flex items-center space-x-2 text-slate-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">Brands Directory</span>
        </div>
      </div>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8 space-y-8">
        {/* Header Title & Search */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start space-x-2">
              <Tag className="w-6 h-6 text-blue-600" />
              <span>Official Hardware Brands</span>
            </h1>
            <p className="text-xs text-slate-500">
              Browse authentic IT, computer component, gaming, and lifestyle brands with official manufacturer warranty.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brand by name..."
              className="w-full pl-9 pr-20 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Alphabet Navigation Bar */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold">
          {alphabet.map((letter) => {
            const isSelected = currentLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => handleLetterSelect(letter)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center uppercase transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Featured Brands Row */}
        {featuredBrands.length > 0 && currentLetter === 'all' && !searchTerm && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-black text-slate-900 uppercase tracking-tight">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Featured Official Partners</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {featuredBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col items-center justify-center text-center space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="font-black text-slate-600 text-sm font-mono">{brand.name.substring(0, 3).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Brands Grid */}
        <div className="space-y-4">
          <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
            All Brands ({brands.length})
          </div>

          {brands.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
              <Tag className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-800">No brands found</div>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or letter filter.</p>
              <button
                onClick={() => router.get('/brands')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="w-full h-16 bg-slate-50 rounded-lg flex items-center justify-center p-3 group-hover:bg-blue-50/50 transition-colors">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="font-black text-slate-700 text-sm">{brand.name}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {brand.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{brand.products_count || 0} Products</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
