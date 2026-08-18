import React from 'react';
import { Truck, Wrench, ShieldCheck, RotateCcw } from 'lucide-react';

export default function OfferBanner({
  title = 'এই অফারে যা যা পাচ্ছেন!',
  subtitle = 'আজকের অর্ডারের সাথে নিশ্চিত বোনাস সুবিধা'
}) {
  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-6 font-['Hind_Siliguri',sans-serif]">
      <div 
        className="rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          background: 'radial-gradient(140% 140% at 20% 20%, #1a2c47 0%, #0d1726 50%, #080d17 100%)'
        }}
      >
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-2xl shadow-xl shrink-0">
            🎁
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
            <p className="text-xs text-amber-400 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-[#0a1220] p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <Truck className="w-5 h-5 text-amber-400 mx-auto" />
            <h4 className="font-bold text-white text-xs">ফ্রি হোম ডেলিভারি</h4>
            <p className="text-[9px] text-slate-400">ঢাকার ভিতরে ফ্রি ডেলিভারি</p>
          </div>

          <div className="bg-[#0a1220] p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <Wrench className="w-5 h-5 text-amber-400 mx-auto" />
            <h4 className="font-bold text-white text-xs">ফ্রি সেটআপ সার্ভিস</h4>
            <p className="text-[9px] text-slate-400">একদম ফ্রি ইন্সটলেশন</p>
          </div>

          <div className="bg-[#0a1220] p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto" />
            <h4 className="font-bold text-white text-xs">১ বছর ওয়ারেন্টি</h4>
            <p className="text-[9px] text-slate-400">অফিসিয়াল ওয়ারেন্টি কার্ড</p>
          </div>

          <div className="bg-[#0a1220] p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <RotateCcw className="w-5 h-5 text-amber-400 mx-auto" />
            <h4 className="font-bold text-white text-xs">৭ দিনের রিপ্লেসমেন্ট</h4>
            <p className="text-[9px] text-slate-400">সমস্যা হলে রিটার্ন সুবিধা</p>
          </div>
        </div>
      </div>
    </section>
  );
}
