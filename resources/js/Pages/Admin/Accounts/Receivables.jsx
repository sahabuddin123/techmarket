import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import {
  BadgeDollarSign, ArrowLeft, Eye, Clock, CreditCard, User,
  DollarSign
} from 'lucide-react';

export default function AdminReceivables({
  receivables = { data: [] },
  totalReceivable = 0,
  financialAccounts = []
}) {
  const [density, setDensity] = useState('comfortable');
  const receivableList = Array.isArray(receivables?.data) ? receivables.data : [];

  const tableColumns = [
    {
      header: 'Sale / Invoice #',
      accessor: 'sale_number',
      sortable: true,
      render: (sale) => (
        <div className="space-y-0.5">
          <Link
            href={`/admin/sales/${sale.id}`}
            className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:underline block"
          >
            {sale.sale_number}
          </Link>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {new Date(sale.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer Details',
      accessor: 'customer_name',
      render: (sale) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {sale.customer_name}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {sale.customer_phone || (sale.customer?.email ?? 'Direct Sale')}
          </div>
        </div>
      ),
    },
    {
      header: 'Grand Total',
      accessor: 'grand_total',
      render: (sale) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          ৳ {Number(sale.grand_total).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Paid Amount',
      accessor: 'paid_amount',
      render: (sale) => (
        <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          ৳ {Number(sale.paid_amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Outstanding Due (BDT)',
      accessor: 'due_amount',
      align: 'right',
      sortable: true,
      render: (sale) => (
        <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
          ৳ {Number(sale.due_amount).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (sale) => (
        <Link
          href={`/admin/sales/${sale.id}`}
          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 text-xs font-bold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Sale</span>
        </Link>
      ),
    },
  ];

  return (
    <AdminShell title="Accounts Receivable">
      <Head title="Receivables - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="Accounts Receivable (Customer Dues)"
          subtitle="Track customer credit sales, outstanding balances, and aged receivable debts."
          badge={`৳ ${totalReceivable.toLocaleString()} Due`}
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
            title="Total Outstanding Receivables"
            value={`৳ ${totalReceivable.toLocaleString()}`}
            icon="BadgeDollarSign"
            variant="amber"
          />
          <AdminKpiCard
            title="Invoices with Due"
            value={`${receivables.total || receivableList.length} Invoices`}
            icon="Clock"
            variant="indigo"
          />
        </div>

        <AdminTable
          columns={tableColumns}
          data={receivableList}
          pagination={receivables}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Outstanding Receivables"
          emptyDescription="All customer sales have been paid in full."
        />
      </div>
    </AdminShell>
  );
}
