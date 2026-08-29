import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import NavbarV2 from './Components/NavbarV2';
import FooterV2 from './Components/FooterV2';
import CartDrawer from '@/Components/CartDrawer';
import HeroSliderV2 from './Components/HeroSliderV2';
import FloatingCategoryBar from './Components/FloatingCategoryBar';
import TrustStripV2 from './Components/TrustStripV2';
import ProductCardV2 from './Components/ProductCardV2';
import DealOfDayV2 from './Components/DealOfDayV2';
import BrandShowcaseV2 from './Components/BrandShowcaseV2';
import QuickServicesV2 from './Components/QuickServicesV2';
import FlashSaleSectionV2 from './Components/FlashSaleSectionV2';
import LatestProductsSectionV2 from './Components/LatestProductsSectionV2';
import BestSellersSectionV2 from './Components/BestSellersSectionV2';
import ServiceTrustStripV2 from './Components/ServiceTrustStripV2';
import PromoServiceBannerV2 from './Components/PromoServiceBannerV2';
import StatsTrustCardsV2 from './Components/StatsTrustCardsV2';
import { ChevronRight } from 'lucide-react';

export default function HomeV2({
  sections = {},
  heroSlides = [],
  sideBannerTop = null,
  featuredCategories = [],
  navCategories = [],
  flashSale = null,
  featuredProducts = [],
  latestProducts = [],
  bestSellers = [],
  brands = [],
  settings = {},
  banners = [],
  dealsOfDay = [],
  categories = [],
}) {
  const [cartOpen, setCartOpen] = useState(false);

  // Resolved hero slides
  const slides = (heroSlides && heroSlides.length > 0)
    ? heroSlides
    : ((banners && banners.length > 0) ? banners : []);

  // Resolved categories for floating category bar
  const floatingCats = (featuredCategories && featuredCategories.length > 0)
    ? featuredCategories
    : ((categories && categories.length > 0) ? categories : navCategories);

  // Deal of the day product
  const dealProduct = (dealsOfDay && dealsOfDay.length > 0)
    ? dealsOfDay[0]
    : (flashSale?.products && flashSale.products.length > 0 ? flashSale.products[0] : null);

  // Section visibility checks (supports admin toggle settings)
  const showCategoryBar = settings.storefront_v2_show_category_bar !== '0';
  const showTrustStrip = settings.storefront_v2_show_trust_strip !== '0';
  const showFeatured = settings.storefront_v2_show_featured !== '0';
  const showDealOfDay = settings.storefront_v2_show_deal_of_day !== '0';
  const showBrands = settings.storefront_v2_show_brands !== '0';
  const showQuickServices = settings.storefront_v2_show_quick_services !== '0';
  const showFlashSale = settings.storefront_v2_show_flash_sale !== '0';
  const showLatestProducts = settings.storefront_v2_show_latest_products !== '0';
  const showBestSellers = settings.storefront_v2_show_best_sellers !== '0';
  const showPromoBanner = settings.storefront_v2_show_promo_banner !== '0';
  const showStats = settings.storefront_v2_show_stats !== '0';

  const homeTitle = settings.default_meta_title || `${settings.site_name || 'TechMarket BD'} | Best Computer, Laptop, Component & CCTV Shop in Bangladesh`;

  return (
    <div className="storefront-v2 min-h-screen bg-[#f3f6fa] text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Head title={homeTitle} />

      {/* 1. Header (Restyled for Version 2) */}
      <NavbarV2 onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ========================================================================= */}
      {/* 2. HERO BANNER SECTION (Dark Navy Technology Environment & Ken Burns) */}
      {/* ========================================================================= */}
      <section className="w-full">
        <HeroSliderV2 slides={slides} />
      </section>

      {/* ========================================================================= */}
      {/* 3. FLOATING CATEGORY NAVIGATION (Overlapping the Hero) */}
      {/* ========================================================================= */}
      {showCategoryBar && (
        <FloatingCategoryBar categories={floatingCats} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full space-y-12 sm:space-y-14 mt-8 sm:mt-10">
        <h1 className="sr-only">
          {homeTitle}
        </h1>

        {/* ========================================================================= */}
        {/* 4 & 5. MAIN TOP GRID: TRUST STRIP + FEATURED PRODUCTS + DEAL OF THE DAY */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 9 Columns: Trust Strip + Featured Products Grid */}
            <div className={`${showDealOfDay ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6`}>
              
              {/* Primary Trust / Service Strip */}
              {showTrustStrip && (
                <TrustStripV2 settings={settings} />
              )}

              {/* Featured Products Section */}
              {showFeatured && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                      FEATURED PRODUCTS
                    </h2>

                    <Link
                      href="/catalog?featured=true"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>

                  {/* 4-Column Product Grid */}
                  <div className={`grid grid-cols-2 sm:grid-cols-2 ${showDealOfDay ? 'md:grid-cols-4' : 'md:grid-cols-4 lg:grid-cols-6'} gap-3 sm:gap-4`}>
                    {(featuredProducts && featuredProducts.length > 0 ? featuredProducts.slice(0, showDealOfDay ? 4 : 6) : []).map((product) => (
                      <ProductCardV2 key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 3 Columns: Deal of the Day Card (Aligned at the top with Trust Strip) */}
            {showDealOfDay && (
              <div className="lg:col-span-3">
                <DealOfDayV2 dealProduct={dealProduct} flashSale={flashSale} />
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: TOP BRANDS (Fully Dynamic from database) */}
        {/* ========================================================================= */}
        {showBrands && (
          <BrandShowcaseV2 brands={brands} />
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: QUICK SERVICES / TOOLS (4-Column Utility Cards) */}
        {/* ========================================================================= */}
        {showQuickServices && (
          <QuickServicesV2 />
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: FLASH SALE (Live Countdown + Product Carousel) */}
        {/* ========================================================================= */}
        {showFlashSale && (
          <FlashSaleSectionV2 flashSale={flashSale} dealsOfDay={dealsOfDay} />
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: LATEST PRODUCTS (Dynamic New Arrivals) */}
        {/* ========================================================================= */}
        {showLatestProducts && (
          <LatestProductsSectionV2 products={latestProducts} />
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: BEST SELLERS (Dynamic Top Sellers) */}
        {/* ========================================================================= */}
        {showBestSellers && (
          <BestSellersSectionV2 products={bestSellers} />
        )}

        {/* ========================================================================= */}
        {/* SECONDARY TRUST / SERVICE STRIP (Original, Delivery, Warranty, Support) */}
        {/* ========================================================================= */}
        {showTrustStrip && (
          <ServiceTrustStripV2 settings={settings} />
        )}

        {/* ========================================================================= */}
        {/* PROMOTIONAL SERVICE BANNER (Professional CCTV / IT Installation) */}
        {/* ========================================================================= */}
        {showPromoBanner && (
          <PromoServiceBannerV2 banner={sideBannerTop} settings={settings} />
        )}

        {/* ========================================================================= */}
        {/* STATISTICS / TRUST CARDS (5000+ Customers, 10K+ Products, etc.) */}
        {/* ========================================================================= */}
        {showStats && (
          <StatsTrustCardsV2 settings={settings} />
        )}
      </main>

      {/* Footer (Restyled for Version 2 with Chatbot & Floating Utilities) */}
      <FooterV2 onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
