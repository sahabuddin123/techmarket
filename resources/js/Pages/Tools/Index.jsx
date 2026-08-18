import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

export default function ToolsIndex() {
  const tools = [
    {
      id: 'btu',
      title: 'AC BTU Calculator',
      description: 'Calculate the perfect BTU capacity for your room to ensure optimal cooling performance.',
      buttonText: 'Use Calculator →',
      href: '/tools/btu-calculator',
      icon: (
        <svg className="w-24 h-24 text-slate-800" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer AC Unit */}
          <rect x="6" y="16" width="52" height="24" rx="3" />
          {/* Center display */}
          <line x1="12" y1="23" x2="34" y2="23" />
          <circle cx="50" cy="23" r="1.5" fill="currentColor" />
          <line x1="12" y1="28" x2="26" y2="28" />
          {/* Bottom grill lines */}
          <line x1="10" y1="34" x2="54" y2="34" />
          {/* Air flow wave streams */}
          <path d="M16 46c2 4 4 6 6 6" />
          <path d="M26 46c1.5 4 3 6 5 6" />
          <path d="M38 46c-1.5 4-3 6-5 6" />
          <path d="M48 46c-2 4-4 6-6 6" />
        </svg>
      ),
    },
    {
      id: 'emi',
      title: 'EMI Calculator',
      description: 'Plan your budget with our EMI calculator and determine affordable monthly payments.',
      buttonText: 'Use Calculator →',
      href: '/tools/emi-calculator',
      icon: (
        <svg className="w-24 h-24 text-slate-800" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          {/* Calendar top ring anchors */}
          <rect x="8" y="14" width="48" height="40" rx="4" />
          <line x1="18" y1="8" x2="18" y2="16" />
          <line x1="32" y1="8" x2="32" y2="16" />
          <line x1="46" y1="8" x2="46" y2="16" />
          <line x1="8" y1="22" x2="56" y2="22" />
          {/* Small Money Badge */}
          <circle cx="42" cy="40" r="11" fill="white" />
          <circle cx="42" cy="40" r="10" />
          <path d="M42 34v12M44.5 37c-.5-.7-1.4-1-2.5-1-1.4 0-2.5.8-2.5 1.8 0 1.2 1.2 1.7 2.5 2 1.4.3 2.5.8 2.5 2 0 1.1-1.1 2-2.5 2-1.2 0-2.2-.4-2.7-1.2" />
          {/* Calendar row dots */}
          <line x1="16" y1="30" x2="24" y2="30" />
          <line x1="16" y1="36" x2="24" y2="36" />
          <line x1="16" y1="42" x2="24" y2="42" />
        </svg>
      ),
    },
    {
      id: 'pickup',
      title: 'Third Party Pickup Points',
      description: 'Find convenient pickup locations near you for hassle-free order collection.',
      buttonText: 'View Locations →',
      href: '/tools/third-party-pickup-points',
      icon: (
        <svg className="w-24 h-24 text-slate-800" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          {/* Map Base Sheet */}
          <path d="M8 16l14-4 16 4 18-4v36l-18 4-16-4-14 4V16z" />
          <line x1="22" y1="12" x2="22" y2="48" />
          <line x1="38" y1="16" x2="38" y2="52" />
          {/* Dotted Route */}
          <path d="M16 40c4-6 10-4 14-8s6-2 10-6" strokeDasharray="2 3" />
          {/* Location Pin */}
          <path d="M44 14a6 6 0 0 0-6 6c0 4.5 6 11 6 11s6-6.5 6-11a6 6 0 0 0-6-6z" fill="white" />
          <circle cx="44" cy="20" r="2" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head title="Useful Tools & Calculators - TechMarket BD" />
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-10 shadow-xs max-w-6xl mx-auto">
          {/* Top Section */}
          <div className="pb-4 border-b border-slate-200">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Useful Tools
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Powerful calculators and utilities to help you make informed decisions
            </p>
          </div>

          {/* 3 Equal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {tools.map((t) => (
              <div 
                key={t.id}
                className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Large Centered Icon Section */}
                <div className="w-full h-32 flex items-center justify-center border-b border-slate-100 pb-4 mb-5">
                  {t.icon}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-start">
                  <h2 className="text-base md:text-lg font-bold text-slate-900 mb-2">
                    {t.title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6">
                    {t.description}
                  </p>
                </div>

                {/* Navy Full-width Button */}
                <Link
                  href={t.href}
                  className="w-full bg-[#1c4289] hover:bg-[#15326b] text-white py-2.5 px-4 rounded font-bold text-xs md:text-sm flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span>{t.buttonText}</span>
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
