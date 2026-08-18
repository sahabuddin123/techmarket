import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import ProductCard from '@/Components/ProductCard';
import { 
  ChevronLeft, ChevronRight, ArrowRight, Zap, 
  Cpu, Wrench, MessageSquare, Sliders, ChevronDown, ChevronUp,
  Smartphone, Laptop, Wind, Monitor, CircuitBoard, HardDrive, 
  MemoryStick, Tv, Router, Printer, Box, Camera, Headphones, Gamepad2, Server, Package,
  ArrowRightLeft, Tag, HelpCircle
} from 'lucide-react';

export default function Home({ 
  sections = {}, 
  heroSlides = [], 
  sideBannerTop = null, 
  sideBannerBottom = null, 
  quickActions = [], 
  featuredCategories = [], 
  flashSale = null, 
  featuredProducts = [], 
  latestProducts = [], 
  bestSellers = [], 
  brands = [], 
  settings = {},
  // Backwards compatibility props
  banners = [],
  categories = []
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(true);

  // Active slides list (Multi-slide carousel)
  const defaultSlides = [
    {
      id: 'slide-1',
      title: 'GIGABYTE AERO X16 AI LAPTOP EXPO',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop',
      button_url: '/catalog',
    },
    {
      id: 'slide-2',
      title: 'ULTIMATE CUSTOM GAMING RIG BUILD',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop',
      button_url: '/pc-builder',
    },
    {
      id: 'slide-3',
      title: '4K OLED GAMING MONITORS & ACCESSORIES',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop',
      button_url: '/category/monitor',
    }
  ];

  const slides = (heroSlides && heroSlides.length >= 2)
    ? heroSlides
    : ((banners && banners.length >= 2) ? banners : defaultSlides);

  // Auto slide carousel with pause on hover
  useEffect(() => {
    if (slides.length <= 1 || isHeroHovered) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length, isHeroHovered]);

  const prevSlide = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setCurrentHeroIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setCurrentHeroIndex((prev) => (prev + 1) % slides.length);
  };

  // Live Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 7, minutes: 33, seconds: 24 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Category Icon Mapper
  const getCategoryIcon = (slug) => {
    const s = (slug || '').toLowerCase();
    if (s.includes('phone') || s.includes('smart')) return <Smartphone className="w-6 h-6 text-slate-700" />;
    if (s.includes('ai-laptop') || s.includes('laptop')) return <Laptop className="w-6 h-6 text-slate-700" />;
    if (s.includes('air-con') || s.includes('wind') || s.includes('ac')) return <Wind className="w-6 h-6 text-slate-700" />;
    if (s.includes('earphone') || s.includes('headphone')) return <Headphones className="w-6 h-6 text-slate-700" />;
    if (s.includes('all-in-one') || s.includes('desktop') || s.includes('pc')) return <Monitor className="w-6 h-6 text-slate-700" />;
    if (s.includes('processor') || s.includes('cpu')) return <Cpu className="w-6 h-6 text-slate-700" />;
    if (s.includes('motherboard')) return <CircuitBoard className="w-6 h-6 text-slate-700" />;
    if (s.includes('ssd') || s.includes('hard') || s.includes('storage')) return <HardDrive className="w-6 h-6 text-slate-700" />;
    if (s.includes('graphic') || s.includes('gpu')) return <Zap className="w-6 h-6 text-slate-700" />;
    if (s.includes('ram') || s.includes('memory')) return <MemoryStick className="w-6 h-6 text-slate-700" />;
    if (s.includes('television') || s.includes('tv')) return <Tv className="w-6 h-6 text-slate-700" />;
    if (s.includes('router') || s.includes('networking')) return <Router className="w-6 h-6 text-slate-700" />;
    if (s.includes('monitor')) return <Monitor className="w-6 h-6 text-slate-700" />;
    if (s.includes('printer')) return <Printer className="w-6 h-6 text-slate-700" />;
    if (s.includes('projector') || s.includes('camera')) return <Camera className="w-6 h-6 text-slate-700" />;
    if (s.includes('gaming')) return <Gamepad2 className="w-6 h-6 text-slate-700" />;
    return <Package className="w-6 h-6 text-slate-700" />;
  };

  // Quick Action Icon Mapper
  const getQuickActionIcon = (iconName) => {
    const name = (iconName || '').toLowerCase();
    if (name.includes('cpu') || name.includes('builder')) return <Cpu className="w-5 h-5 text-[#1c4289]" />;
    if (name.includes('wrench') || name.includes('service')) return <Wrench className="w-5 h-5 text-[#1c4289]" />;
    if (name.includes('compare') || name.includes('arrow')) return <ArrowRightLeft className="w-5 h-5 text-[#1c4289]" />;
    if (name.includes('deal') || name.includes('tag')) return <Tag className="w-5 h-5 text-[#1c4289]" />;
    return <Zap className="w-5 h-5 text-[#1c4289]" />;
  };

  // Check if a section is enabled (defaults to true)
  const isSectionEnabled = (key) => {
    if (!sections || Object.keys(sections).length === 0) return true;
    return sections[key] ? Boolean(sections[key].is_enabled) : true;
  };

  const getSectionTitle = (key, defaultTitle) => {
    return sections[key]?.title || defaultTitle;
  };

  const getSectionSubtitle = (key, defaultSubtitle) => {
    return sections[key]?.subtitle !== undefined ? sections[key].subtitle : defaultSubtitle;
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-slate-900 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head title={`${settings.site_name || 'TechMarket BD'} - Trusted Retail Computer Shop in Bangladesh`} />

      {/* 1. Header & Mega Navigation */}
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Main Storefront Body Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-4 py-4 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: 68% Hero Carousel Slider + 32% Stacked Promo Banner Images */}
        {/* ========================================================================= */}
        {isSectionEnabled('hero_section') && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* Left 68%: Hero Carousel Slider (Smooth Sliding Track, Pure graphics) */}
            <div 
              className="lg:col-span-8 bg-[#0a0e17] rounded-xl overflow-hidden relative shadow-xs group h-[220px] sm:h-[280px] md:h-[320px] lg:h-[340px]"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              {/* Sliding Track */}
              <div
                className="flex h-full w-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentHeroIndex * 100}%)` }}
              >
                {slides.map((slide, idx) => (
                  <div key={slide.id || idx} className="min-w-full w-full h-full shrink-0 relative">
                    <Link
                      href={slide.button_url || '/catalog'}
                      className="w-full h-full block relative"
                    >
                      <img
                        src={slide.image}
                        alt={slide.title || `Slide ${idx + 1}`}
                        className="w-full h-full object-cover select-none pointer-events-none"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Slider Controls (< and > circular arrows) */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20 cursor-pointer"
                    title="Previous Slide"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20 cursor-pointer"
                    title="Next Slide"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Slider Pagination Dots */}
              {slides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20 bg-slate-950/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentHeroIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        i === currentHeroIndex ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right 32%: Two Stacked Promotional Banner Images (Pure graphic - 2 cols on mobile, stacked on desktop) */}
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3.5 h-auto lg:h-[340px]">
              {/* Top Side Banner */}
              <Link
                href={sideBannerTop?.button_url || '/page/corporate-sales'}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all block group relative aspect-[2/1] lg:aspect-auto"
              >
                <img
                  src={sideBannerTop?.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop'}
                  alt={sideBannerTop?.title || 'Corporate Sales'}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </Link>

              {/* Bottom Side Banner */}
              <Link
                href={sideBannerBottom?.button_url || '/servicing'}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all block group relative aspect-[2/1] lg:aspect-auto"
              >
                <img
                  src={sideBannerBottom?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop'}
                  alt={sideBannerBottom?.title || 'Book a Service'}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </Link>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 2. QUICK ACTION CARDS (4 Cards: 2x2 on Mobile, 4 in a row on Desktop) */}
        {/* ========================================================================= */}
        {isSectionEnabled('quick_actions') && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
            {quickActions && quickActions.length > 0 ? (
              quickActions.map((qa) => (
                <Link
                  key={qa.id}
                  href={qa.url}
                  className="bg-white border border-slate-200 hover:border-[#002a5c] rounded-xl p-3.5 flex items-center space-x-3 shadow-xs hover:shadow transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-[#002a5c] group-hover:text-white transition-colors">
                    {getQuickActionIcon(qa.icon || qa.title)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight group-hover:text-[#002a5c] transition-colors truncate">
                      {qa.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {qa.subtitle}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <>
                <Link href="/pc-builder" className="bg-white border border-slate-200 hover:border-[#002a5c] rounded-xl p-3.5 flex items-center space-x-3 shadow-xs hover:shadow transition-all group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#002a5c]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">PC Builder</h4>
                    <p className="text-[11px] text-slate-500 truncate">Build your own custom PC</p>
                  </div>
                </Link>

                <Link href="/servicing" className="bg-white border border-slate-200 hover:border-[#002a5c] rounded-xl p-3.5 flex items-center space-x-3 shadow-xs hover:shadow transition-all group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#002a5c]">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">Service Center</h4>
                    <p className="text-[11px] text-slate-500 truncate">Repair and Maintenance</p>
                  </div>
                </Link>

                <Link href="/compare" className="bg-white border border-slate-200 hover:border-[#002a5c] rounded-xl p-3.5 flex items-center space-x-3 shadow-xs hover:shadow transition-all group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#002a5c]">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">Compare Products</h4>
                    <p className="text-[11px] text-slate-500 truncate">Compare specs and price</p>
                  </div>
                </Link>

                <Link href="/offers" className="bg-white border border-slate-200 hover:border-[#002a5c] rounded-xl p-3.5 flex items-center space-x-3 shadow-xs hover:shadow transition-all group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#002a5c]">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">Deals</h4>
                    <p className="text-[11px] text-slate-500 truncate">Exclusive discounts & offers</p>
                  </div>
                </Link>
              </>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. FEATURED CATEGORIES (16 Multi-Column Grid matching Screenshot) */}
        {/* ========================================================================= */}
        {isSectionEnabled('featured_categories') && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {getSectionTitle('featured_categories', 'Featured Categories')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {getSectionSubtitle('featured_categories', 'Get your desired product from featured category')}
              </p>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
              {(featuredCategories && featuredCategories.length > 0 ? featuredCategories : categories.slice(0, 16)).map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  href={`/category/${cat.slug}`}
                  className="bg-white border border-slate-200 hover:border-[#002a5c] hover:shadow-md rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center transition-all group aspect-square"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 group-hover:text-[#002a5c] transition-colors leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 4. FLASH SALE SECTION (6 Columns Grid with Live Countdown Timer) */}
        {/* ========================================================================= */}
        {isSectionEnabled('flash_sale') && flashSale && flashSale.products && flashSale.products.length > 0 && (
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <Zap className="w-5 h-5 text-[#ea580c] mr-1.5 fill-current" />
                  {getSectionTitle('flash_sale', 'Flash Sale')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getSectionSubtitle('flash_sale', 'Limited time offers with massive savings')}
                </p>
              </div>

              {/* Countdown Timer Display & Controls */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold">
                  <div className="bg-white border border-slate-300 rounded px-2 py-1 text-center shadow-xs">
                    <span className="font-mono text-[#ea580c]">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="block text-[8px] text-slate-400 uppercase -mt-0.5">Days</span>
                  </div>
                  <span className="text-slate-400 font-bold">:</span>
                  <div className="bg-white border border-slate-300 rounded px-2 py-1 text-center shadow-xs">
                    <span className="font-mono text-[#ea580c]">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="block text-[8px] text-slate-400 uppercase -mt-0.5">Hours</span>
                  </div>
                  <span className="text-slate-400 font-bold">:</span>
                  <div className="bg-white border border-slate-300 rounded px-2 py-1 text-center shadow-xs">
                    <span className="font-mono text-[#ea580c]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="block text-[8px] text-slate-400 uppercase -mt-0.5">Mins</span>
                  </div>
                  <span className="text-slate-400 font-bold">:</span>
                  <div className="bg-white border border-slate-300 rounded px-2 py-1 text-center shadow-xs">
                    <span className="font-mono text-[#ea580c]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="block text-[8px] text-slate-400 uppercase -mt-0.5">Secs</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 pl-2">
                  <Link
                    href="/catalog?flash_sale=true"
                    className="text-xs font-bold text-slate-700 hover:text-[#002a5c] px-2.5 py-1 rounded bg-white border border-slate-200 shadow-xs flex items-center"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Flash Product Cards Grid (6 Columns on Desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {flashSale.products.map((product) => (
                <ProductCard key={product.id} product={product} variant="flash" />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 5. FEATURED PRODUCTS SECTION (6-Column Grid matching Screenshot) */}
        {/* ========================================================================= */}
        {isSectionEnabled('featured_products') && featuredProducts && featuredProducts.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {getSectionTitle('featured_products', 'Featured Products')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getSectionSubtitle('featured_products', 'Check & Get Your Desired Product From Featured Products')}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href="/catalog?featured=true"
                  className="text-xs font-bold text-slate-700 hover:text-[#002a5c] px-2.5 py-1 rounded bg-white border border-slate-200 shadow-xs flex items-center"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 6. LATEST PRODUCTS SECTION (6-Column Grid matching Screenshot) */}
        {/* ========================================================================= */}
        {isSectionEnabled('latest_products') && latestProducts && latestProducts.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {getSectionTitle('latest_products', 'Latest Products')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getSectionSubtitle('latest_products', 'Check & Get Your Desired Product From Latest Products')}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href="/catalog?sort=latest"
                  className="text-xs font-bold text-slate-700 hover:text-[#002a5c] px-2.5 py-1 rounded bg-white border border-slate-200 shadow-xs flex items-center"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 7. BEST SELLERS SECTION (6-Column Grid matching Screenshot) */}
        {/* ========================================================================= */}
        {isSectionEnabled('best_sellers') && bestSellers && bestSellers.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {getSectionTitle('best_sellers', 'Best Sellers')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getSectionSubtitle('best_sellers', 'Top-rated products loved by our customers')}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href="/catalog?sort=bestseller"
                  className="text-xs font-bold text-slate-700 hover:text-[#002a5c] px-2.5 py-1 rounded bg-white border border-slate-200 shadow-xs flex items-center"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 8. RICH SEO EDITORIAL / BUYING GUIDE ACCORDION (Exact Reference Match) */}
        {/* ========================================================================= */}
        {isSectionEnabled('seo_content') && (
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => setSeoExpanded(!seoExpanded)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                {getSectionTitle('seo_content', `${settings.site_name || 'TechMarket BD'} - Trusted Retail Computer Shop in Bangladesh`)}
              </h3>
              {seoExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {seoExpanded && (
              <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-4 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-sm">Best Computer Shop in Bangladesh</h4>
                  <p>
                    <Link href="/catalog" className="text-blue-600 hover:underline font-semibold">TechMarket BD</Link> is one of the premier computer, hardware, and electronics retail destinations in Bangladesh. Whether you are assembling a top-tier gaming rig, looking for the latest Intel 14th Gen or AMD Ryzen 9000 Series processor, NVIDIA GeForce RTX 40-Series graphics card, DDR5 RAM, or high-speed NVMe SSD, TechMarket BD guarantees 100% authentic hardware with official manufacturer warranty and dedicated customer service support.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-sm">Buy the Best Laptop in Bangladesh from TechMarket BD</h4>
                  <p>
                    Discover business, gaming, and creator laptops from top global brands like ASUS, Lenovo, HP, MSI, Acer, and Apple with official EMI facilities and nationwide delivery.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-sm">Best Gaming PC & Desktop Shop in Bangladesh</h4>
                  <p>
                    Use our interactive PC Builder tool to configure high-FPS custom desktop computers with real-time component compatibility checks and official warranty.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-sm">Best TV, Air Conditioner and Home Appliance Shop in Bangladesh</h4>
                  <p>
                    Shop energy-efficient Inverter Air Conditioners, 4K Smart Android TVs, Refrigerators, and kitchen appliances from Gree, Haier, General, Samsung, and Panasonic at best prices in Bangladesh.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Rebuilt 4-Column Footer with Scroll to Top */}
      <Footer />
    </div>
  );
}
