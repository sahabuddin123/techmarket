import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function FAQSection({ faqs = null, deliveryRates = {} }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const defaultFaqs = [
    { q: 'পণ্য হাতে পেয়ে টাকা দিতে হবে?', a: 'হ্যাঁ, পণ্য হাতে পেয়ে চেক করে ক্যাশ অন ডেলিভারিতে সম্পূর্ণ টাকা পরিশোধ করতে পারবেন।' },
    { q: 'পণ্য রিটার্ন/রিপ্লেসমেন্ট নীতি কী?', a: 'পণ্যটিতে কোনো ম্যানুফ্যাকচারিং ত্রুটি থাকলে ৭ দিনের মধ্যে সরাসরি রিপ্লেসমেন্ট সুবিধা পাবেন।' },
    { q: 'ডেলিভারি চার্জ কত?', a: deliveryRates.is_free ? 'সম্পূর্ণ ফ্রি ডেলিভারি!' : `ঢাকার ভিতরে ৳${deliveryRates.inside_dhaka || 60} এবং ঢাকার বাইরে ৳${deliveryRates.outside_dhaka || 120}।` },
    { q: 'টিভি কি ভাঙা অবস্থায় আসলে?', a: 'ডেলিভারি ম্যানের সামনে বক্স খুলে চেক করবেন। কোনো ক্ষতি থাকলে তাৎক্ষণিক বদল করে দেওয়া হবে।' },
    { q: 'ওয়ারেন্টি কীভাবে পাবো?', a: 'প্যাকেটের সাথে অফিশিয়াল সিলযুক্ত ওয়ারেন্টি কার্ড ও ইনভয়েস সংযুক্ত থাকে।' },
    { q: 'ইনস্টলেশন কি ফ্রি?', a: 'হ্যাঁ, আমাদের এক্সপার্ট টেকনিশিয়ান দ্বারা ফ্রিতে ওয়াল মাউন্টিং ও সেটআপ সহায়তা প্রদান করা হয়।' }
  ];

  const faqList = Array.isArray(faqs) && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-8 space-y-6 font-['Hind_Siliguri',sans-serif]">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">সচরাচর জিজ্ঞাসা</h2>
        <div className="flex items-center justify-center gap-1">
          <div className="w-8 h-0.5 bg-amber-400"></div>
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="w-8 h-0.5 bg-amber-400"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {faqList.map((faq, i) => {
          const isOpen = activeFaq === i;
          return (
            <div key={i} className="bg-white text-slate-900 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setActiveFaq(isOpen ? null : i)}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-red-600 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{faq.q}</span>
                </span>
                <span className="text-slate-400 font-mono text-sm">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
