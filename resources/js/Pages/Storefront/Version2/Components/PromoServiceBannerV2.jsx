import React from 'react';
import { Link } from '@inertiajs/react';
import { Check, Calendar, Wrench, Shield, ArrowRight } from 'lucide-react';

export default function PromoServiceBannerV2({ banner = null, settings = {} }) {
  const defaultBullets = [
    'Residential',
    'Office',
    'Factory',
    'Apartment',
    'Shop',
    'All Over Bangladesh',
  ];

  const customBullets = settings.storefront_v2_promo_bullets
    ? settings.storefront_v2_promo_bullets.split(',').map(s => s.trim()).filter(Boolean)
    : null;

  const bullets = (customBullets && customBullets.length > 0) ? customBullets : defaultBullets;
  const title = settings.storefront_v2_promo_title || banner?.title || 'Professional CCTV Installation Service';
  const ctaText = settings.storefront_v2_promo_cta_text || banner?.button_text || 'Book Installation';
  const ctaUrl = settings.storefront_v2_promo_cta_url || banner?.button_url || '/servicing';

  return (
    <div className="storefront-v2-promo-banner w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0c1833] via-[#0f2347] to-[#0a152d] border border-blue-900/40 p-6 sm:p-8 lg:p-10 overflow-hidden shadow-lg">
        {/* Abstract Background Lighting & Circuit Textures */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Headlines and Feature Bullets */}
          <div className="lg:col-span-8">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mb-4">
              {title}
            </h3>

            {/* Checkmark Bullets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 max-w-xl">
              {bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-300 text-xs sm:text-sm">
                  <div className="w-4 h-4 rounded-full bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: CTA Button */}
          <div className="lg:col-span-4 flex lg:justify-end items-center">
            <Link
              href={ctaUrl}
              className="inline-flex items-center space-x-2.5 px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{ctaText}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
