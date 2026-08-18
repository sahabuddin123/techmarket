import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { MessageSquare, Phone } from 'lucide-react';
import { 
  initTracking, trackPageView, trackViewContent, 
  trackInitiateCheckout, trackAddPaymentInfo, trackPurchase, 
  getCanonicalContentId, generateEventId 
} from '@/lib/tracking';

// Modular Landing Page Components
import TopTrustBar from '@/Components/LandingPage/TopTrustBar';
import HeroSection from '@/Components/LandingPage/HeroSection';
import BenefitsBar from '@/Components/LandingPage/BenefitsBar';
import FeaturesSection from '@/Components/LandingPage/FeaturesSection';
import ProductDetailsSection from '@/Components/LandingPage/ProductDetailsSection';
import OfferBanner from '@/Components/LandingPage/OfferBanner';
import ReviewsSection from '@/Components/LandingPage/ReviewsSection';
import FAQSection from '@/Components/LandingPage/FAQSection';
import FinalCTA from '@/Components/LandingPage/FinalCTA';
import FinalTrustBar from '@/Components/LandingPage/FinalTrustBar';
import LandingFooter from '@/Components/LandingPage/LandingFooter';
import StickyOrderBar from '@/Components/LandingPage/StickyOrderBar';

export default function LandingPageShow({
  landingPage = {},
  product = {},
  pricing = null,
  sections = [],
  reviews = [],
  ratingSummary = { average: 5.0, count: 0 },
  paymentMethods = [],
  districts = [],
  deliveryRates = { inside_dhaka: 60, outside_dhaka: 120, is_free: false },
  trackingConfig = {},
  structuredSchemas = {},
  campaignParams = {},
}) {
  // Order Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    district: 'Dhaka',
    area: '',
    shipping_address: '',
    payment_method: paymentMethods[0]?.id || 'cod',
    quantity: 1,
    variant: '',
    notes: '',
    website_url_hp: '', // Honeypot
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [hasTrackedInitiate, setHasTrackedInitiate] = useState(false);

  // Countdown timer state (days, hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 12, minutes: 18, seconds: 24 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return { days: 1, hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize tracking on page mount
  useEffect(() => {
    initTracking(trackingConfig);
    trackPageView(landingPage.name || 'Landing Page');

    if (product?.id) {
      const contentId = getCanonicalContentId(product);
      const val = pricing?.final_price || product.price || 0;
      trackViewContent(contentId, product.title, val, 'BDT', {
        campaign_name: landingPage.campaign_name,
        campaign_code: landingPage.campaign_code,
      });

      // Non-blocking view event in backend funnel
      try {
        fetch(`/l/${landingPage.slug}/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({
            event_name: 'view_content',
            value: val,
            currency: 'BDT',
            ...campaignParams,
          }),
        });
      } catch (e) {}
    }
  }, [landingPage.slug]);

  // Pricing calculations
  const unitPrice = pricing?.final_price || Number(product?.price || 0);
  const regularPrice = pricing?.original_price || Number(product?.regular_price || unitPrice);
  const subtotal = unitPrice * formData.quantity;
  
  const shippingFee = useMemo(() => {
    if (deliveryRates.is_free) return 0;
    const isDhaka = String(formData.district).toLowerCase().trim() === 'dhaka';
    return isDhaka ? Number(deliveryRates.inside_dhaka || 60) : Number(deliveryRates.outside_dhaka || 120);
  }, [formData.district, deliveryRates]);

  const totalPayable = subtotal + shippingFee;
  const discountPerUnit = Math.max(0, regularPrice - unitPrice);
  const discountPercent = regularPrice > unitPrice ? Math.round(((regularPrice - unitPrice) / regularPrice) * 100) : 0;

  const scrollToOrder = () => {
    const el = document.getElementById('order-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    handleFormInteraction();
  };

  const handleFormInteraction = () => {
    if (!hasTrackedInitiate && product?.id) {
      setHasTrackedInitiate(true);
      const contentId = getCanonicalContentId(product);
      trackInitiateCheckout(totalPayable, [contentId], 'BDT');

      try {
        fetch(`/l/${landingPage.slug}/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({
            event_name: 'initiate_checkout',
            value: totalPayable,
            currency: 'BDT',
            ...campaignParams,
          }),
        });
      } catch (e) {}
    }
  };

  const handlePaymentMethodSelect = (pmId) => {
    setFormData(prev => ({ ...prev, payment_method: pmId }));
    trackAddPaymentInfo(totalPayable, 'BDT', pmId);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderError(null);

    if (!formData.customer_name.trim()) {
      setOrderError('অনুগ্রহ করে আপনার পুরো নাম লিখুন (Please enter your name).');
      return;
    }
    if (!formData.customer_phone.trim() || formData.customer_phone.trim().length < 11) {
      setOrderError('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (Valid 11-digit phone required).');
      return;
    }
    if (!formData.shipping_address.trim()) {
      setOrderError('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (Full address required).');
      return;
    }

    setSubmitting(true);
    const eventId = generateEventId('LP_ORDER');

    try {
      const response = await fetch(`/l/${landingPage.slug}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          ...formData,
          ...campaignParams,
          event_id: eventId,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        setOrderError(resData.message || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        setSubmitting(false);
        return;
      }

      if (product?.id) {
        const contentId = getCanonicalContentId(product);
        trackPurchase(resData.order_number, resData.total || totalPayable, [contentId], 'BDT', {
          event_id: resData.event_id || eventId,
          campaign_name: landingPage.campaign_name,
        });
      }

      if (resData.redirect_url) {
        window.location.href = resData.redirect_url;
      } else {
        router.visit(`/invoice/${resData.order_number}`);
      }
    } catch (err) {
      setOrderError('একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 font-['Hind_Siliguri',sans-serif] selection:bg-amber-400 selection:text-slate-950 antialiased">
      {/* SEO & Structured Data Head */}
      <Head>
        <title>{landingPage.meta_title || `${landingPage.name} — TechMarket BD`}</title>
        <meta name="description" content={landingPage.meta_description || strip_tags(product?.description || landingPage.name)} />
        {landingPage.meta_image && <meta property="og:image" content={landingPage.meta_image} />}
        <meta property="og:title" content={landingPage.meta_title || landingPage.name} />
        <meta property="og:description" content={landingPage.meta_description || strip_tags(product?.description || '')} />
        <meta property="og:url" content={landingPage.public_url} />
        <meta property="og:type" content="product" />
        {structuredSchemas?.product && (
          <script type="application/ld+json">
            {JSON.stringify(structuredSchemas.product)}
          </script>
        )}
      </Head>

      {/* Custom CSS Injected */}
      {landingPage.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: landingPage.custom_css }} />
      )}

      {/* SECTION 1 — TOP TRUST BAR */}
      <TopTrustBar callNumber={landingPage.call_number || '09678-123456'} />

      {/* SECTION 2 & 3 — HERO SECTION + QUICK ORDER FORM */}
      <HeroSection
        landingPage={landingPage}
        product={product}
        unitPrice={unitPrice}
        regularPrice={regularPrice}
        discountPercent={discountPercent}
        timeLeft={timeLeft}
        formData={formData}
        setFormData={setFormData}
        districts={districts}
        paymentMethods={paymentMethods}
        subtotal={subtotal}
        shippingFee={shippingFee}
        totalPayable={totalPayable}
        submitting={submitting}
        orderError={orderError}
        handleFormInteraction={handleFormInteraction}
        handlePaymentMethodSelect={handlePaymentMethodSelect}
        handleOrderSubmit={handleOrderSubmit}
      />

      {/* SECTION 4 — TRUST / BENEFITS BAR */}
      <BenefitsBar />

      {/* SECTION 5 — WHY THIS TV/PRODUCT BEST */}
      <FeaturesSection
        title={landingPage.features_title || 'কেন এই টিভি সেরা?'}
      />

      {/* SECTION 6 & 7 — PRODUCT DETAILS & PRICE BREAKDOWN */}
      <ProductDetailsSection
        product={product}
        unitPrice={unitPrice}
        regularPrice={regularPrice}
        discountAmount={discountPerUnit}
      />

      {/* SECTION 8 — OFFER / FREE GIFT BANNER */}
      <OfferBanner
        title="এই অফারে যা যা পাচ্ছেন!"
        subtitle="আজকের অর্ডারের সাথে নিশ্চিত বোনাস সুবিধা"
      />

      {/* SECTION 9 — CUSTOMER REVIEWS */}
      <ReviewsSection reviews={reviews} />

      {/* SECTION 10 — FAQ ACCORDION */}
      <FAQSection deliveryRates={deliveryRates} />

      {/* SECTION 11 — FINAL CONVERSION CTA */}
      <FinalCTA callNumber={landingPage.call_number || '09678-123456'} />

      {/* SECTION 12 — FINAL TRUST BAR */}
      <FinalTrustBar />

      {/* SECTION 13 — BRAND RICH FOOTER */}
      {landingPage.show_footer !== false && <LandingFooter />}

      {/* STICKY MOBILE BOTTOM ORDER BAR */}
      {landingPage.show_sticky_order_btn !== false && (
        <StickyOrderBar
          unitPrice={unitPrice}
          scrollToOrder={scrollToOrder}
        />
      )}

      {/* FLOATING WHATSAPP & CALL BUTTONS */}
      <div className="fixed bottom-16 sm:bottom-6 right-4 z-40 flex flex-col gap-2.5">
        {landingPage.show_whatsapp_btn !== false && landingPage.whatsapp_number && (
          <a
            href={`https://wa.me/88${landingPage.whatsapp_number.replace(/\D/g, '')}?text=Hello%20TechMarket%20BD,%20I%20want%20to%20order%20${encodeURIComponent(product?.title || landingPage.name)}`}
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-6 h-6" />
          </a>
        )}

        {landingPage.show_call_btn !== false && landingPage.call_number && (
          <a
            href={`tel:${landingPage.call_number.replace(/[^0-9+]/g, '')}`}
            className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
            title="Call Support Helpline"
          >
            <Phone className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  );
}

function strip_tags(str = '') {
  return String(str).replace(/<\/?[^>]+(>|$)/g, '');
}
