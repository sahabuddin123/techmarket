import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import {
  Wallet, ArrowLeft, Building, Smartphone, CreditCard,
  ArrowUpRight, ArrowDownLeft, DollarSign
} from 'lucide-react';

export default function AdminCashBank({ financialAccounts = [] }) {
  const totalLiquid = financialAccounts.reduce((acc, f) => acc + Number(f.current_balance || 0), 0);

  return (
    <AdminShell title="Cash & Bank Accounts">
      <Head title="Cash & Bank - TechMarket Admin" />

      <div className="space-y-6">
        <AdminPageHeader
          title="Cash Drawers & Bank Registers"
          subtitle="Vault balances, BRAC/DBBL corporate bank accounts, and bKash/Nagad mobile banking merchant wallets."
          badge={`৳ ${totalLiquid.toLocaleString()} Liquid Assets`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/accounts"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Accounts</span>
              </Link>
            </div>
          }
        />

        {/* Registers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {financialAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {acc.type === 'cash' ? <Wallet className="w-5 h-5" /> : acc.type === 'bank' ? <Building className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>

                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {acc.type.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
                  {acc.name}
                </h4>
                <div className="text-xs font-mono text-slate-400">
                  {acc.account_number ? `Account #: ${acc.account_number}` : 'Physical Cash Counter Drawer'}
                </div>
                {acc.bank_name && (
                  <div className="text-xs text-slate-500">
                    {acc.bank_name} {acc.branch_name ? `• ${acc.branch_name}` : ''}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-400">Available Balance:</span>
                <span className="font-mono font-black text-xl text-slate-900 dark:text-slate-100">
                  ৳ {Number(acc.current_balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
