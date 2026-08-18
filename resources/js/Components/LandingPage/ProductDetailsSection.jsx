import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import PriceBreakdown from './PriceBreakdown';

export default function ProductDetailsSection({
  product = {},
  unitPrice = 0,
  regularPrice = 0,
  discountAmount = 0
}) {
  const specs = Array.isArray(product?.key_specs) && product.key_specs.length > 0 ? product.key_specs : [
    'স্ক্রিন সাইজ: ৪৩ ইঞ্চি',
    'রেজোলিউশন: 3840 × 2160 (4K UHD)',
    'অপারেটিং সিস্টেম: Google TV / Official OS',
    'প্রসেসর: Quad Core Processor',
    'সাউন্ড: Dolby Audio, 24W Speakers',
    'কানেক্টিভিটি: Wi-Fi, Bluetooth, HDMI, USB',
    'ওয়ারেন্টি: ১ বছরের অফিসিয়াল ওয়ারেন্টি'
  ];

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-6 font-['Hind_Siliguri',sans-serif]">
      <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Product Image (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-center">
          <img
            src={product?.image || 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08'}
            alt={product?.title || 'Product Detail'}
            className="max-h-64 max-w-full object-contain"
          />
        </div>

        {/* Middle Specs Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">পণ্যের বিস্তারিত</h2>
          <ul className="space-y-2 text-xs text-slate-700">
            {specs.map((spec, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{spec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Price Breakdown Card (3 cols) */}
        <div className="lg:col-span-3">
          <PriceBreakdown
            regularPrice={regularPrice}
            unitPrice={unitPrice}
            discountAmount={discountAmount}
          />
        </div>
      </div>
    </section>
  );
}
