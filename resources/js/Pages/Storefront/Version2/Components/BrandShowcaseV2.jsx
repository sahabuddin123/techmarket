import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function BrandShowcaseV2({ brands = [] }) {
  const activeBrands = Array.isArray(brands) ? brands.filter(b => b.is_active !== false) : [];
  
  if (activeBrands.length === 0) {
    return null;
  }

  const [startIndex, setStartIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const visibleCount = 8;

  // Auto carousel rotation when more than visibleCount brands exist
  useEffect(() => {
    if (isHovered || activeBrands.length <= visibleCount) return;
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % activeBrands.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, activeBrands.length]);

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? activeBrands.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % activeBrands.length);
  };

  // Looped brands list for smooth display
  const displayBrands = [];
  const countToDisplay = Math.min(activeBrands.length, visibleCount);
  for (let i = 0; i < countToDisplay; i++) {
    const idx = (startIndex + i) % activeBrands.length;
    displayBrands.push(activeBrands[idx]);
  }

  return (
    <div 
      className="storefront-v2-brands w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
          TOP BRANDS
        </h2>
        
        <div className="flex items-center space-x-3">
          {activeBrands.length > visibleCount && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Brands"
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Brands"
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link
            href="/brands"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Brand Strip Container (White Rounded Box matching reference) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6 items-center">
          {displayBrands.map((brand, idx) => (
            <Link
              key={`${brand.id || brand.slug || brand.name}-${idx}`}
              href={`/brand/${brand.slug || brand.name.toLowerCase()}`}
              className="flex items-center justify-center h-10 px-2 text-center transition-all duration-300 transform hover:scale-108 group cursor-pointer"
              title={brand.name}
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-7 max-w-[90px] object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  loading="lazy"
                />
              ) : (
                <span className="font-black text-xs sm:text-sm tracking-wider uppercase text-slate-800 group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
