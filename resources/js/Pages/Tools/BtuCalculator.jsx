import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { calculateBtu } from '../../Utils/btuCalculator';
import { Calculator, Sparkles, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head title="AC BTU Calculator - TechMarket BD" />
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-10 shadow-xs max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              AC BTU Calculator
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Calculate the perfect BTU capacity for your room
            </p>
          </div>

          {/* Warning Notice Box */}
          <div className="bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] rounded-md py-3 px-6 text-xs text-center font-medium max-w-2xl mx-auto my-6">
            The calculated results are approximate guidelines for selecting residential air conditioners only.
          </div>

          {/* Calculator Form */}
          <form onSubmit={handleCalculate} className="space-y-6 text-xs max-w-3xl mx-auto">
            {/* Row 1: Room Size & Wall Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Room Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.roomSize}
                  onChange={(e) => setForm({ ...form, roomSize: e.target.value })}
                  className="w-full bg-white text-slate-800 rounded-md border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#1c4289] focus:border-[#1c4289] text-xs font-medium cursor-pointer"
                >
                  {roomSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Wall Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.wallType}
                  onChange={(e) => setForm({ ...form, wallType: e.target.value })}
                  className="w-full bg-white text-slate-800 rounded-md border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#1c4289] focus:border-[#1c4289] text-xs font-medium cursor-pointer"
                >
                  {wallTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Sunlight Exposed Wall */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Sunlight Exposed Wall <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {['None', '1', '2', '3', '4'].map((val) => {
                  const isSelected = form.sunlightWalls === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, sunlightWalls: val })}
                      className={`min-w-[48px] px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1c4289] text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Room Position & Number of Door */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Room Position <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {['Other Floor', 'Top Floor'].map((val) => {
                    const isSelected = form.roomPosition === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, roomPosition: val })}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1c4289] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Number of Door <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {['One', 'Two'].map((val) => {
                    const isSelected = form.doors === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, doors: val })}
                        className={`min-w-[50px] px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1c4289] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 4: Number of Window & Number of People */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Number of Window <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {['1', '2', '3', '4'].map((val) => {
                    const isSelected = form.windows === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, windows: val })}
                        className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1c4289] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Number of People <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {['1', '2', '3', '4'].map((val) => {
                    const isSelected = form.people === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, people: val })}
                        className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1c4289] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
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
                className="w-full bg-[#1c4289] hover:bg-[#15326b] text-white py-3 rounded-md font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate</span>
              </button>
            </div>
          </form>

          {/* Calculation Result Section */}
          {result && (
            <div className="mt-8 pt-8 border-t border-slate-200 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recommended AC Capacity</span>
                    <h3 className="text-2xl font-black text-[#1c4289]">
                      {result.recommendedTon}
                    </h3>
                  </div>

                  <div className="bg-white px-4 py-2 rounded-md border border-slate-200 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cooling Power</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      {result.recommendedBtu.toLocaleString()} BTU / hr
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Estimated Wattage</span>
                    <span className="font-extrabold text-slate-800">~{result.estimatedPowerWatt} Watts</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Technology</span>
                    <span className="font-extrabold text-emerald-600">Dual Inverter Preferred</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Bangladesh Climate</span>
                    <span className="font-extrabold text-slate-800">Tropical High-Ambient</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href="/catalog?search=Air%20Conditioner"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1c4289] hover:underline"
                  >
                    <span>Browse Compatible Air Conditioners</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/tools"
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    ← Back to Tools
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
