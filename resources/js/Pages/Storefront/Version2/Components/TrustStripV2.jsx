import React from 'react';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function TrustStripV2({ settings = {}, className = '' }) {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: '100% Authentic',
      subtitle: 'Original Products',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: settings.delivery_time_dhaka ? `Within ${settings.delivery_time_dhaka}` : 'Within 24 - 48 Hours',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      subtitle: '100% Secure Checkout',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className={`storefront-v2-trust-strip ${className}`}>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 sm:p-5">
        <div className="grid grid-cols-3 divide-x divide-slate-100 items-center">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div 
                key={idx} 
                className={`flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-3 px-1.5 sm:px-4 ${idx !== 0 ? 'pl-2 sm:pl-6' : ''}`}
              >
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-[11px] sm:text-xs md:text-sm tracking-tight leading-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[9px] sm:text-[11px] md:text-xs text-slate-500 mt-0.5 font-normal truncate hidden sm:block">
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
