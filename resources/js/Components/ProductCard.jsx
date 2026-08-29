import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ShoppingCart, Eye, Check, Heart, Zap, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import { trackAddToCart } from '@/lib/tracking';

export default function ProductCard({ product, variant = 'standard' }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [actionToast, setActionToast] = useState('');

  const { wishlistIds = [], compareIds = [] } = usePage().props;
  const isWishlisted = (wishlistIds || []).includes(Number(product?.id));
  const isCompared = (compareIds || []).includes(Number(product?.id));

  const [wishlistActive, setWishlistActive] = useState(isWishlisted);
  const [compareActive, setCompareActive] = useState(isCompared);

  if (!product) return null;

  const currentPrice = Number(product.flash_price || product.price || 0);
  const regularPrice = Number(product.regular_price || 0);
  const savings = regularPrice > currentPrice ? regularPrice - currentPrice : 0;
  const isOutOfStock = product.stock <= 0 && !product.is_deal_of_day;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    trackAddToCart(product, 1);

    router.post('/cart/add', { product_id: product.id, quantity: 1 }, {
      preserveScroll: true,
      onSuccess: () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    trackAddToCart(product, 1);
    router.post('/cart/add', { product_id: product.id, quantity: 1 }, {
      preserveScroll: true,
      onSuccess: () => {
        router.visit('/checkout');
      }
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !wishlistActive;
    setWishlistActive(nextState);
    setActionToast(nextState ? '❤️ Added to Wishlist' : 'Removed from Wishlist');
    setTimeout(() => setActionToast(''), 2000);

    router.post('/wishlist/toggle', { product_id: product.id }, {
      preserveScroll: true,
    });
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !compareActive;
    setCompareActive(nextState);
    setActionToast(nextState ? '⚖️ Added to Compare' : 'Removed from Compare');
    setTimeout(() => setActionToast(''), 2000);

    router.post('/compare/add', { product_id: product.id }, {
      preserveScroll: true,
    });
  };

  // Parse key specifications
  const specsList = Array.isArray(product.key_specs)
    ? product.key_specs
    : (typeof product.key_specs === 'object' && product.key_specs !== null
      ? Object.entries(product.key_specs).map(([k, v]) => `${k}: ${v}`)
      : []);

  return (
    <>
      <div className="bg-white border border-gray-200 hover:shadow-md rounded-md overflow-hidden flex flex-col justify-between p-3 transition-shadow duration-200 group font-sans relative text-gray-800">
        
        {/* Floating Action Toast */}
        {actionToast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-2.5 py-1 bg-slate-900/95 text-white text-[10px] font-bold rounded-md shadow-md pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
            {actionToast}
          </div>
        )}

        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between min-h-[22px] mb-1.5">
          {savings > 0 ? (
            <span className="bg-[#0084ff] text-white font-bold text-[11px] px-2 py-0.5 rounded-sm inline-block shadow-2xs">
              Save: ৳{savings.toLocaleString()}
            </span>
          ) : (
            <div className="h-5"></div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                wishlistActive 
                  ? 'text-rose-500 bg-rose-50 hover:bg-rose-100' 
                  : 'text-gray-400 hover:text-rose-500 hover:bg-gray-100'
              }`}
              title={wishlistActive ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-4 h-4 transition-transform active:scale-125 ${wishlistActive ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={handleCompare}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                compareActive 
                  ? 'text-[#0084ff] bg-blue-50 hover:bg-blue-100' 
                  : 'text-gray-400 hover:text-[#0084ff] hover:bg-gray-100'
              }`}
              title={compareActive ? "Added to Compare" : "Add to Compare"}
            >
              <ArrowRightLeft className={`w-4 h-4 transition-transform active:scale-125 ${compareActive ? 'stroke-[2.5] text-[#0084ff]' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Image */}
        <Link 
          href={`/product/${product.slug}`} 
          className="block aspect-square w-full overflow-hidden p-2.5 flex items-center justify-center bg-white relative group"
        >
          <img
            src={product.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop'}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />

          {/* Official Warranty Badge */}
          <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-white/95 border border-blue-900/30 rounded px-1.5 py-0.5 text-[9px] font-black text-blue-900 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-blue-800" />
            <span>OFFICIAL</span>
          </div>
        </Link>

        {/* Product Details */}
        <div className="mt-2.5 flex-1 flex flex-col justify-between space-y-2.5">
          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="text-[13px] sm:text-[13.5px] font-bold text-gray-900 hover:text-blue-700 line-clamp-2 leading-snug transition-colors min-h-[36px]"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Price Row */}
          <div className="flex items-baseline space-x-2 pt-1.5 border-t border-gray-100">
            <span className="text-[15px] sm:text-[17px] font-black text-red-600">
              ৳{currentPrice.toLocaleString()}
            </span>
            {regularPrice > currentPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">
                ৳{regularPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Flash Sale Countdown Timer if variant === 'flash' */}
          {variant === 'flash' && (
            <div className="pt-1.5 pb-0.5">
              <div className="grid grid-cols-4 gap-1 text-center font-bold">
                <div className="bg-orange-50 border border-orange-200 rounded p-1 text-orange-600">
                  <span className="block text-xs font-black leading-tight">14</span>
                  <span className="block text-[8px] text-orange-400 font-bold uppercase">Days</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-1 text-orange-600">
                  <span className="block text-xs font-black leading-tight">07</span>
                  <span className="block text-[8px] text-orange-400 font-bold uppercase">Hours</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-1 text-orange-600">
                  <span className="block text-xs font-black leading-tight">33</span>
                  <span className="block text-[8px] text-orange-400 font-bold uppercase">Mins</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-1 text-orange-600">
                  <span className="block text-xs font-black leading-tight">24</span>
                  <span className="block text-[8px] text-orange-400 font-bold uppercase">Secs</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Row: Add to Cart & Buy Now */}
          <div className="pt-1">
            {variant === 'flash' ? (
              <Link
                href={`/product/${product.slug}`}
                className="w-full py-2.5 px-3 rounded-md bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>View Deal</span>
              </Link>
            ) : isOutOfStock ? (
              <button
                disabled
                className="w-full py-2 px-3 rounded-md bg-red-50 text-red-400 border border-red-200 text-xs font-bold cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-2 px-2.5 rounded-md text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0084ff] hover:bg-[#0070d6] text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-2 px-2.5 rounded-md bg-[#ff6a00] hover:bg-[#e55f00] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
