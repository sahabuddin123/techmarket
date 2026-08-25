import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminModal from '../../../Components/Admin/AdminModal';
import {
  ArrowUpRight, Plus, ArrowLeft, DollarSign, Calendar,
  CreditCard, User
} from 'lucide-react';

export default function AdminExpenses({
  expenses = { data: [] },
  accounts = [],
  financialAccounts = []
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [density, setDensity] = useState('comfortable');

  const expenseList = Array.isArray(expenses?.data) ? expenses.data : [];

  const { data, setData, post, processing, reset, errors } = useForm({
    category: 'Office & Operational Expenses',
    chart_of_account_id: accounts[0]?.id || '',
    financial_account_id: financialAccounts[0]?.id || '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payee: '',
    reference: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/accounts/expenses', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const tableColumns = [
    {
      header: 'Expense # & Date',
      accessor: 'expense_number',
      sortable: true,
      render: (exp) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
            {exp.expense_number}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {exp.expense_date}
          </div>
        </div>
      ),
    },
    {
      header: 'Category & Account',
      accessor: 'category',
      render: (exp) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{exp.category}</div>
          <div className="text-[10.5px] text-slate-400">{exp.chart_of_account?.name || 'Operating Expense'}</div>
        </div>
      ),
    },
    {
      header: 'Paid From Register',
      accessor: 'financial_account',
      render: (exp) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {exp.financial_account?.name || 'Cash in Hand'}
        </span>
      ),
    },
    {
      header: 'Payee / Vendor',
      accessor: 'payee',
      render: (exp) => (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          {exp.payee || 'Direct Expense'}
        </div>
      ),
    },
    {
      header: 'Amount (BDT)',
      accessor: 'amount',
      align: 'right',
      sortable: true,
      render: (exp) => (
        <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
          ৳ {Number(exp.amount || 0).toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Operating Expense Vouchers">
      <Head title="Expenses - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="Expense Vouchers & Outflows"
          subtitle="Record operating expenses, rent, utilities, courier fees, and vendor service charges."
          badge={`${expenses.total || expenseList.length} Vouchers`}
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
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense Voucher</span>
              </button>
            </div>
          }
        />

        <AdminTable
          columns={tableColumns}
          data={expenseList}
          pagination={expenses}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Expenses Recorded"
          emptyDescription="Record an expense voucher to log operational cash outflows."
        />
      </div>

      {/* ADD EXPENSE MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Operating Expense Voucher"
        subtitle="Post a verified business expense against general ledger accounts"
        icon={CreditCard}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Expense Account (COA) <span className="text-rose-500">*</span>
              </label>
              <select
                value={data.chart_of_account_id}
                onChange={(e) => setData('chart_of_account_id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-bold text-slate-900 dark:text-slate-100 text-xs cursor-pointer"
                required
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Paid From Account <span className="text-rose-500">*</span>
              </label>
              <select
                value={data.financial_account_id}
                onChange={(e) => setData('financial_account_id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-bold text-slate-900 dark:text-slate-100 text-xs cursor-pointer"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono font-bold text-slate-900 dark:text-slate-100 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={data.expense_date}
                onChange={(e) => setData('expense_date', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono text-slate-900 dark:text-slate-100 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Payee / Recipient</label>
              <input
                type="text"
                value={data.payee}
                onChange={(e) => setData('payee', e.target.value)}
                placeholder="e.g. Landlord / Courier Company"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Reference / Bill #</label>
              <input
                type="text"
                value={data.reference}
                onChange={(e) => setData('reference', e.target.value)}
                placeholder="e.g. BILL-9921"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Notes / Business Purpose</label>
              <textarea
                rows="2"
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)}
                placeholder="Description of expense purpose..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-[var(--admin-primary,#4f46e5)] hover:bg-[var(--admin-primary-hover,#4338ca)] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {processing ? 'Recording...' : 'Authorize Voucher & Debit COA'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
