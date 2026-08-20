import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, ChevronLeft, Zap, Timer } from 'lucide-react';
import ProductCardV2 from './ProductCardV2';

export default function FlashSaleSectionV2({ flashSale = null, dealsOfDay = [] }) {
  // Determine products and end_time
  const products = (flashSale?.products && flashSale.products.length > 0)
    ? flashSale.products
    : (dealsOfDay && dealsOfDay.length > 0 ? dealsOfDay : []);

  if (products.length === 0) {
    return null;
  }

  const endTimeStr = flashSale?.end_time;
  
  // Real server-driven countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endTimeStr) {
      // Default 12 hours from now if no explicit end time
      setTimeLeft({ hours: 12, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTime = () => {
      const difference = new Date(endTimeStr).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTimeStr]);

  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 5;

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(0, products.length - visibleCount) : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + visibleCount >= products.length ? 0 : prev + 1));
  };

  const visibleProducts = products.length > visibleCount
    ? products.slice(startIndex, startIndex + visibleCount)
    : products;

  return (
    <div className="storefront-v2-flash-sale w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 select-none">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
              FLASH SALE
            </h2>
          </div>

          {/* Live Countdown Timer Badge */}
          <div className="flex items-center space-x-1.5 bg-[#0b1a36] text-white px-3 py-1.5 rounded-xl text-xs font-mono font-black shadow-xs">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-amber-400 animate-pulse">:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-amber-400 animate-pulse">:</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Right: Carousel Controls & View All */}
        <div className="flex items-center space-x-3">
          {products.length > visibleCount && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Flash Sale Products"
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Flash Sale Products"
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link
            href="/catalog?flash_sale=true"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Product Grid / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {visibleProducts.map((product) => (
          <ProductCardV2 key={`flash-${product.id}`} product={product} />
        ))}
      </div>
    </div>
  );
}
