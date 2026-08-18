import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { CreditCard, CheckCircle, XCircle, Search } from 'lucide-react';

export default function AdminPayments({ payments, filters }) {
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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

  return (
    <AdminLayout title="Order Payments & Verification">
      <Head title="Payments Ledger - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-amber-500" />
            <span>ORDER PAYMENTS & MANUAL BANKING VERIFICATION</span>
          </h1>
          <p className="text-xs text-slate-400">Verify manual mobile banking transaction IDs (bKash/Nagad/Rocket) and track SSLCommerz gateway logs.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Amount (BDT)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.data && payments.data.length > 0 ? (
                  payments.data.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white">{p.order?.order_number}</td>
                      <td className="p-3.5 font-bold text-amber-400">{p.payment_method}</td>
                      <td className="p-3.5 font-mono text-slate-300">{p.transaction_id}</td>
                      <td className="p-3.5 font-black text-white">৳{Number(p.amount).toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          p.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {p.status !== 'paid' && p.order && (
                          <button onClick={() => handleApprove(p.order.id)} className="p-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded" title="Approve Payment">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {p.status !== 'failed' && p.order && (
                          <button onClick={() => setRejectId(p.order.id)} className="p-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded" title="Reject Payment">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No payment transaction records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REJECT REASON MODAL */}
        {rejectId && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleRejectSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Reject Manual Payment</h3>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Reason for Rejection *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Invalid bKash TrxID or mismatched amount"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-rose-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setRejectId(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded font-black uppercase">Confirm Rejection</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
