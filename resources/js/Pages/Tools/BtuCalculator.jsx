import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { calculateBtu } from '@/Utils/btuCalculator';
import { Calculator, Sparkles, CheckCircle2, ChevronRight, ArrowRight, Wind, Info, Zap } from 'lucide-react';

export default function BtuCalculator() {
  const [form, setForm] = useState({
    roomSize: '0-90 Square Feet',
    wallType: 'Facebrick',
    sunlightWalls: 'None',
    roomPosition: 'Other Floor',
    doors: 'One',
    windows: '1',
    people: '2',
  });

  const [result, setResult] = useState(null);

  const roomSizeOptions = [
    '0-90 Square Feet',
    '91-120 Square Feet',
    '121-150 Square Feet',
    '151-180 Square Feet',
    '181-220 Square Feet',
    '221-260 Square Feet',
    '261-300 Square Feet',
    '301-350 Square Feet',
    '351-400 Square Feet',
    '401-500 Square Feet',
    '500+ Square Feet',
  ];

  const wallTypeOptions = [
    'Facebrick',
    'Cavity Brick',
    'Concrete Block',
    'Weatherboard / Timber',
    'Glass / Curtain Wall',
    'Insulated Wall',
  ];

  const handleCalculate = (e) => {
    e.preventDefault();
    const res = calculateBtu(form);
    setResult(res);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-[#0084ff] selection:text-white">
      <Head title="AC BTU Calculator - TechMarket BD" />
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="w-full bg-white border-b border-slate-200/90 py-3">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#0084ff] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/tools" className="hover:text-[#0084ff] transition-colors">Useful Tools</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate">AC BTU Calculator</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-2xs">
          
          {/* Header Section */}
          <div className="pb-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0084ff] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Wind className="w-3.5 h-3.5" />
                <span>COOLING POWER ESTIMATOR</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                AC BTU Capacity Calculator
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Determine the exact ton and BTU rating required for your room based on heat load factors.
              </p>
            </div>

            <Link
              href="/tools"
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0084ff] flex items-center gap-1.5 self-start md:self-auto transition-colors"
            >
              <span>← Back to Tools</span>
            </Link>
          </div>

          {/* Warning Notice Box */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 text-xs font-medium flex items-center gap-2.5 my-6">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>The calculated results are approximate engineering guidelines for residential and home-office air conditioners in Bangladesh climate conditions.</span>
          </div>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Calculator Form (7 cols) */}
            <form onSubmit={handleCalculate} className="lg:col-span-7 space-y-5 bg-slate-50/70 p-6 sm:p-7 rounded-2xl border border-slate-200/80">
              
              {/* Row 1: Room Size & Wall Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    Room Size (Sq. Ft.) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.roomSize}
                    onChange={(e) => setForm({ ...form, roomSize: e.target.value })}
                    className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff] text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    {roomSizeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    Wall Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.wallType}
                    onChange={(e) => setForm({ ...form, wallType: e.target.value })}
                    className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff] text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    {wallTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Sunlight Exposed Wall */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Sunlight Exposed Walls <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {['None', '1', '2', '3', '4'].map((val) => {
                    const isSelected = form.sunlightWalls === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, sunlightWalls: val })}
                        className={`min-w-[50px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0084ff] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-2xs'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Room Position & Number of Doors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    Floor Position <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {['Other Floor', 'Top Floor'].map((val) => {
                      const isSelected = form.roomPosition === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setForm({ ...form, roomPosition: val })}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-[#0084ff] text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-2xs'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    Number of Doors <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {['One', 'Two'].map((val) => {
                      const isSelected = form.doors === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setForm({ ...form, doors: val })}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-[#0084ff] text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-2xs'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 4: Number of Windows & People */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    Number of Windows <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {['1', '2', '3', '4'].map((val) => {
                      const isSelected = form.windows === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setForm({ ...form, windows: val })}
                          className={`w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0084ff] text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-2xs'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    Occupants (People) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {['1', '2', '3', '4'].map((val) => {
                      const isSelected = form.people === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setForm({ ...form, people: val })}
                          className={`w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0084ff] text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-2xs'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#0084ff] hover:bg-[#0070d6] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculate AC Capacity</span>
                </button>
              </div>
            </form>

            {/* Results / Recommendation Column (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {result ? (
                <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Recommended AC Ton</span>
                      <h3 className="text-3xl font-black text-white mt-0.5">
                        {result.recommendedTon}
                      </h3>
                    </div>
                    <div className="bg-slate-800/80 px-3 py-2 rounded-xl text-right border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Cooling Power</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {result.recommendedBtu.toLocaleString()} BTU/hr
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Power Consumption:</span>
                      <span className="font-bold text-white">~{result.estimatedPowerWatt} Watts</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Recommended Compressor:</span>
                      <span className="font-bold text-emerald-400">Inverter T3 Climate</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Target Efficiency:</span>
                      <span className="font-bold text-blue-300">5-Star Energy Saver</span>
                    </div>
                  </div>

                  <Link
                    href="/catalog?search=Air%20Conditioner"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-center"
                  >
                    <span>Browse {result.recommendedTon} Air Conditioners</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0084ff] flex items-center justify-center mx-auto shadow-2xs">
                    <Wind className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">Ready to Calculate</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Fill out your room dimensions on the left and click "Calculate AC Capacity" for instant recommendations.
                    </p>
                  </div>
                </div>
              )}

              {/* Buying Tips Guide */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#0084ff]" />
                  <span>Expert AC Sizing Guidelines</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                  <li><strong className="text-slate-800">Top Floor Consideration:</strong> Top floor rooms absorb severe rooftop heat and require ~15-20% higher BTU capacity.</li>
                  <li><strong className="text-slate-800">Dual Inverter:</strong> Saves up to 60% electricity compared to non-inverter fixed-speed models.</li>
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
