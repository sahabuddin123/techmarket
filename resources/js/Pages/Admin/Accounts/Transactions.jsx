import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import {
  FileText, ArrowLeft, ArrowDownLeft, ArrowUpRight, DollarSign,
  Calendar, Clock, CheckCircle2
} from 'lucide-react';

export default function AdminTransactions({
  transactions = { data: [] },
  filters = {}
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [sourceModule, setSourceModule] = useState(filters.source_module || '');
  const [density, setDensity] = useState('comfortable');

  const transactionList = Array.isArray(transactions?.data) ? transactions.data : [];

  const handleFilterSubmit = (newFilters = {}) => {
    router.get('/admin/accounts/transactions', {
      search: search || undefined,
      source_module: sourceModule || undefined,
      ...newFilters
    }, { preserveState: true, replace: true });
  };

  const tableColumns = [
    {
      header: 'Tx Number & Date',
      accessor: 'transaction_number',
      sortable: true,
      render: (tx) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
            {tx.transaction_number}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {tx.transaction_date}
          </div>
        </div>
      ),
    },
    {
      header: 'Source Module',
      accessor: 'source_module',
      render: (tx) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {tx.source_module}
        </span>
      ),
    },
    {
      header: 'Description & Reference',
      accessor: 'description',
      render: (tx) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{tx.description}</div>
          <div className="text-[10.5px] text-slate-400 font-mono">Ref: {tx.reference_number || 'Internal'}</div>
        </div>
      ),
    },
    {
      header: 'Debits & Credits (Balanced)',
      accessor: 'journal_entries',
      render: (tx) => (
        <div className="space-y-1 font-mono text-[11px] min-w-[200px]">
          {(tx.journal_entries || []).map((entry, idx) => (
            <div key={idx} className="flex justify-between items-center text-[10.5px]">
              <span className={`font-semibold ${entry.type === 'debit' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 pl-2'}`}>
                {entry.account?.code} - {entry.account?.name}
              </span>
              <span className={`font-bold ${entry.type === 'debit' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {entry.type === 'debit' ? `Dr ৳${Number(entry.amount).toLocaleString()}` : `Cr ৳${Number(entry.amount).toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Total Amount (BDT)',
      accessor: 'total_amount',
      align: 'right',
      sortable: true,
      render: (tx) => (
        <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
          ৳ {Number(tx.total_amount || 0).toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Transactions General Ledger">
      <Head title="Journal Transactions - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="General Ledger & Double-Entry Journal"
          subtitle="Audit-compliant double-entry transaction history. Total debits strictly equal total credits."
          badge={`${transactions.total || transactionList.length} Transactions`}
          actions={
            <Link
              href="/admin/accounts"
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          }
        />

        <AdminPageToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            handleFilterSubmit({ search: val || undefined });
          }}
          searchPlaceholder="Search Tx #, description, reference..."
          onRefresh={() => router.get('/admin/accounts/transactions')}
        >
          <select
            value={sourceModule}
            onChange={(e) => {
              setSourceModule(e.target.value);
              handleFilterSubmit({ source_module: e.target.value || undefined });
            }}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="">All Source Modules</option>
            <option value="pos">POS Sales</option>
            <option value="sales">Commercial Sales</option>
            <option value="purchases">Supplier Purchases</option>
            <option value="expense">Operating Expenses</option>
            <option value="income">Other Income</option>
          </select>
        </AdminPageToolbar>

        <AdminTable
          columns={tableColumns}
          data={transactionList}
          pagination={transactions}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Transactions Recorded"
          emptyDescription="Double-entry journal transactions created by commerce operations will appear here."
        />
      </div>
    </AdminShell>
  );
}
