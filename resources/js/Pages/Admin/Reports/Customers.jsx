import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Users, UserCheck, Download, DollarSign, Award, 
  Share2, Repeat, UserPlus, ShoppingBag 
} from 'lucide-react';

export default function CustomersReport({ reportData, filters }) {
  const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || 'last_30_days');

  const overview = reportData?.overview || {};
  const topSpenders = reportData?.top_spenders || [];
  const topFrequent = reportData?.top_frequent || [];
  const referralStats = reportData?.referral_stats || {};
  const loyaltyStats = reportData?.loyalty_stats || {};
  const range = reportData?.range || {};

  const handleFilterChange = (period) => {
    setSelectedPeriod(period);
    router.get('/admin/reports/customers', { period }, { preserveState: true, replace: true });
  };

  const exportUrl = `/admin/reports/export?type=customers&period=${selectedPeriod}`;

  return (
    <AdminLayout title="Customer Intelligence & Retention">
      <Head title="Customer Intelligence & Retention - Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-500" />
              <span>CUSTOMER INTELLIGENCE & RETENTION</span>
            </h1>
            <p className="text-xs text-slate-400">
              Customer lifetime spend, repeat purchase frequency, top accounts, and referral/loyalty statistics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={exportUrl}
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-2">
          {[
            { id: 'today', label: 'Today' },
            { id: 'last_7_days', label: 'Last 7 Days' },
            { id: 'last_30_days', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handleFilterChange(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPeriod === p.id 
                  ? 'bg-[#1c4289] text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* CUSTOMER KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Total Customers</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {Number(overview.total_customers || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">New this period: +{overview.new_customers || 0}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Repeat Purchase Rate</span>
              <Repeat className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {overview.repeat_purchase_rate || 0}%
            </div>
            <div className="text-[11px] text-slate-500">{overview.returning_customers || 0} repeat buyers</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Avg Lifetime Spend</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ৳{Number(overview.avg_lifetime_spend || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Per purchasing customer</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Zero Purchase Accounts</span>
              <UserPlus className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-300 font-mono">
              {overview.zero_purchase_customers || 0}
            </div>
            <div className="text-[11px] text-slate-500">Potential conversion target</div>
          </div>
        </div>

        {/* TOP SPENDERS & FREQUENT BUYERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Spenders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Top Customers by Revenue Generated</span>
            </h3>

            <div className="space-y-2 text-xs">
              {topSpenders.length > 0 ? (
                topSpenders.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.email} • {c.phone}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-amber-400">৳{Number(c.total_spent).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{c.order_count} orders</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">No customer spend records found.</div>
              )}
            </div>
          </div>

          {/* Top Frequent Buyers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <span>Top Customers by Order Frequency</span>
            </h3>

            <div className="space-y-2 text-xs">
              {topFrequent.length > 0 ? (
                topFrequent.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-black text-indigo-400">{c.order_count} Orders</div>
                      <div className="text-[10px] text-slate-400">৳{Number(c.total_spent).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">No order history recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* REFERRAL & LOYALTY RETENTION PROGRAMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Referral Program */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Referral Program Intelligence</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">Total Referrals</div>
                <div className="text-xl font-black text-white font-mono mt-1">{referralStats.total_referrals || 0}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">Qualified Conversions</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1">{referralStats.qualified_referrals || 0}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">Rewarded Referrals</div>
                <div className="text-xl font-black text-purple-400 font-mono mt-1">{referralStats.rewarded_referrals || 0}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">Reward Points Given</div>
                <div className="text-xl font-black text-amber-400 font-mono mt-1">{referralStats.reward_points_issued || 0} pts</div>
              </div>
            </div>
          </div>

          {/* Loyalty Program */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Loyalty Points Ledger Intelligence</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">Points Earned</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1">+{loyaltyStats.points_earned || 0} pts</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">Points Redeemed</div>
                <div className="text-xl font-black text-rose-400 font-mono mt-1">-{loyaltyStats.points_redeemed || 0} pts</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">Points Reversed</div>
                <div className="text-xl font-black text-slate-400 font-mono mt-1">{loyaltyStats.points_reversed || 0} pts</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">Active Point Liability</div>
                <div className="text-xl font-black text-amber-400 font-mono mt-1">{loyaltyStats.net_active_points || 0} pts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
