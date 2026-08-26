import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { Heart, ShoppingBag, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

export default function Wishlist() {
  const { settings = {} } = usePage().props;
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="storefront-v3 min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col selection:bg-[#0153FD] selection:text-white">
      <Head title={`My Wishlist - ${settings.site_name || 'TechMarket BD'}`} />

      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Breadcrumb Header */}
      <div className="w-full bg-white border-b border-slate-100 py-2.5">
        <div className="max-w-[1640px] mx-auto px-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#0153FD] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate">My Wishlist</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>FAVORITE ITEMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Saved Wishlist
          </h1>
        </div>

        <div className="bg-white border border-[#8BB1FF]/70 rounded-[24px] p-10 sm:p-14 text-center text-slate-500 space-y-5 shadow-[0_0_20px_rgba(202,224,255,0.6)]">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs border border-rose-100">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Your Wishlist is currently empty</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Explore our tech catalog and click the heart icon on any gadget to save items for future purchases.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center space-x-2 bg-[#0153FD] hover:bg-[#0042cf] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
