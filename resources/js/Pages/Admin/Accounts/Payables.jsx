import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import {
  CreditCard, ArrowLeft, Eye, Clock, Building2,
  DollarSign
} from 'lucide-react';

export default function AdminPayables({
  payables = { data: [] },
  totalPayable = 0,
  financialAccounts = []
}) {
  const [density, setDensity] = useState('comfortable');
  const payableList = Array.isArray(payables?.data) ? payables.data : [];

  const tableColumns = [
    {
      header: 'Purchase # & Date',
      accessor: 'purchase_number',
      sortable: true,
      render: (p) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
            {p.purchase_number}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {new Date(p.purchase_date).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Supplier / Vendor',
      accessor: 'supplier',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {p.supplier?.company_name || 'Supplier'}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {p.supplier?.phone || ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Total Bill',
      accessor: 'total',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          ৳ {Number(p.total).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Paid Amount',
      accessor: 'paid_amount',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          ৳ {Number(p.paid_amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Outstanding Payable (BDT)',
      accessor: 'due_amount',
      align: 'right',
      sortable: true,
      render: (p) => (
        <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
          ৳ {Number(p.due_amount).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (p) => (
        <Link
          href="/admin/purchases"
          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 text-xs font-bold transition"
        >
          <span>Pay Supplier</span>
        </Link>
      ),
    },
  ];

  return (
    <AdminShell title="Accounts Payable">
      <Head title="Payables - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="Accounts Payable (Supplier Dues)"
          subtitle="Track supplier purchase obligations, pending bill maturities, and release vendor disbursements."
          badge={`৳ ${totalPayable.toLocaleString()} Due`}
          actions={
            <Link
              href="/admin/accounts"
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Accounts</span>
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminKpiCard
            title="Total Outstanding Payables"
            value={`৳ ${totalPayable.toLocaleString()}`}
            icon="CreditCard"
            variant="amber"
          />
          <AdminKpiCard
            title="Bills with Due"
            value={`${payables.total || payableList.length} Orders`}
            icon="Clock"
            variant="indigo"
          />
        </div>

        <AdminTable
          columns={tableColumns}
          data={payableList}
          pagination={payables}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Outstanding Payables"
          emptyDescription="All supplier bills and purchase orders are fully settled."
        />
      </div>
    </AdminShell>
  );
}
