import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';

export default function AdminReviews({ reviews }) {
  const handleStatus = (id, newStatus) => {
    router.post(`/admin/reviews/${id}/status`, { status: newStatus }, { preserveScroll: true });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this review?')) {
      router.delete(`/admin/reviews/${id}`);
    }
  };

  return (
    <AdminLayout title="Product Reviews Moderation">
      <Head title="Product Reviews - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <Star className="w-6 h-6 text-amber-500 fill-current" />
            <span>PRODUCT REVIEWS & CUSTOMER FEEDBACK MODERATION</span>
          </h1>
          <p className="text-xs text-slate-400">Approve, reject, and reply to customer product reviews.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Product & Rating</th>
                  <th className="p-3.5">Customer Comment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reviews.data && reviews.data.length > 0 ? (
                  reviews.data.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <div className="font-bold text-white leading-tight">{r.product?.title}</div>
                        <div className="flex text-amber-400 mt-1">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 max-w-md">
                        <div className="text-slate-200 font-semibold">{r.title}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{r.comment}</div>
                        <div className="text-[10px] text-slate-500 mt-1">By: {r.user?.name}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          r.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {r.status !== 'approved' && (
                          <button onClick={() => handleStatus(r.id, 'approved')} className="p-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button onClick={() => handleStatus(r.id, 'rejected')} className="p-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(r.id)} className="p-1 bg-slate-800 text-slate-400 hover:text-rose-400 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No product reviews submitted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
