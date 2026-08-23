import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Home, Tag, Monitor, User, Menu, X, Heart, 
  GitCompare, ShoppingCart, Star, Flame, Sparkles, 
  MapPin, Wrench, BookOpen 
} from 'lucide-react';

import MobileBottomNavV3 from '@/Pages/Storefront/Version3/Components/MobileBottomNavV3';

export default function MobileBottomNav({ onOpenCart }) {
  const page = usePage();
  const currentUrl = page.url || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const { auth = {}, cart = { count: 0, total: 0 }, settings = {}, storefront_version } = page.props || {};
  const version = storefront_version || settings.storefront_version || 'v1';

  if (version === 'v3') {
    return <MobileBottomNavV3 onOpenCart={onOpenCart} />;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', icon: Home, active: currentUrl === '/' || currentUrl === '' },
    { label: 'Offers', href: '/offers', icon: Tag, active: currentUrl.startsWith('/offers') },
    { label: 'PC Builder', href: '/pc-builder', icon: Monitor, active: currentUrl.startsWith('/pc-builder') },
    { 
      label: 'Account', 
      href: auth?.user ? (auth.user.role === 'admin' ? '/admin' : '/profile') : '/login', 
      icon: User, 
      active: currentUrl.startsWith('/profile') || currentUrl.startsWith('/login') || currentUrl.startsWith('/register') || currentUrl.startsWith('/admin')
    },
  ];

  return (
    <>
      {/* FIXED MOBILE BOTTOM NAVIGATION BAR (Exact TechLand UI) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#002a5c] border-t border-blue-950/80 shadow-2xl select-none">
        <div className="grid grid-cols-5 h-14 text-center items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.label === 'Account' && !auth?.user) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'login' } }));
                  }
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive ? 'text-[#3b82f6]' : 'text-white/80 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* 5th Button: Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              isMenuOpen ? 'text-[#3b82f6]' : 'text-white/80 hover:text-white'
            }`}
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-5 h-5 stroke-2" />
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* QUICK MENU DRAWER (Exact TechLand Screenshot 5) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden overflow-hidden select-none">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Right Slide-in Panel */}
          <div className="fixed inset-y-0 right-0 max-w-[280px] w-full bg-[#0f172a] text-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-250 border-l border-slate-800">
            {/* Header */}
            <div className="p-4 bg-[#002a5c] flex items-center justify-between border-b border-blue-900 shadow-sm">
              <h3 className="font-extrabold text-base tracking-tight text-white">Menu</h3>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 text-xs font-semibold text-slate-200">
              <Link
                href="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <Heart className="w-4 h-4 text-slate-400" />
                <span>Wishlist</span>
              </Link>

              <Link
                href="/compare"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <GitCompare className="w-4 h-4 text-slate-400" />
                <span>Compare</span>
              </Link>

              <Link
                href="/cart"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onOpenCart) onOpenCart();
                }}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <ShoppingCart className="w-4 h-4 text-slate-400" />
                  <span>Cart</span>
                </div>
                {cart.count > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {cart.count}
                  </span>
                )}
              </Link>

              <Link
                href="/catalog?filter=featured"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <Star className="w-4 h-4 text-amber-400" />
                <span>Featured Products</span>
              </Link>

              <Link
                href="/catalog?filter=best_seller"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Best Sellers</span>
              </Link>

              <Link
                href="/catalog?filter=latest"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Latest Products</span>
              </Link>

              <Link
                href="/offers"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Offers & Deals</span>
              </Link>

              <Link
                href="/about-us"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Find Store</span>
              </Link>

              <Link
                href="/pc-builder"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Tools</span>
              </Link>

              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/60 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Blog</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
