import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import ProductCard from '@/Components/ProductCard';
import CartDrawer from '@/Components/CartDrawer';
import { 
  Calendar, Clock, Tag, Sparkles, Gift, Film, 
  Percent, ShieldCheck, CheckCircle2, ChevronRight, 
  ArrowDown, Share2, AlertCircle, ShoppingBag 
} from 'lucide-react';

export default function OffersShow({ 
  offer, 
  products = { data: [] }, 
  relatedOffers = [], 
  filters = {} 
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productSearch, setProductSearch] = useState(filters.search || '');
  const productsRef = useRef(null);

  // Dynamic Live 4-box Countdown timer
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = () => {
    if (!offer.end_at) {
      return { isOngoing: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const endDate = new Date(offer.end_at);
    const startDate = offer.start_at ? new Date(offer.start_at) : null;

    if (startDate && startDate > now) {
      const startDiff = startDate - now;
      return {
        isScheduled: true,
        days: Math.floor(startDiff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((startDiff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((startDiff / 1000 / 60) % 60),
        seconds: Math.floor((startDiff / 1000) % 60),
      };
    }

    const diff = endDate - now;
    if (diff <= 0) {
      return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      isActive: true,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const timer = calculateTimeRemaining();
  const pad = (n) => String(n).padStart(2, '0');

  // Format date range
  const dateRangeText = offer.offer_validity_text || (
    offer.start_at && offer.end_at ? (
      `${new Date(offer.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – ${new Date(offer.end_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    ) : 'Limited Period Offer'
  );

  const scrollToProducts = () => {
    if (offer.cta_button_url && !offer.cta_button_url.startsWith('#')) {
      router.visit(offer.cta_button_url);
    } else if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Default Perks if not custom configured
  const perks = offer.perks || [
    { title: 'Best Price Guaranteed', desc: 'Shop genuine hardware at the most competitive price in BD.' },
    { title: 'Special Discount & Gifts', desc: 'Enjoy exclusive gifts, vouchers & instant discount.' },
    { title: 'Official BD Warranty', desc: '100% genuine distributor warranty on all eligible products.' },
  ];

  // Default Feature Cards if not custom configured
  const features = offer.features || [
    { title: 'Wide Selection of Products', desc: 'Choose from top global tier-1 brands.' },
    { title: 'Best Price & Quick EMI', desc: 'Up to 36 months zero-cost EMI facilities available.' },
    { title: 'Fast & Secure Delivery', desc: 'Express shipping across all 64 districts in Bangladesh.' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans flex flex-col selection:bg-red-500 selection:text-white">
      <Head>
        <title>{offer.seo_title || `${offer.title} | Exclusive Campaign | TechMarket BD`}</title>
        <meta name="description" content={offer.seo_description || offer.short_description || offer.title} />
      </Head>

      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Main Campaign Container (Matching Screenshot 1) */}
      <main className="flex-1 max-w-[1140px] w-full mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/offers" className="hover:text-red-600">Offers</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900 truncate">{offer.title}</span>
        </nav>

        {/* 1. TOP HEADER & METADATA BAR WITH 4-BOX COUNTDOWN (Matching Screenshot 1) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Metadata */}
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 capitalize tracking-tight">
              {offer.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-red-600" />
                <span>{dateRangeText}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                🖥️ Online | Offline Outlets
              </span>
            </div>
          </div>

          {/* Right Countdown Widget Box (Matching Screenshot 1) */}
          <div className="border border-red-200 bg-red-50/40 rounded-xl p-3.5 flex flex-col items-center shrink-0 min-w-[240px]">
            <span className="text-[10px] font-black tracking-widest text-red-600 uppercase mb-1.5">
              {timer.isExpired ? 'CAMPAIGN CONCLUDED' : timer.isScheduled ? 'STARTS IN' : 'ENDING IN'}
            </span>

            {!timer.isExpired && !timer.isOngoing ? (
              <div className="flex items-center gap-1.5 text-center">
                {/* DAYS */}
                <div className="bg-white rounded-lg border border-red-100 px-2.5 py-1 shadow-xs min-w-[44px]">
                  <span className="text-lg font-black text-red-600 block leading-tight">{pad(timer.days)}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">DAYS</span>
                </div>
                <span className="text-red-400 font-bold text-sm">:</span>
                {/* HRS */}
                <div className="bg-white rounded-lg border border-red-100 px-2.5 py-1 shadow-xs min-w-[44px]">
                  <span className="text-lg font-black text-red-600 block leading-tight">{pad(timer.hours)}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">HRS</span>
                </div>
                <span className="text-red-400 font-bold text-sm">:</span>
                {/* MIN */}
                <div className="bg-white rounded-lg border border-red-100 px-2.5 py-1 shadow-xs min-w-[44px]">
                  <span className="text-lg font-black text-red-600 block leading-tight">{pad(timer.minutes)}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">MIN</span>
                </div>
                <span className="text-red-400 font-bold text-sm">:</span>
                {/* SEC */}
                <div className="bg-white rounded-lg border border-red-100 px-2.5 py-1 shadow-xs min-w-[44px]">
                  <span className="text-lg font-black text-red-600 block leading-tight">{pad(timer.seconds)}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">SEC</span>
                </div>
              </div>
            ) : timer.isExpired ? (
              <span className="text-sm font-bold text-gray-500 py-1">Offer Expired</span>
            ) : (
              <span className="text-sm font-bold text-amber-700 py-1">∞ Ongoing Campaign</span>
            )}
          </div>
        </div>

        {/* 2. HERO CAMPAIGN BANNER IMAGE (Matching Screenshot 1) */}
        {offer.banner_image && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-slate-950">
            <img 
              src={offer.banner_image} 
              alt={offer.title} 
              className="w-full h-auto object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* 3. CAMPAIGN DETAILS & PERKS CARD (Matching Screenshot 1) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm text-center space-y-6">
          {/* Limited Time Badge Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>{offer.badge_text || 'LIMITED TIME EXCLUSIVE OFFER'}</span>
          </div>

          {/* Headline */}
          {offer.headline && (
            <h2 className="text-xl md:text-3xl font-black text-gray-950 tracking-tight leading-snug max-w-2xl mx-auto">
              {offer.headline}
            </h2>
          )}

          {/* Description */}
          {(offer.short_description || offer.description) && (
            <p className="text-xs md:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
              {offer.description || offer.short_description}
            </p>
          )}

          {/* 3 Key Perks Row (Matching Screenshot 1) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
            {perks.map((perk, idx) => (
              <div 
                key={idx}
                className="bg-[#fafafa] p-4 rounded-xl border border-gray-200 flex items-start gap-3 hover:border-red-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  {idx === 0 ? '💰' : idx === 1 ? '🔥' : '🎟️'}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900 mb-0.5">{perk.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-normal">{perk.desc || perk.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Why Buy From TechMarket BD? Section */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                WHY BUY FROM TECHMARKET BD?
              </span>
              <h3 className="text-sm md:text-base font-extrabold text-gray-900">
                Shop with complete confidence and authentic manufacturer support
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {features.map((feat, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="text-base mb-1">{idx === 0 ? '📦' : idx === 1 ? '🏷️' : '⚡'}</div>
                  <h5 className="font-bold text-xs text-gray-900 mb-1">{feat.title}</h5>
                  <p className="text-[11px] text-gray-600 leading-normal">{feat.desc || feat.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Offer Validity & Action Button */}
          <div className="pt-6 flex flex-col items-center space-y-3">
            <div className="px-5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
              OFFER VALID: {dateRangeText}
            </div>

            <button
              onClick={scrollToProducts}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs md:text-sm rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>{offer.cta_button_text || 'BUY NOW →'}</span>
            </button>

            {offer.terms_and_conditions && (
              <span className="text-[10px] text-gray-400 block pt-1">
                {offer.terms_and_conditions}
              </span>
            )}
          </div>
        </div>

        {/* 4. CAMPAIGN ASSOCIATED PRODUCTS SECTION (Matching Screenshot 1) */}
        <section ref={productsRef} className="space-y-4 pt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight">
                  Campaign Eligible Products
                </h3>
                <p className="text-[11px] text-gray-500">
                  {products.total > 0 ? `${products.total} products qualify for this promotion` : 'All items eligible'}
                </p>
              </div>
            </div>

            {/* Product Quick Search */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                router.get(`/offers/${offer.slug}`, { search: productSearch }, { preserveState: true, preserveScroll: true });
              }}
              className="relative min-w-[240px]"
            >
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products in this offer..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:border-red-600"
              />
              <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Products Grid */}
          {products.data && products.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.data.map((product) => (
                <div key={product.id} className="relative">
                  {/* Campaign Custom Badge if set on pivot */}
                  {product.pivot?.badge && (
                    <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[9px] uppercase tracking-wider shadow">
                      {product.pivot.badge}
                    </div>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-xs text-gray-500">
              No specific products attached yet. This offer applies to all qualifying purchases in-store & online.
            </div>
          )}

          {/* Pagination */}
          {products.links && products.links.length > 3 && (
            <div className="flex justify-center pt-4">
              <div className="flex items-center gap-1">
                {products.links.map((link, idx) => (
                  <button
                    key={idx}
                    disabled={!link.url || link.active}
                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                      link.active
                        ? 'bg-red-600 text-white border-red-600'
                        : link.url
                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 5. MORE ACTIVE OFFERS RECOMMENDATIONS */}
        {relatedOffers.length > 0 && (
          <div className="pt-6 space-y-3">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Explore More Active Campaigns
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedOffers.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/offers/${rel.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 hover:border-red-500 hover:shadow-sm transition-all group"
                >
                  <img
                    src={rel.thumbnail_image || rel.banner_image || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=150'}
                    alt={rel.title}
                    className="w-16 h-12 object-cover rounded-lg shrink-0 bg-slate-900"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-xs text-gray-900 group-hover:text-red-600 truncate">
                      {rel.title}
                    </h5>
                    <p className="text-[10px] text-gray-500">{rel.offer_validity_text || 'Active Campaign'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
