import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';
import { Wrench, Plus, ShieldCheck } from 'lucide-react';

export default function ServiceRequests({ user, unreadCount = 0 }) {
  return (
    <AccountLayout unreadCount={unreadCount}>
      <Head title="Service Requests - TechMarket BD" />

      <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:px-6 border-b border-[#e2e8f0] flex items-center justify-between">
          <h1 className="text-[16px] font-bold text-[#1e293b]">
            Service Requests
          </h1>
          <Link
            href="/servicing"
            className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[12px] font-semibold px-4 py-1.5 rounded-[4px] transition-colors shadow-sm inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Service Ticket</span>
          </Link>
        </div>

        {/* Content */}
        <div className="p-12 text-center text-[#8b95a5] space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center mx-auto">
            <Wrench className="w-7 h-7" />
          </div>
          <p className="text-[14px] font-semibold text-[#475569]">
            No repair or servicing requests found.
          </p>
          <p className="text-[12.5px] text-[#8b95a5] max-w-md mx-auto">
            Need warranty claim, hardware repair, thermal paste replacement, or diagnostic servicing? Submit a request to our certified technician team.
          </p>
          <div className="pt-2">
            <Link
              href="/servicing"
              className="text-[13px] font-bold text-[#274a7d] hover:underline"
            >
              Submit Service Request →
            </Link>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
