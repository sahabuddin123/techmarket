import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import ProductCard from '@/Components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export default function Wishlist() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Head title="My Wishlist - TechMarket BD" />

      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
          <Heart className="w-6 h-6 text-rose-500 fill-current" />
          <span>MY SAVED WISHLIST HARDWARE</span>
        </h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4">
          <Heart className="w-16 h-16 stroke-1 text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-white">Your Wishlist is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Explore our tech catalog and click the heart icon on product cards to save items to your wishlist.</p>
          <Link href="/catalog" className="inline-block bg-[#1c4289] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-md">
            Browse Store Catalog
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
