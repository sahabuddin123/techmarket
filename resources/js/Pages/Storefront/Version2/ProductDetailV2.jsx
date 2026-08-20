import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import NavbarV2 from './Components/NavbarV2';
import FooterV2 from './Components/FooterV2';
import CartDrawer from '@/Components/CartDrawer';
import ProductCardV2 from './Components/ProductCardV2';
import { trackViewContent, trackAddToCart } from '@/lib/tracking';
import { 
  ShoppingCart, Heart, ArrowRightLeft, ShieldCheck, 
  Check, Star, ChevronLeft, ChevronRight, Share2, 
  HelpCircle, MessageSquare, Plus, Minus, Tag, CheckCircle2, User,
  X, Building2, Calculator, CreditCard, Info, ShieldAlert, FileText,
  Truck, Award, Clock, Headphones, Zap, Timer, Sparkles
} from 'lucide-react';

export default function ProductDetailV2(props) {
  // Normalize incoming props with complete defensive null-safety
  const product = props?.product || {};
  const relatedProducts = Array.isArray(props?.relatedProducts) ? props.relatedProducts : [];
  const specifications = Array.isArray(props?.specifications) ? props.specifications : [];
  const breadcrumbs = Array.isArray(props?.breadcrumbs) && props.breadcrumbs.length > 0
    ? props.breadcrumbs
    : [{ label: 'Home', url: '/' }, { label: product?.title || 'Product', url: '#' }];
  const reviews = Array.isArray(props?.reviews) ? props.reviews : [];
  const ratingSummary = props?.ratingSummary || { average: 5.0, count: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  const questions = Array.isArray(props?.questions) ? props.questions : [];
  const categoryFaqs = Array.isArray(props?.categoryFaqs) ? props.categoryFaqs : [];
  const emiPartners = Array.isArray(props?.emiPartners) && props.emiPartners.length > 0
    ? props.emiPartners
    : [
        { id: 1, bank_name: 'City Bank (Amex)', min_amount: 5000, available_tenures: [3, 6, 9, 12, 18, 24, 36], interest_rate_note: '0% Interest up to 12 months' },
        { id: 2, bank_name: 'BRAC Bank', min_amount: 5000, available_tenures: [3, 6, 9, 12, 24], interest_rate_note: '0% Interest on selected credit cards' },
        { id: 3, bank_name: 'Eastern Bank (EBL)', min_amount: 5000, available_tenures: [3, 6, 9, 12, 24], interest_rate_note: '0% Interest facility available' },
        { id: 4, bank_name: 'Standard Chartered', min_amount: 10000, available_tenures: [3, 6, 9, 12], interest_rate_note: 'SCB EasyPay 0% available' },
        { id: 5, bank_name: 'Dutch-Bangla Bank (DBBL)', min_amount: 5000, available_tenures: [3, 6, 9, 12, 24], interest_rate_note: 'InstaPay 0% facility' },
        { id: 6, bank_name: 'Mutual Trust Bank (MTB)', min_amount: 5000, available_tenures: [3, 6, 9, 12], interest_rate_note: 'FlexiPay available' },
      ];
  const { auth = {}, settings = {} } = usePage().props;

  // Component UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('specification');
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [compareAdded, setCompareAdded] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState(12);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Question Form State
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState(false);

  // Price & Savings Calculation
  const currentPrice = Number(product.flash_price || product.price || 0);
  const regularPrice = Number(product.regular_price || 0);
  const savings = regularPrice > currentPrice ? regularPrice - currentPrice : 0;
  const isOutOfStock = Number(product.stock || 0) <= 0 && !product.is_deal_of_day;
  const isFlashSaleActive = Boolean(props?.isFlashSale || product?.is_deal_of_day || props?.offer);

  // Gallery Images Normalization
  const galleryImages = useMemo(() => {
    const list = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach(img => {
        if (img && typeof img === 'string' && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop');
    }
    return list;
  }, [product.image, product.gallery]);

  const activeImage = galleryImages[selectedImageIndex] || galleryImages[0];

  // Key Specifications Highlights
  const keySpecsList = useMemo(() => {
    if (Array.isArray(product.key_specs)) return product.key_specs;
    if (typeof product.key_specs === 'object' && product.key_specs !== null) {
      return Object.entries(product.key_specs).map(([k, v]) => `${k}: ${v}`);
    }
    // Fallback extract from specifications groups
    const list = [];
    specifications.forEach(g => {
      if (Array.isArray(g.attributes)) {
        g.attributes.forEach(a => {
          if (list.length < 5) list.push(`${a.name}: ${a.value}`);
        });
      }
    });
    return list;
  }, [product.key_specs, specifications]);

  // Trigger ViewContent tracking event on mount
  useEffect(() => {
    if (product?.id) {
      trackViewContent(product);
    }
  }, [product?.id]);

  // Handle Add to Cart
  const handleAddToCart = (directCheckout = false) => {
    if (isOutOfStock) return;
    trackAddToCart(product, quantity);
    router.post('/cart/add', { product_id: product.id, quantity }, {
      preserveScroll: true,
      onSuccess: () => {
        setAdded(true);
        if (directCheckout) {
          router.get('/checkout');
        } else {
          setIsCartOpen(true);
          setTimeout(() => setAdded(false), 2000);
        }
      }
    });
  };

  // Handle Wishlist
  const handleWishlist = (e) => {
    e.preventDefault();
    router.post('/wishlist/toggle', { product_id: product.id }, {
      preserveScroll: true,
      onSuccess: () => {
        setWishlistAdded(true);
        setTimeout(() => setWishlistAdded(false), 2000);
      }
    });
  };

  // Handle Compare
  const handleCompare = (e) => {
    e.preventDefault();
    router.post('/compare/add', { product_id: product.id }, {
      preserveScroll: true,
      onSuccess: () => {
        setCompareAdded(true);
        setTimeout(() => setCompareAdded(false), 2000);
      }
    });
  };

  // Scroll to section helper
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const seo = props?.seo || {};

  return (
    <div className="storefront-v2 min-h-screen bg-[#f3f6fa] text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Head>
        <title>{seo.title || `${product.title || 'Product'} Price in Bangladesh | TechMarket BD`}</title>
        <meta name="description" content={seo.description || `Buy ${product.title} at best price in Bangladesh from TechMarket BD.`} />
        {seo.canonical_url && <link rel="canonical" href={seo.canonical_url} />}
        {seo.meta_robots && <meta name="robots" content={seo.meta_robots} />}

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={seo.og?.title || seo.title} />
        <meta property="og:description" content={seo.og?.description || seo.description} />
        <meta property="og:image" content={seo.og?.image || product.image} />
        <meta property="og:url" content={seo.og?.url || seo.canonical_url} />
        <meta property="og:type" content="product" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.twitter?.title || seo.og?.title || seo.title} />
        <meta name="twitter:description" content={seo.twitter?.description || seo.og?.description || seo.description} />
        <meta name="twitter:image" content={seo.twitter?.image || seo.og?.image || product.image} />

        {/* JSON-LD Structured Data Schema */}
        {seo.json_ld && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.json_ld) }} />
        )}
      </Head>

      {/* 1. TOP HEADER & NAVIGATION (Version 2) */}
      <NavbarV2 onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MAIN CONTAINER (Version 2 max-w-[1360px]) */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        
        {/* 2. MODERN BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto py-1 select-none">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-extrabold text-slate-900 truncate max-w-md">{bc.label}</span>
              ) : (
                <Link href={bc.url} className="hover:text-blue-600 transition-colors shrink-0">
                  {bc.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* 3. PRODUCT HERO CARD (Version 2 Modern White Surface) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Left Gallery (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Image Container */}
              <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl aspect-square flex items-center justify-center p-6 relative group overflow-hidden shadow-2xs">
                {savings > 0 && (
                  <span className="absolute top-3.5 left-3.5 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg z-10 shadow-xs flex items-center gap-1">
                    <Tag className="w-3 h-3 fill-current" />
                    <span>Save ৳{savings.toLocaleString()}</span>
                  </span>
                )}

                <img
                  src={activeImage}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />

                {/* Official Warranty Badge */}
                <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-blue-200 rounded-xl px-2.5 py-1 text-xs font-black text-blue-700 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>OFFICIAL WARRANTY</span>
                </div>
              </div>

              {/* Thumbnail Carousel */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs cursor-pointer"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex gap-2 overflow-x-auto py-1 custom-scrollbar">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl border p-1 shrink-0 bg-white cursor-pointer transition-all ${
                          selectedImageIndex === idx
                            ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs cursor-pointer"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Product Details & Purchase Card (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                {/* Brand & Category Pill */}
                <div className="flex flex-wrap items-center gap-2">
                  {product.brand && (
                    <Link
                      href={`/brand/${product.brand.slug}`}
                      className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs uppercase tracking-wider hover:bg-blue-100 transition-colors"
                    >
                      {product.brand.name}
                    </Link>
                  )}
                  {product.category && (
                    <Link
                      href={`/category/${product.category.slug}`}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                    >
                      {product.category.name}
                    </Link>
                  )}
                </div>

                {/* Main Title */}
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                  {product.title}
                </h1>

                {/* Ratings & Interactive Helper Row */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-4 h-4 fill-current text-amber-400" />
                      ))}
                    </div>
                    <span className="text-slate-800 font-bold text-xs">
                      {ratingSummary.average} ({reviews.length} reviews)
                    </span>
                  </div>

                  <span className="text-slate-300">|</span>

                  <button 
                    type="button" 
                    onClick={() => setShowDisclaimerModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Disclaimer</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => scrollToSection('questions')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Question</span>
                  </button>
                </div>

                {/* Metadata Tags Pill Strip */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-2 pb-3 border-b border-slate-100">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-extrabold ${
                    isOutOfStock ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isOutOfStock ? '● Out of Stock' : '✓ In Stock'}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-200/80">
                    PID: <strong>P0{String(product.id).padStart(8, '0')}</strong>
                  </span>
                  {product.sku && (
                    <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-200/80">
                      SKU: <strong>{product.sku}</strong>
                    </span>
                  )}
                  {product.warranty && (
                    <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
                      Warranty: <strong>{product.warranty}</strong>
                    </span>
                  )}
                </div>

                {/* Deal of the Day Banner if Active */}
                {isFlashSaleActive && (
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md border border-blue-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                        <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <span className="font-black text-sm block tracking-wide uppercase text-amber-400">
                          {props?.offer?.title || (product.is_deal_of_day ? 'Deal of the Day' : 'Flash Sale Campaign')}
                        </span>
                        <span className="text-xs text-slate-200 font-medium">
                          {savings > 0 ? `Special discount: Save ৳${savings.toLocaleString()}` : 'Limited promotional pricing'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-black/40 text-white px-3 py-2 rounded-xl text-xs font-mono font-black border border-white/10">
                      <Timer className="w-3.5 h-3.5 text-amber-400 mr-1" />
                      <span>13D</span>
                      <span className="text-amber-400">:</span>
                      <span>23H</span>
                      <span className="text-amber-400">:</span>
                      <span>40M</span>
                    </div>
                  </div>
                )}

                {/* Short Description */}
                {product.short_description && (
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    <p>{product.short_description}</p>
                  </div>
                )}

                {/* Key Features Bullet Points */}
                {keySpecsList.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      Key Highlights:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {keySpecsList.slice(0, 6).map((spec, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-[#f8fafc] p-2 rounded-xl border border-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <span className="leading-tight font-medium">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Dual Price Boxes: Cash Price + EMI Card */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Cash Price Box */}
                  <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      {isFlashSaleActive 
                        ? (product.is_deal_of_day ? 'Deal Price' : 'Flash Price')
                        : (savings > 0 ? 'Special Cash Price' : 'Regular Price')}
                    </span>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl sm:text-3xl font-black text-blue-600 leading-none">
                        ৳{currentPrice.toLocaleString()}
                      </span>
                      {regularPrice > currentPrice && (
                        <span className="text-sm text-slate-400 line-through font-bold">
                          ৳{regularPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="pt-1">
                      <Link
                        href="/payment-terms"
                        className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Payment Methods & Terms</span>
                      </Link>
                    </div>
                  </div>

                  {/* Right: EMI Card */}
                  <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      EMI Facility Starts From*
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                        ৳{Math.round(currentPrice / 36 || 218).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-500">/ month</span>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowEmiModal(true)}
                        className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>View Bank EMI Plans</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector & Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-white p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Decrease Quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-10 text-center text-xs font-black border-none focus:outline-none focus:ring-0 p-0 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Increase Quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    disabled={isOutOfStock}
                    className={`flex-1 min-w-[140px] py-3 px-5 rounded-2xl text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                        : added
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now Button */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    disabled={isOutOfStock}
                    className="py-3 px-5 rounded-2xl text-white text-xs font-black uppercase tracking-wider bg-[#0b1a36] hover:bg-[#162a52] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <span>Buy Now</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    type="button"
                    onClick={handleWishlist}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    title="Add to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wishlistAdded ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Compare */}
                  <button
                    type="button"
                    onClick={handleCompare}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    title="Add to Compare"
                  >
                    <ArrowRightLeft className={`w-4 h-4 ${compareAdded ? 'text-blue-600' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. SERVICE & TRUST STRIP (Version 2 4-Card Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">100% Original</h4>
              <p className="text-[11px] text-slate-500 font-medium">Official Brand Products</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Fast Delivery</h4>
              <p className="text-[11px] text-slate-500 font-medium">Within 24-48 Hours</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Official Warranty</h4>
              <p className="text-[11px] text-slate-500 font-medium">Verified Support</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Expert Support</h4>
              <p className="text-[11px] text-slate-500 font-medium">24/7 Dedicated Care</p>
            </div>
          </div>
        </div>

        {/* 5. PRODUCT TABS NAVIGATION & CONTENT SECTION */}
        <div className="space-y-6">
          {/* Tabs Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 flex flex-wrap gap-2 sticky top-20 z-20 shadow-xs">
            {[
              { id: 'specification', label: 'Specification' },
              { id: 'description', label: 'Description' },
              { id: 'questions', label: `Questions & Answers (${questions.length})` },
              { id: 'reviews', label: `Customer Reviews (${reviews.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Full Specifications */}
          <section id="specification" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight pb-3 border-b border-slate-100">
              Detailed Specifications
            </h2>

            {specifications.length > 0 ? (
              <div className="space-y-6">
                {specifications.map((group, gIdx) => (
                  <div key={gIdx} className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    {/* Group Header */}
                    <div className="bg-[#f8fafc] text-slate-900 font-extrabold text-xs uppercase tracking-wider px-4 py-3 border-b border-slate-200/80 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>{group.group || 'General Specifications'}</span>
                    </div>

                    {/* Specification Table */}
                    <table className="w-full text-xs text-left">
                      <tbody className="divide-y divide-slate-100">
                        {group.attributes && group.attributes.map((attr, aIdx) => (
                          <tr key={aIdx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="w-2/5 sm:w-1/3 px-4 py-3 font-bold text-slate-600 bg-slate-50/50 border-r border-slate-100">
                              {attr.name}
                            </td>
                            <td className="px-4 py-3 text-slate-900 font-semibold">
                              {attr.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#f8fafc] rounded-2xl font-medium">
                Standard manufacturer specifications apply with official brand warranty.
              </div>
            )}
          </section>

          {/* Tab 2: Description */}
          <section id="description" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight pb-3 border-b border-slate-100">
              Product Overview & Description
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {product.title} in Bangladesh
              </h3>

              {product.description ? (
                <div
                  className="leading-relaxed prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="leading-relaxed text-slate-600">
                  Get the genuine <strong>{product.title}</strong> at the best price in Bangladesh from TechMarket BD. 
                  Order online or visit our showroom to get authentic products with official manufacturer warranty and dedicated customer support.
                </p>
              )}
            </div>
          </section>

          {/* Tab 3: Questions & Answers */}
          <section id="questions" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                Questions & Answers ({questions.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowQuestionForm(prev => !prev)}
                className="text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Ask a Question
              </button>
            </div>

            {/* Question Submission Form */}
            {showQuestionForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!questionText.trim()) return;
                  setSubmittingQuestion(true);
                  router.post('/questions', { product_id: product.id, question: questionText }, {
                    preserveScroll: true,
                    onSuccess: () => {
                      setSubmittingQuestion(false);
                      setQuestionSuccess(true);
                      setQuestionText('');
                      setTimeout(() => setQuestionSuccess(false), 3000);
                    },
                    onError: () => setSubmittingQuestion(false)
                  });
                }}
                className="bg-[#f8fafc] border border-slate-200 p-4 rounded-2xl space-y-3"
              >
                <span className="text-xs font-black text-slate-900 block">Your Question:</span>
                <textarea
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ask about product details, warranty, specifications, delivery..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Our expert team answers within 24 hours.</span>
                  <button
                    type="submit"
                    disabled={submittingQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2 rounded-xl cursor-pointer shadow-xs"
                  >
                    {submittingQuestion ? 'Submitting...' : 'Submit Question'}
                  </button>
                </div>
                {questionSuccess && (
                  <span className="text-xs text-emerald-600 font-extrabold block">
                    Thank you! Your question has been submitted for review.
                  </span>
                )}
              </form>
            )}

            {/* Questions List */}
            {questions.length > 0 ? (
              <div className="divide-y divide-slate-100 space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="pt-4 first:pt-0 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-black text-blue-600 shrink-0">Q.</span>
                      <span className="font-extrabold text-slate-900">{q.question}</span>
                    </div>
                    {q.answer ? (
                      <div className="flex items-start gap-2 pl-4 text-slate-700 bg-[#f8fafc] p-3 rounded-xl border border-slate-100">
                        <span className="font-black text-emerald-600 shrink-0">Ans:</span>
                        <span>{q.answer}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 pl-4 block">Pending answer from tech support.</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#f8fafc] rounded-2xl font-medium">
                There are no questions asked yet. Be the first to ask!
              </div>
            )}
          </section>

          {/* Tab 4: Customer Reviews */}
          <section id="reviews" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                Customer Reviews ({reviews.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowReviewForm(prev => !prev)}
                className="text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Write a Review
              </button>
            </div>

            {/* Rating Summary Box */}
            <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-8">
              <div className="text-center sm:text-left shrink-0 space-y-1">
                <span className="text-4xl font-black text-slate-900 leading-none block">{ratingSummary.average}</span>
                <div className="flex justify-center sm:justify-start my-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-bold">Based on {ratingSummary.count} verified ratings</span>
              </div>

              {/* Rating Distribution Bars */}
              <div className="flex-1 w-full space-y-1.5 text-xs font-bold text-slate-600">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = ratingSummary.counts?.[stars] || 0;
                  const pct = ratingSummary.count > 0 ? (count / ratingSummary.count) * 100 : (stars === 5 ? 100 : 0);
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-12">{stars} Star</span>
                      <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="divide-y divide-slate-100 space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{rev.user?.name || 'Customer'}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">Verified Buyer</span>
                      </div>
                      <span className="text-slate-400 font-medium">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= (rev.rating || 5) ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>

                    {rev.comment && (
                      <p className="text-slate-700 leading-relaxed pt-1">{rev.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#f8fafc] rounded-2xl font-medium">
                There are no reviews for this product yet.
              </div>
            )}
          </section>
        </div>

        {/* 6. RELATED PRODUCTS SECTION (Version 2 Responsive Product Card Grid) */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  RELATED PRODUCTS
                </h2>
              </div>

              {product.category && (
                <Link
                  href={`/category/${product.category.slug}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
                >
                  <span>View All in {product.category.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.slice(0, 6).map((rel) => (
                <ProductCardV2 key={`related-${rel.id}`} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 7. BANK EMI PLANS MODAL */}
      {showEmiModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowEmiModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Bank EMI Facilities</h3>
                  <p className="text-xs text-slate-500 font-medium">Calculate monthly installments across all partner banks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmiModal(false)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              {/* Product Info Bar */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1.5 shrink-0 flex items-center justify-center">
                  <img src={activeImage} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">{product.title}</h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-black text-blue-600">৳{currentPrice.toLocaleString()}</span>
                    {regularPrice > currentPrice && (
                      <span className="text-xs text-slate-400 line-through font-bold">৳{regularPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block uppercase font-extrabold">Starting EMI</span>
                  <span className="text-sm font-black text-slate-900">৳{Math.round(currentPrice / 36 || 218).toLocaleString()}/mo</span>
                </div>
              </div>

              {/* Tenure Selector */}
              <div>
                <label className="text-xs font-black text-slate-900 block mb-2">
                  Select EMI Tenure (Months):
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[3, 6, 9, 12, 18, 24, 36].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setSelectedTenure(months)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        selectedTenure === months
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <span>{months} M</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank EMI Comparison Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-4 py-2.5 text-[11px] font-black text-slate-600 grid grid-cols-12 uppercase tracking-wider">
                  <div className="col-span-5">Partner Bank</div>
                  <div className="col-span-4 text-right">Monthly (৳)</div>
                  <div className="col-span-3 text-right">Availability</div>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {emiPartners.map((partner) => {
                    const tenures = Array.isArray(partner.available_tenures) 
                      ? partner.available_tenures.map(Number) 
                      : [3, 6, 9, 12, 24];
                    const minAmount = Number(partner.min_amount || 5000);
                    const isSupported = tenures.includes(Number(selectedTenure));
                    const isEligible = currentPrice >= minAmount && isSupported;
                    const monthlyAmount = Math.round(currentPrice / Number(selectedTenure));

                    return (
                      <div key={partner.id || partner.bank_name} className="px-4 py-3 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-colors text-xs">
                        <div className="col-span-5">
                          <span className="font-extrabold text-slate-900 block">{partner.bank_name}</span>
                          <span className="text-[10px] text-slate-500 block font-medium">{partner.interest_rate_note || '0% Interest available'}</span>
                        </div>
                        <div className="col-span-4 text-right">
                          <span className={`font-black block ${isEligible ? 'text-blue-600' : 'text-slate-400'}`}>
                            ৳{monthlyAmount.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">/ mo</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">for {selectedTenure} months</span>
                        </div>
                        <div className="col-span-3 text-right">
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Available
                            </span>
                          ) : !isSupported ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                              No {selectedTenure}M plan
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                              Min ৳{minAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notice */}
              <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3.5 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-2 font-black">
                  <Info className="w-4 h-4 text-blue-700" />
                  <span>How to avail Bank EMI:</span>
                </div>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  1. Bank EMI is supported on all credit cards issued by participating partner banks.<br />
                  2. Select <strong>Credit Card / Online EMI</strong> at checkout, pick your bank, and choose your preferred tenure.<br />
                  3. Zero-cost 0% EMI applies to designated promotion cards with tenure up to 12 months.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Link
                href="/tools/emi-calculator"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:underline"
              >
                <Calculator className="w-4 h-4" />
                <span>Open Advanced EMI Calculator</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowEmiModal(false)}
                className="px-5 py-2 text-xs font-extrabold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PRODUCT DISCLAIMER MODAL */}
      {showDisclaimerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowDisclaimerModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Product & Warranty Disclaimer</h3>
                  <p className="text-xs text-slate-500 font-medium">Official guidelines regarding specifications, warranty, and pricing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDisclaimerModal(false)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 flex-1 custom-scrollbar">
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 mb-0.5">Specification & Feature Accuracy</h4>
                  <p className="leading-relaxed text-slate-600 text-[11px]">
                    Product photos, highlights, and technical specifications are provided by official manufacturers. Minor physical revisions, color nuances, or box design updates may occur across production batches without prior notice.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 mb-0.5">Pricing & Market Availability</h4>
                  <p className="leading-relaxed text-slate-600 text-[11px]">
                    Listed prices, cash discounts, and promotional flash sale deals in Bangladeshi Taka (BDT) are subject to global component supply and distributor MSRP adjustments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 mb-0.5">Official Manufacturer Warranty</h4>
                  <p className="leading-relaxed text-slate-600 text-[11px]">
                    Warranty claims are honored strictly per official distributor and brand guidelines in Bangladesh. Physical damage, liquid spillage, burn marks, unauthorized BIOS flashing, and broken seal stickers void all warranty coverage.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Link
                href="/terms"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>Read Full Terms & Policies →</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowDisclaimerModal(false)}
                className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center gap-3 lg:hidden shadow-lg">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Price</span>
          <span className="text-base font-black text-blue-600 leading-none">৳{currentPrice.toLocaleString()}</span>
        </div>

        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={isOutOfStock}
          className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>

        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={isOutOfStock}
          className="py-2.5 px-4 rounded-xl bg-[#0b1a36] hover:bg-[#162a52] text-white text-xs font-extrabold uppercase tracking-wider shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <span>Buy Now</span>
        </button>
      </div>

      {/* 10. DARK FOOTER (Version 2) */}
      <FooterV2 onOpenCart={() => setIsCartOpen(true)} />
    </div>
  );
}
