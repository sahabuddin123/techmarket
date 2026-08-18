import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ShoppingCart, Eye, Check, Heart, Zap, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import { trackAddToCart } from '@/lib/tracking';

export default function ProductCard({ product, variant = 'standard' }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

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

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.post('/wishlist/toggle', { product_id: product.id }, { preserveScroll: true });
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.post('/compare/add', { product_id: product.id }, { preserveScroll: true });
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
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between min-h-[20px] mb-1">
          {savings > 0 ? (
            <span className="bg-[#00897b] text-white font-bold text-[10px] px-2 py-0.5 rounded-sm inline-block">
              Save: ৳{savings.toLocaleString()}
            </span>
          ) : (
            <div className="h-4"></div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-gray-100 transition-colors"
              title="Add to Wishlist"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCompare}
              className="p-1 rounded text-gray-400 hover:text-[#0088cc] hover:bg-gray-100 transition-colors"
              title="Add to Compare"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              title="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Image */}
        <Link 
          href={`/product/${product.slug}`} 
          className="block aspect-square w-full overflow-hidden p-2 flex items-center justify-center bg-white relative group"
        >
          <img
            src={product.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop'}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-104 transition-transform duration-200"
            loading="lazy"
          />

          {/* Official Warranty Badge */}
          <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-white/90 border border-blue-900/40 rounded px-1 py-0.5 text-[8px] font-black text-blue-900 shadow-xs">
            <ShieldCheck className="w-2.5 h-2.5 text-blue-800" />
            <span>OFFICIAL</span>
          </div>
        </Link>

        {/* Product Details */}
        <div className="mt-2 flex-1 flex flex-col justify-between space-y-2">
          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="text-xs font-bold text-gray-900 hover:text-blue-700 line-clamp-2 leading-snug transition-colors min-h-[32px]"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Price Row */}
          <div className="flex items-baseline space-x-2 pt-1 border-t border-gray-100">
            <span className="text-sm font-black text-red-600">
              ৳{currentPrice.toLocaleString()}
            </span>
            {regularPrice > currentPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                ৳{regularPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Flash Sale Countdown Timer if variant === 'flash' */}
          {variant === 'flash' && (
            <div className="pt-1.5 pb-0.5">
              <div className="grid grid-cols-4 gap-1 text-center font-bold">
                <div className="bg-orange-50 border border-orange-200 rounded p-0.5 text-orange-600">
                  <span className="block text-[11px] font-black leading-tight">14</span>
                  <span className="block text-[8px] text-orange-400 font-semibold uppercase">Days</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-0.5 text-orange-600">
                  <span className="block text-[11px] font-black leading-tight">07</span>
                  <span className="block text-[8px] text-orange-400 font-semibold uppercase">Hours</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-0.5 text-orange-600">
                  <span className="block text-[11px] font-black leading-tight">33</span>
                  <span className="block text-[8px] text-orange-400 font-semibold uppercase">Mins</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-0.5 text-orange-600">
                  <span className="block text-[11px] font-black leading-tight">24</span>
                  <span className="block text-[8px] text-orange-400 font-semibold uppercase">Secs</span>
                </div>
              </div>
            </div>
          )}

          {/* Single Full-Width Action Button (Exact Reference UI) */}
          <div className="pt-1.5">
            {variant === 'flash' ? (
              <Link
                href={`/offers/flash-sale/${product.slug}`}
                className="w-full py-2 px-3 rounded-md bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
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
              <Link
                href={`/product/${product.slug}`}
                className="w-full py-2 px-3 rounded-md bg-[#1c2434] hover:bg-[#0f172a] text-white text-xs font-bold flex items-center justify-center transition-colors text-center shadow-xs"
              >
                View Details
              </Link>
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
