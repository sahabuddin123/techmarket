import React from 'react';
import { Phone } from 'lucide-react';

export default function FinalCTA({ callNumber = '09678-123456' }) {
  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-6 font-['Hind_Siliguri',sans-serif]">
      <div className="rounded-3xl bg-[#0d1829] border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">অর্ডার করতে সমস্যা হচ্ছে?</h3>
            <p className="text-xs text-slate-300 font-mono">
              আমাদের কল করুন: <strong className="text-amber-400">{callNumber}</strong>
            </p>
          </div>
        </div>

        <a
          href={`tel:${callNumber.replace(/[^0-9+]/g, '')}`}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer"
        >
          এখনই কল করুন
        </a>
      </div>
    </section>
  );
}
