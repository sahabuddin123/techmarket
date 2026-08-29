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
  Camera, 
  Wrench, 
  Compass, 
  ArrowRight, 
  AlertCircle,
  HelpCircle
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#1c4289] selection:text-white">
      <Head>
        <title>404 - Page Not Found | TechMarket BD</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Sorry, the page or hardware you are looking for could not be found. Explore TechMarket BD for latest laptops, gaming computers and accessories." />
      </Head>

      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* ================= 404 HERO BANNER ================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 md:p-12 shadow-sm text-center relative overflow-hidden">
          
          {/* Subtle Background Glow Accent */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            
            {/* Big Graphic 404 Badge */}
            <div className="inline-flex items-center justify-center">
              <span className="text-7xl sm:text-9xl font-black tracking-tight bg-gradient-to-r from-[#1c4289] via-[#2563eb] to-[#ea580c] bg-clip-text text-transparent select-none drop-shadow-xs">
                404
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Oops! Looks like this page is off the grid.
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                The product, category, or link you're trying to reach doesn't exist, has been moved, or the URL was mistyped.
              </p>
            </div>

            {/* Smart Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto mt-4">
              <div className="relative flex items-center shadow-sm rounded-xl overflow-hidden border border-slate-300 focus-within:border-[#1c4289] focus-within:ring-2 focus-within:ring-[#1c4289]/20 transition-all bg-white">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for Laptops, GPUs, SSDs, Routers, CCTV..."
                  className="w-full pl-4 pr-28 py-3.5 text-sm text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-2 bg-[#1c4289] hover:bg-[#15326b] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Popular Shortcut Pills */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Popular Destinations
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {popularPills.map((pill, idx) => (
                  <Link
                    key={idx}
                    href={pill.url}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-[#1c4289] text-slate-700 hover:text-white border border-slate-200/80 transition-all duration-200"
                  >
                    {pill.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 bg-[#1c4289] hover:bg-[#15326b] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Back to Homepage</span>
              </Link>
              <Link
                href="/catalog"
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                <span>Browse All Products</span>
              </Link>
              <Link
                href="/pc-builder"
                className="px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>Custom PC Builder</span>
              </Link>
            </div>

          </div>
        </div>

        {/* ================= SMART PRODUCT RECOMMENDATIONS ================= */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <section className="mt-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#1c4289]" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Recommended For You & Trending Today
                </h2>
              </div>
              <Link 
                href="/catalog" 
                className="text-xs sm:text-sm font-bold text-[#1c4289] hover:text-[#ea580c] flex items-center gap-1 transition-colors"
              >
                <span>View More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
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
