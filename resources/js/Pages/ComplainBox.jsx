import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';

export default function ComplainBox() {
  const [cartOpen, setCartOpen] = useState(false);
  const { settings = {}, auth = {} } = usePage().props;

  const { data, setData, post, processing, reset, errors, recentlySuccessful } = useForm({
    name: auth.user?.name || '',
    phone: auth.user?.phone || '',
    email: auth.user?.email || '',
    subject: '',
    details: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/complain-box', {
      onSuccess: () => reset('subject', 'details'),
    });
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#0084ff] selection:text-white">
      <Head title="Complain Box - TechMarket BD" />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-12 shadow-xs max-w-5xl mx-auto space-y-8">
          
          {/* Top Header */}
          <div className="pb-4 border-b border-slate-200 space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Complain Box
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Please share your concerns with us and we'll address them promptly.
            </p>
          </div>

          {recentlySuccessful && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! Your complaint has been submitted. Our support team will review and respond shortly.</span>
            </div>
          )}

          {/* 2-Column Layout Matching Reference Screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Complaint Form (7 Cols) */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
              
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0084ff]"
                />
                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                    Phone number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0084ff]"
                  />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0084ff]"
                  />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.subject}
                  onChange={(e) => setData('subject', e.target.value)}
                  placeholder="Enter complain subject"
                  className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0084ff]"
                />
                {errors.subject && <p className="text-red-500 text-[11px] mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={7}
                  required
                  value={data.details}
                  onChange={(e) => setData('details', e.target.value)}
                  placeholder="Write your detailed complaint..."
                  className="w-full bg-white border border-slate-300 rounded p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#0084ff] leading-relaxed"
                />
                {errors.details && <p className="text-red-500 text-[11px] mt-1">{errors.details}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-[#0084ff] hover:bg-[#0070d6] text-white px-8 py-2.5 rounded text-xs font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {processing ? 'Submitting...' : 'Submit'}
                </button>
              </div>

            </form>

            {/* Right Column: Information Section (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Section 1: Need Immediate Help? */}
              <div className="space-y-3.5">
                <div className="inline-block relative bg-[#0084ff] text-white px-3.5 py-1.5 rounded-l text-xs font-bold shadow-2xs pr-5 [clip-path:polygon(0%_0%,calc(100%-8px)_0%,100%_50%,calc(100%-8px)_100%,0%_100%)]">
                  Need Immediate Help?
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  For urgent order or service issues, reach us directly by phone or visit one of our stores.
                </p>

                <div className="space-y-2.5 pt-1">
                  <a
                    href={`tel:${settings.hotline || '+8809613562601'}`}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded bg-[#0084ff] hover:bg-[#0070d6] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: {settings.hotline || '09613562601'}</span>
                  </a>

                  <a
                    href={`mailto:${settings.support_email || 'info@techmarketbd.com'}`}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0084ff]" />
                    <span>{settings.support_email || 'info@techmarketbd.com'}</span>
                  </a>

                  <Link
                    href="/servicing"
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0084ff]" />
                    <span>Visit Our Stores</span>
                  </Link>
                </div>
              </div>

              {/* Section 2: Before You Submit */}
              <div className="space-y-3 pt-2">
                <div className="inline-block relative bg-[#0084ff] text-white px-3.5 py-1.5 rounded-l text-xs font-bold shadow-2xs pr-5 [clip-path:polygon(0%_0%,calc(100%-8px)_0%,100%_50%,calc(100%-8px)_100%,0%_100%)]">
                  Before You Submit
                </div>

                <ul className="text-xs text-slate-600 space-y-2 leading-relaxed pt-1">
                  <li className="flex items-start space-x-1.5">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>Include your order number if the complaint is order-related.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>Describe the issue clearly with dates and product details.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>We typically respond within 1–2 business days.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
