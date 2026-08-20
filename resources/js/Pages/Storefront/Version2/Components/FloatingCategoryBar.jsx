import React from 'react';
import { Link } from '@inertiajs/react';
import { 
  Router, Camera, Network, Headphones, Home, Gamepad2, 
  LayoutGrid
} from 'lucide-react';

export default function FloatingCategoryBar({ categories = [] }) {
  // Main priority categories from reference design
  const primaryCategories = [
    { name: 'Routers', matchKeys: ['router', 'wifi'], icon: Router, fallbackSlug: 'routers' },
    { name: 'CCTV', matchKeys: ['cctv', 'camera', 'security', 'surveillance'], icon: Camera, fallbackSlug: 'cctv' },
    { name: 'Networking', matchKeys: ['network', 'switch', 'ethernet'], icon: Network, fallbackSlug: 'networking' },
    { name: 'Accessories', matchKeys: ['access', 'headphone', 'audio', 'earphone'], icon: Headphones, fallbackSlug: 'accessories' },
    { name: 'Smart Home', matchKeys: ['smart', 'home', 'iot', 'lock'], icon: Home, fallbackSlug: 'smart-home' },
    { name: 'Gaming', matchKeys: ['gaming', 'console', 'gpu'], icon: Gamepad2, fallbackSlug: 'gaming' },
  ];

  // Resolve links against actual store categories if available
  const displayItems = primaryCategories.map((prim) => {
    const matchedCategory = (categories || []).find((c) => {
      const name = (c.name || '').toLowerCase();
      const slug = (c.slug || '').toLowerCase();
      return prim.matchKeys.some((k) => name.includes(k) || slug.includes(k));
    });

    return {
      name: prim.name,
      slug: matchedCategory ? matchedCategory.slug : prim.fallbackSlug,
      icon: prim.icon,
      href: matchedCategory ? `/category/${matchedCategory.slug}` : `/catalog?search=${prim.name.toLowerCase()}`,
    };
  });

  // Append 'More' item
  displayItems.push({
    name: 'More',
    slug: 'more',
    icon: LayoutGrid,
    href: '/catalog',
  });

  return (
    <div className="storefront-v2-category-bar relative z-20 -mt-10 sm:-mt-12 md:-mt-16 w-full max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 select-none">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Mobile: Horizontal scrollable rail with full labels | Desktop: 7-column equal grid */}
        <div className="flex md:grid md:grid-cols-7 divide-x divide-slate-100 items-stretch overflow-x-auto md:overflow-visible scrollbar-none snap-x">
          {displayItems.map((item, idx) => {
            const IconComponent = item.icon || LayoutGrid;

            return (
              <Link
                key={item.slug || idx}
                href={item.href}
                className="group flex flex-col items-center justify-center py-4 sm:py-6 md:py-7 px-4 sm:px-5 hover:bg-blue-50/40 transition-all duration-300 text-center cursor-pointer relative shrink-0 min-w-[95px] sm:min-w-[115px] md:min-w-0 md:w-full snap-start"
              >
                <div className="text-blue-600 mb-2 sm:mb-2.5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0">
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[1.75]" />
                </div>
                <span className="text-xs sm:text-xs md:text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight whitespace-nowrap md:whitespace-normal md:truncate max-w-full leading-tight">
                  {item.name}
                </span>
                
                {/* Subtle blue bottom indicator line on hover */}
                <span className="absolute bottom-0 left-3 right-3 sm:left-4 sm:right-4 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
