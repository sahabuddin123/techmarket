import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { 
  ShieldAlert, Search, CheckCircle2, AlertTriangle, AlertCircle, 
  History, Truck, Package, User, ArrowUpRight, Phone, Mail, Award, XCircle 
} from 'lucide-react';

export default function FraudChecker({ searchQuery, searchPhone, matchedOrder, customerProfile, recentChecks = [] }) {
  const [query, setQuery] = useState(searchQuery || searchPhone || '');
  const [density, setDensity] = useState('comfortable');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.get('/admin/customers/fraud-checker', { search: query.trim() }, { preserveState: true });
  };

  const getRiskBadge = (level, score) => {
    switch (level) {
      case 'critical':
        return <AdminStatusBadge status="danger" label={`CRITICAL RISK (${score}/100)`} size="xs" />;
      case 'high':
        return <AdminStatusBadge status="warning" label={`HIGH RISK (${score}/100)`} size="xs" />;
      case 'medium':
        return <AdminStatusBadge status="pending" label={`MEDIUM RISK (${score}/100)`} size="xs" />;
      default:
        return <AdminStatusBadge status="active" label={`LOW RISK (${score}/100)`} size="xs" />;
    }
  };

  const recentCheckColumns = [
    {
      header: 'Customer / Phone',
      accessor: 'customer_phone',
      render: (rc) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
            {rc.customer_phone || 'N/A'}
          </div>
          <div className="text-[10.5px] text-slate-400">
            {rc.customer_name || 'Guest'}
          </div>
        </div>
      ),
    },
    {
      header: 'Risk Score & Level',
      accessor: 'risk_score',
      render: (rc) => getRiskBadge(rc.risk_level, rc.risk_score),
    },
    {
      header: 'Courier Delivery Ratio',
      accessor: 'delivery_success_rate',
      render: (rc) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-xs">
          {rc.delivery_success_rate || 0}% Success
        </span>
      ),
    },
    {
      header: 'Audit Date',
      accessor: 'created_at',
      render: (rc) => (
        <span className="font-mono text-slate-400 text-xs">
          {rc.created_at ? new Date(rc.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      align: 'right',
      render: (rc) => (
        <button
          type="button"
          onClick={() => {
            setQuery(rc.customer_phone);
            router.get('/admin/customers/fraud-checker', { search: rc.customer_phone }, { preserveState: true });
          }}
          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Inspect
        </button>
      ),
    },
  ];

  return (
    <AdminShell title="Fraud Checker">
      <Head title="Customer Fraud Intelligence Lookup - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Customer Fraud Intelligence & Risk Scoring"
          subtitle="Search customer phone numbers, orders, or names to calculate risk scores, courier cancellation telemetry, and return rates."
          badge="AI Shield Engine"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/customers/fraud-reviews"
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Pending Reviews Queue</span>
              </Link>
              <Link
                href="/admin/settings/fraud"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <span>Rule Weights</span>
              </Link>
            </div>
          }
        />

        {/* Search Bar Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter customer phone (e.g. 01711223344), order #, or name..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Analyze Risk
            </button>
          </form>
        </div>

        {/* Result Area */}
        {customerProfile && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                  {customerProfile.name || 'Customer Account'}
                </h3>
                <div className="text-xs text-slate-500 font-mono">
                  {customerProfile.phone} • {customerProfile.email || 'No email'}
                </div>
              </div>
              <div>
                {getRiskBadge(customerProfile.risk_level, customerProfile.risk_score)}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10.5px] text-slate-500 font-bold uppercase">Total Orders</div>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">{customerProfile.total_orders || 0}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10.5px] text-slate-500 font-bold uppercase">Delivered Orders</div>
                <div className="text-lg font-black text-emerald-600 font-mono mt-0.5">{customerProfile.delivered_orders || 0}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10.5px] text-slate-500 font-bold uppercase">Cancelled / Returned</div>
                <div className="text-lg font-black text-rose-600 font-mono mt-0.5">{customerProfile.cancelled_orders || 0}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10.5px] text-slate-500 font-bold uppercase">Courier Delivery Rate</div>
                <div className="text-lg font-black text-indigo-600 font-mono mt-0.5">{customerProfile.delivery_rate || 0}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Audit Checks Table */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
              Recent Automated Anti-Fraud Checks
            </h3>
          </div>

          <AdminTable
            columns={recentCheckColumns}
            data={recentChecks}
            density={density}
            onDensityChange={setDensity}
            emptyTitle="No recent fraud checks recorded"
            emptyDescription="Risk scoring evaluations from incoming customer checkouts will appear here."
          />
        </div>
      </div>
    </AdminShell>
  );
}
