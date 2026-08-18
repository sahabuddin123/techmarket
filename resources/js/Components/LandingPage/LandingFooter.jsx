import React from 'react';

export default function LandingFooter() {
  return (
    <footer className="bg-[#05080e] border-t border-slate-900 py-10 px-3 sm:px-6 text-xs text-slate-400 space-y-6 font-['Hind_Siliguri',sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-sans">TM</div>
            <span className="font-black text-white text-sm tracking-tight font-sans">TECHMARKET BD</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            বিশ্বস্ততার সাথে সেরা পণ্য, সবার কাছে। ১০০% অথেনটিক গ্যাজেট ও হোম অ্যাপ্লায়েন্স।
          </p>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-bold text-white uppercase text-[11px]">গুরুত্বপূর্ণ লিংক</h4>
          <ul className="space-y-1 text-[11px] text-slate-400">
            <li>আমাদের সম্পর্কে</li>
            <li>সকল পণ্য</li>
            <li>অফার সমূহ</li>
            <li>যোগাযোগ</li>
          </ul>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-bold text-white uppercase text-[11px]">সহায়তা</h4>
          <ul className="space-y-1 text-[11px] text-slate-400">
            <li>ডেলিভারি পলিসি</li>
            <li>রিটার্ন পলিসি</li>
            <li>ওয়ারেন্টি তথ্য</li>
            <li>গোপনীয়তা নীতি</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-[11px]">পেমেন্ট মেথড</h4>
          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-200 font-mono">
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">bKash</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">Nagad</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">VISA</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">Mastercard</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">Cash on Delivery</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <p>© 2026 TechMarket BD. সর্বস্বত্ব সংরক্ষিত।</p>
        <p>ডিজাইন ও ডেভেলপমেন্ট: TechMarket BD টিম</p>
      </div>
    </footer>
  );
}
