import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  User, Lock, Mail, Eye, EyeOff, ArrowLeft, 
  ShoppingBag, ShieldCheck, Truck, Gift, AlertCircle 
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-['Hind_Siliguri',sans-serif] selection:bg-[#1c4289] selection:text-white">
      <Head title="গ্রাহক লগইন — TechMarket BD" />

      {/* Top Brand & Back to Home */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1c4289] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>মূল ওয়েবসাইটে ফিরে যান (Back to Home)</span>
        </Link>
        <Link href="/" className="inline-block">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1c4289] flex items-center justify-center text-white font-black text-xl shadow-md">
              TM
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-900 leading-none block">
                Tech<span className="text-[#1c4289]">Market</span>
              </span>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                Trusted Retail BD
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* LEFT COLUMN: CUSTOMER BENEFITS HIGHLIGHT (5 Cols) */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#1c4289] to-[#0f244c] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15 mb-3">
                  👤 কাস্টমার পোর্টাল
                </span>
                <h2 className="text-xl sm:text-2xl font-black leading-snug">
                  আপনার অ্যাকাউন্টে লগইন করুন
                </h2>
                <p className="text-xs text-blue-100/80 mt-1.5">
                  একটি অ্যাকাউন্টের মাধ্যমেই উপভোগ করুন প্রিমিয়াম শপিং অভিজ্ঞতা
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold">লাইভ অর্ডার ট্র্যাকিং</p>
                    <p className="text-[11px] text-blue-200/70">রিয়েল-টাইমে ডেলিভারি আপডেট জানুন</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold">রিওয়ার্ড পয়েন্ট ও কুপন</p>
                    <p className="text-[11px] text-blue-200/70">প্রতিটি অর্ডারে পয়েন্ট ও ডিসকাউন্ট</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold">অফিসিয়াল ওয়ারেন্টি সাপোর্ট</p>
                    <p className="text-[11px] text-blue-200/70">দ্রুত ক্লেইম ও সার্ভিস রিকোয়েস্ট</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Support Call */}
            <div className="pt-6 mt-6 border-t border-white/10 text-xs text-blue-200/80 relative z-10">
              হেল্পলাইন: <span className="font-bold text-amber-300">09678-123456</span>
            </div>
          </div>

          {/* RIGHT COLUMN: LOGIN FORM (7 Cols) */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900">
                স্বাগতম! (Welcome Back)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                আপনার ইমেইল এবং পাসওয়ার্ড দিয়ে সাইন ইন করুন
              </p>
            </div>

            {/* Session Status */}
            {status && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                {status}
              </div>
            )}

            {/* Error Message */}
            {(errors.email || errors.password) && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errors.email || errors.password}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ইমেইল অ্যাড্রেস (Email Address)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="example@mail.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1c4289] focus:ring-1 focus:ring-[#1c4289] transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    পাসওয়ার্ড (Password)
                  </label>
                  {canResetPassword && (
                    <Link
                      href={route('password.request')}
                      className="text-xs text-[#1c4289] font-bold hover:underline"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1c4289] focus:ring-1 focus:ring-[#1c4289] transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="rounded border-slate-300 text-[#1c4289] focus:ring-[#1c4289]"
                  />
                  <span className="text-xs text-slate-600 font-medium">আমাকে মনে রাখুন</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 px-4 rounded-xl bg-[#1c4289] hover:bg-[#15326b] text-white font-black text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>লগইন করা হচ্ছে...</span>
                  </>
                ) : (
                  <span>লগইন করুন (Log In)</span>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                নতুন কাস্টমার?{' '}
                <Link
                  href={route('register')}
                  className="text-[#1c4289] font-black hover:underline ml-1"
                >
                  এখনই অ্যাকাউন্ট তৈরি করুন (Register)
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
