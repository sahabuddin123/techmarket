import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';
import { Award, Gift, Sparkles, ShoppingBag } from 'lucide-react';

export default function RewardPoints({ user, points = 0, unreadCount = 0 }) {
  return (
    <AccountLayout unreadCount={unreadCount}>
      <Head title="Reward Points - TechMarket BD" />

      <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:px-6 border-b border-[#e2e8f0]">
          <h1 className="text-[16px] font-bold text-[#1e293b]">
            Reward Points
          </h1>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#8b95a5] uppercase tracking-wider">
                  Available Balance
                </div>
                <div className="text-2xl font-black text-[#1e293b] mt-0.5">
                  {points} <span className="text-sm font-semibold text-[#64748b]">Points</span>
                </div>
              </div>
            </div>

            <Link
              href="/catalog"
              className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[4px] transition-colors shadow-sm inline-flex items-center justify-center space-x-2 shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Hardware</span>
            </Link>
          </div>

          {/* Points rules */}
          <div className="border-t border-[#f1f5f9] pt-6 space-y-3">
            <h3 className="text-[14px] font-bold text-[#1e293b]">
              How to earn and redeem TechMarket points:
            </h3>
            <ul className="text-[13px] text-[#64748b] space-y-2 list-disc list-inside">
              <li>Earn 1 reward point for every ৳100 spent on completed hardware purchases.</li>
              <li>Redeem your reward points at checkout for instant discounts on future orders.</li>
              <li>Receive bonus points during special tech campaigns and verified product reviews.</li>
            </ul>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
