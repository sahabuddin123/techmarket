import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import NavbarV3 from './Components/NavbarV3';
import FooterV3 from './Components/FooterV3';
import CartDrawer from '@/Components/CartDrawer';
import HeroSliderV3 from './Components/HeroSliderV3';
import TopTrendingSplitSectionV3 from './Components/TopTrendingSplitSectionV3';
import FeatureTrustCardsV3 from './Components/FeatureTrustCardsV3';
import CategoryIconGridV3 from './Components/CategoryIconGridV3';
import GadgetsForYouSectionV3 from './Components/GadgetsForYouSectionV3';
import NewArrivalsCarouselV3 from './Components/NewArrivalsCarouselV3';
import BrandShowcaseV3 from './Components/BrandShowcaseV3';
import VideoGadgetReviewsV3 from './Components/VideoGadgetReviewsV3';
import MobileBottomNavV3 from './Components/MobileBottomNavV3';

export default function HomeV3({
  heroSlides = [],
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

  // Resolved categories
  const resolvedCategories = (featuredCategories && featuredCategories.length > 0)
    ? featuredCategories
    : ((categories && categories.length > 0) ? categories : navCategories);

  // Trending Gadgets
  const trendingGadgets = (bestSellers && bestSellers.length > 0)
    ? bestSellers
    : (dealsOfDay && dealsOfDay.length > 0 ? dealsOfDay : featuredProducts);

  // Gadgets For You list
  const gadgetsForYouList = (featuredProducts && featuredProducts.length > 0)
    ? featuredProducts
    : latestProducts;

  // New Arrivals
  const newArrivalsList = (latestProducts && latestProducts.length > 0)
    ? latestProducts
    : featuredProducts;

  return (
    <div className="storefront-v3 min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col selection:bg-[#0153FD] selection:text-white">
      <Head title={`${settings.site_name || 'TechMarket BD'} - Leading Computer & Gadget Store`} />

      {/* 1. Header (Navbar with Search, Categories, Offers, Cart) */}
      <NavbarV3 onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* 2. Main Page Content (100% Exact Same-to-Same Section Order from Screenshot) */}
      <main className="flex-1 w-full space-y-6 sm:space-y-10 pb-16">
        
        {/* Banner: 2 IN 1 FLASHLIGHT & AMBIENT LIGHT */}
        <HeroSliderV3 slides={slides} />

        {/* Section 1: Top Trending Gadgets (Special Left Banner Card + Right 4-Product Carousel) */}
        <TopTrendingSplitSectionV3 products={trendingGadgets} />

        {/* Section 2: 4 Service Trust Cards */}
        <FeatureTrustCardsV3 settings={settings} />

        {/* Section 3: Shop By Categories (16 Categories Grid) */}
        <CategoryIconGridV3 categories={resolvedCategories} />

        {/* Section 4: Gadgets For You (Filterable Category Tabs + 10 Product Cards + View All) */}
        <GadgetsForYouSectionV3 products={gadgetsForYouList} />

        {/* Section 5: New Arrivals (Carousel with Navigation Arrows) */}
        <NewArrivalsCarouselV3 products={newArrivalsList} />

        {/* Section 6: Brands We Carry (Brands Matrix + View All) */}
        <BrandShowcaseV3 brands={brands} />

        {/* Section 7: Video Gadget Reviews (YouTube Channel Subscriber Bar + 7 Video Reels) */}
        <VideoGadgetReviewsV3 settings={settings} />

      </main>

      {/* 3. Footer (Royal Blue Gradient Footer + Floating Chat Widget) */}
      <FooterV3 onOpenCart={() => setCartOpen(true)} />

      {/* 4. Mobile Bottom Navigation Bar (App-like Mobile Navigation) */}
      <MobileBottomNavV3 onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
