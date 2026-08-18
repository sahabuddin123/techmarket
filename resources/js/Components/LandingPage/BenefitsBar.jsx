import React from 'react';
import { ShieldCheck, Truck, ThumbsUp, RotateCcw } from 'lucide-react';

export default function BenefitsBar() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 -mt-6 relative z-20 font-['Hind_Siliguri',sans-serif]">
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-4 border border-slate-100">
        {/* 1 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900">১০০% অফিসিয়াল পণ্য</h3>
            <p className="text-[10px] text-slate-500">অফিসিয়াল ওয়ারেন্টি সহ</p>
          </div>
        </div>

        {/* 2 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900">সারা বাংলাদেশে ডেলিভারি</h3>
            <p className="text-[10px] text-slate-500">ঘরে বসে পণ্য গ্রহণ করুন</p>
          </div>
        </div>

        {/* 3 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 shadow-xs">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900">পণ্য পেয়ে টাকা দিন</h3>
            <p className="text-[10px] text-slate-500">ক্যাশ অন ডেলিভারি সুবিধা</p>
          </div>
        </div>

        {/* 4 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 shadow-xs">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900">৭ দিনের রিপ্লেসমেন্ট</h3>
            <p className="text-[10px] text-slate-500">সমস্যা হলে বদলে দেওয়া হবে</p>
          </div>
        </div>
      </div>
    </div>
  );
}
