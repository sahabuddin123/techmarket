import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import ProductCardV3 from './ProductCardV3';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function TopTrendingSplitSectionV3({ products = [] }) {
  const [startIndex, setStartIndex] = useState(0);

  // Exact 8 top trending gadget products
  const defaultTrending = [
    {
      id: 't-1',
      title: 'Original X10 laser Flashlight & Ambient Lantern',
      slug: 'original-x10-laser-flashlight',
      price: 850,
      regular_price: 1250,
      discount_percent: 32,
      image: '/images/storefront/v3/prod_x10_flashlight.jpg',
      category: 'Winter Items',
      stock: 45,
    },
    {
      id: 't-2',
      title: 'SKE POE-36E-LFP 20,000mAh Mini DC UPS',
      slug: 'ske-poe-36e-lfp',
      price: 3750,
      regular_price: 4250,
      discount_percent: 12,
      image: '/images/storefront/v3/prod_ske_ups.jpg',
      category: 'Appliances',
      stock: 20,
    },
    {
      id: 't-3',
      title: 'JYSUPER JY-2219 Rechargeable Stand Fan',
      slug: 'jysuper-jy-2219',
      price: 3790,
      regular_price: 4190,
      discount_percent: 10,
      image: '/images/storefront/v3/prod_jysuper_stand.jpg',
      category: 'Rechargeable Lights & Fans',
      stock: 18,
    },
    {
      id: 't-4',
      title: 'Weidasi WD-959 Original Mosquito Racket',
      slug: 'weidasi-wd-959-original',
      price: 750,
      regular_price: 1150,
      discount_percent: 35,
      image: '/images/storefront/v3/prod_weidasi_racket.jpg',
      category: 'Rechargeable Lights & Fans',
      stock: 50,
    },
    {
      id: 't-5',
      title: 'Xiaomi Solove F5 Pro Max Table Fan',
      slug: 'xiaomi-solove-f5-pro-max',
      price: 3450,
      regular_price: 3850,
      discount_percent: 10,
      image: '/images/storefront/v3/prod_solove_fan.jpg',
      category: 'Rechargeable Lights & Fans',
      stock: 30,
    },
    {
      id: 't-6',
      title: 'Awei PA-92 20000mAh Powerbank',
      slug: 'awei-pa-92-20000mah',
      price: 1550,
      regular_price: 1850,
      discount_percent: 16,
      image: '/images/storefront/v3/prod_awei_powerbank.jpg',
      category: 'Powerbanks',
      stock: 40,
    },
  ];

  const items = (products && products.length >= 4) ? products : defaultTrending;

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(0, items.length - 2) : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 2 >= items.length ? 0 : prev + 1));
  };

  const visibleDesktop = items.slice(startIndex, startIndex + 4);
  const visibleMobile = items.slice(startIndex, startIndex + 2);

  return (
    <section className="w-full max-w-[1240px] mx-auto px-3 sm:px-4 lg:px-6 my-6 sm:my-10">
      
      {/* 1. MOBILE VIEW (Exact Match to Screenshot: Full Blue Box with Title + Shop Now + 2 Products + Side Nav Arrows) */}
      <div className="lg:hidden relative rounded-[22px] bg-gradient-to-b from-[#0153FD] via-[#0047d9] to-[#0038a8] p-4 text-white text-center shadow-lg border border-[#8BB1FF]/40">
        
        {/* Floating Top Pill Badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <div className="px-5 py-1 rounded-full bg-[#0153FD] text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md border-2 border-white">
            <span>LIMITED TIME OFFER</span>
          </div>
        </div>

        {/* Title & Shop Now CTA */}
        <div className="pt-2 pb-3 space-y-2">
          <h3 className="text-2xl font-black font-serif italic text-white tracking-tight leading-none">
            Top Trending <br />
            <span className="text-sky-200 font-sans not-italic font-black text-xl">Gadgets</span>
          </h3>
          
          <div>
            <Link
              href="/catalog?sort=trending"
              className="inline-flex items-center space-x-1.5 bg-white text-[#0153FD] hover:bg-slate-100 font-extrabold text-[11px] px-5 py-1.5 rounded-full shadow-md transition-transform active:scale-95"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 2 Products Side-by-Side with Navigation Arrows */}
        <div className="relative pt-1 flex items-center">
          {items.length > 2 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute -left-2.5 z-20 w-7 h-7 rounded-full bg-[#0153FD] border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer active:scale-90"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-full grid grid-cols-2 gap-2 text-left">
            {visibleMobile.map((product) => (
              <ProductCardV3 key={product.id} product={product} />
            ))}
          </div>

          {items.length > 2 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute -right-2.5 z-20 w-7 h-7 rounded-full bg-[#0153FD] border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer active:scale-90"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. DESKTOP VIEW (White Glow Box with Left Blue Card + 4 Products Grid) */}
      <div className="hidden lg:block relative bg-white border border-[#8BB1FF]/70 rounded-[22px] p-6 shadow-[0_0_15px_rgba(202,224,255,0.65)]">
        
        {/* Floating Top Badge */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="px-7 py-1.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#0153FD] text-white font-black text-sm tracking-wide shadow-md border-2 border-white">
            <span>LIMITED TIME OFFER</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5 pt-3 items-stretch">
          
          {/* Left Blue Gradient Card */}
          <div className="col-span-3 rounded-[20px] bg-gradient-to-br from-[#0153FD] via-[#0047d9] to-[#002b82] p-6 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                BEST SELLER
              </span>

              <h3 className="text-3xl font-black leading-tight tracking-tight text-white">
                Top <br />
                Trending <br />
                <span className="text-sky-300">Gadgets</span>
              </h3>

              <p className="text-xs text-white/80 leading-relaxed pt-1">
                Explore our curated collection of the most popular and in-demand gadgets available right now.
              </p>
            </div>

            <div className="pt-6 relative z-10">
              <Link
                href="/catalog?sort=trending"
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-[#0153FD] font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-all hover:scale-102"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right 4 Products with Navigation Arrows */}
          <div className="col-span-9 relative flex items-center">
            {items.length > 4 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute -left-4 z-20 w-8 h-8 rounded-full bg-[#0153FD] hover:bg-[#0042cf] text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-full grid grid-cols-4 gap-4">
              {visibleDesktop.map((product) => (
                <ProductCardV3 key={product.id} product={product} />
              ))}
            </div>

            {items.length > 4 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute -right-4 z-20 w-8 h-8 rounded-full bg-[#0153FD] hover:bg-[#0042cf] text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

    </section>
  );
}
