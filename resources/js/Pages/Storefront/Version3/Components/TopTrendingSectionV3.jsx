import React from 'react';
import SectionBoxV3 from './SectionBoxV3';
import ProductCardV3 from './ProductCardV3';

export default function TopTrendingSectionV3({ products = [] }) {
  if (!products || products.length === 0) return null;

  return (
    <SectionBoxV3 title="Top Trending Gadgets" badgeText="Top Trending Gadgets">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
        {products.slice(0, 10).map((product) => (
          <ProductCardV3 key={product.id} product={product} />
        ))}
      </div>
    </SectionBoxV3>
  );
}
