import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  Lock, Mail, Phone, Eye, EyeOff, ArrowLeft, 
  Truck, Gift, ShieldCheck, AlertCircle 
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    phone: '',
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans selection:bg-[#002a5c] selection:text-white">
      <Head title="Sign In — TechMarket BD" />

      {/* Top Brand & Back to Home */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#002a5c] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link href="/" className="inline-block">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#002a5c] flex items-center justify-center text-white font-black text-xl shadow-md">
              TM
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-900 leading-none block">
                Tech<span className="text-blue-600">Market</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Storefront Portal
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* LEFT COLUMN */}
          <div className="md:col-span-5 bg-[#002a5c] p-7 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Welcome Back
                </h2>
                <p className="text-xs text-blue-100/70 mt-1 leading-relaxed">
                  Log in to manage your orders, wishlist, and exclusive member discounts.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Live Parcel Tracking</p>
                    <p className="text-[11px] text-blue-200/60">Real-time shipping updates</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Gift className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Reward Points</p>
                    <p className="text-[11px] text-blue-200/60">Points on every checkout</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Official Warranty</p>
                    <p className="text-[11px] text-blue-200/60">Fast warranty support</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 text-xs text-blue-200/70 relative z-10 flex items-center justify-between">
              <span>Helpline</span>
              <span className="font-semibold text-white font-mono">09678-123456</span>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="md:col-span-7 p-7 sm:p-8 flex flex-col justify-center">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                Sign In
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your phone number and password to continue.
              </p>
            </div>

            {/* Session Status */}
            {status && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs">
                {status}
              </div>
            )}

            {/* Error Message */}
            {(errors.phone || errors.email || errors.password) && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.phone || errors.email || errors.password}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone number (or Email)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="phone"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="017XXXXXXXX"
                    required
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#002a5c] focus:ring-1 focus:ring-[#002a5c] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Password
                  </label>
                  {canResetPassword && (
                    <Link
                      href={route('password.request')}
                      className="text-xs text-[#002a5c] font-semibold hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#002a5c] focus:ring-1 focus:ring-[#002a5c] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="rounded border-slate-300 text-[#002a5c] focus:ring-[#002a5c]"
                  />
                  <span className="text-xs text-slate-600">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-2.5 px-4 rounded-lg bg-[#002a5c] hover:bg-[#001f44] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Social OAuth Buttons */}
            <div className="mt-5">
              <div className="relative flex items-center justify-center mb-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2 text-[11px] text-slate-400 font-medium shrink-0">
                  or continue with
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="/auth/google/redirect"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </a>

                <a
                  href="/auth/facebook/redirect"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <Link
                  href={route('register')}
                  className="text-[#002a5c] font-bold hover:underline ml-1"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
