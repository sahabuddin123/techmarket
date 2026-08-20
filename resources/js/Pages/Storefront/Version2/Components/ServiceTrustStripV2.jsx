import React from 'react';
import { ShieldCheck, Truck, Award, Headphones } from 'lucide-react';

export default function ServiceTrustStripV2({ settings = {} }) {
  const items = [
    {
      icon: ShieldCheck,
      title: 'Original',
      subtitle: '100% Genuine',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: 'Across Bangladesh',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      icon: Award,
      title: 'Warranty',
      subtitle: 'Official Warranty',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      subtitle: '24/7 Available',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="storefront-v2-secondary-trust w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {items.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div 
                key={idx} 
                className={`flex items-center space-x-3.5 ${idx !== 0 ? 'pt-3 sm:pt-0 sm:pl-6' : ''}`}
              >
                <div className={`w-11 h-11 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
