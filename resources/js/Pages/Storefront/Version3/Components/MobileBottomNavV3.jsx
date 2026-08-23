import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Home, Store, ShoppingBag, User } from 'lucide-react';

export default function MobileBottomNavV3({ onOpenCart }) {
  const { auth, cart = { count: 0 } } = usePage().props;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] font-sans select-none">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            currentPath === '/' ? 'text-[#0153FD]' : 'text-slate-500 hover:text-[#0153FD]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        {/* Shop */}
        <Link
          href="/catalog"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            currentPath.startsWith('/catalog') ? 'text-[#0153FD]' : 'text-slate-500 hover:text-[#0153FD]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Shop</span>
        </Link>

        {/* Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold text-slate-500 hover:text-[#0153FD] transition-colors cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cart.count > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#0153FD] text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                {cart.count}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* Account */}
        <Link
          href={auth?.user ? '/account/profile' : '/login'}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            currentPath.startsWith('/account') || currentPath.startsWith('/login') ? 'text-[#0153FD]' : 'text-slate-500 hover:text-[#0153FD]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Account</span>
        </Link>
      </div>
    </div>
  );
}
