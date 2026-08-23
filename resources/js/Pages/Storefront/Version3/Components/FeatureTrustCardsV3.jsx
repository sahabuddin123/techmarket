import React from 'react';
import { Truck, Headphones, ShieldCheck, RefreshCw } from 'lucide-react';

export default function FeatureTrustCardsV3({ settings = {} }) {
  const trustItems = [
    {
      icon: Headphones,
      title: '100% Genuine',
      desc: 'Authentic gadget items',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      desc: 'Quick express shipping',
    },
    {
      icon: RefreshCw,
      title: '7 Days Return',
      desc: 'Easy replacement policy',
    },
    {
      icon: ShieldCheck,
      title: 'Official Warranty',
      desc: 'Manufacturer backed guarantee',
    },
  ];

  return (
    <section className="w-full max-w-[1240px] mx-auto px-3 sm:px-6 lg:px-8 my-4 sm:my-8 select-none">
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white border border-[#8BB1FF]/70 rounded-xl sm:rounded-[20px] p-2 sm:p-4 shadow-[0_0_10px_rgba(202,224,255,0.5)] flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left hover:border-[#0153FD] transition-all duration-200"
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#E9F0FF] text-[#0153FD] flex items-center justify-center shrink-0 shadow-2xs mb-1 sm:mb-0">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-800 tracking-tight leading-tight">
                  {item.title}
                </h4>
                <p className="hidden md:block text-[10px] text-slate-500 line-clamp-1">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
