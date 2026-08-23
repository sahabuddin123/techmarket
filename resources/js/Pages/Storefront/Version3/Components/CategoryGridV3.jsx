import React from 'react';
import { Link } from '@inertiajs/react';
import SectionBoxV3 from './SectionBoxV3';
import { ChevronRight } from 'lucide-react';

export default function CategoryGridV3({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <SectionBoxV3 
      title="Featured Categories" 
      badgeText="Featured Categories"
      action={
        <Link 
          href="/catalog" 
          className="text-xs font-bold text-[#0153FD] hover:underline flex items-center space-x-1"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 pt-2">
        {categories.slice(0, 16).map((cat) => (
          <Link
            key={cat.id}
            href={`/catalog?category=${cat.slug}`}
            className="bg-[#fbfcfe] hover:bg-white border border-slate-200/80 hover:border-[#0153FD] rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-2 group transition-all duration-200 hover:shadow-sm cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E9F0FF] group-hover:bg-[#0153FD] text-[#0153FD] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
              {cat.icon ? (
                <span className="font-bold text-base">{cat.icon.charAt(0)}</span>
              ) : (
                <span className="font-bold text-base">{cat.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0153FD] transition-colors line-clamp-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </SectionBoxV3>
  );
}
