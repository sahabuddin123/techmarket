import React from 'react';
import { ShieldCheck, Award, ThumbsUp, Star } from 'lucide-react';

export default function FinalTrustBar() {
  return (
    <div className="border-t border-slate-800/80 bg-[#070b13] py-6 px-3 sm:px-6 font-['Hind_Siliguri',sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-slate-300">
        <div className="space-y-1">
          <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto" />
          <h4 className="font-bold text-white">SSL নিরাপদ পেমেন্ট</h4>
          <p className="text-[10px] text-slate-400">আপনার তথ্য ১০০% নিরাপদ</p>
        </div>

        <div className="space-y-1">
          <Award className="w-5 h-5 text-amber-400 mx-auto" />
          <h4 className="font-bold text-white">১০০% ব্র্যান্ড অথেন্টিক</h4>
          <p className="text-[10px] text-slate-400">অনলাইনে বিশ্বস্ত</p>
        </div>

        <div className="space-y-1">
          <ThumbsUp className="w-5 h-5 text-amber-400 mx-auto" />
          <h4 className="font-bold text-white">১ লক্ষ+ গ্রাহকের আস্থা</h4>
          <p className="text-[10px] text-slate-400">আমাদের উপর ভরসা করেছেন</p>
        </div>

        <div className="space-y-1">
          <Star className="w-5 h-5 text-amber-400 mx-auto fill-amber-400" />
          <h4 className="font-bold text-white">৪.৮/৫ রেটিং</h4>
          <p className="text-[10px] text-slate-400">গ্রাহকদের ভালোবাসা</p>
        </div>
      </div>
    </div>
  );
}
