import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { trackViewContent, trackAddToCart } from '@/lib/tracking';
import { 
  ShoppingCart, Heart, ArrowRightLeft, ShieldCheck, 
  Check, Star, ChevronLeft, ChevronRight, Share2, 
  HelpCircle, MessageSquare, Plus, Minus, Tag, CheckCircle2, User,
  X, Building2, Calculator, CreditCard, Info, ShieldAlert, FileText
} from 'lucide-react';

export default function ProductDetail(props) {
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
  const { auth = {} } = usePage().props;

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
        // Optional navigation or toast notification
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
    <div className="min-h-screen bg-[#f2f4f8] text-[#333] font-sans flex flex-col selection:bg-[#002a5c] selection:text-white">
      <Head>
        <title>{seo.title || `${product.title || 'Product'} Price in Bangladesh | TechLand BD`}</title>
        <meta name="description" content={seo.description || `Buy ${product.title} at best price in Bangladesh.`} />
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

      {/* 1. TOP HEADER & NAVIGATION */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MAIN CONTAINER (Centered narrow max-w-[1240px]) */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-2.5 sm:px-4 py-2.5 space-y-2.5">
        
        {/* 2. BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[#666] overflow-x-auto py-0.5 select-none">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#999] font-normal shrink-0">&gt;</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-[#111] truncate">{bc.label}</span>
              ) : (
                <Link href={bc.url} className="hover:text-[#0066cc] transition-colors shrink-0">
                  {bc.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* 3. MAIN PRODUCT SECTION: TWO-COLUMN LAYOUT (Left Sidebar 225px + Right Main Content) */}
        <div className="flex flex-col lg:flex-row gap-3.5 items-start">

          {/* ================= LEFT SIDEBAR: RELATED PRODUCTS ================= */}
          <aside className="hidden lg:block w-[225px] shrink-0 space-y-2 text-[12px]">
            <div className="bg-white rounded-[3px] border border-[#e2e8f0] p-3 shadow-none space-y-2.5">
              <h3 className="font-bold text-[13px] text-[#111] uppercase tracking-wide pb-2 border-b border-[#eee]">
                Related Product
              </h3>

              <div className="divide-y divide-[#eee] space-y-2.5">
                {relatedProducts.slice(0, 7).map((rel) => {
                  const relPrice = Number(rel.flash_price || rel.price || 0);
                  const relRegular = Number(rel.regular_price || 0);

                  return (
                    <div key={rel.id} className="pt-2.5 first:pt-0 flex gap-2.5 items-center group">
                      <Link
                        href={`/product/${rel.slug}`}
                        className="w-14 h-14 bg-white border border-[#eee] rounded-[2px] p-1 flex items-center justify-center shrink-0 overflow-hidden"
                      >
                        <img
                          src={rel.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150&auto=format&fit=crop'}
                          alt={rel.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${rel.slug}`}
                          className="text-[11px] font-semibold text-[#111] hover:text-[#0066cc] transition-colors line-clamp-2 leading-tight"
                          title={rel.title}
                        >
                          {rel.title}
                        </Link>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-[12px] font-bold text-[#d32f2f]">
                            ৳{relPrice.toLocaleString()}
                          </span>
                          {relRegular > relPrice && (
                            <span className="text-[10px] text-[#888] line-through">
                              ৳{relRegular.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ================= RIGHT MAIN PRODUCT CONTENT ================= */}
          <div className="flex-1 min-w-0 space-y-3.5">
            
            {/* FLASH SALE / OFFER TOP HEADER BANNER (Only when actually on Flash Sale, Deal of the Day, or Active Campaign) */}
            {isFlashSaleActive && (
              <div className="bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white rounded-t-[3px] p-2.5 sm:px-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Tag className="w-3.5 h-3.5 fill-current text-white" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs sm:text-sm block leading-tight">
                      {props?.offer?.title || (product.is_deal_of_day ? 'Deal of the Day' : 'Flash Sale Deal')}
                    </span>
                    <span className="text-[10px] sm:text-xs text-orange-100 font-medium">
                      {savings > 0 ? `Save ৳${savings.toLocaleString()} on this limited time deal` : 'Exclusive promotional price'}
                    </span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-1 text-slate-900">
                  <span className="text-[9px] font-black text-white uppercase tracking-wider mr-1 hidden sm:inline">ENDS IN</span>
                  <div className="bg-white rounded px-1.5 py-0.5 text-center min-w-[26px]">
                    <span className="block text-[11px] font-black leading-tight text-slate-900">13</span>
                    <span className="block text-[7px] text-slate-500 uppercase font-bold">Days</span>
                  </div>
                  <div className="bg-white rounded px-1.5 py-0.5 text-center min-w-[26px]">
                    <span className="block text-[11px] font-black leading-tight text-slate-900">23</span>
                    <span className="block text-[7px] text-slate-500 uppercase font-bold">Hrs</span>
                  </div>
                  <div className="bg-white rounded px-1.5 py-0.5 text-center min-w-[26px]">
                    <span className="block text-[11px] font-black leading-tight text-slate-900">40</span>
                    <span className="block text-[7px] text-slate-500 uppercase font-bold">Min</span>
                  </div>
                  <div className="bg-white rounded px-1.5 py-0.5 text-center min-w-[26px]">
                    <span className="block text-[11px] font-black leading-tight text-slate-900">48</span>
                    <span className="block text-[7px] text-slate-500 uppercase font-bold">Sec</span>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT CARD: GALLERY + INFO & PURCHASE */}
            <div className={`bg-white border border-[#e2e8f0] p-4 sm:p-5 shadow-none ${
              isFlashSaleActive ? 'rounded-b-[3px] border-t-0' : 'rounded-[3px]'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Left Gallery (5 cols) */}
                <div className="md:col-span-5 space-y-3">
                  <div className="bg-white border border-[#e2e8f0] rounded-[3px] aspect-square flex items-center justify-center p-3 relative group overflow-hidden">
                    {savings > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-[#00897b] text-white font-bold text-[10px] px-2 py-0.5 rounded-[2px] z-10">
                        Save: ৳{savings.toLocaleString()}
                      </span>
                    )}

                    <img
                      src={activeImage}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Official Warranty Badge */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 border border-blue-900/40 rounded-[2px] px-1.5 py-0.5 text-[9px] font-black text-blue-900 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-blue-800" />
                      <span>OFFICIAL</span>
                    </div>
                  </div>

                  {/* Thumbnail Carousel */}
                  {galleryImages.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                        className="p-1 rounded-[2px] border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#666]"
                        aria-label="Previous Image"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex-1 flex gap-1.5 overflow-x-auto py-1 custom-scrollbar">
                        {galleryImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-12 h-12 rounded-[2px] border p-0.5 shrink-0 bg-white cursor-pointer transition-all ${
                              selectedImageIndex === idx
                                ? 'border-[#002a5c] ring-1 ring-[#002a5c]'
                                : 'border-[#e2e8f0] hover:border-[#888]'
                            }`}
                          >
                            <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                        className="p-1 rounded-[2px] border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#666]"
                        aria-label="Next Image"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Product Details & Purchase Card (7 cols) */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Main Title */}
                    <h1 className="text-[16px] sm:text-[18px] font-bold text-[#111] leading-snug tracking-tight">
                      {product.title}
                    </h1>

                    {/* Ratings, Disclaimer & Suggestion Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-1.5 pb-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-3 h-3 fill-current text-slate-300" />
                          ))}
                        </div>
                        <span className="text-[#333] font-medium text-[11px]">
                          {reviews.length} Reviews
                        </span>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => setShowDisclaimerModal(true)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Disclaimer</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => scrollToSection('questions')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Suggestion</span>
                      </button>
                    </div>

                    {/* Metadata Tags Row Matching Reference Screenshot */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#666] pb-2 border-b border-[#eee]">
                      <span>Stock : <strong className={isOutOfStock ? 'text-red-600' : 'text-emerald-700'}>{isOutOfStock ? 'Out of Stock' : 'In Stock'}</strong></span>
                      <span className="text-[#ccc]">|</span>
                      <span>PID : <strong className="text-[#111]">P0{String(product.id).padStart(8, '0')}</strong></span>
                      {product.sku && (
                        <>
                          <span className="text-[#ccc]">|</span>
                          <span>SKU : <strong className="text-[#111]">{product.sku}</strong></span>
                        </>
                      )}
                      {product.brand && (
                        <>
                          <span className="text-[#ccc]">|</span>
                          <span>Brand : <strong className="text-[#111]">{product.brand.name}</strong></span>
                        </>
                      )}
                      <span className="text-[#ccc]">|</span>
                      <span>Model : <strong className="text-[#111]">{product.sku || 'K65 RGB MINI'}</strong></span>
                      <span className="text-[#ccc]">|</span>
                      <span>Warranty : <strong className="text-[#111]">{product.warranty || '2 Years'}</strong></span>
                    </div>

                    {/* Short Description / Summary Overview */}
                    {product.short_description && (
                      <div className="pt-2 text-[12px] text-[#555] leading-relaxed">
                        <p>{product.short_description}</p>
                      </div>
                    )}

                    {/* Key Features Bullet List */}
                    {keySpecsList.length > 0 && (
                      <div className="pt-2 space-y-1">
                        <span className="text-[12px] font-bold text-[#111] block mb-1">Key Features:</span>
                        <ul className="space-y-1 text-[11px] text-[#444]">
                          {keySpecsList.slice(0, 6).map((spec, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#002a5c] font-bold mt-0.5">•</span>
                              <span className="leading-tight">{spec}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => scrollToSection('specification')}
                          className="text-[11px] font-bold text-[#0066cc] hover:underline pt-1 inline-block cursor-pointer"
                        >
                          View More Info
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dual Price Boxes: Special/Regular Price + EMI Start From (Exact Reference Screenshot) */}
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Left: Price Box */}
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px] p-3 space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">
                          {isFlashSaleActive 
                            ? (product.is_deal_of_day ? 'Deal of the Day Price' : 'Flash Sale Price')
                            : (savings > 0 ? 'Special Cash Price' : 'Price')}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl sm:text-2xl font-black text-[#d32f2f] leading-none">
                            ৳{currentPrice.toLocaleString()}
                          </span>
                          {regularPrice > currentPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ৳{regularPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="pt-1">
                          <Link
                            href="/payment-terms"
                            className="text-[10px] text-[#0066cc] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>💳 + Available Payment Methods & Terms</span>
                          </Link>
                        </div>
                      </div>

                      {/* Right: EMI Start From Box */}
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px] p-3 space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">
                          EMI Start From*
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl sm:text-2xl font-black text-[#002a5c] leading-none">
                            ৳{Math.round(currentPrice / 36 || 218).toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowEmiModal(true)}
                            className="text-[10px] text-[#0066cc] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                          >
                            <span>🏦 View Banks EMI Plans</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#cbd5e1] rounded-[3px] bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="p-1.5 text-[#666] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                          aria-label="Decrease Quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-10 text-center text-[12px] font-bold border-none focus:outline-none focus:ring-0 p-0"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="p-1.5 text-[#666] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                          aria-label="Increase Quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Buy Now / Grab Deal Button */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(false)}
                        disabled={isOutOfStock}
                        className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-[3px] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-none transition-colors cursor-pointer ${
                          isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : added
                            ? 'bg-emerald-600'
                            : 'bg-[#002a5c] hover:bg-[#1c4289]'
                        }`}
                      >
                        {added ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added to Cart!</span>
                          </>
                        ) : isFlashSaleActive ? (
                          <>
                            <Tag className="w-3.5 h-3.5 fill-current" />
                            <span>Grab Deal</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Buy Now</span>
                          </>
                        )}
                      </button>

                      {/* Add to Wishlist */}
                      <button
                        type="button"
                        onClick={handleWishlist}
                        className="py-2.5 px-3 rounded-[3px] border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-[#444] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Add to Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${wishlistAdded ? 'fill-red-500 text-red-500' : 'text-[#666]'}`} />
                        <span className="hidden sm:inline">Wishlist</span>
                      </button>

                      {/* Add to Compare */}
                      <button
                        type="button"
                        onClick={handleCompare}
                        className="py-2.5 px-3 rounded-[3px] border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-[#444] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Add to Compare"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-[#666]" />
                        <span className="hidden sm:inline">Compare</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PRODUCT TABS NAVIGATION BAR */}
            <div className="bg-white rounded-[3px] border border-[#e2e8f0] p-1 flex flex-wrap gap-1 sticky top-2 z-20 shadow-xs">
              {[
                { id: 'specification', label: 'Specification' },
                { id: 'description', label: 'Description' },
                { id: 'questions', label: `Questions (${questions.length})` },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToSection(tab.id)}
                  className={`py-1.5 px-3.5 rounded-[2px] text-[12px] font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#002a5c] text-white shadow-2xs'
                      : 'text-[#555] hover:bg-[#f1f5f9] hover:text-[#111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 5. FULL SPECIFICATION SECTION (Dense 2-Column Table matching Screenshot) */}
            <section id="specification" className="bg-white rounded-[3px] border border-[#e2e8f0] p-4 sm:p-5 space-y-4">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] uppercase tracking-wide pb-2 border-b border-[#eee]">
                Specification
              </h2>

              {specifications.length > 0 ? (
                <div className="space-y-4">
                  {specifications.map((group, gIdx) => (
                    <div key={gIdx} className="rounded-[2px] border border-[#e2e8f0] overflow-hidden">
                      {/* Group Header */}
                      <div className="bg-[#f8fafc] text-[#111] font-bold text-[12px] uppercase px-3 py-2 border-b border-[#e2e8f0]">
                        {group.group || 'General Specifications'}
                      </div>

                      {/* Two-Column Specification Table */}
                      <table className="w-full text-[12px] text-left">
                        <tbody className="divide-y divide-[#eee]">
                          {group.attributes && group.attributes.map((attr, aIdx) => (
                            <tr key={aIdx} className="hover:bg-[#f8fafc] transition-colors">
                              <td className="w-[35%] sm:w-[30%] px-3 py-2 font-medium text-[#555] bg-[#fafafa] border-r border-[#eee]">
                                {attr.name}
                              </td>
                              <td className="px-3 py-2 text-[#111] font-normal">
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
                <div className="p-4 text-center text-[12px] text-[#777] bg-[#f8fafc] rounded-[2px]">
                  Standard manufacturer specifications apply with official warranty.
                </div>
              )}
            </section>

            {/* 6. DESCRIPTION SECTION */}
            <section id="description" className="bg-white rounded-[3px] border border-[#e2e8f0] p-4 sm:p-5 space-y-3 text-[12px] text-[#444]">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] uppercase tracking-wide pb-2 border-b border-[#eee]">
                Description
              </h2>

              <div className="space-y-2">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-[#111]">
                  {product.title} in Bangladesh
                </h3>

                {product.description ? (
                  <div
                    className="leading-relaxed prose prose-xs max-w-none text-[#444]"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="leading-relaxed text-[#555]">
                    Get the genuine <strong>{product.title}</strong> at the best price in Bangladesh from TechMarket BD. 
                    Order online or visit our showroom to get authentic products with official warranty and expert customer support.
                  </p>
                )}
              </div>
            </section>

            {/* 7. QUESTIONS & ANSWERS SECTION */}
            <section id="questions" className="bg-white rounded-[3px] border border-[#e2e8f0] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#eee]">
                <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] uppercase tracking-wide">
                  Questions & Answers ({questions.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(prev => !prev)}
                  className="text-[11px] font-bold bg-[#002a5c] hover:bg-[#1c4289] text-white px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer"
                >
                  Ask a Question
                </button>
              </div>

              {/* Question Form */}
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
                  className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-[3px] space-y-2.5"
                >
                  <span className="text-[12px] font-bold text-[#111] block">Your Question:</span>
                  <textarea
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ask about product details, warranty, delivery..."
                    className="w-full text-[12px] p-2 rounded-[2px] border border-[#cbd5e1] focus:outline-none focus:border-[#002a5c]"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#666]">Our team answers within 24 hours.</span>
                    <button
                      type="submit"
                      disabled={submittingQuestion}
                      className="bg-[#002a5c] hover:bg-[#1c4289] text-white text-[11px] font-bold px-4 py-1.5 rounded-[2px] cursor-pointer"
                    >
                      {submittingQuestion ? 'Submitting...' : 'Submit Question'}
                    </button>
                  </div>
                  {questionSuccess && (
                    <span className="text-[11px] text-emerald-600 font-bold block">
                      Thank you! Your question has been submitted for review.
                    </span>
                  )}
                </form>
              )}

              {/* Questions List */}
              {questions.length > 0 ? (
                <div className="divide-y divide-[#eee] space-y-3">
                  {questions.map((q) => (
                    <div key={q.id} className="pt-3 first:pt-0 space-y-1.5 text-[12px]">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-[#002a5c] shrink-0">Q.</span>
                        <span className="font-semibold text-[#111]">{q.question}</span>
                      </div>
                      {q.answer ? (
                        <div className="flex items-start gap-2 pl-4 text-[#555] bg-[#f8fafc] p-2 rounded-[2px]">
                          <span className="font-bold text-emerald-700 shrink-0">Ans:</span>
                          <span>{q.answer}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#888] pl-4 block">Pending answer from support team.</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[12px] text-[#777] bg-[#f8fafc] rounded-[2px]">
                  There are no questions asked yet. Be the first to ask!
                </div>
              )}
            </section>

            {/* 8. REVIEWS SECTION */}
            <section id="reviews" className="bg-white rounded-[3px] border border-[#e2e8f0] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#eee]">
                <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] uppercase tracking-wide">
                  Customer Reviews ({reviews.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(prev => !prev)}
                  className="text-[11px] font-bold bg-[#002a5c] hover:bg-[#1c4289] text-white px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer"
                >
                  Write a Review
                </button>
              </div>

              {/* Rating Summary Box */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px] p-4 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-left shrink-0">
                  <span className="text-[28px] font-black text-[#111] leading-none block">{ratingSummary.average}</span>
                  <div className="flex justify-center sm:justify-start my-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#666]">Based on {ratingSummary.count} reviews</span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="flex-1 w-full space-y-1 text-[11px]">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = ratingSummary.counts?.[stars] || 0;
                    const pct = ratingSummary.count > 0 ? (count / ratingSummary.count) * 100 : (stars === 5 ? 100 : 0);
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-10 text-[#666]">{stars} Star</span>
                        <div className="flex-1 bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-[#888]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="divide-y divide-[#eee] space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-3 first:pt-0 space-y-1 text-[12px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#111]">{rev.user?.name || 'Customer'}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Verified</span>
                        </div>
                        <span className="text-[11px] text-[#888]">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= (rev.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>

                      {rev.comment && (
                        <p className="text-[#555] leading-relaxed pt-0.5">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[12px] text-[#777] bg-[#f8fafc] rounded-[2px]">
                  There are no reviews for this product yet.
                </div>
              )}
            </section>

            {/* 9. BOTTOM INFORMATIONAL / SEO PRICE BREAKDOWN */}
            <section className="bg-white rounded-[3px] border border-[#e2e8f0] p-4 sm:p-5 space-y-2 text-[12px] text-[#555]">
              <h3 className="text-[13px] sm:text-[14px] font-bold text-[#111]">
                What is the price of {product.title} in Bangladesh?
              </h3>
              <p className="leading-relaxed">
                The latest price of <strong>{product.title}</strong> in Bangladesh is <strong>৳{currentPrice.toLocaleString()}</strong>. 
                You can buy the {product.title} at the best price from TechMarket BD with genuine manufacturer warranty and fast delivery across Bangladesh.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* 10. BANK EMI PLANS MODAL */}
      {showEmiModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowEmiModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#002a5c]/10 flex items-center justify-center text-[#002a5c]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Bank EMI Facilities</h3>
                  <p className="text-xs text-slate-500">Calculate monthly installments across all partner banks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmiModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Product Info Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                  <img src={activeImage} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{product.title}</h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-sm font-extrabold text-[#d32f2f]">৳{currentPrice.toLocaleString()}</span>
                    {regularPrice > currentPrice && (
                      <span className="text-[11px] text-slate-400 line-through">৳{regularPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Starting EMI</span>
                  <span className="text-xs font-black text-[#002a5c]">৳{Math.round(currentPrice / 36 || 218).toLocaleString()}/mo</span>
                </div>
              </div>

              {/* Tenure Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select EMI Tenure (Months):
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[3, 6, 9, 12, 18, 24, 36].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setSelectedTenure(months)}
                      className={`py-2 px-1 text-center rounded text-xs font-bold transition-all cursor-pointer border ${
                        selectedTenure === months
                          ? 'bg-[#002a5c] text-white border-[#002a5c] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <span>{months} M</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank EMI Comparison Table */}
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-600 grid grid-cols-12 uppercase tracking-wider">
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
                      <div key={partner.id || partner.bank_name} className="px-3 py-2.5 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-colors text-xs">
                        <div className="col-span-5">
                          <span className="font-bold text-slate-900 block">{partner.bank_name}</span>
                          <span className="text-[10px] text-slate-500 block">{partner.interest_rate_note || '0% Interest available'}</span>
                        </div>
                        <div className="col-span-4 text-right">
                          <span className={`font-extrabold block ${isEligible ? 'text-[#002a5c]' : 'text-slate-400'}`}>
                            ৳{monthlyAmount.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">/ mo</span>
                          </span>
                          <span className="text-[9px] text-slate-400 block">for {selectedTenure} months</span>
                        </div>
                        <div className="col-span-3 text-right">
                          {isEligible ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Available
                            </span>
                          ) : !isSupported ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-500">
                              No {selectedTenure}M plan
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700">
                              Min ৳{minAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Policy & Terms Notice */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded p-3 text-[11px] text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-3.5 h-3.5 text-blue-700" />
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
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <Link
                href="/tools/emi-calculator"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002a5c] hover:underline"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Open Advanced EMI Calculator</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowEmiModal(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. PRODUCT DISCLAIMER MODAL */}
      {showDisclaimerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowDisclaimerModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-700">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Product & Warranty Disclaimer</h3>
                  <p className="text-xs text-slate-500">Official information regarding specifications, warranty, and pricing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDisclaimerModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3.5 text-xs text-slate-600 flex-1 custom-scrollbar">
              {/* Point 1: Spec Accuracy */}
              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded border border-slate-200">
                <div className="p-1 rounded bg-blue-100 text-blue-700 mt-0.5 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Specification & Feature Accuracy</h4>
                  <p className="leading-relaxed">
                    Product photos, highlights, and technical specifications are provided by official manufacturers. Minor physical revisions, color nuances, or box design updates may occur across production batches without prior notice.
                  </p>
                </div>
              </div>

              {/* Point 2: Pricing & Stock */}
              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded border border-slate-200">
                <div className="p-1 rounded bg-amber-100 text-amber-700 mt-0.5 shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Pricing & Market Availability</h4>
                  <p className="leading-relaxed">
                    Listed prices, cash discounts, and promotional flash sale deals in Bangladeshi Taka (BDT) are subject to global component supply and distributor MSRP adjustments. Unconfirmed orders with inadvertent pricing errors may be amended.
                  </p>
                </div>
              </div>

              {/* Point 3: Official Warranty Policy */}
              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded border border-slate-200">
                <div className="p-1 rounded bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Official Manufacturer Warranty</h4>
                  <p className="leading-relaxed">
                    Warranty claims are honored strictly per official distributor and brand guidelines in Bangladesh. Physical damage, liquid spillage, burn marks, unauthorized BIOS flashing, and broken seal stickers void all warranty coverage.
                  </p>
                </div>
              </div>

              {/* Point 4: Unboxing Recommendation */}
              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded border border-slate-200">
                <div className="p-1 rounded bg-purple-100 text-purple-700 mt-0.5 shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Parcel Unboxing Recommendation</h4>
                  <p className="leading-relaxed">
                    We strongly recommend recording an uncut 360° unboxing video upon courier delivery. This guarantees instant investigation and resolution in the rare event of transit damage or missing package accessories.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <Link
                href="/terms"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#002a5c] hover:underline"
              >
                <span>Read Full Terms & Policies →</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowDisclaimerModal(false)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#002a5c] hover:bg-[#1c4289] rounded transition-colors cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. DARK FOOTER */}
      <Footer />
    </div>
  );
}
