import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import ProductCard from '@/Components/ProductCard';
import { Heart, ShoppingBag, ArrowRight, ChevronRight, Sparkles, Trash2 } from 'lucide-react';

export default function Wishlist({ wishlists = [], products = [] }) {
  const { settings = {} } = usePage().props;
  const [cartOpen, setCartOpen] = useState(false);

  // Extract products from either products array or wishlists items
  const productList = (products && products.length > 0)
    ? products
    : (wishlists && wishlists.length > 0)
    ? wishlists.map(w => w.product).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-[#0084ff] selection:text-white">
      <Head title={`My Wishlist (${productList.length}) - ${settings.site_name || 'TechMarket BD'}`} />

      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Breadcrumb Header */}
      <div className="w-full bg-white border-b border-slate-200/90 py-3">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#0084ff] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate">My Wishlist</span>
          </div>
          <div className="text-slate-500 text-xs font-semibold">
            <span>{productList.length} Saved {productList.length === 1 ? 'Item' : 'Items'}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-[11px] font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>SAVED HARDWARE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              My Saved Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your personal collection of saved tech hardware, gaming rigs, and accessories.
            </p>
          </div>

          {productList.length > 0 && (
            <Link
              href="/catalog"
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <span>Continue Shopping</span>
            </Link>
          )}
        </div>

        {/* Content Area */}
        {productList.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-10 sm:p-14 text-center text-slate-500 space-y-5 shadow-2xs">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs border border-rose-100">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Your Wishlist is currently empty</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Explore our tech catalog and click the heart icon on any gadget or component to save items for future purchases.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center space-x-2 bg-[#0084ff] hover:bg-[#0070d6] text-white font-extrabold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {productList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
