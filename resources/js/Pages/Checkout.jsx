import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  AlertTriangle, Check, ShieldCheck, ChevronRight, 
  ShoppingBag, CheckCircle2, Lock, Truck, User, MapPin, 
  CreditCard, FileText, Info, HelpCircle, ArrowRight, Home,
  Building2, Sparkles, Phone, Mail
} from 'lucide-react';
import { trackInitiateCheckout, trackAddPaymentInfo } from '@/lib/tracking';

export default function Checkout(props) {
  // Normalize incoming props with defensive null-safety
  const cart = Array.isArray(props?.cart) ? props.cart : [];
  const user = props?.user || null;
  const districts = Array.isArray(props?.districts) && props.districts.length > 0
    ? props.districts
    : ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Faridpur', 'Gazipur', 'Narayanganj'];
  const summary = props?.summary || { subtotal: 0, discount: 0, shipping_cost: null, shipping_label: 'Calculated later', total: 0, coupon_code: null };
  const paymentMethodsList = Array.isArray(props?.paymentMethods) && props.paymentMethods.length > 0
    ? props.paymentMethods
    : [
        { id: 'cod', title: 'Cash on Delivery', description: 'Pay cash when your order is delivered.', badge: null },
      ];

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [addressType, setAddressType] = useState('home');

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

  // Authoritative dynamic calculations
  const subtotal = cart.reduce((acc, item) => acc + ((Number(item.regular_price) || Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  const totalSavings = cart.reduce((acc, item) => acc + ((Number(item.savings) || 0) * (Number(item.quantity) || 1)), 0) + (Number(summary.discount) || 0);
  // Shipping charge is NOT added at checkout — it is calculated later based on weight/dimensions/location
  const payableTotal = Math.max(0, subtotal - totalSavings);

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
      trackInitiateCheckout(cart, payableTotal);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.terms) {
      alert('Please agree to the terms and conditions to confirm your order.');
      return;
    }
    trackAddPaymentInfo(data.payment_method, payableTotal);
    post('/checkout');
  };

  return (
    <div className="storefront-v2 min-h-screen bg-[#f3f6fa] text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Head title="Secure Checkout | TechMarket BD" />

      {/* 1. TOP HEADER & NAVIGATION */}
      <Navbar onOpenCart={() => setIsCartDrawerOpen(true)} />
      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-[1640px] mx-auto px-4 py-6 space-y-6">
        
        {/* 2. MODERN BREADCRUMB & PROGRESS STEPPER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto select-none">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href="/cart" className="hover:text-blue-600 transition-colors">Shopping Cart</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-extrabold text-slate-900">Checkout</span>
          </nav>

          {/* Checkout Progress Stepper */}
          <div className="flex items-center space-x-2 text-xs font-extrabold">
            <div className="flex items-center space-x-1.5 text-emerald-600">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
              <span>Cart</span>
            </div>
            <span className="w-6 h-0.5 bg-emerald-300" />
            <div className="flex items-center space-x-1.5 text-blue-600">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-xs">2</span>
              <span>Information & Payment</span>
            </div>
            <span className="w-6 h-0.5 bg-slate-200" />
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {cart.length > 0 ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= LEFT COLUMN: CUSTOMER, SHIPPING, BILLING & NOTES (65% / 7 cols) ================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* CARD 1: CUSTOMER & DELIVERY INFORMATION */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight">
                        Customer & Delivery Information
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Enter your contact and address details for order shipment
                      </p>
                    </div>
                  </div>

                  {user && (
                    <span className="text-[11px] font-extrabold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                      Logged in as {user.name}
                    </span>
                  )}
                </div>

                <div className="space-y-4 text-xs">
                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-extrabold">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={data.customer_name}
                          onChange={(e) => setData('customer_name', e.target.value)}
                          placeholder="e.g. Tanvir Ahmed"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                        />
                      </div>
                      {errors.customer_name && (
                        <span className="text-[11px] text-red-600 font-bold block">{errors.customer_name}</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-extrabold">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={data.customer_phone}
                          onChange={(e) => setData('customer_phone', e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                        />
                      </div>
                      {errors.customer_phone && (
                        <span className="text-[11px] text-red-600 font-bold block">{errors.customer_phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email (Optional) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-700 font-extrabold">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">For invoice & tracking updates</span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={data.customer_email}
                        onChange={(e) => setData('customer_email', e.target.value)}
                        placeholder="your.email@example.com (optional)"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                      />
                    </div>
                    {errors.customer_email && (
                      <span className="text-[11px] text-red-600 font-bold block">{errors.customer_email}</span>
                    )}
                  </div>

                  {/* Row 3: District & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-extrabold">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={data.district}
                        onChange={(e) => setData('district', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-bold bg-white cursor-pointer"
                      >
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {errors.district && (
                        <span className="text-[11px] text-red-600 font-bold block">{errors.district}</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-extrabold">
                        Thana / Area / Upazila
                      </label>
                      <input
                        type="text"
                        value={data.area}
                        onChange={(e) => setData('area', e.target.value)}
                        placeholder="e.g. Mirpur, Uttara, Dhanmondi, Boalkhali"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                      />
                      {errors.area && (
                        <span className="text-[11px] text-red-600 font-bold block">{errors.area}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Detailed Address */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 font-extrabold">
                      Detailed Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <textarea
                        rows={2}
                        required
                        value={data.shipping_address}
                        onChange={(e) => setData('shipping_address', e.target.value)}
                        placeholder="House no., Road no., Sector/Block, landmark, etc."
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                      />
                    </div>
                    {errors.shipping_address && (
                      <span className="text-[11px] text-red-600 font-bold block">{errors.shipping_address}</span>
                    )}
                  </div>

                  {/* Address Type Selector */}
                  <div className="pt-1">
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Address Type:
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'home', label: 'Home', icon: Home },
                        { id: 'office', label: 'Office', icon: Building2 },
                        { id: 'other', label: 'Other', icon: MapPin },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSelected = addressType === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setAddressType(t.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: BILLING DETAILS */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      Billing Details
                    </h2>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 font-extrabold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Same as shipping address</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="space-y-4 text-xs pt-1 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-extrabold">
                          Billing Contact Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={!sameAsShipping}
                          value={data.billing_name}
                          onChange={(e) => setData('billing_name', e.target.value)}
                          placeholder="Billing Name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-extrabold">
                          Billing Contact Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required={!sameAsShipping}
                          value={data.billing_phone}
                          onChange={(e) => setData('billing_phone', e.target.value)}
                          placeholder="Billing Phone"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-extrabold">
                        Billing Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={!sameAsShipping}
                        value={data.billing_address}
                        onChange={(e) => setData('billing_address', e.target.value)}
                        placeholder="Billing Street Address"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3: ORDER NOTES (OPTIONAL) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-3 shadow-xs">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Order Notes <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                  </h2>
                </div>

                <textarea
                  rows={3}
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Any special instructions for your order (e.g. package gift wrapping, preferred delivery time, call before arrival)..."
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium bg-white"
                />
              </div>
            </div>

            {/* ================= RIGHT COLUMN: STICKY ORDER SUMMARY & PAYMENT (35% / 5 cols) ================= */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-5 shadow-xs sticky top-24">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                      Order Summary
                    </h2>
                  </div>
                  <span className="text-xs font-black bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                {/* Cart Products List */}
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {cart.map((item) => {
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const itemTotal = price * qty;

                    return (
                      <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100&auto=format&fit=crop'}
                            alt={item.title}
                            className="w-12 h-12 object-contain rounded-xl bg-[#f8fafc] border border-slate-100 p-1 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span className="text-xs font-extrabold text-slate-900 block truncate group-hover:text-blue-600 transition-colors leading-tight" title={item.title}>
                              {item.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              {item.sku && <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.2 rounded">SKU: {item.sku}</span>}
                              <span>৳{price.toLocaleString()} × {qty}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-black text-slate-900 whitespace-nowrap">
                          ৳{itemTotal.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals Summary */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Product Subtotal</span>
                    <span className="font-extrabold text-slate-900">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount / Savings</span>
                      <span>- ৳{totalSavings.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Shipping Charge Notice — Exactly "Calculated later" */}
                  <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Shipping Charge</span>
                      <div className="group relative cursor-help">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg text-center z-30 leading-tight">
                          Final shipping cost will be calculated based on product weight, dimensions and delivery location.
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 text-[11px]">
                      Calculated later
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">Current Payable Total</span>
                      <span className="text-[10px] text-slate-400 font-medium">(Excluding pending shipping)</span>
                    </div>
                    <span className="text-2xl font-black text-blue-600">
                      ৳{payableTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* PAYMENT METHODS SELECTION (Dynamic Cards) */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    Select Payment Method:
                  </span>

                  <div className="space-y-2">
                    {paymentMethodsList.map((pm) => {
                      const isSelected = data.payment_method === pm.id;
                      return (
                        <label
                          key={pm.id}
                          htmlFor={`pm_${pm.id}`}
                          className={`block p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              id={`pm_${pm.id}`}
                              type="radio"
                              name="payment_method"
                              value={pm.id}
                              checked={isSelected}
                              onChange={(e) => setData('payment_method', e.target.value)}
                              className="mt-0.5 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-slate-900">{pm.title}</span>
                                {pm.badge && (
                                  <span
                                    style={{ backgroundColor: pm.badge.bg }}
                                    className="text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs"
                                  >
                                    {pm.badge.text}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block leading-tight mt-0.5 font-medium">
                                {pm.description}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {errors.payment_method && (
                    <span className="text-[11px] text-red-600 font-bold mt-1 block">{errors.payment_method}</span>
                  )}
                </div>

                {/* TERMS AND CONDITIONS */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none font-medium">
                    <input
                      type="checkbox"
                      checked={data.terms}
                      onChange={(e) => setData('terms', e.target.checked)}
                      className="mt-0.5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>
                      I have read and agree to the{' '}
                      <Link href="/terms-and-conditions" className="text-blue-600 font-bold underline hover:text-blue-700">
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy-policy" className="text-blue-600 font-bold underline hover:text-blue-700">
                        Privacy Policy
                      </Link>.
                    </span>
                  </label>
                  {errors.terms && (
                    <span className="text-[11px] text-red-600 mt-1 block font-bold">{errors.terms}</span>
                  )}
                </div>

                {/* SHIPPING & CONFIRMATION NOTICE */}
                <div className="bg-amber-50/80 border border-amber-200/80 text-amber-900 p-3.5 rounded-xl text-xs leading-relaxed space-y-1">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="font-bold">
                      ডেলিভারি চার্জ পণ্যের সাইজ, ওজন ও দূরত্বের ওপর নির্ভর করে নির্ধারণ করা হবে।
                    </p>
                  </div>
                  <p className="text-[11px] text-amber-800/90 pl-6 font-medium">
                    অর্ডার প্লেসের পর আমাদের কাস্টমার সাপোর্ট টিম ফোন কলের মাধ্যমে কনফার্ম করবে।
                  </p>
                </div>

                {/* CONFIRM ORDER PRIMARY CTA */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  <span>{processing ? 'Processing Order...' : 'Confirm Order'}</span>
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-bold pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SSL Secured</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>100% Genuine Tech</span>
                  <span className="text-slate-300">•</span>
                  <span>Official Warranty</span>
                </div>

              </div>
            </div>

          </form>
        ) : (
          /* EMPTY CART CHECKOUT STATE */
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 sm:p-16 text-center space-y-4 shadow-xs max-w-xl mx-auto">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xs">
              <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Your Shopping Cart is Empty</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Please add some tech items to your cart before proceeding to checkout.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Explore Tech Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer onOpenCart={() => setIsCartDrawerOpen(true)} />
    </div>
  );
}
