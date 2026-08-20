import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  Lock, Mail, Eye, EyeOff, ArrowLeft, 
  ShieldCheck, AlertCircle 
} from 'lucide-react';

export default function ResetPassword({ token, email }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    token: token,
    email: email || '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('password.store'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans selection:bg-[#002a5c] selection:text-white">
      <Head title="Reset Password — TechMarket BD" />

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
                Account Security
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-7 sm:p-8">
          <div className="mb-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#002a5c] flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Set New Password
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create a strong new password for your account.
            </p>
          </div>

          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{Object.values(errors)[0]}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#002a5c] focus:ring-1 focus:ring-[#002a5c] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                New password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
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

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#002a5c] focus:ring-1 focus:ring-[#002a5c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 px-4 rounded-lg bg-[#002a5c] hover:bg-[#001f44] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href={route('login')}
              className="text-xs text-[#002a5c] font-semibold hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
