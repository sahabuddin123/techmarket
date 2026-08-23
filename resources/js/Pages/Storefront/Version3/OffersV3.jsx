import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import NavbarV3 from './Components/NavbarV3';
import FooterV3 from './Components/FooterV3';
import CartDrawer from '@/Components/CartDrawer';
import ProductCardV3 from './Components/ProductCardV3';
import { ChevronRight } from 'lucide-react';

export default function OffersV3({
  offers = [],
  dealsOfDay = [],
  flashSale = null,
  featuredProducts = [],
  settings = {},
}) {
  const [cartOpen, setCartOpen] = useState(false);

  const displayProducts = (offers && offers.length > 0)
    ? offers
    : ((dealsOfDay && dealsOfDay.length > 0) ? dealsOfDay : featuredProducts);

  return (
    <div className="storefront-v3 min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col selection:bg-[#0153FD] selection:text-white">
      <Head title={`Limited Time Offers - ${settings.site_name || 'TechMarket BD'}`} />

      {/* 1. Navbar */}
      <NavbarV3 onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* 2. Breadcrumb */}
      <div className="w-full bg-white border-b border-slate-100 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#0153FD] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Limited Time Offers</span>
        </div>
      </div>

      {/* 3. Main Offers Layout (Screenshot 3) */}
      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Header matching Screenshot 3 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-[#002268] tracking-tight">
            Limited Time Offer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-normal">
            All products are available in limited quantities and will be offered strictly while stocks last. Early purchase is strongly recommended
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {displayProducts.map((product) => (
            <ProductCardV3 key={product.id} product={product} />
          ))}
        </div>
      </main>

      {/* 4. Footer */}
      <FooterV3 onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
