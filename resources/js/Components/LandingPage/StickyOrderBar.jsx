import React from 'react';

export default function StickyOrderBar({
  unitPrice = 0,
  scrollToOrder
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2.5 bg-[#0b1424]/95 backdrop-blur-md border-t border-slate-800 shadow-2xl flex items-center justify-between sm:hidden font-['Hind_Siliguri',sans-serif]">
      <div>
        <span className="text-[9px] text-slate-400 uppercase font-bold block">অফার মূল্য</span>
        <span className="text-base font-black text-amber-400 font-mono">৳ {Number(unitPrice).toLocaleString()}</span>
      </div>

      <button
        type="button"
        onClick={scrollToOrder}
        className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/30 cursor-pointer animate-pulse"
      >
        🛒 এখনই অর্ডার করুন
      </button>
    </div>
  );
}
