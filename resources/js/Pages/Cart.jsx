import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, 
  Lock, Tag, Star, AlertCircle, CheckCircle2, X
} from 'lucide-react';

export default function Cart(props) {
  // Normalize incoming props with complete defensive null-safety
  const rawCart = Array.isArray(props?.cart) ? props.cart : [];
  const summary = props?.summary || {
    subtotal: 0,
    discount: 0,
    total: 0,
    item_count: 0,
    coupon: null,
    points: null,
    available_points: 0,
  };
  const { errors = {}, flash = {} } = usePage().props;

  // Component UI State
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [pointsInput, setPointsInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isApplyingPoints, setIsApplyingPoints] = useState(false);

  // Cart Calculations
  const itemCount = summary.item_count || rawCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const rawSubtotal = summary.subtotal || rawCart.reduce((sum, item) => sum + ((item.regular_price || item.price) * (item.quantity || 1)), 0);
  const totalDiscount = summary.discount || rawCart.reduce((sum, item) => sum + ((item.savings || 0) * (item.quantity || 1)), 0);
  const grandTotal = summary.total || Math.max(0, rawSubtotal - totalDiscount);

  // Quantity Controls
  const updateQty = (productId, newQty) => {
    if (newQty < 1) return;
    router.post('/cart/update', { product_id: productId, quantity: newQty }, { 
      preserveScroll: true,
      preserveState: true,
    });
  };

  // Remove Single Item
  const removeItem = (productId) => {
    router.post('/cart/remove', { product_id: productId }, { 
      preserveScroll: true,
      preserveState: true,
    });
  };

  // Clear All Items
  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your shopping cart?')) {
      router.post('/cart/clear', {}, { 
        preserveScroll: true,
        preserveState: true,
      });
    }
  };

  // Handle Apply Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    router.post('/cart/coupon', { code: couponCode }, {
      preserveScroll: true,
      onFinish: () => {
        setIsApplyingCoupon(false);
        setCouponCode('');
      }
    });
  };

  // Handle Remove Coupon
  const handleRemoveCoupon = () => {
    router.delete('/cart/coupon', { preserveScroll: true });
  };

  // Handle Apply Reward Points
  const handleApplyPoints = (e) => {
    e.preventDefault();
    const pts = parseInt(pointsInput, 10);
    if (isNaN(pts) || pts <= 0) return;
    setIsApplyingPoints(true);
    router.post('/cart/points', { points: pts }, {
      preserveScroll: true,
      onFinish: () => {
        setIsApplyingPoints(false);
        setPointsInput('');
      }
    });
  };

  // Handle Remove Points
  const handleRemovePoints = () => {
    router.delete('/cart/points', { preserveScroll: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#333] font-sans flex flex-col selection:bg-[#002a5c] selection:text-white">
      <Head title={`Shopping Cart (${itemCount}) | TechMarket BD`} />

      {/* 1. GLOBAL HEADER & MEGA MENU */}
      <Navbar onOpenCart={() => setIsCartDrawerOpen(true)} />
      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />

      {/* MAIN CONTAINER (Centered approx 1240px wide) */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-2.5 sm:px-4 py-4 space-y-3">
        
        {/* Flash Message or Error Alerts */}
        {flash?.message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] p-2.5 rounded-[3px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{flash.message}</span>
          </div>
        )}

        {errors?.coupon && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[12px] p-2.5 rounded-[3px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.coupon}</span>
          </div>
        )}

        {errors?.points && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[12px] p-2.5 rounded-[3px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.points}</span>
          </div>
        )}

        {rawCart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* ================= LEFT COLUMN: SHOPPING CART AREA (approx 72% / 8 cols) ================= */}
            <div className="lg:col-span-8 space-y-3">
              <div className="bg-white rounded-[3px] border border-[#d9dee7] p-4 sm:p-5 shadow-2xs">
                
                {/* Header: Shopping Cart (X items) on left, Clear All on right */}
                <div className="flex items-center justify-between pb-3 border-b border-[#eee]">
                  <h1 className="text-[15px] sm:text-[16px] font-bold text-[#111]">
                    Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </h1>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[#d32f2f] hover:underline text-[12px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-[#eee]">
                  {rawCart.map((item) => {
                    const price = Number(item.price || 0);
                    const regularPrice = Number(item.regular_price || price);
                    const savings = regularPrice > price ? regularPrice - price : 0;
                    const qty = item.quantity || 1;

                    return (
                      <div
                        key={item.id}
                        className="py-3.5 first:pt-3 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        {/* Left Thumbnail & Center Info */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Thumbnail */}
                          <Link
                            href={`/product/${item.slug}`}
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-[#eee] rounded-[2px] p-1 flex items-center justify-center shrink-0 overflow-hidden"
                          >
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&auto=format&fit=crop'}
                              alt={item.title}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </Link>

                          {/* Info */}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-[13px] sm:text-[14px] font-semibold text-[#111] hover:text-[#0066cc] transition-colors line-clamp-2 leading-snug"
                              title={item.title}
                            >
                              {item.title}
                            </Link>

                            {/* Sub-meta: Brand & SKU */}
                            <div className="text-[11px] text-[#777] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              {item.brand_name && (
                                <span>Brand: <strong className="text-[#444] font-medium">{item.brand_name}</strong></span>
                              )}
                              {item.brand_name && item.sku && <span className="text-[#ccc]">|</span>}
                              {item.sku && (
                                <span>Model: <strong className="text-[#444] font-medium">{item.sku}</strong></span>
                              )}
                            </div>

                            {/* Price Line: Current Price + Strikethrough Regular Price + Save Badge */}
                            <div className="flex flex-wrap items-baseline gap-1.5 pt-0.5">
                              <span className="text-[15px] sm:text-[16px] font-bold text-[#d32f2f]">
                                ৳{price.toLocaleString()}
                              </span>

                              {regularPrice > price && (
                                <span className="text-[12px] text-[#999] line-through">
                                  ৳{regularPrice.toLocaleString()}
                                </span>
                              )}

                              {savings > 0 && (
                                <span className="bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] font-bold text-[10px] px-1.5 py-0.2 rounded-[2px] inline-block">
                                  Save: ৳{savings.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Quantity Control & Remove */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                          {/* Quantity Selector: [ − ] [ qty ] [ + ] */}
                          <div className="flex items-center border border-[#cbd5e1] rounded-[2px] bg-white">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, qty - 1)}
                              className="px-2 py-1 text-[#666] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                              aria-label="Decrease Quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-[12px] font-bold text-[#111]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, qty + 1)}
                              className="px-2 py-1 text-[#666] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                              aria-label="Increase Quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove Action */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[#d32f2f] hover:underline text-[11px] font-medium flex items-center gap-1 mt-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Shopping Link */}
              <Link
                href="/shop"
                className="text-[12px] text-[#002a5c] font-semibold hover:underline flex items-center gap-1 mt-3 inline-block"
              >
                <ArrowLeft className="w-3.5 h-3.5 inline" />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* ================= RIGHT COLUMN: ORDER SUMMARY (approx 28% / 4 cols) ================= */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-white rounded-[3px] border border-[#d9dee7] p-4 sm:p-5 space-y-3.5 shadow-2xs">
                
                {/* Header */}
                <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] pb-2 border-b border-[#eee]">
                  Order Summary
                </h2>

                {/* Breakdown Rows */}
                <div className="space-y-2 text-[12px]">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-[#555]">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-bold text-[#111]">
                      ৳{rawSubtotal.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Discount (Includes Product Sale Savings + Coupons + Points) */}
                  {totalDiscount > 0 && (
                    <div className="flex justify-between items-center text-[#555]">
                      <span>Discount</span>
                      <span className="font-bold text-[#2e7d32]">
                        - ৳{totalDiscount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between items-center text-[#555]">
                    <span>Shipping</span>
                    <span className="text-[#888]">Calculated later</span>
                  </div>

                  {/* Total Divider */}
                  <div className="pt-2 border-t border-[#eee] flex justify-between items-baseline">
                    <span className="text-[13px] font-bold text-[#111]">Total</span>
                    <span className="text-[18px] sm:text-[20px] font-black text-[#002a5c]">
                      ৳{grandTotal.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* PROMO CODE SECTION */}
                <div className="pt-2 border-t border-[#eee] space-y-1.5">
                  <span className="text-[12px] font-bold text-[#333] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#002a5c]" />
                    <span>Promo Code</span>
                  </span>

                  {summary.coupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-[2px] text-[11px]">
                      <div>
                        <span className="font-bold text-emerald-800">{summary.coupon.code}</span>
                        <span className="text-emerald-600 block">
                          -৳{Number(summary.coupon.discount).toLocaleString()} discount applied
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-rose-600 hover:text-rose-800 p-0.5"
                        title="Remove Promo Code"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#333] uppercase"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="bg-[#002a5c] hover:bg-[#1c4289] text-white text-[12px] font-bold px-4 py-1.5 rounded-[2px] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}
                </div>

                {/* REWARD POINTS SECTION */}
                <div className="pt-2 border-t border-[#eee] space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] font-bold text-[#333]">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>Reward Points</span>
                    </span>
                    <span className="text-[11px] font-normal text-[#666]">
                      Available: <strong className="text-[#111]">{summary.available_points || 0}</strong>
                    </span>
                  </div>

                  {summary.points ? (
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-[2px] text-[11px]">
                      <div>
                        <span className="font-bold text-amber-900">{summary.points.points} Points</span>
                        <span className="text-amber-700 block">
                          -৳{Number(summary.points.discount).toLocaleString()} discount applied
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePoints}
                        className="text-rose-600 hover:text-rose-800 p-0.5"
                        title="Remove Points"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPoints} className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="Enter points"
                        value={pointsInput}
                        onChange={(e) => setPointsInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#333]"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingPoints || !pointsInput || summary.available_points <= 0}
                        className="bg-[#002a5c] hover:bg-[#1c4289] text-white text-[12px] font-bold px-4 py-1.5 rounded-[2px] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {isApplyingPoints ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}
                </div>

                {/* PROCEED TO CHECKOUT BUTTON */}
                <Link
                  href="/checkout"
                  className="w-full py-2.5 bg-[#002a5c] hover:bg-[#1c4289] text-white text-[13px] font-bold rounded-[3px] flex items-center justify-center gap-1.5 transition-colors shadow-none cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Proceed to Checkout</span>
                </Link>

                {/* WE ACCEPT SECTION */}
                <div className="pt-2 text-center space-y-1.5">
                  <span className="text-[10px] text-[#888] uppercase tracking-wider block">
                    We accept
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] font-bold text-gray-500">
                    <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-blue-900">VISA</span>
                    <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-red-600">MasterCard</span>
                    <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-blue-600">AMEX</span>
                    <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-pink-600">bKash</span>
                    <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-orange-600">Nagad</span>
                    <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-purple-600">Rocket</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* EMPTY CART STATE */
          <div className="bg-white rounded-[3px] border border-[#d9dee7] p-12 text-center space-y-3 shadow-2xs max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-[#666]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-[16px] font-bold text-[#111]">Your shopping cart is empty</h2>
            <p className="text-[12px] text-[#666] max-w-sm mx-auto">
              Explore our wide range of authentic laptops, computer components, accessories, and gadgets to add items to your cart.
            </p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2 bg-[#002a5c] hover:bg-[#1c4289] text-white text-[12px] font-bold rounded-[3px] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
