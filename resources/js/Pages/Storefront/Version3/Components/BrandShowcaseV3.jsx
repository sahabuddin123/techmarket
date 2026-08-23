import React from 'react';
import { Link } from '@inertiajs/react';
import SectionBoxV3 from './SectionBoxV3';
import { ArrowRight } from 'lucide-react';

export default function BrandShowcaseV3({ brands = [] }) {
  // Pre-populate with typical top brands from TechJhuli screenshot
  const fallbackBrands = [
    { id: 'b1', name: 'Xiaomi', slug: 'xiaomi' },
    { id: 'b2', name: 'WEIDASI', slug: 'weidasi' },
    { id: 'b3', name: 'UNIKYY', slug: 'unikyy' },
    { id: 'b4', name: 'Transcend', slug: 'transcend' },
    { id: 'b5', name: 'SOLOVE', slug: 'solove' },
    { id: 'b6', name: 'SKE', slug: 'ske' },
    { id: 'b7', name: 'SITECOM', slug: 'sitecom' },
    { id: 'b8', name: 'SATECHI', slug: 'satechi' },
    { id: 'b9', name: 'SAMSUNG', slug: 'samsung' },
    { id: 'b10', name: 'RAZER', slug: 'razer' },
    { id: 'b11', name: 'QCY', slug: 'qcy' },
    { id: 'b12', name: 'PROMATE', slug: 'promate' },
    { id: 'b13', name: 'msi', slug: 'msi' },
    { id: 'b14', name: 'Microsoft', slug: 'microsoft' },
    { id: 'b15', name: 'Lenovo', slug: 'lenovo' },
    { id: 'b16', name: 'JYSUPER', slug: 'jysuper' },
  ];

  const displayBrands = (brands && brands.length >= 8) ? brands : fallbackBrands;

  return (
    <SectionBoxV3 title="Brands We Carry" badgeText="Brands We Carry">
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-4 pt-2">
        {displayBrands.slice(0, 16).map((brand) => (
          <Link
            key={brand.id}
            href={`/catalog?brand=${brand.slug || brand.name.toLowerCase()}`}
            className="bg-[#fbfcfe] hover:bg-white border border-slate-200/80 hover:border-[#0153FD] rounded-xl sm:rounded-2xl p-2 sm:p-4 h-12 sm:h-20 flex items-center justify-center text-center transition-all duration-200 hover:shadow-sm group cursor-pointer"
          >
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all"
                loading="lazy"
              />
            ) : (
              <span className="font-black text-[10px] sm:text-sm text-slate-700 group-hover:text-[#0153FD] tracking-tight sm:tracking-wide transition-colors truncate uppercase font-mono">
                {brand.name}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Bottom See All Pill Button */}
      <div className="flex justify-end pt-5">
        <Link
          href="/brands"
          className="inline-flex items-center space-x-1.5 px-5 py-1.5 rounded-full border-2 border-[#0153FD] text-[#0153FD] hover:bg-[#0153FD] hover:text-white font-bold text-xs transition-all shadow-xs"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </SectionBoxV3>
  );
}
