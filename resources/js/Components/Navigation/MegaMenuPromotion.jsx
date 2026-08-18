import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function MegaMenuPromotion({ config, defaultCategorySlug }) {
    if (!config || config.promo_enabled === false) {
        return null;
    }

    const {
        promo_image = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop',
        promo_title = 'Featured Special Deals',
        promo_subtitle = 'Genuine Warranty & Fast Delivery Across BD',
        promo_btn_text = 'Explore Products',
        promo_btn_url = `/category/${defaultCategorySlug || ''}`
    } = config;

    return (
        <div className="w-64 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden border border-slate-800 shadow-sm shrink-0">
            {/* Background image overlay */}
            <div className="absolute inset-0 opacity-25 hover:opacity-35 transition-opacity duration-300 pointer-events-none">
                <img 
                    src={promo_image} 
                    alt={promo_title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
            </div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    Special Spotlight
                </div>
                <h4 className="text-sm font-bold text-white leading-tight mb-1">
                    {promo_title}
                </h4>
                {promo_subtitle && (
                    <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">
                        {promo_subtitle}
                    </p>
                )}
            </div>

            <div className="relative z-10 pt-3 mt-auto">
                <Link
                    href={promo_btn_url || `/category/${defaultCategorySlug || ''}`}
                    className="inline-flex items-center justify-between w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors shadow"
                >
                    <span>{promo_btn_text || 'Explore Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
            </div>
        </div>
    );
}
