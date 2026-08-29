import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Wrench, ChevronRight, ArrowRight, ShieldCheck, Sparkles, MapPin, Calculator } from 'lucide-react';

export default function ToolsIndex() {
  const tools = [
    {
      id: 'btu',
      title: 'AC BTU Calculator',
      description: 'Calculate the precise BTU cooling capacity required for your room to ensure peak energy efficiency and optimal performance.',
      buttonText: 'Open BTU Calculator',
      href: '/tools/btu-calculator',
      badge: 'Cooling Advisor',
      icon: (
        <svg className="w-20 h-20 text-[#1c4289]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="16" width="52" height="24" rx="3" />
          <line x1="12" y1="23" x2="34" y2="23" />
          <circle cx="50" cy="23" r="1.5" fill="currentColor" />
          <line x1="12" y1="28" x2="26" y2="28" />
          <line x1="10" y1="34" x2="54" y2="34" />
          <path d="M16 46c2 4 4 6 6 6" />
          <path d="M26 46c1.5 4 3 6 5 6" />
          <path d="M38 46c-1.5 4-3 6-5 6" />
          <path d="M48 46c-2 4-4 6-6 6" />
        </svg>
      ),
    },
    {
      id: 'emi',
      title: 'EMI Installment Calculator',
      description: 'Plan your budget with our flexible 0% & low-interest EMI calculator across 21+ supported partner commercial banks in Bangladesh.',
      buttonText: 'Calculate Monthly EMI',
      href: '/tools/emi-calculator',
      badge: 'Finance Planner',
      icon: (
        <svg className="w-20 h-20 text-[#1c4289]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="14" width="48" height="40" rx="4" />
          <line x1="18" y1="8" x2="18" y2="16" />
          <line x1="32" y1="8" x2="32" y2="16" />
          <line x1="46" y1="8" x2="46" y2="16" />
          <line x1="8" y1="22" x2="56" y2="22" />
          <circle cx="42" cy="40" r="11" fill="white" />
          <circle cx="42" cy="40" r="10" />
          <path d="M42 34v12M44.5 37c-.5-.7-1.4-1-2.5-1-1.4 0-2.5.8-2.5 1.8 0 1.2 1.2 1.7 2.5 2 1.4.3 2.5.8 2.5 2 0 1.1-1.1 2-2.5 2-1.2 0-2.2-.4-2.7-1.2" />
          <line x1="16" y1="30" x2="24" y2="30" />
          <line x1="16" y1="36" x2="24" y2="36" />
          <line x1="16" y1="42" x2="24" y2="42" />
        </svg>
      ),
    },
    {
      id: 'pickup',
      title: 'Third Party Pickup Points',
      description: 'Locate verified nationwide courier hubs, Sundarban, SA Paribahan, and RedX agent pickup counters for fast and secure collection.',
      buttonText: 'Browse Pickup Hubs',
      href: '/tools/third-party-pickup-points',
      badge: 'Nationwide Delivery',
      icon: (
        <svg className="w-20 h-20 text-[#1c4289]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 16l14-4 16 4 18-4v36l-18 4-16-4-14 4V16z" />
          <line x1="22" y1="12" x2="22" y2="48" />
          <line x1="38" y1="16" x2="38" y2="52" />
          <path d="M16 40c4-6 10-4 14-8s6-2 10-6" strokeDasharray="2 3" />
          <path d="M44 14a6 6 0 0 0-6 6c0 4.5 6 11 6 11s6-6.5 6-11a6 6 0 0 0-6-6z" fill="white" />
          <circle cx="44" cy="20" r="2" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head title="Useful Tools & Calculators - TechMarket BD" />
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="w-full bg-white border-b border-slate-200/90 py-3">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#1c4289] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate">Useful Tools & Calculators</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Main Content Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-2xs">
          
          {/* Header Section */}
          <div className="pb-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#1c4289] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Wrench className="w-3.5 h-3.5" />
                <span>CUSTOMER UTILITIES</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                Useful Tools & Decision Calculators
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Smart interactive calculators and service estimators to help you make informed purchase decisions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href="/pc-builder" 
                className="px-4 py-2 bg-[#1c4289] hover:bg-[#15326b] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>PC Builder Suite</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3 Balanced Responsive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {tools.map((t) => (
              <div 
                key={t.id}
                className="bg-slate-50/60 hover:bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between items-center text-center shadow-2xs hover:shadow-md hover:border-blue-300/80 transition-all group"
              >
                {/* Badge */}
                <div className="w-full flex justify-end mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100/70 text-[#1c4289]">
                    {t.badge}
                  </span>
                </div>

                {/* Large Centered Icon */}
                <div className="w-full h-28 flex items-center justify-center border-b border-slate-200/60 pb-4 mb-5 group-hover:scale-105 transition-transform">
                  {t.icon}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-start">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 font-heading">
                    {t.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {t.description}
                  </p>
                </div>

                {/* Navy Full-width Button */}
                <Link
                  href={t.href}
                  className="w-full bg-[#1c4289] hover:bg-[#15326b] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer group-hover:shadow"
                >
                  <span>{t.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
