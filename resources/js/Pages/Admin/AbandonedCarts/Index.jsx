import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { ShoppingCart } from 'lucide-react';

export default function AdminAbandonedCarts({ carts }) {
  return (
    <AdminLayout title="Abandoned Carts Recovery">
      <Head title="Abandoned Carts - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            <span>ABANDONED CARTS & RECOVERY CAMPAIGNS</span>
          </h1>
          <p className="text-xs text-slate-400">Monitor incomplete checkout carts and trigger customer recovery campaigns.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Customer / Session</th>
                  <th className="p-3.5">Cart Items Count</th>
                  <th className="p-3.5">Total Value (BDT)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {carts.data && carts.data.length > 0 ? (
                  carts.data.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white">{c.user?.name || `Guest (${c.session_id.substring(0, 10)})`}</td>
                      <td className="p-3.5 text-slate-300 font-semibold">{Array.isArray(c.items) ? c.items.length : 0} items</td>
                      <td className="p-3.5 font-black text-white">৳{Number(c.total_value).toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'recovered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          c.status === 'abandoned' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(c.last_activity_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No abandoned cart sessions recorded.</td>
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
