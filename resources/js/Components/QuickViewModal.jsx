import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { X, ShoppingCart, Check, ShieldCheck, Zap, ArrowRight, Heart, ArrowRightLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { trackAddToCart } from '@/lib/tracking';

export default function QuickViewModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const currentPrice = Number(product.flash_price || product.price || 0);
  const regularPrice = Number(product.regular_price || 0);
  const savings = regularPrice > currentPrice ? regularPrice - currentPrice : 0;
  const isOutOfStock = product.stock <= 0 && !product.is_deal_of_day;

  // Key specs formatting
  const specsList = Array.isArray(product.key_specs)
    ? product.key_specs
    : (typeof product.key_specs === 'object' && product.key_specs !== null
      ? Object.entries(product.key_specs).map(([k, v]) => `${k}: ${v}`)
      : []);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    trackAddToCart(product, quantity);

    router.post('/cart/add', { product_id: product.id, quantity }, {
      preserveScroll: true,
      onSuccess: () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setBuyingNow(true);
    trackAddToCart(product, quantity);

    router.post('/cart/add', { product_id: product.id, quantity }, {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        router.visit('/checkout');
      },
      onError: () => {
        setBuyingNow(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:p-0">
        
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-xs" 
          onClick={onClose} 
          aria-hidden="true"
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Window */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl lg:max-w-4xl sm:w-full relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 cursor-pointer shadow-2xs"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left Column: Product Image & Badges (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full aspect-square bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden group">
                
                {savings > 0 && (
                  <span className="absolute top-3 left-3 bg-[#0084ff] text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-2xs z-10">
                    Save: ৳{savings.toLocaleString()}
                  </span>
                )}

                <img
                  src={product.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop'}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 border border-blue-900/30 rounded-md px-2 py-1 text-[10px] font-black text-blue-900 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
                  <span>100% OFFICIAL</span>
                </div>
              </div>

              {/* Stock Status Badge */}
              <div className="w-full mt-3 flex items-center justify-between px-1 text-xs">
                <span className="text-slate-500 font-medium">Availability:</span>
                {isOutOfStock ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-bold text-[11px] border border-red-200">
                    Out of Stock
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    In Stock ({product.stock} units)
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Product Info & Actions (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              
              <div>
                {/* Category / Brand Breadcrumb */}
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {product.brand?.name && (
                    <span className="text-[#0084ff] font-extrabold">{product.brand.name}</span>
                  )}
                  {product.brand?.name && product.category?.name && <span>•</span>}
                  {product.category?.name && (
                    <span className="text-slate-600">{product.category.name}</span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug font-heading">
                  {product.title}
                </h2>

                {/* SKU & Warranty info */}
                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
                  {product.sku && (
                    <span>SKU: <strong className="text-slate-800 font-mono">{product.sku}</strong></span>
                  )}
                  <span>Warranty: <strong className="text-slate-800">{product.warranty || 'Official Warranty'}</strong></span>
                </div>

                {/* Price Box */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Special Cash Price</span>
                    <div className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                      ৳{currentPrice.toLocaleString()}
                    </div>
                  </div>
                  {regularPrice > currentPrice && (
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase block">Regular Price</span>
                      <span className="text-base text-slate-400 line-through font-semibold font-mono">
                        ৳{regularPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Key Specifications Highlights */}
                {specsList.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0084ff]" />
                      <span>Key Highlights</span>
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {specsList.slice(0, 6).map((spec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 bg-slate-50/70 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0084ff] mt-1.5 shrink-0" />
                          <span className="leading-tight text-[11.5px]">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quantity and Action Buttons */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center justify-center border border-slate-300 rounded-xl bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-black text-slate-900 font-mono">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={isOutOfStock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0084ff] hover:bg-[#0070d6] text-white'
                    }`}
                  >
                    {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    <span>{added ? 'ADDED TO CART!' : 'ADD TO CART'}</span>
                  </button>

                  {/* Buy Now */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || buyingNow}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-[#ff6a00] hover:bg-[#e55f00] text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>{buyingNow ? 'Processing...' : 'BUY NOW'}</span>
                  </button>

                </div>

                {/* View Full Product Details Link */}
                <div className="pt-2 text-center">
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084ff] hover:text-blue-700 hover:underline transition-colors"
                  >
                    <span>View Full Product Specifications & Warranty Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
