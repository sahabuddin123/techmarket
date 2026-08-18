import React from 'react';
import { Tv, Sparkles, Volume2, Mic, Wifi, Smartphone, Gamepad2, Award } from 'lucide-react';

export default function FeaturesSection({ title = 'কেন এই পণ্য সেরা?', items = null }) {
  const defaultFeatures = [
    { title: '4K আল্ট্রা HD', desc: 'অসাধারণ ছবি ও কালার কোয়ালিটি', icon: Tv },
    { title: 'গুগল টিভি', desc: 'সকল জনপ্রিয় অ্যাপ একসাথে', icon: Sparkles },
    { title: 'ডলবি অডিও', desc: 'সিনেমার মতো সাউন্ড', icon: Volume2 },
    { title: 'ভয়েস কন্ট্রোল', desc: 'কথা বলেই নিয়ন্ত্রণ করুন', icon: Mic },
    { title: 'স্মার্ট কানেক্টিভিটি', desc: 'Wi-Fi, Bluetooth, HDMI', icon: Wifi },
    { title: 'গেম ও এন্টারটেইনমেন্ট', desc: 'সবকিছু একসাথে', icon: Gamepad2 },
  ];

  const featureList = Array.isArray(items) && items.length > 0 ? items : defaultFeatures;

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-12 space-y-6 font-['Hind_Siliguri',sans-serif]">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h2>
        <div className="flex items-center justify-center gap-1">
          <div className="w-8 h-0.5 bg-amber-400"></div>
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="w-8 h-0.5 bg-amber-400"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {featureList.map((card, i) => {
          const Icon = card.icon || Tv;
          return (
            <div key={i} className="bg-white text-slate-900 p-4 rounded-2xl text-center space-y-2 shadow-lg border border-slate-100 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
                {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
              </div>
              <h3 className="font-extrabold text-xs text-slate-900 leading-tight">{card.title}</h3>
              <p className="text-[10px] text-slate-500 leading-tight">{card.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
