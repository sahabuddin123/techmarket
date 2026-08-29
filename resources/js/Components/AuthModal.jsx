import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { 
  X, Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, 
  Truck, Gift, AlertCircle, CheckCircle2, ArrowRight, 
  KeyRound, LogIn, UserPlus, HelpCircle
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onSuccess }) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'forgot-password' | 'forgot-phone'
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [forgotStatus, setForgotStatus] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setForgotStatus(null);
      setPhoneStatus(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Login Form
  const loginForm = useForm({
    phone: '',
    password: '',
    remember: false,
  });

  // Register Form
  const registerForm = useForm({
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  // Forgot Password Form
  const forgotPasswordForm = useForm({
    email: '',
  });

  // Forgot Phone Form
  const forgotPhoneForm = useForm({
    email: '',
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginForm.post(route('login'), {
      preserveScroll: true,
      onSuccess: () => {
        loginForm.reset('password');
        if (onSuccess) onSuccess();
        onClose();
      },
      onFinish: () => loginForm.reset('password'),
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerForm.post(route('register'), {
      preserveScroll: true,
      onSuccess: () => {
        registerForm.reset('password', 'password_confirmation');
        if (onSuccess) onSuccess();
        onClose();
      },
      onFinish: () => registerForm.reset('password', 'password_confirmation'),
    });
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setForgotStatus(null);
    forgotPasswordForm.post(route('password.email'), {
      preserveScroll: true,
      onSuccess: () => {
        setForgotStatus('Password reset link has been sent to your email.');
        forgotPasswordForm.reset();
      },
    });
  };

  const handleForgotPhoneSubmit = (e) => {
    e.preventDefault();
    setPhoneStatus(null);
    forgotPhoneForm.post(route('phone.forgot'), {
      preserveScroll: true,
      onSuccess: () => {
        setPhoneStatus('If your email is registered, we have emailed your phone number.');
        forgotPhoneForm.reset();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center">
        <div 
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden text-left transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* LEFT COLUMN: BRAND SIDEBAR */}
          <div className="hidden md:flex md:w-5/12 bg-[#0084ff] text-white p-7 flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-sm">
                  TM
                </div>
                <div>
                  <span className="text-base font-black tracking-tight text-white block leading-none">
                    Tech<span className="text-blue-400">Market</span>
                  </span>
                  <span className="text-[10px] text-blue-200/70 font-medium">
                    Customer Portal
                  </span>
                </div>
              </div>

              <h4 className="text-lg font-bold text-white mb-1.5">
                {tab === 'login' && 'Welcome Back'}
                {tab === 'register' && 'Create Account'}
                {tab === 'forgot-password' && 'Reset Password'}
                {tab === 'forgot-phone' && 'Find Phone Number'}
              </h4>
              <p className="text-xs text-blue-100/70 leading-relaxed">
                Sign in with your phone number and password to manage orders and track shipments.
              </p>

              {/* Minimal Perks */}
              <div className="space-y-3 mt-8">
                <div className="flex items-center gap-2.5 text-xs text-blue-100/90">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <span>Real-time order tracking</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-blue-100/90">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                    <Gift className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <span>Reward points on purchases</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-blue-100/90">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <span>Official warranty & support</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-blue-200/60 flex items-center justify-between">
              <span>Helpline</span>
              <span className="font-semibold text-white font-mono">09678-123456</span>
            </div>
          </div>

          {/* RIGHT COLUMN: FORMS */}
          <div className="w-full md:w-7/12 p-6 sm:p-7 flex flex-col justify-center">
            {/* Segmented Tab Toggle (for login & register) */}
            {(tab === 'login' || tab === 'register') && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tab === 'login'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            {/* ================= 1. LOGIN TAB ================= */}
            {tab === 'login' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Sign In</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your phone number and password to log in.
                  </p>
                </div>

                {/* Errors */}
                {(loginForm.errors.phone || loginForm.errors.email || loginForm.errors.password) && (
                  <div className="mb-3.5 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginForm.errors.phone || loginForm.errors.email || loginForm.errors.password}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone number (or Email)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginForm.data.phone}
                        onChange={(e) => loginForm.setData('phone', e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTab('forgot-password');
                          setForgotStatus(null);
                        }}
                        className="text-xs text-[#0084ff] font-semibold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginForm.data.password}
                        onChange={(e) => loginForm.setData('password', e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot phone row */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={loginForm.data.remember}
                        onChange={(e) => loginForm.setData('remember', e.target.checked)}
                        className="rounded border-slate-300 text-[#0084ff] focus:ring-[#0084ff]"
                      />
                      <span className="text-xs text-slate-600">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot-phone');
                        setPhoneStatus(null);
                      }}
                      className="text-xs text-slate-500 hover:text-[#0084ff] hover:underline"
                    >
                      Forgot phone?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginForm.processing}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0084ff] hover:bg-[#001f44] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loginForm.processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>

                {/* Social Login Options */}
                <div className="mt-4">
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

                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      className="text-[#0084ff] font-bold hover:underline ml-1"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ================= 2. REGISTER TAB ================= */}
            {tab === 'register' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Create Account</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phone number is mandatory to register.
                  </p>
                </div>

                {/* Errors */}
                {Object.keys(registerForm.errors).length > 0 && (
                  <div className="mb-3.5 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{Object.values(registerForm.errors)[0]}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={registerForm.data.name}
                        onChange={(e) => registerForm.setData('name', e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={registerForm.data.phone}
                        onChange={(e) => registerForm.setData('phone', e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email address <span className="text-slate-400 text-[10px]">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={registerForm.data.email}
                        onChange={(e) => registerForm.setData('email', e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          value={registerForm.data.password}
                          onChange={(e) => registerForm.setData('password', e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          tabIndex={-1}
                        >
                          {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Confirm password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegisterConfirm ? 'text' : 'password'}
                          required
                          value={registerForm.data.password_confirmation}
                          onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          tabIndex={-1}
                        >
                          {showRegisterConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registerForm.processing}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0084ff] hover:bg-[#001f44] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {registerForm.processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </form>

                {/* Social Login Options */}
                <div className="mt-3.5">
                  <div className="relative flex items-center justify-center mb-2.5">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-2 text-[11px] text-slate-400 font-medium shrink-0">
                      or register with
                    </span>
                    <div className="border-t border-slate-200 w-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href="/auth/google/redirect"
                      className="flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google</span>
                    </a>

                    <a
                      href="/auth/facebook/redirect"
                      className="flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
                    </a>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-[#0084ff] font-bold hover:underline ml-1"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ================= 3. FORGOT PHONE TAB ================= */}
            {tab === 'forgot-phone' && (
              <div>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-slate-900">Forgot Phone Number</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your registered email address and we will mail your phone number to you.
                  </p>
                </div>

                {/* Status Message */}
                {phoneStatus && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{phoneStatus}</span>
                  </div>
                )}

                {/* Errors */}
                {forgotPhoneForm.errors.email && (
                  <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotPhoneForm.errors.email}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Registered email address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotPhoneForm.data.email}
                        onChange={(e) => forgotPhoneForm.setData('email', e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotPhoneForm.processing}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0084ff] hover:bg-[#001f44] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotPhoneForm.processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Send My Phone Number</span>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setPhoneStatus(null);
                    }}
                    className="text-xs text-[#0084ff] font-semibold hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            )}

            {/* ================= 4. FORGOT PASSWORD TAB ================= */}
            {tab === 'forgot-password' && (
              <div>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-slate-900">Forgot Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your email to receive a password reset link.
                  </p>
                </div>

                {/* Status */}
                {forgotStatus && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{forgotStatus}</span>
                  </div>
                )}

                {/* Errors */}
                {forgotPasswordForm.errors.email && (
                  <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotPasswordForm.errors.email}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Registered email address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotPasswordForm.data.email}
                        onChange={(e) => forgotPasswordForm.setData('email', e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotPasswordForm.processing}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0084ff] hover:bg-[#001f44] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotPasswordForm.processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setForgotStatus(null);
                    }}
                    className="text-xs text-[#0084ff] font-semibold hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
