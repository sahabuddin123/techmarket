import React from 'react';

// Version 3 Components
import HeroSliderV3 from '@/Pages/Storefront/Version3/Components/HeroSliderV3';
import TopTrendingSplitSectionV3 from '@/Pages/Storefront/Version3/Components/TopTrendingSplitSectionV3';
import FeatureTrustCardsV3 from '@/Pages/Storefront/Version3/Components/FeatureTrustCardsV3';
import CategoryIconGridV3 from '@/Pages/Storefront/Version3/Components/CategoryIconGridV3';
import GadgetsForYouSectionV3 from '@/Pages/Storefront/Version3/Components/GadgetsForYouSectionV3';
import NewArrivalsCarouselV3 from '@/Pages/Storefront/Version3/Components/NewArrivalsCarouselV3';
import BrandShowcaseV3 from '@/Pages/Storefront/Version3/Components/BrandShowcaseV3';
import VideoGadgetReviewsV3 from '@/Pages/Storefront/Version3/Components/VideoGadgetReviewsV3';

// Version 2 Components
import HeroSliderV2 from '@/Pages/Storefront/Version2/Components/HeroSliderV2';
import FloatingCategoryBar from '@/Pages/Storefront/Version2/Components/FloatingCategoryBar';
import TrustStripV2 from '@/Pages/Storefront/Version2/Components/TrustStripV2';
import FlashSaleSectionV2 from '@/Pages/Storefront/Version2/Components/FlashSaleSectionV2';
import DealOfDayV2 from '@/Pages/Storefront/Version2/Components/DealOfDayV2';
import LatestProductsSectionV2 from '@/Pages/Storefront/Version2/Components/LatestProductsSectionV2';
import BestSellersSectionV2 from '@/Pages/Storefront/Version2/Components/BestSellersSectionV2';
import BrandShowcaseV2 from '@/Pages/Storefront/Version2/Components/BrandShowcaseV2';

/**
 * Dynamic Section Renderer
 * Renders homepage sections dynamically based on the active storefront version and section key.
 */
export default function DynamicSectionRenderer({ sectionKey, version = 'v3', data = {} }) {
  if (version === 'v3') {
    switch (sectionKey) {
      case 'hero_slider':
        return <HeroSliderV3 slides={data.slides || data.heroSlides} />;
      case 'top_trending':
      case 'trending_products':
        return <TopTrendingSplitSectionV3 products={data.trendingProducts || data.featuredProducts} />;
      case 'trust_cards':
      case 'usp_section':
        return <FeatureTrustCardsV3 settings={data.settings} />;
      case 'featured_categories':
      case 'category_grid':
        return <CategoryIconGridV3 categories={data.categories || data.featuredCategories} />;
      case 'gadgets_for_you':
      case 'best_sellers':
        return <GadgetsForYouSectionV3 products={data.gadgetsForYou || data.bestSellers} />;
      case 'new_arrivals':
      case 'latest_products':
        return <NewArrivalsCarouselV3 products={data.newArrivals || data.latestProducts} />;
      case 'featured_brands':
      case 'brand_showcase':
        return <BrandShowcaseV3 brands={data.brands} />;
      case 'video_reviews':
        return <VideoGadgetReviewsV3 settings={data.settings} videos={data.videos} />;
      default:
        return null;
    }
  }

  if (version === 'v2') {
    switch (sectionKey) {
      case 'hero_slider':
        return <HeroSliderV2 slides={data.slides || data.heroSlides} sideBannerTop={data.sideBannerTop} sideBannerBottom={data.sideBannerBottom} />;
      case 'featured_categories':
        return <FloatingCategoryBar categories={data.categories || data.featuredCategories} />;
      case 'trust_cards':
        return <TrustStripV2 />;
      case 'flash_sale':
        return <FlashSaleSectionV2 flashSale={data.flashSale} />;
      case 'deal_of_day':
        return <DealOfDayV2 deals={data.dealsOfDay} />;
      case 'latest_products':
      case 'new_arrivals':
        return <LatestProductsSectionV2 products={data.latestProducts} />;
      case 'best_sellers':
        return <BestSellersSectionV2 products={data.bestSellers} />;
      case 'brand_showcase':
        return <BrandShowcaseV2 brands={data.brands} />;
      default:
        return null;
    }
  }

  // Version 1 renders natively in HomeV1
  return null;
}
