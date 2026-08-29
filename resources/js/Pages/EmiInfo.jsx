import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { Search, CreditCard, Landmark, CheckCircle2, ChevronRight } from 'lucide-react';

export default function EmiInfo() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchBank, setSearchBank] = useState('');
  const [filterTerm, setFilterTerm] = useState('All');

  const bankRates = [
    { name: 'Al-Arafah Islami Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', 'N/A', 'N/A', 'N/A', 'N/A'] },
    { name: 'AB Bank Limited', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'Bank Asia Limited', rates: ['5.20%', '6.85%', '9.14%', '11.52%', 'N/A', 'N/A', 'N/A', 'N/A'] },
    { name: 'Brac Bank Limited', rates: ['5.20%', '6.85%', '9.65%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'City Bank Limited', rates: ['6.29%', '7.30%', '10.26%', '12.67%', '18.49%', '22.01%', '23.47%', '28.07%'] },
    { name: 'Dhaka Bank Limited', rates: ['5.20%', '6.85%', '9.14%', '11.52%', 'N/A', 'N/A', 'N/A', 'N/A'] },
    { name: 'Dutch Bangla Bank Limited', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'Eastern Bank Limited', rates: ['5.20%', '6.85%', '9.65%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'Jamuna Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'Lanka Bangla Finance', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'Mutual Trust Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'Islami Bank Bangladesh', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'NCC Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'Shahjalal Islami Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', 'N/A', 'N/A', 'N/A', 'N/A'] },
    { name: 'South East Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'Standard Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'Standard Chartered Bank', rates: ['5.75%', '7.30%', '10.02%', '14.02%', '17.97%', '22.05%', 'N/A', '31.07%'] },
    { name: 'NRB Commercial Bank Ltd.', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'NRB Bank Ltd.', rates: ['5.20%', '6.85%', '9.14%', '11.52%', 'N/A', 'N/A', 'N/A', 'N/A'] },
    { name: 'Meghna Bank Limited', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'SBAC Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'Midland Bank Ltd.', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'Exim Bank Ltd.', rates: ['5.20%', '6.85%', '9.14%', '11.52%', 'N/A', 'N/A', 'N/A', 'N/A'] },
    { name: 'Prime Bank Ltd.', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'United Commercial Bank Ltd.', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', 'N/A', 'N/A'] },
    { name: 'Community Bank Bangladesh Ltd.', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'One Bank Limited', rates: ['5.20%', '6.85%', '9.14%', '11.52%', 'N/A', 'N/A', 'N/A', 'N/A'] },
    { name: 'Trust Bank Ltd.', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
    { name: 'Mercantile Bank', rates: ['5.20%', '6.85%', '9.14%', '11.52%', '15.31%', '20.76%', '22.21%', '26.75%'] },
  ];

  const filteredBanks = useMemo(() => {
    return bankRates.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(searchBank.toLowerCase());
      if (!matchesSearch) return false;
      if (filterTerm === 'All') return true;

      const termIndexMap = { '3 Month': 0, '6 Month': 1, '9 Month': 2, '12 Month': 3, '18 Month': 4, '24 Month': 5, '30 Month': 6, '36 Month': 7 };
      const targetIdx = termIndexMap[filterTerm];
      if (targetIdx !== undefined) {
        return b.rates[targetIdx] !== 'N/A';
      }
      return true;
    });
  }, [searchBank, filterTerm]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#0084ff] selection:text-white">
      <Head title="EMI Information & Bank Partner Facilities - TechMarket BD" />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-12 shadow-xs max-w-5xl mx-auto space-y-8">
          
          {/* Top Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                EMI Information
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Details about our Easy Monthly Installment payment options
              </p>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Last Updated: 15 July, 2026
            </div>
          </div>

          {/* Section 1: Our Global EMI Policy */}
          <div className="space-y-3">
            <div className="inline-block bg-[#0084ff] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Our Global EMI Policy
            </div>
            
            <div className="text-xs text-slate-700 leading-relaxed space-y-2 pt-1">
              <p className="font-bold text-slate-900">
                EMI with specific amount & charges will bear by CUSTOMER/USER - EMI with surcharge:
              </p>
              <p>
                In this model, merchants surcharge customers for EMI payment. Customers will find the EMI payment option on the SSLCOMMERZ payment page. Upon selecting the EMI tenure, the EMI charge will be added to the product/service price. This is applicable to all product purchases.
              </p>
            </div>
          </div>

          {/* Section 2: EMI Terms & Conditions */}
          <div className="space-y-3 pt-2">
            <div className="inline-block bg-[#0084ff] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              EMI Terms & Conditions
            </div>

            <div className="text-xs text-slate-700 leading-relaxed space-y-2 pt-1">
              <p><span className="font-bold text-slate-900 mr-1.5">১ |</span> ৫০০০ পর্যন্ত বা তার উপরে যে কোন মূল্যের পণ্যের ক্ষেত্রে EMI উপভোগ করা যাবে।</p>
              <p><span className="font-bold text-slate-900 mr-1.5">২ |</span> ব্যাংকভেদে সর্বোচ্চ ৩৬(ছত্রিশ) মাস পর্যন্ত EMI এর সুবিধা উপভোগ করা যাবে।</p>
              <p><span className="font-bold text-slate-900 mr-1.5">৩ |</span> EMI এর অধীনে কোন পণ্যের আসল প্রাইস (Cash Price), ডিসকাউন্ট বা কোন ধরণের অফারের মূল্য প্রযোজ্য হবে না।</p>
              <p><span className="font-bold text-slate-900 mr-1.5">৪ |</span> এখানে উল্লেখ্য আমাদের সাইটে সকল পণ্যের ক্যাশ প্রাইস দেয়া আছে।</p>
              <p><span className="font-bold text-slate-900 mr-1.5">৫ |</span> এই মুহূর্তে ২২টি সদস্য ব্যাংকের ক্রেডিট কার্ডের মাধ্যমে EMI সুবিধা উপভোগ করা যাবে।</p>
              <p><span className="font-bold text-slate-900 mr-1.5">৬ |</span> EMI এর জন্য SSLCOMMERZ কর্তৃক উল্লেখিত চার্জ প্রযোজ্য যা ইনফরমেশন এর সময়সীমার সাথে পরিবর্তনশীল।</p>
              <p><span className="font-bold text-slate-900 mr-1.5">৭ |</span> EMI সংক্রান্ত সকল প্রকার তথ্যের যেকোনো সময় পরিবর্তন করার সকল প্রকার অধিকার TechMarket সংরক্ষণ করে।</p>
            </div>
          </div>

          {/* Section 3: Banks Under Online EMI And Its Charges */}
          <div className="space-y-5 pt-2">
            <div className="inline-block bg-[#0084ff] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Banks Under Online EMI And Its Charges
            </div>

            {/* Bank Logos Strip Matching Reference Screenshot */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3 items-center justify-center text-center">
              {['BRAC Bank', 'City Bank', 'Bank Asia', 'Dhaka Bank', 'Jamuna Bank', 'DBBL', 'EBL', 'MTB', 'Islami Bank', 'NCC Bank', 'Standard Bank', 'NRB Bank', 'Meghna Bank', 'SBAC Bank'].map((bName, bIdx) => (
                <div key={bIdx} className="bg-white border border-slate-200 rounded p-2 text-[10px] font-bold text-slate-700 shadow-2xs hover:border-[#0084ff] transition-colors truncate">
                  {bName}
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs pt-1">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchBank}
                  onChange={(e) => setSearchBank(e.target.value)}
                  placeholder="Search bank name..."
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 pl-8 text-xs focus:outline-none focus:border-[#0084ff]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-slate-500 font-medium text-xs whitespace-nowrap">Filter by Term:</span>
                <select
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#0084ff]"
                >
                  <option value="All">All Terms</option>
                  <option value="3 Month">3 Month</option>
                  <option value="6 Month">6 Month</option>
                  <option value="9 Month">9 Month</option>
                  <option value="12 Month">12 Month</option>
                  <option value="18 Month">18 Month</option>
                  <option value="24 Month">24 Month</option>
                  <option value="30 Month">30 Month</option>
                  <option value="36 Month">36 Month</option>
                </select>
              </div>
            </div>

            {/* Surcharge Matrix Table Matching Screenshot */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Bank Name</th>
                      <th className="py-2.5 px-2.5 text-center">3 Month</th>
                      <th className="py-2.5 px-2.5 text-center">6 Month</th>
                      <th className="py-2.5 px-2.5 text-center">9 Month</th>
                      <th className="py-2.5 px-2.5 text-center">12 Month</th>
                      <th className="py-2.5 px-2.5 text-center">18 Month</th>
                      <th className="py-2.5 px-2.5 text-center">24 Month</th>
                      <th className="py-2.5 px-2.5 text-center">30 Month</th>
                      <th className="py-2.5 px-2.5 text-center">36 Month</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((b, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {b.name}
                          </td>
                          {b.rates.map((r, rIdx) => (
                            <td 
                              key={rIdx} 
                              className={`py-2 px-2.5 text-center ${r === 'N/A' ? 'text-slate-400 font-mono' : 'font-medium text-slate-700'}`}
                            >
                              {r}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                          No banks found matching "{searchBank}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
