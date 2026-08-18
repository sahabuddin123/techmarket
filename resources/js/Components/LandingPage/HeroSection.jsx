import React from 'react';
import { Flame, Truck, ShieldCheck, Wrench } from 'lucide-react';
import QuickOrderForm from './QuickOrderForm';

export default function HeroSection({
  landingPage = {},
  product = {},
  unitPrice = 0,
  regularPrice = 0,
  discountPercent = 0,
  timeLeft = { days: 2, hours: 12, minutes: 18, seconds: 24 },
  formData,
  setFormData,
  districts = [],
  paymentMethods = [],
  subtotal = 0,
  shippingFee = 0,
  totalPayable = 0,
  submitting = false,
  orderError = null,
  handleFormInteraction,
  handlePaymentMethodSelect,
  handleOrderSubmit
}) {
  const specs = Array.isArray(product?.key_specs) && product.key_specs.length > 0 ? product.key_specs : [
    '4K Ultra HD', 'Google TV', 'Dolby Audio', 'Voice Control'
  ];

  return (
    <div 
      className="relative pt-6 pb-12 px-3 sm:px-6 overflow-hidden border-b border-slate-800/80 font-['Hind_Siliguri',sans-serif] bg-[#070b14]"
      style={{
        background: 'radial-gradient(125% 125% at 50% 0%, #162540 0%, #0d1728 40%, #060a12 100%)'
      }}
    >
      {/* High-tech Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Ambient Lighting & Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-5 w-[420px] h-[420px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT HERO COLUMN (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Small Offer Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40 text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{landingPage.campaign_name || '🌙 ঈদ মাসের অফার'}</span>
          </div>

          {/* Large Product Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {product?.title || landingPage.name}
            </h1>
            <p className="text-amber-400 text-sm sm:text-base font-bold">
              সেরা বিনোদন, সেরা অভিজ্ঞতা
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {specs.map((spec, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-[11px] font-medium backdrop-blur-xs">
                {spec}
              </span>
            ))}
          </div>

          {/* Pricing Highlight Box */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 max-w-lg">
            <div className="bg-[#f59e0b] text-slate-950 px-4 py-2 rounded-xl font-black shadow-md flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none">অফার মূল্য</span>
              <span className="text-xl sm:text-2xl font-black leading-tight">৳ {Number(unitPrice).toLocaleString()}</span>
            </div>

            {regularPrice > unitPrice && (
              <div className="text-slate-400 px-2">
                <span className="text-[10px] uppercase block">পুরনো মূল্য:</span>
                <span className="text-base sm:text-lg font-bold line-through text-slate-500">৳ {Number(regularPrice).toLocaleString()}</span>
              </div>
            )}

            {discountPercent > 0 && (
              <div className="ml-auto bg-[#e11d48] text-white px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm animate-pulse">
                {discountPercent}% ছাড়
              </div>
            )}
          </div>

          {/* Trust Items Below Price */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium pt-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Truck className="w-4 h-4" />
              <span className="text-slate-200">✓ ফ্রি ডেলিভারি</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-slate-200">✓ অফিসিয়াল ওয়ারেন্টি</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Wrench className="w-4 h-4" />
              <span className="text-slate-200">✓ হোম ডেলিভারি সুবিধা</span>
            </span>
          </div>

          {/* 3D Product Showcase with Glow/Pedestal */}
          <div className="relative pt-4 pb-2 flex flex-col items-center">
            <div className="w-full max-w-md h-56 sm:h-72 relative flex items-center justify-center">
              {/* 3D Circular Pedestal Bottom */}
              <div className="absolute bottom-2 w-4/5 h-16 bg-gradient-to-r from-amber-500/20 via-amber-400/40 to-amber-500/20 rounded-full blur-xs border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.3)]"></div>
              <div className="absolute bottom-4 w-3/4 h-10 bg-[#0d1829] rounded-full border border-amber-400/80"></div>
              
              {/* Product Image */}
              <img
                src={product?.image || 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08'}
                alt={product?.title || 'Product Display'}
                className="max-h-full max-w-full object-contain relative z-10 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Countdown Timer Strip */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2 w-full max-w-md backdrop-blur-md shadow-xl">
              <span className="text-xs text-amber-400 font-bold block">অফার শেষ হতে বাকি:</span>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-[#070b13] p-2 rounded-xl border border-slate-800 text-center">
                  <span className="text-lg sm:text-xl font-black text-white font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[10px] text-slate-400 block">দিন</span>
                </div>
                <div className="bg-[#070b13] p-2 rounded-xl border border-slate-800 text-center">
                  <span className="text-lg sm:text-xl font-black text-white font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[10px] text-slate-400 block">ঘণ্টা</span>
                </div>
                <div className="bg-[#070b13] p-2 rounded-xl border border-slate-800 text-center">
                  <span className="text-lg sm:text-xl font-black text-white font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] text-slate-400 block">মিনিট</span>
                </div>
                <div className="bg-[#070b13] p-2 rounded-xl border border-slate-800 text-center">
                  <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] text-slate-400 block">সেকেন্ড</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ORDER FORM (5 Cols) */}
        <div className="lg:col-span-5" id="order-form">
          <QuickOrderForm
            formData={formData}
            setFormData={setFormData}
            districts={districts}
            paymentMethods={paymentMethods}
            unitPrice={unitPrice}
            subtotal={subtotal}
            shippingFee={shippingFee}
            totalPayable={totalPayable}
            submitting={submitting}
            orderError={orderError}
            handleFormInteraction={handleFormInteraction}
            handlePaymentMethodSelect={handlePaymentMethodSelect}
            handleOrderSubmit={handleOrderSubmit}
            orderBtnText={landingPage.custom_order_button_text || 'অর্ডার নিশ্চিত করুন'}
          />
        </div>
      </div>
    </div>
  );
}
