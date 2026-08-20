import React from 'react';
import { Users, Package, ShieldCheck, Award, Star } from 'lucide-react';

export default function StatsTrustCardsV2({ settings = {} }) {
  const statCards = [
    {
      icon: Users,
      value: settings.storefront_v2_stat1_num || '5000+',
      label: settings.storefront_v2_stat1_label || 'Happy Customers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Package,
      value: settings.storefront_v2_stat2_num || '10K+',
      label: settings.storefront_v2_stat2_label || 'Products Sold',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      icon: ShieldCheck,
      value: settings.storefront_v2_stat3_num || '50+',
      label: settings.storefront_v2_stat3_label || 'Expert Members',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Award,
      value: settings.storefront_v2_stat4_num || '5+',
      label: settings.storefront_v2_stat4_label || 'Years of Trust',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="storefront-v2-stats w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] p-5 flex items-center space-x-4 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
