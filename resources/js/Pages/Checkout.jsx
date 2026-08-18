import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  AlertTriangle, Check, ShieldCheck, ChevronRight, 
  ShoppingBag, CheckCircle2, Lock
} from 'lucide-react';
import { trackInitiateCheckout, trackAddPaymentInfo } from '@/lib/tracking';

export default function Checkout(props) {
  // Normalize incoming props with defensive null-safety
  const cart = Array.isArray(props?.cart) ? props.cart : [];
  const user = props?.user || null;
  const districts = Array.isArray(props?.districts) && props.districts.length > 0
    ? props.districts
    : ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Faridpur', 'Gazipur', 'Narayanganj'];
  const summary = props?.summary || { subtotal: 0, discount: 0, shipping_cost: 60, total: 0, coupon_code: null };
  const paymentMethodsList = Array.isArray(props?.paymentMethods) && props.paymentMethods.length > 0
    ? props.paymentMethods
    : [
        { id: 'cod', title: 'Cash on Delivery', description: 'Pay cash when your order is delivered.', badge: null },
        { id: 'bkash', title: 'bKash', description: 'Pay securely using bKash.', badge: { text: 'bKash', bg: '#e2136e' } },
        { id: 'nagad', title: 'Nagad', description: 'Pay securely using Nagad.', badge: { text: 'Nagad', bg: '#f7941d' } },
      ];

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Form State
  const { data, setData, post, processing, errors } = useForm({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    district: user?.district || 'Dhaka',
    area: '',
    shipping_address: user?.address || '',
    same_billing: true,
    billing_name: '',
    billing_phone: '',
    billing_address: '',
    payment_method: paymentMethodsList[0]?.id || 'cod',
    coupon_code: summary.coupon_code || '',
    notes: '',
    terms: true,
  });

  // Calculate live line totals
  const subtotal = cart.reduce((acc, item) => acc + ((item.regular_price || item.price) * (item.quantity || 1)), 0);
  const totalSavings = cart.reduce((acc, item) => acc + ((item.savings || 0) * (item.quantity || 1)), 0) + (summary.discount || 0);
  const calculatedShipping = data.district === 'Dhaka' ? 60.00 : 120.00;
  const total = Math.max(0, (subtotal - totalSavings) + calculatedShipping);

  // Handle same as shipping mirror
  useEffect(() => {
    if (sameAsShipping) {
      setData((prev) => ({
        ...prev,
        same_billing: true,
        billing_name: prev.customer_name,
        billing_phone: prev.customer_phone,
        billing_address: prev.shipping_address,
      }));
    } else {
      setData('same_billing', false);
    }
  }, [sameAsShipping, data.customer_name, data.customer_phone, data.shipping_address]);

  // Track InitiateCheckout on checkout mount
  useEffect(() => {
    if (cart.length > 0) {
      trackInitiateCheckout(cart, total);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.terms) {
      alert('Please agree to the terms and conditions to confirm your order.');
      return;
    }
    trackAddPaymentInfo(data.payment_method, total);
    post('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#333] font-sans flex flex-col selection:bg-[#002a5c] selection:text-white">
      <Head title="Checkout | TechMarket BD" />

      {/* 1. GLOBAL HEADER & CATEGORY NAVIGATION */}
      <Navbar onOpenCart={() => setIsCartDrawerOpen(true)} />
      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />

      {/* MAIN CONTAINER (Centered approx 1240px wide) */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-2.5 sm:px-4 py-3.5 space-y-3">
        
        {/* 2. BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[#666] select-none py-0.5">
          <Link href="/" className="hover:text-[#0066cc] transition-colors">Home</Link>
          <span className="text-[#999]">&gt;</span>
          <Link href="/cart" className="hover:text-[#0066cc] transition-colors">Shopping Cart</Link>
          <span className="text-[#999]">&gt;</span>
          <span className="font-semibold text-[#111]">Checkout</span>
        </nav>

        {cart.length > 0 ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
            
            {/* ================= LEFT COLUMN: SHIPPING, BILLING & NOTES (approx 58-60% / 7 cols) ================= */}
            <div className="lg:col-span-7 space-y-3.5">
              
              {/* CARD 1: SHIPPING DETAILS */}
              <div className="bg-white rounded-[3px] border border-[#d9dee7] p-4 sm:p-5 space-y-3 shadow-2xs">
                <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] pb-2 border-b border-[#eee]">
                  Shipping Details
                </h2>

                <div className="space-y-3 text-[12px]">
                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#333] font-semibold mb-1">
                        Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={data.customer_name}
                        onChange={(e) => setData('customer_name', e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white font-medium"
                      />
                      {errors.customer_name && (
                        <span className="text-[11px] text-red-600 mt-0.5 block">{errors.customer_name}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#333] font-semibold mb-1">
                        Phone <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={data.customer_phone}
                        onChange={(e) => setData('customer_phone', e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white font-medium"
                      />
                      {errors.customer_phone && (
                        <span className="text-[11px] text-red-600 mt-0.5 block">{errors.customer_phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: District & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#333] font-semibold mb-1">
                        District <span className="text-red-600">*</span>
                      </label>
                      <select
                        required
                        value={data.district}
                        onChange={(e) => setData('district', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white font-medium cursor-pointer"
                      >
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {errors.district && (
                        <span className="text-[11px] text-red-600 mt-0.5 block">{errors.district}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#333] font-semibold mb-1">
                        Area <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={data.area}
                        onChange={(e) => setData('area', e.target.value)}
                        placeholder="Thana / Area (e.g. Madhukhali, Mirpur)"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white font-medium"
                      />
                      {errors.area && (
                        <span className="text-[11px] text-red-600 mt-0.5 block">{errors.area}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Address */}
                  <div>
                    <label className="block text-[#333] font-semibold mb-1">
                      Address <span className="text-red-600">*</span>
                      <span className="text-[10px] text-[#888] font-normal ml-1">
                        House, road and area only. District and thana are selected above.
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      value={data.shipping_address}
                      onChange={(e) => setData('shipping_address', e.target.value)}
                      placeholder="e.g. House 12, Road 4, Sector 7"
                      className="w-full px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white font-medium"
                    />
                    {errors.shipping_address && (
                      <span className="text-[11px] text-red-600 mt-0.5 block">{errors.shipping_address}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 2: BILLING DETAILS */}
              <div className="bg-white rounded-[3px] border border-[#d9dee7] p-4 sm:p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#eee]">
                  <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111]">
                    Billing Details
                  </h2>

                  <label className="flex items-center gap-1.5 text-[11px] text-[#555] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="rounded-[2px] border-[#cbd5e1] text-[#002a5c] focus:ring-[#002a5c] w-3.5 h-3.5"
                    />
                    <span>Same as shipping address.</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="space-y-3 text-[12px] pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#333] font-semibold mb-1">
                          Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required={!sameAsShipping}
                          value={data.billing_name}
                          onChange={(e) => setData('billing_name', e.target.value)}
                          placeholder="Billing Contact Name"
                          className="w-full px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[#333] font-semibold mb-1">
                          Phone <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required={!sameAsShipping}
                          value={data.billing_phone}
                          onChange={(e) => setData('billing_phone', e.target.value)}
                          placeholder="Billing Contact Phone"
                          className="w-full px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#333] font-semibold mb-1">
                        Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required={!sameAsShipping}
                        value={data.billing_address}
                        onChange={(e) => setData('billing_address', e.target.value)}
                        placeholder="Billing Street Address"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3: ORDER NOTES (OPTIONAL) */}
              <div className="bg-white rounded-[3px] border border-[#d9dee7] p-4 sm:p-5 space-y-2 shadow-2xs">
                <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] pb-2 border-b border-[#eee]">
                  Order Notes <span className="text-[#888] font-normal text-[12px]">(Optional)</span>
                </h2>

                <textarea
                  rows={3}
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Any special instructions for your order (optional)..."
                  className="w-full p-2.5 text-[12px] rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c] text-[#111] bg-white"
                />
              </div>
            </div>

            {/* ================= RIGHT COLUMN: ORDER DETAILS, PAYMENT & CONFIRM (approx 40-42% / 5 cols) ================= */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="bg-white rounded-[3px] border border-[#d9dee7] p-4 sm:p-5 space-y-3.5 shadow-2xs">
                
                {/* Header */}
                <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111]">
                  Order Details
                </h2>

                {/* Subheader: PRODUCT | AMOUNT */}
                <div className="flex justify-between items-center text-[10px] text-[#888] font-bold uppercase pb-1.5 border-b border-[#eee]">
                  <span>PRODUCT</span>
                  <span>AMOUNT</span>
                </div>

                {/* Products List */}
                <div className="divide-y divide-[#eee]">
                  {cart.map((item) => {
                    const price = Number(item.price || 0);
                    const qty = item.quantity || 1;
                    const itemTotal = price * qty;

                    return (
                      <div key={item.id} className="py-2.5 first:pt-1 last:pb-0 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100&auto=format&fit=crop'}
                            alt={item.title}
                            className="w-10 h-10 object-contain rounded-[2px] bg-white border border-[#eee] p-0.5 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[12px] font-semibold text-[#111] block truncate leading-tight" title={item.title}>
                              {item.title}
                            </span>
                            <span className="text-[11px] text-[#777] block">
                              ৳{price.toLocaleString()} × {qty}
                            </span>
                          </div>
                        </div>

                        <span className="text-[12px] font-bold text-[#111] whitespace-nowrap">
                          ৳{itemTotal.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals Summary */}
                <div className="pt-2 border-t border-[#eee] space-y-2 text-[12px]">
                  <div className="flex justify-between text-[#555]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#111]">
                      ৳{subtotal.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-[#555]">
                      <span>Discount</span>
                      <span className="font-bold text-[#2e7d32]">
                        - ৳{totalSavings.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#555]">
                    <span>Shipping Charge</span>
                    <span className="font-bold text-[#111]">
                      ৳{calculatedShipping.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#eee] flex justify-between items-baseline">
                    <span className="text-[13px] font-bold text-[#111]">Total</span>
                    <span className="text-[18px] sm:text-[20px] font-black text-[#002a5c]">
                      ৳{total.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* PAYMENT METHODS — DYNAMICALLY RENDERED FROM ACTIVE CONFIGURATION */}
                <div className="pt-2 border-t border-[#eee] space-y-2">
                  {paymentMethodsList.map((pm) => (
                    <label
                      key={pm.id}
                      htmlFor={`pm_${pm.id}`}
                      className={`block p-2.5 rounded-[3px] border cursor-pointer transition-all ${
                        data.payment_method === pm.id
                          ? 'border-[#002a5c] bg-[#f8fafc] ring-1 ring-[#002a5c]/20'
                          : 'border-[#d9dee7] bg-white hover:border-[#aaa]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          id={`pm_${pm.id}`}
                          type="radio"
                          name="payment_method"
                          value={pm.id}
                          checked={data.payment_method === pm.id}
                          onChange={(e) => setData('payment_method', e.target.value)}
                          className="mt-0.5 text-[#002a5c] focus:ring-[#002a5c] w-3.5 h-3.5 cursor-pointer"
                        />
                        <div className="flex-1 text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#111]">{pm.title}</span>
                            {pm.badge && (
                              <span
                                style={{ backgroundColor: pm.badge.bg }}
                                className="text-white text-[9px] font-black px-1.5 py-0.2 rounded-[2px]"
                              >
                                {pm.badge.text}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#666] block leading-tight mt-0.5">
                            {pm.description}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}

                  {errors.payment_method && (
                    <span className="text-[11px] text-red-600 mt-0.5 block">{errors.payment_method}</span>
                  )}
                </div>

                {/* TERMS AND CONDITIONS CHECKBOX */}
                <div className="pt-2 border-t border-[#eee]">
                  <label className="flex items-start gap-2 text-[11px] text-[#444] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.terms}
                      onChange={(e) => setData('terms', e.target.checked)}
                      className="mt-0.5 rounded-[2px] border-[#cbd5e1] text-[#002a5c] focus:ring-[#002a5c] w-3.5 h-3.5"
                    />
                    <span>
                      I have read and agree to the{' '}
                      <Link href="/page/terms-conditions" className="text-[#0066cc] underline hover:text-[#002a5c]">
                        terms and conditions
                      </Link>.
                    </span>
                  </label>
                  {errors.terms && (
                    <span className="text-[11px] text-red-600 mt-1 block font-semibold">{errors.terms}</span>
                  )}
                </div>

                {/* ORDER NOTICE (Yellow/Gold Notice Box) */}
                <div className="bg-[#fffde7] border border-[#fff59d] text-[#795548] p-3 rounded-[2px] text-[11px] leading-relaxed space-y-1">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#f57f17] shrink-0 mt-0.5" />
                    <p className="font-medium">
                      অর্ডার কনফার্মেশন কলের সময় আপনাকে পেমেন্ট এবং ডেলিভারি চার্জ জানানো হবে। কলের পর ৪৮ ঘণ্টার মধ্যে পেমেন্ট করতে হবে, না হলে অর্ডার বাতিল হয়ে যাবে।
                    </p>
                  </div>
                  <p className="text-[10px] text-[#8d6e63] pl-5">
                    অনিবার্য কারণবশত পণ্যের মূল্য পরিবর্তনশীল হলে, টেক মার্কেট বিডি কর্তৃপক্ষ অর্ডার বাতিলের অধিকার সংরক্ষণ করে।
                  </p>
                </div>

                {/* CONFIRM ORDER BUTTON */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-2.5 bg-[#002a5c] hover:bg-[#1c4289] text-white text-[13px] font-bold rounded-[3px] flex items-center justify-center gap-1.5 transition-colors shadow-none cursor-pointer disabled:opacity-60"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{processing ? 'Processing Order...' : 'Confirm Order'}</span>
                </button>

              </div>
            </div>

          </form>
        ) : (
          /* EMPTY CART CHECKOUT STATE */
          <div className="bg-white rounded-[3px] border border-[#d9dee7] p-12 text-center space-y-3 shadow-2xs max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-[#666]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-[16px] font-bold text-[#111]">Your cart is empty</h2>
            <p className="text-[12px] text-[#666] max-w-sm mx-auto">
              Please add some items to your shopping cart before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2 bg-[#002a5c] hover:bg-[#1c4289] text-white text-[12px] font-bold rounded-[3px] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
