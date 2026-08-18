import React from 'react';
import { ShieldCheck, Truck, CreditCard, RotateCcw, Phone } from 'lucide-react';

export default function TopTrustBar({ callNumber = '09678-123456' }) {
  return (
    <div className="bg-[#0b1322] border-b border-slate-800/80 text-[11px] sm:text-xs py-2 px-3 text-slate-300 font-['Hind_Siliguri',sans-serif]">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-medium">
          <span className="flex items-center gap-1.5 text-amber-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অফিসিয়াল ওয়ারেন্টি</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>সারা বাংলাদেশে ডেলিভারি</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>পণ্য পেয়ে টাকা দিন</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি</span>
          </span>
        </div>

        {callNumber && (
          <a
            href={`tel:${callNumber.replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-1.5 text-amber-400 font-bold hover:underline ml-auto"
          >
            <Phone className="w-3.5 h-3.5 fill-amber-400" />
            <span>কল করুন: {callNumber}</span>
          </a>
        )}
      </div>
    </div>
  );
}
