import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  KeyRound, Mail, ArrowLeft, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function ForgotPassword({ status }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('password.email'));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans selection:bg-[#0084ff] selection:text-white">
      <Head title="Forgot Password — TechMarket BD" />

      {/* Top Brand & Back to Home */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0084ff] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link href="/" className="inline-block">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0084ff] flex items-center justify-center text-white font-black text-xl shadow-md">
              TM
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-900 leading-none block">
                Tech<span className="text-blue-600">Market</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Account Recovery
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-7 sm:p-8">
          <div className="mb-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0084ff] flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Forgot Password
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter your registered email address and we'll send you a password reset link.
            </p>
          </div>

          {/* Success Status */}
          {status && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{status}</span>
            </div>
          )}

          {/* Errors */}
          {errors.email && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.email}</span>
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
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0084ff] hover:bg-[#001f44] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href={route('login')}
              className="text-xs text-[#0084ff] font-semibold hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
