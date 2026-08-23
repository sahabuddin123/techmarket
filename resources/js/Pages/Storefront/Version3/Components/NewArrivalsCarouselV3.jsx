import React, { useState } from 'react';
import SectionBoxV3 from './SectionBoxV3';
import ProductCardV3 from './ProductCardV3';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewArrivalsCarouselV3({ products = [] }) {
  const [startIndex, setStartIndex] = useState(0);

  // Exact 6 products from TechJhuli screenshot with real studio images
  const defaultNewArrivals = [
    {
      id: 'na-1',
      title: 'Xiaomi Solove F5 Pro Max',
      slug: 'xiaomi-solove-f5-pro-max',
      price: 3450,
      regular_price: 3850,
      discount_percent: 10,
      image: '/images/storefront/v3/prod_solove_fan.jpg',
      stock: 30,
    },
    {
      id: 'na-2',
      title: 'Awei PA-92 20000mAh',
      slug: 'awei-pa-92-20000mah',
      price: 1550,
      regular_price: 1850,
      discount_percent: 16,
      image: '/images/storefront/v3/prod_awei_powerbank.jpg',
      stock: 40,
    },
    {
      id: 'na-3',
      title: 'Unikyy Blade Pro Portable Turbo',
      slug: 'unikyy-blade-pro-portable-turbo',
      price: 1250,
      regular_price: 1550,
      discount_percent: 19,
      image: '/images/storefront/v3/prod_unikyy_fan.jpg',
      stock: 25,
    },
    {
      id: 'na-4',
      title: 'Weidasi WD-959 Rechargeable',
      slug: 'weidasi-wd-959-rechargeable',
      price: 750,
      regular_price: 1150,
      discount_percent: 35,
      image: '/images/storefront/v3/prod_weidasi_racket.jpg',
      stock: 50,
    },
    {
      id: 'na-5',
      title: 'JYSUPER JY-2219',
      slug: 'jysuper-jy-2219',
      price: 3790,
      regular_price: 4190,
      discount_percent: 10,
      image: '/images/storefront/v3/prod_jysuper_stand.jpg',
      stock: 18,
    },
    {
      id: 'na-6',
      title: 'JYSUPER JY-2218',
      slug: 'jysuper-jy-2218',
      price: 1190,
      regular_price: 1590,
      discount_percent: 25,
      image: '/images/storefront/v3/prod_jysuper_white_fan.jpg',
      stock: 22,
    },
    {
      id: 'na-7',
      title: 'JYSUPER JY-2570 Table Fan',
      slug: 'jysuper-jy-2570',
      price: 2090,
      regular_price: 2790,
      discount_percent: 25,
      image: '/images/storefront/v3/prod_jysuper_pink.jpg',
      stock: 35,
    },
    {
      id: 'na-8',
      title: 'Original X10 laser Flashlight',
      slug: 'original-x10-laser-flashlight',
      price: 850,
      regular_price: 1250,
      discount_percent: 32,
      image: '/images/storefront/v3/prod_x10_flashlight.jpg',
      stock: 45,
    },
  ];

  const items = (products && products.length >= 4) ? products : defaultNewArrivals;

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(0, items.length - 2) : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 2 >= items.length ? 0 : prev + 1));
  };

  const visibleMobile = items.slice(startIndex, startIndex + 2);
  const visibleDesktop = items.slice(startIndex, startIndex + 6);

  return (
    <SectionBoxV3 title="New Arrivals" badgeText="New Arrivals">
      <div className="relative flex items-center pt-2">
        
        {/* Left Arrow */}
        {items.length > 2 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute -left-2.5 sm:-left-5 z-20 w-7 sm:w-9 h-7 sm:h-9 rounded-full bg-[#0153FD] hover:bg-[#0042cf] text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            aria-label="Previous Arrivals"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Mobile: 2 Products Grid */}
        <div className="md:hidden w-full grid grid-cols-2 gap-2">
          {visibleMobile.map((product) => (
            <ProductCardV3 key={product.id} product={product} />
          ))}
        </div>

        {/* Desktop: 6 Products Grid */}
        <div className="hidden md:grid w-full grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {visibleDesktop.map((product) => (
            <ProductCardV3 key={product.id} product={product} />
          ))}
        </div>

        {/* Right Arrow */}
        {items.length > 2 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-2.5 sm:-right-5 z-20 w-7 sm:w-9 h-7 sm:h-9 rounded-full bg-[#0153FD] hover:bg-[#0042cf] text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            aria-label="Next Arrivals"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

      </div>
    </SectionBoxV3>
  );
}
