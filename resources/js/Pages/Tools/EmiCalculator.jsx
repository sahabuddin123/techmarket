import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { Calculator, CreditCard, Landmark, CheckCircle2, ChevronRight, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function EmiCalculator({ partners = [], banks = [] }) {
  const [amount, setAmount] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [calculatedPlan, setCalculatedPlan] = useState(null);
  const [error, setError] = useState('');

  // Fallback bank list if none passed from props
  const bankList = banks.length > 0 ? banks : [
    { name: 'Al-Arafah Islami Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'AB Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Bank Asia Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Brac Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'City Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Dhaka Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Dutch Bangla Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Eastern Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Jamuna Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
    { name: 'Lanka Bangla Finance', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Mutual Trust Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Islami Bank Bangladesh', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
    { name: 'NCC Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Shahjalal Islami Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
    { name: 'South East Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Standard Chartered Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Premier Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
    { name: 'Prime Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Pubali Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
    { name: 'Trust Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'United Commercial Bank (UCB)', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
  ];

  const handleCalculate = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!numAmount || isNaN(numAmount) || numAmount < 5000) {
      setError('Please enter a minimum purchase amount of ৳ 5,000');
      setCalculatedPlan(null);
      return;
    }

    if (!selectedBankName) {
      setError('Please select a bank from the list');
      setCalculatedPlan(null);
      return;
    }

    setError('');
    const bankObj = bankList.find((b) => b.name === selectedBankName) || {
      name: selectedBankName,
      tenures: [3, 6, 9, 12, 18, 24, 36],
    };

    // Calculate installment options for each tenure
    const tenures = bankObj.tenures || [3, 6, 9, 12, 18, 24, 36];
    const plans = tenures.map((m) => {
      const monthly = Math.round(numAmount / m);
      return {
        months: m,
        monthly,
        total: numAmount,
        interestRate: m <= 12 ? '0% Interest' : 'Standard Bank Rate',
      };
    });

    setCalculatedPlan({
      bankName: bankObj.name,
      amount: numAmount,
      plans,
    });
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head title="EMI Calculator - TechMarket BD" />
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-10 shadow-xs max-w-4xl mx-auto">
          {/* Header */}
          <div className="pb-4 border-b border-slate-200">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              EMI Calculator
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Plan your budget and determine affordable monthly payments
            </p>
          </div>

          {/* Section Tab */}
          <div className="mt-8 mb-6">
            <span className="bg-[#1c4289] text-white px-5 py-2.5 rounded font-bold text-xs sm:text-sm inline-block shadow-xs">
              Calculate Your EMI
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Amount */}
              <div className="md:col-span-5">
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="5000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Minimum amount 5000 taka"
                  className="w-full bg-white text-slate-800 rounded-md border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#1c4289] focus:border-[#1c4289] text-xs font-medium placeholder-slate-400"
                />
              </div>

              {/* Bank Selection */}
              <div className="md:col-span-5">
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                  Bank <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBankName}
                  onChange={(e) => setSelectedBankName(e.target.value)}
                  className="w-full bg-white text-slate-800 rounded-md border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#1c4289] focus:border-[#1c4289] text-xs font-medium cursor-pointer"
                >
                  <option value="">--- Please Select Bank ---</option>
                  {bankList.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calculate Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#1c4289] hover:bg-[#15326b] text-white py-2.5 px-4 rounded-md font-bold text-xs sm:text-sm flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  <span>Calculate</span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-semibold mt-2">{error}</p>
            )}
          </form>

          {/* Results Table Section */}
          {calculatedPlan && (
            <div className="mt-8 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Selected Partner</span>
                    <h3 className="text-lg font-bold text-slate-900">{calculatedPlan.bankName}</h3>
                  </div>
                  <div className="bg-white px-4 py-1.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Purchase Amount</span>
                    <span className="text-base font-extrabold text-[#1c4289] font-mono">
                      ৳ {calculatedPlan.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse bg-white rounded border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold">
                        <th className="py-2.5 px-4">Tenure</th>
                        <th className="py-2.5 px-4">Monthly Installment</th>
                        <th className="py-2.5 px-4">Interest / Scheme</th>
                        <th className="py-2.5 px-4 text-right">Total Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {calculatedPlan.plans.map((p) => (
                        <tr key={p.months} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {p.months} Months
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-[#1c4289] font-mono">
                            ৳ {p.monthly.toLocaleString()} / mo
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {p.interestRate}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-800 text-right">
                            ৳ {p.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                  <span className="text-[11px]">
                    * Zero-cost 0% EMI applies to eligible credit cards based on bank approval & campaign guidelines.
                  </span>
                  <Link
                    href="/emi-info"
                    className="inline-flex items-center text-[#1c4289] font-bold hover:underline"
                  >
                    <span>Full Partner Bank Guidelines</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
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
