import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminModal from '../../../Components/Admin/AdminModal';
import {
  Network, Plus, ArrowLeft, Layers, ShieldCheck, CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function AdminChartOfAccounts({ accounts = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'asset', 'liability', 'equity', 'income', 'expense'

  const { data, setData, post, processing, reset, errors } = useForm({
    code: '',
    name: '',
    type: 'asset',
    category: 'current_asset',
    parent_id: '',
    opening_balance: 0,
    description: '',
  });

  const filteredAccounts = accounts.filter(acc => {
    if (activeTab === 'all') return true;
    return acc.type === activeTab;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/accounts/chart-of-accounts', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const getCategoryBadgeColor = (type) => {
    switch (type) {
      case 'asset': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200';
      case 'liability': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200';
      case 'equity': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 border-purple-200';
      case 'income': return 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 border-sky-200';
      case 'expense': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <AdminShell title="Chart of Accounts">
      <Head title="Chart of Accounts - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="Chart of Accounts (COA)"
          subtitle="Hierarchical structure of financial accounts for double-entry bookkeeping across 5 core accounting classes."
          badge={`${accounts.length} Accounts`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/accounts"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Account</span>
              </button>
            </div>
          }
        />

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'asset', label: 'Assets (1000s)' },
            { id: 'liability', label: 'Liabilities (2000s)' },
            { id: 'equity', label: 'Equity (3000s)' },
            { id: 'income', label: 'Income (4000s)' },
            { id: 'expense', label: 'Expenses (5000s)' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-t-xl font-bold text-xs transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Hierarchy List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Account Code</th>
                  <th className="p-3.5">Account Name</th>
                  <th className="p-3.5">Class / Type</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Current Balance (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {acc.code}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {acc.name}
                      {acc.is_system && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                          System Default
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeColor(acc.type)}`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 capitalize">
                      {acc.category.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ৳ {Number(acc.current_balance || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE ACCOUNT MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Chart of Account Node"
        subtitle="Define a new account head in the General Ledger"
        icon={Layers}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Account Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.code}
                onChange={(e) => setData('code', e.target.value)}
                placeholder="e.g. 5006"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100"
                required
              />
              {errors.code && <div className="text-[10.5px] text-rose-500">{errors.code}</div>}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Account Class / Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={data.type}
                onChange={(e) => setData('type', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden cursor-pointer text-slate-900 dark:text-slate-100"
              >
                <option value="asset">Asset (1000s)</option>
                <option value="liability">Liability (2000s)</option>
                <option value="equity">Equity (3000s)</option>
                <option value="income">Income (4000s)</option>
                <option value="expense">Expense (5000s)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Account Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="e.g. Software & Cloud Subscriptions"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Description / Subcategory</label>
            <textarea
              rows="2"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="Purpose of this ledger account..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-[var(--admin-primary,#4f46e5)] hover:bg-[var(--admin-primary-hover,#4338ca)] text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {processing ? 'Creating...' : 'Save COA Account'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
