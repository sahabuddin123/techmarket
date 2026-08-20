import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ShoppingCart, ShoppingBag, Eye, Check, Heart, ArrowRightLeft, Star } from 'lucide-react';
import QuickViewModal from '@/Components/QuickViewModal';
import { trackAddToCart } from '@/lib/tracking';

export default function ProductCardV2({ product, variant = 'standard' }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentPrice = Number(product.flash_price || product.price || 0);
  const regularPrice = Number(product.regular_price || 0);
  const savings = regularPrice > currentPrice ? regularPrice - currentPrice : 0;
  const isOutOfStock = product.stock <= 0 && !product.is_deal_of_day;

  // Determine badge
  let badge = null;
  if (product.is_featured) badge = { text: 'FEATURED', bg: 'bg-blue-600' };
  if (product.is_deal_of_day) badge = { text: 'HOT DEAL', bg: 'bg-amber-600' };
  if (savings > 0) badge = { text: 'SALE', bg: 'bg-rose-500' };
  if (product.created_at && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
    badge = badge || { text: 'NEW', bg: 'bg-blue-600' };
  }

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

  return (
    <>
      <div className="storefront-v2-product-card bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between p-3.5 group relative font-sans">
        
        {/* Top Badges & Floating Action Icons */}
        <div className="flex items-center justify-between z-10 mb-2">
          {badge ? (
            <span className={`${badge.bg} text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs`}>
              {badge.text}
            </span>
          ) : (
            <span />
          )}

          {/* Quick Actions (Wishlist, Compare, Quick View) */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleWishlist}
              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-2xs"
              title="Add to Wishlist"
              aria-label="Add to Wishlist"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCompare}
              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors shadow-2xs"
              title="Add to Compare"
              aria-label="Add to Compare"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Image Area */}
        <Link 
          href={`/product/${product.slug}`} 
          className="block aspect-square w-full rounded-xl bg-slate-50/70 p-3 flex items-center justify-center relative overflow-hidden group/img"
        >
          <img
            src={product.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop'}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover/img:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Product Info & Pricing */}
        <div className="pt-3 flex flex-col justify-between flex-1">
          {/* Brand or Category tag */}
          {product.brand?.name && (
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 truncate block">
              {product.brand.name}
            </span>
          )}

          {/* Product Title */}
          <Link 
            href={`/product/${product.slug}`}
            className="font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2.5"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Price & Cart Button Row */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 mt-auto">
            <div>
              <div className="text-sm sm:text-base font-black text-blue-600 tracking-tight">
                ৳{currentPrice.toLocaleString()}
              </div>
              {regularPrice > currentPrice && (
                <div className="text-[11px] text-slate-400 line-through -mt-0.5">
                  ৳{regularPrice.toLocaleString()}
                </div>
              )}
            </div>

            {/* Add to Cart Quick Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || added}
              aria-label="Add to cart"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                added
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 hover:border-blue-600'
              }`}
            >
              {added ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal
          isOpen={quickViewOpen}
          product={product}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
}
