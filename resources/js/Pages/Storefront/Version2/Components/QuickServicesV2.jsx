import React from 'react';
import { Link } from '@inertiajs/react';
import { Cpu, Wrench, Zap, Sliders } from 'lucide-react';

export default function QuickServicesV2() {
  const serviceCards = [
    {
      id: 'pc-builder',
      title: 'PC Builder',
      subtitle: 'Configure your ideal PC',
      icon: Cpu,
      href: '/pc-builder',
    },
    {
      id: 'book-service',
      title: 'Book a Service',
      subtitle: 'Repairs and home visits',
      icon: Wrench,
      href: '/servicing',
    },
    {
      id: 'complain-box',
      title: 'Complain Box',
      subtitle: 'Share concerns with us',
      icon: Zap,
      href: '/complain-box',
    },
    {
      id: 'tools',
      title: 'Tools',
      subtitle: 'Calculators and utilities',
      icon: Sliders,
      href: '/tools',
    },
  ];

  return (
    <div className="storefront-v2-quick-services w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {serviceCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.id}
              href={card.href}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-[0_8px_25px_rgba(37,99,235,0.12)] hover:-translate-y-1 transition-all duration-300 p-4 sm:p-5 flex items-center space-x-4 group cursor-pointer"
            >
              {/* Circular Soft Blue Icon Badge */}
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
