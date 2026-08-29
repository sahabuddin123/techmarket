import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import ProductImageLightbox from '@/Components/Storefront/ProductImageLightbox';
import { trackViewContent, trackAddToCart } from '@/lib/tracking';
import { 
  ShoppingCart, Heart, ArrowRightLeft, ShieldCheck, 
  Check, Star, ChevronLeft, ChevronRight, Share2, 
  HelpCircle, MessageSquare, Plus, Minus, Tag, CheckCircle2, User,
  X, Building2, Calculator, CreditCard, Info, ShieldAlert, FileText,
  ZoomIn, Bookmark, Zap
} from 'lucide-react';

export default function ProductDetailV1(props) {
  // Normalize incoming props with complete defensive null-safety
  const product = props?.product || {};
  const relatedProducts = Array.isArray(props?.relatedProducts) ? props.relatedProducts : [];
  const specifications = Array.isArray(props?.specifications) ? props.specifications : [];
  const breadcrumbs = Array.isArray(props?.breadcrumbs) && props.breadcrumbs.length > 0
    ? props.breadcrumbs
    : [{ label: 'Home', url: '/' }, { label: product?.brand?.name || 'Brand', url: '#' }, { label: product?.title || 'Product', url: '#' }];
  const reviews = Array.isArray(props?.reviews) ? props.reviews : [];
  const ratingSummary = props?.ratingSummary || { average: 5.0, count: reviews.length || 0, counts: { 5: reviews.length || 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
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
  const [bookmarked, setBookmarked] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState(12);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

    if (directCheckout) {
      router.post('/cart/add', { 
        product_id: product.id, 
        quantity, 
        buy_now: 1 
      }, {
        onError: () => {
          window.location.href = `/checkout?product_id=${product.id}&quantity=${quantity}`;
        }
      });
      return;
    }

    router.post('/cart/add', { product_id: product.id, quantity }, {
      preserveScroll: true,
      onSuccess: () => {
        setAdded(true);
        setIsCartOpen(true);
        setTimeout(() => setAdded(false), 2000);
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

  // Scroll to Tab Section
  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans antialiased">
      <Head>
        <title>{`${product.title || 'Product Details'} - ${settings.site_name || 'TechMarket BD'}`}</title>
        <meta name="description" content={product.meta_description || product.short_description || `Buy ${product.title} at best price in Bangladesh.`} />
      </Head>

      {/* 1. TOP NAVBAR */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 py-4 space-y-4">
        
        {/* 2. BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-slate-500 overflow-x-auto py-1 select-none">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400 font-normal shrink-0">/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-slate-900 truncate">{bc.label}</span>
              ) : (
                <Link href={bc.url} className="hover:text-[#0084ff] transition-colors shrink-0">
                  {bc.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* 3. MAIN PRODUCT SECTION: TWO-COLUMN LAYOUT (Left Sidebar 260px-280px + Right Main Content) */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">

          {/* ================= LEFT SIDEBAR: RELATED PRODUCTS ================= */}
          <aside className="hidden lg:block w-[260px] xl:w-[280px] shrink-0 space-y-3">
            <div className="bg-white rounded border border-slate-200 p-3.5 shadow-2xs space-y-3">
              <h3 className="font-bold text-[14px] text-slate-900 tracking-tight pb-2.5 border-b border-slate-200">
                Related Products
              </h3>

              <div className="divide-y divide-slate-100 space-y-3">
                {relatedProducts.slice(0, 6).map((rel) => {
                  const relPrice = Number(rel.flash_price || rel.price || 0);
                  const relRegular = Number(rel.regular_price || 0);
                  const relSavings = relRegular > relPrice ? relRegular - relPrice : 0;

                  return (
                    <div key={rel.id} className="pt-3 first:pt-0 flex gap-2.5 items-center group">
                      <Link
                        href={`/product/${rel.slug}`}
                        className="w-16 h-16 bg-white border border-slate-200 rounded p-1 flex items-center justify-center shrink-0 overflow-hidden"
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
                          className="text-[12px] font-semibold text-slate-900 hover:text-[#0084ff] transition-colors line-clamp-2 leading-snug"
                          title={rel.title}
                        >
                          {rel.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                          <span className="text-[13px] font-bold text-[#dc2626]">
                            ৳{relPrice.toLocaleString()}
                          </span>
                          {relRegular > relPrice && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ৳{relRegular.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {relSavings > 0 && (
                          <span className="text-[10px] font-medium text-emerald-600 block mt-0.5">
                            Save ৳{relSavings.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {product.brand && (
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/brands/${product.brand.slug || ''}`}
                    className="w-full block text-center py-2 px-3 bg-[#0084ff] hover:bg-[#0070d6] text-white text-[12px] font-bold rounded transition-colors"
                  >
                    View All {product.brand.name}
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* ================= RIGHT MAIN PRODUCT CONTENT ================= */}
          <div className="flex-1 min-w-0 space-y-4">
            
            {/* PRODUCT CARD: GALLERY + INFO & PURCHASE */}
            <div className="bg-white border border-slate-200 rounded p-4 sm:p-6 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

                {/* Left Gallery (5 cols) */}
                <div className="md:col-span-5 space-y-3">
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="bg-white border border-slate-200 rounded aspect-square flex items-center justify-center p-4 relative group overflow-hidden cursor-pointer hover:border-[#0084ff] transition-all"
                    title="Click to view full image and zoom"
                  >
                    {savings > 0 && (
                      <span className="absolute top-3 left-3 bg-[#10b981] text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full z-10 shadow-xs">
                        Save ৳{savings.toLocaleString()}
                      </span>
                    )}

                    <img
                      src={activeImage}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hover Zoom & Expand Overlay Pill */}
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-xs text-white rounded-md px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                      <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                      <span>Click to Zoom</span>
                    </div>
                  </div>

                  {/* Thumbnail Carousel */}
                  {galleryImages.length > 1 && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 flex gap-2 overflow-x-auto py-1 custom-scrollbar">
                        {galleryImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-14 h-14 rounded border p-1 shrink-0 bg-white cursor-pointer transition-all ${
                              selectedImageIndex === idx
                                ? 'border-[#0084ff] ring-2 ring-[#0084ff]/20'
                                : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Product Details & Purchase Card (7 cols) */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Main Title */}
                    <h1 className="text-[18px] sm:text-[21px] font-bold text-slate-900 leading-snug tracking-tight">
                      {product.title}
                    </h1>

                    {/* Ratings & Actions Bar */}
                    <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[12px]">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-3.5 h-3.5 fill-current text-amber-400" />
                          ))}
                        </div>
                        <span className="text-slate-600 font-medium text-[11.5px]">
                          {reviews.length} Reviews
                        </span>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => setBookmarked(!bookmarked)}
                        className={`inline-flex items-center gap-1 text-[11.5px] font-semibold transition-colors cursor-pointer ${
                          bookmarked ? 'text-[#0084ff]' : 'text-slate-600 hover:text-[#0084ff]'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                        <span>Bookmark</span>
                      </button>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isOutOfStock 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Metadata Tags Row (Exact Reference Screenshot) */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-slate-600 py-2 border-y border-slate-100">
                      <span>Price: <strong className="text-[#dc2626]">৳{currentPrice.toLocaleString()}</strong></span>
                      <span className="text-slate-300">|</span>
                      {regularPrice > currentPrice && (
                        <>
                          <span>Regular Price: <strong className="text-slate-800">৳{regularPrice.toLocaleString()}</strong></span>
                          <span className="text-slate-300">|</span>
                        </>
                      )}
                      <span>Status: <strong className={isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}>{isOutOfStock ? 'Out of Stock' : 'In Stock'}</strong></span>
                      <span className="text-slate-300">|</span>
                      <span>Product Code: <strong className="text-slate-900">{product.sku || `18${String(product.id).padStart(3, '0')}`}</strong></span>
                      {product.brand && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span>Brand: <strong className="text-slate-900">{product.brand.name}</strong></span>
                        </>
                      )}
                      <span className="text-slate-300">|</span>
                      <span>Warranty: <strong className="text-slate-900">{product.warranty || '2 Years'}</strong></span>
                    </div>

                    {/* Key Features Bullet List */}
                    {keySpecsList.length > 0 && (
                      <div className="space-y-1.5 py-1">
                        <span className="text-[12.5px] font-bold text-slate-900 block">Key Features:</span>
                        <ul className="space-y-1 text-[12px] text-slate-700">
                          {keySpecsList.slice(0, 5).map((spec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#0084ff] font-bold mt-0.5">•</span>
                              <span className="leading-tight">{spec}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => scrollToSection('specification')}
                          className="text-[12px] font-bold text-[#0084ff] hover:underline pt-1 inline-block cursor-pointer"
                        >
                          View More Info
                        </button>
                      </div>
                    )}

                    {/* Discounted Price Card Box (Exact Reference Screenshot) */}
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 sm:p-3.5 space-y-1 mt-2">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                        Discounted Price
                      </span>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-2xl sm:text-3xl font-black text-[#dc2626] leading-none">
                          ৳{currentPrice.toLocaleString()}
                        </span>
                        {regularPrice > currentPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            ৳{regularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowEmiModal(true)}
                          className="text-[11.5px] text-[#0084ff] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                        >
                          <span>+ Available Payment Method & EMI Facilities</span>
                        </button>
                      </div>
                    </div>

                    {/* Quantity & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-300 rounded bg-white h-10">
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="px-2.5 h-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
                          aria-label="Decrease Quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 text-center text-[13px] font-bold border-none focus:outline-none focus:ring-0 p-0"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="px-2.5 h-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
                          aria-label="Increase Quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(false)}
                        disabled={isOutOfStock}
                        className={`h-10 px-5 sm:px-6 rounded text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : added
                            ? 'bg-emerald-600'
                            : 'bg-[#0084ff] hover:bg-[#0070d6]'
                        }`}
                      >
                        {added ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      {/* Buy Now Button (Direct Checkout) */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(true)}
                        disabled={isOutOfStock}
                        className="h-10 px-5 sm:px-6 rounded text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all bg-[#0c1424] hover:bg-[#0084ff] active:scale-[0.98] cursor-pointer disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                        title="Proceed immediately to checkout"
                      >
                        <Zap className="w-4 h-4 fill-white text-white" />
                        <span>Buy Now</span>
                      </button>

                      {/* Add to Wishlist */}
                      <button
                        type="button"
                        onClick={handleWishlist}
                        className="h-10 px-3.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Add to Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${wishlistAdded ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                        <span className="hidden sm:inline">Wishlist</span>
                      </button>

                      {/* Add to Compare */}
                      <button
                        type="button"
                        onClick={handleCompare}
                        className="h-10 px-3.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Add to Compare"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">Compare</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PRODUCT TABS NAVIGATION BAR */}
            <div className="bg-white rounded border border-slate-200 p-1.5 flex flex-wrap gap-1.5 sticky top-2 z-20 shadow-2xs">
              {[
                { id: 'specification', label: 'Specification' },
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
                { id: 'questions', label: `Questions (${questions.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToSection(tab.id)}
                  className={`py-2 px-4 rounded text-[13px] font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#0084ff] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 5. FULL SPECIFICATION SECTION (Exact Structured Table matching Screenshot) */}
            <section id="specification" className="bg-white rounded border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
              <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-wide pb-2.5 border-b border-slate-200">
                Specification
              </h2>

              {specifications.length > 0 ? (
                <div className="space-y-4">
                  {specifications.map((group, gIdx) => (
                    <div key={gIdx} className="rounded border border-slate-200 overflow-hidden">
                      {/* Group Header */}
                      <div className="bg-slate-100 text-slate-900 font-bold text-[12.5px] uppercase tracking-wide px-4 py-2 border-b border-slate-200">
                        {group.group || 'General Specifications'}
                      </div>

                      {/* Two-Column Specification Table */}
                      <table className="w-full text-[12.5px] text-left border-collapse">
                        <tbody className="divide-y divide-slate-200">
                          {group.attributes && group.attributes.map((attr, aIdx) => (
                            <tr key={aIdx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="w-[32%] sm:w-[28%] px-4 py-2.5 font-medium text-slate-600 bg-slate-50/40 border-r border-slate-200">
                                {attr.name}
                              </td>
                              <td className="px-4 py-2.5 text-slate-900 font-normal">
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
                <div className="p-4 text-center text-[12.5px] text-slate-500 bg-slate-50 rounded">
                  Standard manufacturer specifications apply with official brand warranty.
                </div>
              )}
            </section>

            {/* 6. DESCRIPTION SECTION */}
            <section id="description" className="bg-white rounded border border-slate-200 p-4 sm:p-6 space-y-3.5 text-[13px] text-slate-700 shadow-2xs">
              <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-wide pb-2.5 border-b border-slate-200">
                Description
              </h2>

              <div className="space-y-3">
                <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900">
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
                    Order online or visit our showroom to get authentic products with official warranty and expert customer support.
                  </p>
                )}

                {/* FAQ Highlights from Screenshot */}
                <div className="pt-3 space-y-2 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-[13px]">Can I use the camera at night?</h4>
                    <p className="text-slate-600 text-[12.5px]">Yes, it features infrared night vision ensuring clear 24/7 round-the-clock monitoring.</p>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-[13px]">Does the device support two-way audio?</h4>
                    <p className="text-slate-600 text-[12.5px]">Yes, it comes equipped with high quality built-in microphone and audio speaker.</p>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-[13px]">Is expandable TF card storage supported?</h4>
                    <p className="text-slate-600 text-[12.5px]">Yes, you can easily store recordings on an external micro TF card up to 256GB or network storage.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. REVIEWS SECTION */}
            <section id="reviews" className="bg-white rounded border border-slate-200 p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-wide">
                  Reviews ({reviews.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(prev => !prev)}
                  className="text-[12px] font-bold bg-[#0084ff] hover:bg-[#0070d6] text-white px-3.5 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Write a Review
                </button>
              </div>

              {/* Rating Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-left shrink-0">
                  <span className="text-3xl font-black text-slate-900 leading-none block">{ratingSummary.average}</span>
                  <div className="flex justify-center sm:justify-start my-1.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4 fill-current text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11.5px] text-slate-500 font-medium">Based on {ratingSummary.count} global ratings</span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="flex-1 w-full space-y-1.5 text-[12px]">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = ratingSummary.counts?.[stars] || 0;
                    const pct = ratingSummary.count > 0 ? (count / ratingSummary.count) * 100 : (stars === 5 ? 100 : 0);
                    return (
                      <div key={stars} className="flex items-center gap-2.5">
                        <span className="w-12 text-slate-600 font-medium">{stars} Star</span>
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-slate-500 font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reviewComment.trim()) return;
                    setSubmittingReview(true);
                    router.post('/reviews', { product_id: product.id, rating: reviewRating, comment: reviewComment }, {
                      preserveScroll: true,
                      onSuccess: () => {
                        setSubmittingReview(false);
                        setReviewSuccess(true);
                        setReviewComment('');
                        setTimeout(() => setReviewSuccess(false), 3000);
                      },
                      onError: () => setSubmittingReview(false)
                    });
                  }}
                  className="bg-slate-50 border border-slate-200 p-4 rounded space-y-3"
                >
                  <span className="text-[13px] font-bold text-slate-900 block">Rate & Review this product:</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs text-slate-600 font-bold ml-2">{reviewRating} out of 5</span>
                  </div>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your honest review and experience..."
                    className="w-full text-[12.5px] p-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#0084ff] bg-white"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-[#0084ff] hover:bg-[#0070d6] text-white text-[12px] font-bold px-4 py-2 rounded cursor-pointer"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </div>
                  {reviewSuccess && (
                    <span className="text-xs text-emerald-600 font-bold block">
                      Thank you! Your review has been recorded.
                    </span>
                  )}
                </form>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="divide-y divide-slate-100 space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-3 first:pt-0 space-y-1.5 text-[12.5px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rev.user?.name || 'Customer'}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Verified Buyer</span>
                        </div>
                        <span className="text-[11.5px] text-slate-400">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= (rev.rating || 5) ? 'fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>

                      {rev.comment && (
                        <p className="text-slate-600 leading-relaxed pt-0.5">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[12.5px] text-slate-500 bg-slate-50 rounded">
                  There are no reviews for this product yet.
                </div>
              )}
            </section>

            {/* 8. QUESTIONS & ANSWERS SECTION */}
            <section id="questions" className="bg-white rounded border border-slate-200 p-4 sm:p-6 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-wide">
                  Questions & Answers ({questions.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(prev => !prev)}
                  className="text-[12px] font-bold bg-[#0084ff] hover:bg-[#0070d6] text-white px-3.5 py-1.5 rounded transition-colors cursor-pointer"
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
                  className="bg-slate-50 border border-slate-200 p-4 rounded space-y-3"
                >
                  <span className="text-[13px] font-bold text-slate-900 block">Your Question:</span>
                  <textarea
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ask about technical specifications, warranty, delivery times..."
                    className="w-full text-[12.5px] p-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#0084ff] bg-white"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] text-slate-500">Our customer team answers within 24 hours.</span>
                    <button
                      type="submit"
                      disabled={submittingQuestion}
                      className="bg-[#0084ff] hover:bg-[#0070d6] text-white text-[12px] font-bold px-4 py-2 rounded cursor-pointer"
                    >
                      {submittingQuestion ? 'Submitting...' : 'Submit Question'}
                    </button>
                  </div>
                  {questionSuccess && (
                    <span className="text-xs text-emerald-600 font-bold block">
                      Thank you! Your question has been submitted.
                    </span>
                  )}
                </form>
              )}

              {/* Questions List */}
              {questions.length > 0 ? (
                <div className="divide-y divide-slate-100 space-y-3">
                  {questions.map((q) => (
                    <div key={q.id} className="pt-3 first:pt-0 space-y-1.5 text-[12.5px]">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-[#0084ff] shrink-0">Q.</span>
                        <span className="font-semibold text-slate-900">{q.question}</span>
                      </div>
                      {q.answer ? (
                        <div className="flex items-start gap-2 pl-4 text-slate-600 bg-slate-50 p-2.5 rounded">
                          <span className="font-bold text-emerald-700 shrink-0">Ans:</span>
                          <span>{q.answer}</span>
                        </div>
                      ) : (
                        <span className="text-[11.5px] text-slate-400 pl-4 block">Pending answer from support team.</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[12.5px] text-slate-500 bg-slate-50 rounded">
                  There are no questions asked yet. Be the first to ask!
                </div>
              )}
            </section>

            {/* 9. BOTTOM INFORMATIONAL / SEO PRICE BREAKDOWN (Exact Reference Screenshot Bottom Box) */}
            <section className="bg-white rounded border border-slate-200 p-4 sm:p-5 space-y-2 text-[12px] text-slate-600 leading-relaxed shadow-2xs">
              <h3 className="text-[13.5px] font-bold text-slate-900">
                What is the price of {product.title} Price in Bangladesh 2026?
              </h3>
              <p>
                The latest <Link href="#" className="text-[#0084ff] font-semibold hover:underline">{product.title}</Link> price in BD is <strong>৳{currentPrice.toLocaleString()}</strong>. 
                The {product.title} manufactured by <strong>{product.brand?.name || 'Manufacturer'}</strong> comes with <strong>{product.warranty || '2 Years'} Warranty</strong> in Bangladesh. 
                To buy or order it online, visit <Link href="/" className="text-[#0084ff] font-semibold hover:underline">TechMarket BD Shop</Link> or order online. 
                Regular price is <strong>৳{(regularPrice || currentPrice).toLocaleString()}</strong> and discounted cash price is <strong>৳{currentPrice.toLocaleString()}</strong> in Bangladesh. 
                Read our latest Showroom Address or follow us on <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#0084ff] font-semibold hover:underline">Facebook</a> for regular updates & offers. 
                Subscribe to our <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#0084ff] font-semibold hover:underline">YouTube</a> channel for product unboxing & reviews.
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
                <div className="w-8 h-8 rounded-full bg-[#0084ff]/10 flex items-center justify-center text-[#0084ff]">
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
                    <span className="text-sm font-extrabold text-[#dc2626]">৳{currentPrice.toLocaleString()}</span>
                    {regularPrice > currentPrice && (
                      <span className="text-[11px] text-slate-400 line-through">৳{regularPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Starting EMI</span>
                  <span className="text-xs font-black text-[#0084ff]">৳{Math.round(currentPrice / 36 || 218).toLocaleString()}/mo</span>
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
                          ? 'bg-[#0084ff] text-white border-[#0084ff] shadow-xs'
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
                          <span className={`font-extrabold block ${isEligible ? 'text-[#0084ff]' : 'text-slate-400'}`}>
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084ff] hover:underline"
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

      {/* 11. PRODUCT IMAGE LIGHTBOX / FULLSCREEN ZOOM MODAL */}
      <ProductImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={galleryImages}
        currentIndex={selectedImageIndex}
        onSelectIndex={setSelectedImageIndex}
        productTitle={product.title}
        price={currentPrice}
      />

      {/* 12. FOOTER */}
      <Footer />
    </div>
  );
}
