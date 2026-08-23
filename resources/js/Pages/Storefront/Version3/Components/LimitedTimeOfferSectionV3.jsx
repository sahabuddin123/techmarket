import React from 'react';
import ProductCardV3 from './ProductCardV3';

export default function LimitedTimeOfferSectionV3({ products = [], flashSale = null }) {
  const displayProducts = (products && products.length > 0)
    ? products
    : (flashSale?.products && flashSale.products.length > 0 ? flashSale.products : []);

  if (!displayProducts || displayProducts.length === 0) return null;

  return (
    <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 my-12 sm:my-16">
      {/* Centered Heading with exact TechJhuli text */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#002268] tracking-tight">
          Limited Time Offer
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-normal">
          All products are available in limited quantities and will be offered strictly while stocks last. Early purchase is strongly recommended
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {displayProducts.slice(0, 10).map((product) => (
          <ProductCardV3 key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
