import React from 'react';

export default function PriceBreakdown({
  regularPrice = 0,
  unitPrice = 0,
  discountAmount = 0
}) {
  const savings = Math.max(0, discountAmount || (regularPrice - unitPrice));

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-['Hind_Siliguri',sans-serif]">
      <h3 className="font-extrabold text-xs text-slate-800 border-b border-slate-200 pb-1.5">মূল্য বিবরণ</h3>
      
      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>পণ্যের মূল্য:</span>
          <span className="font-mono font-bold">৳ {Number(regularPrice).toLocaleString()}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-slate-500">
            <span>ছাড়:</span>
            <span className="font-mono font-bold text-slate-700">- ৳ {Number(savings).toLocaleString()}</span>
          </div>
        )}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-black text-slate-900">
          <span>অফার মূল্য:</span>
          <span className="text-red-600 font-mono font-black text-base">৳ {Number(unitPrice).toLocaleString()}</span>
        </div>
      </div>

      {savings > 0 && (
        <div className="p-2 bg-emerald-100/80 border border-emerald-300 text-emerald-800 rounded-xl text-[11px] font-extrabold text-center">
          আপনি সাশ্রয় করছেন: ৳ {Number(savings).toLocaleString()}
        </div>
      )}
    </div>
  );
}
