import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ShoppingCart, Check, Heart, Eye } from 'lucide-react';
import QuickViewModal from '@/Components/QuickViewModal';
import { trackAddToCart } from '@/lib/tracking';

export default function ProductCardV3({ product }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentPrice = Number(product.flash_price || product.price || 0);
  const regularPrice = Number(product.regular_price || 0);
  const discountPercent = (regularPrice > currentPrice && regularPrice > 0)
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : (product.discount_percent || 0);

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

  return (
    <>
      <div className="storefront-v3-product-card bg-white border border-slate-100 hover:border-[#0153FD]/40 rounded-[20px] p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_25px_rgba(1,83,253,0.12)] hover:-translate-y-1 group relative font-sans">
        
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between z-10 w-full mb-1 min-h-[24px]">
          {discountPercent > 0 ? (
            <span className="bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleWishlist}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-2xs"
              title="Add to Wishlist"
              aria-label="Add to Wishlist"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-[#0153FD] flex items-center justify-center transition-colors shadow-2xs"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Image */}
        <Link
          href={`/product/${product.slug}`}
          className="block aspect-square w-full rounded-xl p-2 flex items-center justify-center overflow-hidden my-2"
        >
          <img
            src={product.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop'}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Info & Price */}
        <div className="flex flex-col justify-between flex-1 mt-1">
          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="font-medium text-xs sm:text-[13px] text-slate-900 hover:text-[#0153FD] transition-colors line-clamp-2 leading-tight min-h-[32px] mb-2"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Pricing Row */}
          <div className="flex items-center space-x-2 mb-3">
            {regularPrice > currentPrice && (
              <span className="text-xs text-slate-400 line-through">
                {regularPrice.toLocaleString()}৳
              </span>
            )}
            <span className="text-sm sm:text-base font-bold text-[#0153FD]">
              {currentPrice.toLocaleString()}৳
            </span>
          </div>

          {/* TechJhuli Full-Width Blue Pill "Add To Cart" Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || added}
            className={`w-full py-2 px-4 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer shadow-xs ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#0153FD] hover:bg-[#0042cf] active:scale-98 text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Added</span>
              </>
            ) : (
              <span>Add To Cart</span>
            )}
          </button>
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
