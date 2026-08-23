import React from 'react';
import { Link } from '@inertiajs/react';
import SectionBoxV3 from './SectionBoxV3';

export default function CategoryIconGridV3({ categories = [] }) {
  // 16 Categories with customized 3D/realistic gadget SVG illustrations matching TechJhuli
  const defaultCategories = [
    {
      id: 'c1',
      name: 'Rechargeable Lights & Fans',
      slug: 'rechargeable-lights-fans',
      iconUrl: '/images/storefront/v3/prod_solove_fan.jpg',
      iconBg: 'from-blue-50 to-sky-100',
    },
    {
      id: 'c2',
      name: 'Powerbanks',
      slug: 'powerbanks',
      iconUrl: '/images/storefront/v3/prod_awei_powerbank.jpg',
      iconBg: 'from-amber-50 to-orange-100',
    },
    {
      id: 'c3',
      name: 'Charger & Cables',
      slug: 'charger-cables',
      iconBg: 'from-purple-50 to-indigo-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m20 10-8 8" />
          <path d="m4 14 8-8" />
          <circle cx="19" cy="5" r="2" fill="currentColor" />
          <circle cx="5" cy="19" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'c4',
      name: 'TWS & Headphones',
      slug: 'tws-headphones',
      iconBg: 'from-emerald-50 to-teal-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
        </svg>
      ),
    },
    {
      id: 'c5',
      name: 'Smartwatches',
      slug: 'smartwatches',
      iconBg: 'from-rose-50 to-pink-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="12" height="13" x="6" y="5.5" rx="3" />
          <path d="M12 2v3.5" />
          <path d="M12 18.5V22" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'c6',
      name: 'Neckbands',
      slug: 'neckbands',
      iconBg: 'from-cyan-50 to-blue-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5" />
          <path d="M12 3a9 9 0 0 1 9 9v7a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2" />
        </svg>
      ),
    },
    {
      id: 'c7',
      name: 'Mini DC UPS',
      slug: 'mini-dc-ups',
      iconUrl: '/images/storefront/v3/prod_ske_ups.jpg',
      iconBg: 'from-slate-50 to-blue-100',
    },
    {
      id: 'c8',
      name: "Creator's Zone",
      slug: 'creators-zone',
      iconUrl: '/images/storefront/v3/prod_hollyland_mic.jpg',
      iconBg: 'from-violet-50 to-fuchsia-100',
    },
    {
      id: 'c9',
      name: 'Summer Items',
      slug: 'summer-items',
      iconUrl: '/images/storefront/v3/prod_unikyy_fan.jpg',
      iconBg: 'from-yellow-50 to-amber-100',
    },
    {
      id: 'c10',
      name: 'Winter Items',
      slug: 'winter-items',
      iconUrl: '/images/storefront/v3/prod_x10_flashlight.jpg',
      iconBg: 'from-sky-50 to-indigo-100',
    },
    {
      id: 'c11',
      name: 'Phone Accessories',
      slug: 'phone-accessories',
      iconBg: 'from-teal-50 to-emerald-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      ),
    },
    {
      id: 'c12',
      name: 'Lighting',
      slug: 'lighting',
      iconBg: 'from-amber-50 to-yellow-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      ),
    },
    {
      id: 'c13',
      name: 'TV & Home Entertainment',
      slug: 'tv-home-entertainment',
      iconBg: 'from-blue-50 to-slate-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="15" x="2" y="7" rx="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
      ),
    },
    {
      id: 'c14',
      name: 'Kids Zone',
      slug: 'kids-zone',
      iconBg: 'from-pink-50 to-rose-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" x2="9.01" y1="9" y2="9" />
          <line x1="15" x2="15.01" y1="9" y2="9" />
        </svg>
      ),
    },
    {
      id: 'c15',
      name: 'Gaming',
      slug: 'gaming',
      iconBg: 'from-indigo-50 to-purple-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" x2="10" y1="12" y2="12" />
          <line x1="8" x2="8" y1="10" y2="14" />
          <line x1="15" x2="15.01" y1="13" y2="13" />
          <line x1="18" x2="18.01" y1="11" y2="11" />
          <rect width="20" height="12" x="2" y="6" rx="2" />
        </svg>
      ),
    },
    {
      id: 'c16',
      name: 'Tools & Tech Accessories',
      slug: 'tools-tech-accessories',
      iconBg: 'from-slate-50 to-zinc-100',
      svg: (
        <svg className="w-7 h-7 text-[#0153FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
  ];

  // If categories are provided from DB/props, map them with icons/images, otherwise use defaults
  const displayCategories = (categories && categories.length > 0)
    ? categories.slice(0, 16).map((cat, idx) => {
        const matchingDefault = defaultCategories.find(d => d.slug === cat.slug || d.name.toLowerCase() === cat.name.toLowerCase()) || defaultCategories[idx % defaultCategories.length];
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          iconUrl: cat.image || cat.icon || matchingDefault?.iconUrl,
          iconBg: matchingDefault?.iconBg || 'from-blue-50 to-sky-100',
          svg: matchingDefault?.svg,
        };
      })
    : defaultCategories;

  return (
    <SectionBoxV3 title="Shop By Categories" badgeText="Shop By Categories">
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3.5 pt-2">
        {displayCategories.map((cat, idx) => (
          <Link
            key={cat.id || idx}
            href={`/catalog?category=${cat.slug || cat.name.toLowerCase()}`}
            className="bg-[#fbfcfe] hover:bg-white border border-[#8BB1FF]/40 hover:border-[#0153FD] rounded-xl sm:rounded-[20px] p-2 sm:p-3 flex flex-col items-center justify-between text-center min-h-[90px] sm:min-h-[125px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
          >
            {/* Category Icon / Mini Thumbnail Box */}
            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cat.iconBg || 'from-blue-50 to-sky-100'} border border-[#8BB1FF]/30 group-hover:border-[#0153FD] flex items-center justify-center transition-all duration-200 overflow-hidden shadow-2xs group-hover:scale-105`}>
              {cat.iconUrl ? (
                <img
                  src={cat.iconUrl}
                  alt={cat.name}
                  className="w-7 h-7 sm:w-10 sm:h-10 object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              ) : (
                cat.svg
              )}
            </div>

            {/* Category Name */}
            <span className="text-[10px] sm:text-xs font-bold text-slate-800 group-hover:text-[#0153FD] leading-tight line-clamp-2 transition-colors mt-1 sm:mt-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Centered View All Pill Button (Same to Same Screenshot) */}
      <div className="flex justify-center pt-5">
        <Link
          href="/catalog"
          className="inline-flex items-center space-x-1.5 px-6 py-2 rounded-full border-2 border-[#0153FD] text-[#0153FD] hover:bg-[#0153FD] hover:text-white font-bold text-xs transition-all shadow-xs"
        >
          <span>View All</span>
          <span className="text-xs">&rarr;</span>
        </Link>
      </div>
    </SectionBoxV3>
  );
}
