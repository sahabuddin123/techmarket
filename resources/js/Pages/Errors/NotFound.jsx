import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import ProductCard from '@/Components/ProductCard';
import { 
  Search, 
  Home, 
  ShoppingBag, 
  Cpu, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function NotFound({
  recommendedProducts = [],
  topCategories = [],
  requestedPath = '',
  settings = {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.get('/catalog', { search: searchQuery.trim() });
    }
  };

  const popularPills = [
    { label: 'Gaming Laptops', url: '/catalog?category=laptops' },
    { label: 'Processors & CPUs', url: '/catalog?category=processor' },
    { label: 'Graphics Cards', url: '/catalog?category=graphics-card' },
    { label: 'CCTV & Security', url: '/cctv-estimator' },
    { label: 'PC Builder Tool', url: '/pc-builder' },
    { label: 'Special Offers', url: '/offers' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans selection:bg-[#0084ff] selection:text-white">
      <Head>
        <title>404 - Page Not Found | TechMarket BD</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Sorry, the page or hardware you are looking for could not be found. Explore TechMarket BD for latest laptops, gaming computers and accessories." />
      </Head>

      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Main Container Perfectly Aligned with Storefront Layout */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* ================= 404 HERO HERO CARD ================= */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 sm:p-12 text-center relative overflow-hidden">
          
          {/* Subtle Modern Ambient Lighting */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            
            {/* Big Gradient 404 Title */}
            <div className="space-y-1">
              <h1 className="text-8xl sm:text-9xl font-black tracking-tight leading-none bg-gradient-to-r from-[#0084ff] via-[#2563eb] to-[#ea580c] bg-clip-text text-transparent select-none drop-shadow-2xs">
                404
              </h1>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
                Oops! Looks like this page is off the grid.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto pt-1 leading-relaxed">
                The product, category, or link you are trying to reach doesn't exist, has been moved, or the URL was mistyped.
              </p>
            </div>

            {/* Centered Integrated Search Form */}
            <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto w-full pt-2">
              <div className="relative flex items-center bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-300 focus-within:border-[#0084ff] focus-within:ring-3 focus-within:ring-[#0084ff]/15 rounded-xl shadow-2xs transition-all">
                <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for Laptops, GPUs, SSDs, Routers, CCTV..."
                  className="w-full pl-3 pr-24 py-3 text-sm text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-2 bg-[#0084ff] hover:bg-[#0070d6] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Popular Shortcut Pills */}
            <div className="pt-2 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Popular Destinations
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {popularPills.map((pill, idx) => (
                  <Link
                    key={idx}
                    href={pill.url}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100/90 hover:bg-[#0084ff] text-slate-700 hover:text-white border border-slate-200 transition-all duration-150"
                  >
                    {pill.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="px-6 py-2.5 bg-[#0084ff] hover:bg-[#0070d6] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Back to Homepage</span>
              </Link>
              <Link
                href="/catalog"
                className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                <span>Browse All Products</span>
              </Link>
              <Link
                href="/pc-builder"
                className="px-6 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>Custom PC Builder</span>
              </Link>
            </div>

          </div>
        </div>

        {/* ================= SMART PRODUCT RECOMMENDATIONS ================= */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0084ff] flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Recommended For You & Trending Today
                  </h2>
                  <p className="text-xs text-slate-500">Handpicked top deals and trending hardware you might like</p>
                </div>
              </div>
              <Link 
                href="/catalog" 
                className="text-xs sm:text-sm font-bold text-[#0084ff] hover:text-[#ea580c] flex items-center gap-1.5 transition-colors group"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* High Density Storefront Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {recommendedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
