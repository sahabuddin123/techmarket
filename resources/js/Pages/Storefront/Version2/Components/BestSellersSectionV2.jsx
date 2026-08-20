import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, ChevronLeft, Award } from 'lucide-react';
import ProductCardV2 from './ProductCardV2';

export default function BestSellersSectionV2({ products = [] }) {
  if (!products || products.length === 0) {
    return null;
  }

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
    <div className="storefront-v2-best-sellers w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            BEST SELLERS
          </h2>
        </div>

        {/* Right: Controls & View All */}
        <div className="flex items-center space-x-3">
          {products.length > visibleCount && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Best Seller Products"
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Best Seller Products"
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link
            href="/catalog?sort=bestseller"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {visibleProducts.map((product) => (
          <ProductCardV2 key={`bestseller-${product.id}`} product={product} />
        ))}
      </div>
    </div>
  );
}
