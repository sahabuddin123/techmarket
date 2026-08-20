import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, 
  ShieldCheck, Truck, Sparkles, Tag, HelpCircle 
} from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart = { count: 0, total: 0, items: [] }, settings = {} } = usePage().props;
  const [updatingId, setUpdatingId] = useState(null);

  if (!isOpen) return null;

  const updateQty = (productId, newQty) => {
    if (newQty < 1) return;
    setUpdatingId(productId);
    router.post('/cart/update', { product_id: productId, quantity: newQty }, { 
      preserveScroll: true,
      onFinish: () => setUpdatingId(null)
    });
  };

  const removeItem = (productId) => {
    setUpdatingId(productId);
    router.post('/cart/remove', { product_id: productId }, { 
      preserveScroll: true,
      onFinish: () => setUpdatingId(null)
    });
  };

  const clearCart = () => {
    router.post('/cart/clear', {}, { preserveScroll: true });
  };

  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const itemCount = Number(cart?.count || cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0));
  const subtotal = Number(cart?.total || cartItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity || 1)), 0));

  return (
    <div className="storefront-v2-cart-drawer fixed inset-0 z-50 overflow-hidden font-sans select-none animate-in fade-in duration-200">
      {/* Backdrop with Subtle Blur */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen w-full sm:w-[440px] md:w-[460px] max-w-full sm:max-w-[460px] bg-[#f8fafc] text-slate-900 flex flex-col h-full shadow-2xl border-l border-slate-200/90 z-10 animate-in slide-in-from-right duration-300">
          
          {/* ========================================================================= */}
          {/* 1. STICKY HEADER (Deep Navy V2 Header) */}
          {/* ========================================================================= */}
          <div className="px-5 sm:px-6 py-4 bg-[#0b1a36] text-white flex items-center justify-between border-b border-blue-950 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-sky-400 shadow-xs shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-sm sm:text-base text-white tracking-tight truncate">
                    Your Shopping Cart
                  </h3>
                  <span className="bg-blue-600/30 border border-sky-400/30 text-sky-300 text-[11px] px-2.5 py-0.5 rounded-full font-black shrink-0">
                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                  {settings.cart_trust_text || '100% Genuine Tech with Official Warranty'}
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Close Shopping Cart Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. SLIM SERVICE / TRUST STRIP */}
          {/* ========================================================================= */}
          <div className="bg-white border-b border-slate-200/80 px-5 sm:px-6 py-2.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Fast Nationwide Courier Delivery</span>
            </div>
            <span className="text-[11px] font-extrabold text-blue-600 shrink-0">
              Safe & Tracked
            </span>
          </div>

          {/* ========================================================================= */}
          {/* 3. SCROLLABLE CART PRODUCT LIST */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3.5 sm:py-4 space-y-3 custom-scrollbar min-h-0">
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
                const itemPrice = Number(item.price || 0);
                const regPrice = Number(item.regular_price || itemPrice);
                const isUpdating = updatingId === item.id;
                const qty = Number(item.quantity) || 1;

                return (
                  <div 
                    key={item.id || item.product_id} 
                    className={`bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-blue-300 transition-all flex items-center gap-3.5 group relative ${
                      isUpdating ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {/* Fixed Size 72px Thumbnail Container */}
                    <Link
                      href={item.slug ? `/product/${item.slug}` : '/catalog'}
                      onClick={onClose}
                      className="rounded-xl border border-slate-100 bg-[#f8fafc] p-1 shrink-0 flex items-center justify-center overflow-hidden group-hover:border-blue-200 transition-colors"
                      style={{ width: '72px', height: '72px', minWidth: '72px', maxWidth: '72px', minHeight: '72px', maxHeight: '72px' }}
                    >
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150&auto=format&fit=crop'} 
                        alt={item.title}
                        style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                        className="group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </Link>

                    {/* Product Info & Controls */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1">
                      <Link
                        href={item.slug ? `/product/${item.slug}` : '/catalog'}
                        onClick={onClose}
                        className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug block"
                        title={item.title}
                      >
                        {item.title}
                      </Link>

                      {/* SKU / Metadata / Brand */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        {item.sku && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                            SKU: {item.sku}
                          </span>
                        )}
                        {item.brand_name && (
                          <span className="text-[10px] text-blue-600 font-bold">
                            {item.brand_name}
                          </span>
                        )}
                      </div>

                      {/* Pricing Row */}
                      <div className="flex items-baseline space-x-2 pt-0.5">
                        <span className="text-sm font-black text-blue-600 leading-none">
                          ৳{itemPrice.toLocaleString()}
                        </span>
                        {regPrice > itemPrice && (
                          <span className="text-xs text-slate-400 line-through font-bold">
                            ৳{regPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stepper & Action Controls */}
                      <div className="flex items-center justify-between pt-1">
                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-[#f8fafc] rounded-xl border border-slate-200 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            disabled={qty <= 1}
                            onClick={() => updateQty(item.id, qty - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-black text-slate-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, qty + 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total & Remove Trash Button */}
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs font-black text-slate-900">
                            ৳{(itemPrice * qty).toLocaleString()}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
                            title="Remove from Cart"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* ========================================================================= */
              /* 4. PREMIUM EMPTY CART STATE */
              /* ========================================================================= */
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">
                    Your Shopping Cart is Empty
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Looks like you haven't added any tech products yet. Explore our latest deals and authentic hardware.
                  </p>
                </div>
                <Link
                  href="/catalog"
                  onClick={onClose}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 group cursor-pointer"
                >
                  <span>Explore Tech Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 5. STICKY ORDER SUMMARY & CHECKOUT ACTIONS */}
          {/* ========================================================================= */}
          {cartItems.length > 0 && (
            <div className="px-5 sm:px-6 py-4 bg-white border-t border-slate-200/90 space-y-3.5 shadow-lg shrink-0">
              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider">Subtotal:</span>
                  <span className="text-lg font-black text-slate-900">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="bg-blue-50/80 border border-blue-100 rounded-xl px-3 py-2 text-[11px] text-blue-900 flex items-center justify-between font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>Shipping:</span>
                    <span className="font-bold">Calculated at checkout</span>
                  </div>
                  <div className="group relative cursor-help">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block w-52 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg text-center z-30 leading-tight">
                      Final delivery charge will be calculated based on delivery location and shipment details.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Clear Cart + Proceed to Checkout */}
              <div className="flex items-center gap-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs font-extrabold transition-colors cursor-pointer shrink-0"
                  title="Clear all cart items"
                >
                  Clear
                </button>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-3.5 px-5 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Continue Shopping Action */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  or Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
