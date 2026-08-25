import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import {
  Landmark, Network, FileText, ArrowUpRight, ArrowDownLeft,
  BadgeDollarSign, CreditCard, Wallet, Plus, ArrowRight,
  TrendingUp, CheckCircle2, DollarSign, Building
} from 'lucide-react';

export default function AdminAccountsIndex({
  metrics = {},
  financialAccounts = [],
  recentTransactions = []
}) {
  return (
    <AdminShell title="Finance & Accounts ERP">
      <Head title="Accounts Dashboard - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Executive Financial Dashboard"
          subtitle="Double-entry accounting, real-time liquid cash positions, revenue velocity, and debt ledgers."
          badge="ERP Finance"
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/accounts/expenses"
                className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </Link>
              <Link
                href="/admin/accounts/income"
                className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Record Income</span>
              </Link>
              <Link
                href="/admin/accounts/chart-of-accounts"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Chart of Accounts</span>
              </Link>
            </div>
          }
        />

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Total Liquid Assets (Cash & Bank)"
            value={`৳ ${(metrics.total_liquid_cash || 0).toLocaleString()}`}
            icon="Wallet"
            variant="indigo"
          />
          <AdminKpiCard
            title="Today's Sales Revenue"
            value={`৳ ${(metrics.today_sales || 0).toLocaleString()}`}
            icon="TrendingUp"
            variant="emerald"
          />
          <AdminKpiCard
            title="Accounts Receivable (Customer Dues)"
            value={`৳ ${(metrics.total_receivables || 0).toLocaleString()}`}
            icon="BadgeDollarSign"
            variant="sky"
          />
          <AdminKpiCard
            title="Accounts Payable (Supplier Dues)"
            value={`৳ ${(metrics.total_payables || 0).toLocaleString()}`}
            icon="CreditCard"
            variant="amber"
          />
        </div>

        {/* Cash & Bank Registers Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              Cash Drawers & Bank Registers
            </h3>
            <Link
              href="/admin/accounts/cash-bank"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Registers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {financialAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{acc.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {acc.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {acc.account_number ? `A/C: ${acc.account_number}` : 'Cash Register Vault'}
                </div>
                <div className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-100 dark:border-slate-800">
                  ৳ {Number(acc.current_balance || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Journal Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Recent Double-Entry Journal Transactions
            </h3>
            <Link
              href="/admin/accounts/transactions"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{tx.transaction_number}</span>
                    <span>•</span>
                    <span className="truncate">{tx.description}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 font-mono">
                    Date: {tx.transaction_date} • Source: {tx.source_module?.toUpperCase()} • By: {tx.creator?.name || 'System'}
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-slate-900 dark:text-slate-100 text-sm shrink-0">
                  ৳ {Number(tx.total_amount || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
