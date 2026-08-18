import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Plus, Edit2, Trash2, Ticket } from 'lucide-react';

export default function AdminCoupons({ coupons }) {
  const handleDelete = (couponId) => {
    if (confirm('Are you sure you want to delete this coupon code?')) {
      router.delete(`/admin/coupons/${couponId}`);
    }
  };

  return (
    <AdminLayout title="Manage Coupons">
      <Head title="Promo Coupon Codes - Admin" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Ticket className="w-6 h-6 text-amber-500" />
              <span>DISCOUNT COUPONS & PROMO CODES</span>
            </h1>
            <p className="text-xs text-slate-400">Create promotional discount codes for customer checkout.</p>
          </div>

          <Link
            href="/admin/coupons/create"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE NEW COUPON</span>
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Coupon Code</th>
                  <th className="p-3.5">Discount Value</th>
                  <th className="p-3.5">Min Spend</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {coupons && coupons.length > 0 ? (
                  coupons.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-amber-400 font-mono text-sm">{c.code}</td>
                      <td className="p-3.5 font-black text-white">
                        {c.type === 'percent' ? `${c.value}% OFF` : `৳${Number(c.value).toLocaleString()} OFF`}
                      </td>
                      <td className="p-3.5 text-slate-300">৳{Number(c.min_spend).toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {c.is_active ? 'Active' : 'Expired / Disabled'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/admin/coupons/${c.id}/edit`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded inline-block"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded inline-block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No discount coupons created yet.</td>
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
