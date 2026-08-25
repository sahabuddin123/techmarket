import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPayments({ payments = { data: [] } }) {
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [density, setDensity] = useState('comfortable');

  const paymentList = Array.isArray(payments?.data) ? payments.data : [];

  const handleApprove = (orderId) => {
    router.post(`/admin/payments/${orderId}/approve`, {}, { preserveScroll: true });
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    router.post(`/admin/payments/${rejectId}/reject`, { reason: rejectReason }, {
      onSuccess: () => {
        setRejectId(null);
        setRejectReason('');
      }
    });
  };

  const columns = [
    {
      header: 'Order Reference',
      accessor: 'order',
      render: (p) => (
        <div>
          <Link
            href={`/admin/orders/${p.order?.id}`}
            className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
          >
            #{p.order?.order_number || p.order?.id}
          </Link>
          <div className="text-[10px] text-slate-400 font-mono">
            {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
          </div>
        </div>
      ),
    },
    {
      header: 'Payment Gateway / Method',
      accessor: 'payment_method',
      render: (p) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs font-mono">
          {p.payment_method}
        </span>
      ),
    },
    {
      header: 'Transaction ID (TrxID)',
      accessor: 'transaction_id',
      render: (p) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
          {p.transaction_id || '—'}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          ৳ {Number(p.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (p) => (
        <AdminStatusBadge status={p.status || 'pending'} size="xs" />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          {p.status !== 'paid' && p.order && (
            <button
              type="button"
              onClick={() => handleApprove(p.order.id)}
              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
              title="Approve Manual Payment"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          {p.status !== 'failed' && p.order && (
            <button
              type="button"
              onClick={() => setRejectId(p.order.id)}
              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
              title="Reject Manual Payment"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Payments">
      <Head title="Order Payments & Verification - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Order Payments & Verification"
          subtitle="Verify manual mobile banking transaction IDs (bKash/Nagad/Rocket) and track payment gateways."
          badge={`${payments.total || paymentList.length} Transactions`}
        />

        {/* Payments Table */}
        <AdminTable
          columns={columns}
          data={paymentList}
          pagination={payments}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No payment transactions found"
          emptyDescription="Mobile banking and online payments will appear here for verification."
        />
      </div>

      {/* Reject Reason Modal */}
      {rejectId && (
        <AdminModal
          isOpen={Boolean(rejectId)}
          onClose={() => setRejectId(null)}
          title="Reject Manual Payment"
          subtitle={`Order #${rejectId}`}
          size="sm"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Reason for Rejection *</label>
              <input
                type="text"
                required
                placeholder="e.g. Invalid bKash TrxID or mismatched amount"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
          </div>
        </AdminModal>
      )}
    </AdminShell>
  );
}
