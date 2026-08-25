import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminTable from '../../../Components/Admin/AdminTable';
import { 
  Users, UserCheck, Download, DollarSign, Award, 
  Share2, Repeat, UserPlus, ShoppingBag 
} from 'lucide-react';

export default function CustomersReport({ reportData = {}, filters = {} }) {
  const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || 'last_30_days');
  const [density, setDensity] = useState('comfortable');

  const overview = reportData?.overview || {};
  const topSpenders = Array.isArray(reportData?.top_spenders) ? reportData.top_spenders : [];
  const topFrequent = Array.isArray(reportData?.top_frequent) ? reportData.top_frequent : [];
  const referralStats = reportData?.referral_stats || {};
  const loyaltyStats = reportData?.loyalty_stats || {};
  const range = reportData?.range || {};

  const handleFilterChange = (period) => {
    setSelectedPeriod(period);
    router.get('/admin/reports/customers', { period }, { preserveState: true, replace: true });
  };

  const exportUrl = `/admin/reports/export?type=customers&period=${selectedPeriod}`;

  const topSpendersColumns = [
    {
      header: 'Customer Profile',
      accessor: 'name',
      render: (c) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {c.name}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {c.email || c.phone || 'Customer Account'}
          </div>
        </div>
      ),
    },
    {
      header: 'Total Orders',
      accessor: 'orders_count',
      align: 'center',
      render: (c) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-xs">
          {c.orders_count} orders
        </span>
      ),
    },
    {
      header: 'Lifetime Spend',
      accessor: 'total_spent',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
          ৳{Number(c.total_spent || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Customer Intelligence">
      <Head title="Customer Intelligence & Retention - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Customer Intelligence & Retention"
          subtitle="Customer lifetime spend velocity, repeat purchase ratios, VIP accounts, and loyalty rewards."
          badge="VIP Telemetry"
          actions={
            <a
              href={exportUrl}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          }
        />

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'last_7_days', label: 'Last 7 Days' },
              { id: 'last_30_days', label: 'Last 30 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleFilterChange(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === p.id 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Metrics KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Total Registered"
            value={overview.total_registered || 0}
            icon={Users}
            color="indigo"
            description="Lifetime customer user accounts"
          />
          <AdminKpiCard
            title="New Signups"
            value={overview.new_registered || 0}
            icon={UserPlus}
            color="emerald"
            description={`In ${range.label || selectedPeriod}`}
          />
          <AdminKpiCard
            title="Purchasing Customers"
            value={overview.purchasing_customers || 0}
            icon={UserCheck}
            color="blue"
            description="Placed at least 1 order in period"
          />
          <AdminKpiCard
            title="Repeat Buyer Rate"
            value={`${overview.repeat_purchase_rate || 0}%`}
            icon={Repeat}
            color="purple"
            description="Customers with 2+ completed orders"
          />
        </div>

        {/* Top Spending & Frequent Customers Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading px-1">
              Top VIP Customers by Revenue (BDT)
            </h3>
            <AdminTable
              columns={topSpendersColumns}
              data={topSpenders}
              density={density}
              onDensityChange={setDensity}
              emptyTitle="No customer purchase records"
              emptyDescription="Top spenders will appear here as orders complete."
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading px-1">
              Top Repeat Purchasing Customers
            </h3>
            <AdminTable
              columns={topSpendersColumns}
              data={topFrequent}
              density={density}
              onDensityChange={setDensity}
              emptyTitle="No repeat purchases recorded"
              emptyDescription="Customers with multiple transactions will be listed here."
            />
          </div>
        </div>

        {/* Referral & Loyalty Program Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Referral Program Performance
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Total Referrals</div>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1">{referralStats.total || 0}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Converted</div>
                <div className="text-xl font-black text-emerald-600 font-mono mt-1">{referralStats.converted || 0}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Conversion</div>
                <div className="text-xl font-black text-indigo-600 font-mono mt-1">{referralStats.rate || 0}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Customer Loyalty Points Ledger
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Points Issued</div>
                <div className="text-xl font-black text-amber-500 font-mono mt-1">{loyaltyStats.issued || 0} pts</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Points Redeemed</div>
                <div className="text-xl font-black text-emerald-600 font-mono mt-1">{loyaltyStats.redeemed || 0} pts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
