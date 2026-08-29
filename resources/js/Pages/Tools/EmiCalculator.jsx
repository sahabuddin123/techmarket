import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Calculator, CreditCard, Landmark, CheckCircle2, ChevronRight, ArrowRight, ShieldCheck, HelpCircle, Info } from 'lucide-react';

export default function EmiCalculator({ partners = [], banks = [] }) {
  const [amount, setAmount] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [calculatedPlan, setCalculatedPlan] = useState(null);
  const [error, setError] = useState('');

  // Fallback bank list if none passed from props
  const bankList = banks.length > 0 ? banks : [
    { name: 'City Bank Limited (Amex)', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'BRAC Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Eastern Bank Limited (EBL)', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Standard Chartered Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Dutch Bangla Bank Limited (DBBL)', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Mutual Trust Bank (MTB)', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'United Commercial Bank (UCB)', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Bank Asia Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Dhaka Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Prime Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'South East Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'NCC Bank', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Trust Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'LankaBangla Finance', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24, 36] },
    { name: 'Islami Bank Bangladesh Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
    { name: 'Jamuna Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
    { name: 'Premier Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
    { name: 'Pubali Bank Limited', min_amount: 5000, tenures: [3, 6, 9, 12, 18, 24] },
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

    const tenures = bankObj.tenures || [3, 6, 9, 12, 18, 24, 36];
    const plans = tenures.map((m) => {
      const monthly = Math.round(numAmount / m);
      return {
        months: m,
        monthly,
        total: numAmount,
        interestRate: m <= 12 ? '0% Interest' : 'Standard Rate',
      };
    });

    setCalculatedPlan({
      bankName: bankObj.name,
      amount: numAmount,
      plans,
    });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-[#0084ff] selection:text-white">
      <Head title="EMI Calculator - TechMarket BD" />
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="w-full bg-white border-b border-slate-200/90 py-3">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#0084ff] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/tools" className="hover:text-[#0084ff] transition-colors">Useful Tools</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate">EMI Calculator</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-2xs">
          
          {/* Header Section */}
          <div className="pb-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0084ff] text-[11px] font-bold uppercase tracking-wider mb-2">
                <CreditCard className="w-3.5 h-3.5" />
                <span>0% EMI FACILITY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                Monthly EMI Installment Calculator
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Calculate your monthly breakdown with 21+ partner bank credit cards in Bangladesh.
              </p>
            </div>

            <Link
              href="/tools"
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0084ff] flex items-center gap-1.5 self-start md:self-auto transition-colors"
            >
              <span>← Back to Tools</span>
            </Link>
          </div>

          {/* Calculator Input Box */}
          <form onSubmit={handleCalculate} className="my-6 bg-slate-50/70 p-6 sm:p-7 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              
              {/* Purchase Amount */}
              <div className="md:col-span-5">
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Purchase Amount (BDT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    min="5000"
                    placeholder="e.g. 75000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white text-slate-900 rounded-xl border border-slate-300 py-2.5 pl-8 pr-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff] shadow-2xs"
                  />
                </div>
              </div>

              {/* Select Bank */}
              <div className="md:col-span-5">
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Partner Bank / Card Issuer <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBankName}
                  onChange={(e) => setSelectedBankName(e.target.value)}
                  className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0084ff] focus:border-[#0084ff] cursor-pointer shadow-2xs"
                >
                  <option value="">-- Please Select Bank --</option>
                  {bankList.map((b) => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#0084ff] hover:bg-[#0070d6] text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculate</span>
                </button>
              </div>

            </div>

            {error && (
              <p className="mt-3 text-xs text-red-600 font-semibold">{error}</p>
            )}
          </form>

          {/* Results Table Section */}
          {calculatedPlan ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Available EMI Tenures for <span className="text-[#0084ff]">{calculatedPlan.bankName}</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  Total Amount: ৳{calculatedPlan.amount.toLocaleString()}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tenure (Months)</th>
                      <th className="py-3 px-4">Monthly Payment</th>
                      <th className="py-3 px-4">Interest Rate</th>
                      <th className="py-3 px-4 text-right">Total Payable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {calculatedPlan.plans.map((p) => (
                      <tr key={p.months} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {p.months} Months
                        </td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-[#0084ff] text-sm">
                          ৳{p.monthly.toLocaleString()} / mo
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                            {p.interestRate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                          ৳{p.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0084ff] flex items-center justify-center mx-auto shadow-2xs">
                <CreditCard className="w-7 h-7 stroke-[1.5]" />
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter your desired cart total (min. ৳5,000) and choose your bank above to view 3 to 36 month installment plans.
              </p>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
