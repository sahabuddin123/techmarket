import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewsSection({ reviews = [] }) {
  const sampleReviews = [
    {
      name: 'রাকিব হাসান',
      location: 'ঢাকা',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      comment: 'টিভি পিকচার কোয়ালিটি অসাধারণ! সাউন্ড ও খুব ভালো। ডেলিভারি ছিল খুব দ্রুত।',
      rating: 5
    },
    {
      name: 'মাসুমা আক্তার',
      location: 'চট্টগ্রাম',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      comment: 'অনলাইনে অর্ডার করে খুব ভালো পণ্য পেয়েছি। চেক করে টাকা দিয়েছি। সত্যি নির্ভরযোগ্য!',
      rating: 5
    },
    {
      name: 'সোহাগ মিয়া',
      location: 'সিলেট',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      comment: 'বিকাশে পেমেন্ট করে অর্ডার করেছি। সার্ভিস ও পণ্য দুটোই সেরা।',
      rating: 5
    }
  ];

  const reviewList = Array.isArray(reviews) && reviews.length > 0 ? reviews.slice(0, 3) : sampleReviews;

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-10 space-y-6 font-['Hind_Siliguri',sans-serif]">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">গ্রাহকদের মতামত</h2>
        <div className="flex items-center justify-center gap-1">
          <div className="w-8 h-0.5 bg-amber-400"></div>
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="w-8 h-0.5 bg-amber-400"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviewList.map((rev, i) => (
          <div key={i} className="bg-white text-slate-900 p-5 rounded-2xl shadow-xl space-y-3 border border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={rev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.name || rev.user_name || 'Customer')}&background=0D8ABC&color=fff`}
                alt={rev.name || rev.user_name || 'Customer'}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h3 className="font-extrabold text-xs text-slate-900">{rev.name || rev.user_name || 'গ্রাহক'}</h3>
                <p className="text-[10px] text-slate-500">{rev.location || 'ঢাকা'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
