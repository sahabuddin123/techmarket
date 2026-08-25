import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminModal from '../../../Components/Admin/AdminModal';
import {
  ArrowDownLeft, Plus, ArrowLeft, DollarSign, Calendar,
  CreditCard, User
} from 'lucide-react';

export default function AdminIncome({
  incomes = { data: [] },
  accounts = [],
  financialAccounts = []
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [density, setDensity] = useState('comfortable');

  const incomeList = Array.isArray(incomes?.data) ? incomes.data : [];

  const { data, setData, post, processing, reset, errors } = useForm({
    category: 'Other Business Income',
    chart_of_account_id: accounts[0]?.id || '',
    financial_account_id: financialAccounts[0]?.id || '',
    amount: '',
    income_date: new Date().toISOString().split('T')[0],
    payer: '',
    reference: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/accounts/income', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const tableColumns = [
    {
      header: 'Income # & Date',
      accessor: 'income_number',
      sortable: true,
      render: (inc) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
            {inc.income_number}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {inc.income_date}
          </div>
        </div>
      ),
    },
    {
      header: 'Category & Account',
      accessor: 'category',
      render: (inc) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{inc.category}</div>
          <div className="text-[10.5px] text-slate-400">{inc.chart_of_account?.name || 'Revenue Account'}</div>
        </div>
      ),
    },
    {
      header: 'Deposited To Register',
      accessor: 'financial_account',
      render: (inc) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {inc.financial_account?.name || 'Cash in Hand'}
        </span>
      ),
    },
    {
      header: 'Payer / Source',
      accessor: 'payer',
      render: (inc) => (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          {inc.payer || 'Direct Receipt'}
        </div>
      ),
    },
    {
      header: 'Amount (BDT)',
      accessor: 'amount',
      align: 'right',
      sortable: true,
      render: (inc) => (
        <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
          ৳ {Number(inc.amount || 0).toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Income Vouchers">
      <Head title="Income - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="Income Vouchers & Inflows"
          subtitle="Record non-retail income, scrap sales, service earnings, and direct capital deposits."
          badge={`${incomes.total || incomeList.length} Vouchers`}
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
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Income Voucher</span>
              </button>
            </div>
          }
        />

        <AdminTable
          columns={tableColumns}
          data={incomeList}
          pagination={incomes}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Income Recorded"
          emptyDescription="Record an income voucher to credit financial accounts."
        />
      </div>

      {/* ADD INCOME MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Direct Income Voucher"
        subtitle="Post verified revenue or owner capital injection"
        icon={DollarSign}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Income Account (COA) <span className="text-rose-500">*</span>
              </label>
              <select
                value={data.chart_of_account_id}
                onChange={(e) => setData('chart_of_account_id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden cursor-pointer"
                required
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Deposit Into Register <span className="text-rose-500">*</span>
              </label>
              <select
                value={data.financial_account_id}
                onChange={(e) => setData('financial_account_id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden cursor-pointer"
                required
              >
                {financialAccounts.map(f => (
                  <option key={f.id} value={f.id}>{f.name} (৳{Number(f.current_balance).toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Amount (BDT) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                placeholder="৳ 0.00"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Income Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={data.income_date}
                onChange={(e) => setData('income_date', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Payer / Source</label>
              <input
                type="text"
                value={data.payer}
                onChange={(e) => setData('payer', e.target.value)}
                placeholder="e.g. Corporate Client / Bank Dividend"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Notes / Reference</label>
              <textarea
                rows="2"
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)}
                placeholder="Description of income source..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
              />
            </div>
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {processing ? 'Recording...' : 'Authorize Income Voucher'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
