import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Search, UserCheck, Package, Award, Share2 } from 'lucide-react';

export default function AdminCustomerSupport({ customerData, filters }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/support', { search }, { preserveState: true });
  };

  return (
    <AdminLayout title="Unified Customer Support Workspace">
      <Head title="Customer Support - Admin" />

      <div className="space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <UserCheck className="w-6 h-6 text-amber-500" />
              <span>CUSTOMER SUPPORT WORKSPACE</span>
            </h1>
            <p className="text-slate-400">Lookup customer profile, orders history, loyalty balance, and referral data</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 text-white p-3 rounded-xl focus:border-amber-500 font-bold"
          />
          <button type="submit" className="px-5 bg-amber-500 text-slate-950 font-black rounded-xl uppercase flex items-center space-x-1.5 hover:bg-amber-400">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* CUSTOMER DETAIL VIEW */}
        {customerData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="font-black text-sm text-white uppercase border-b border-slate-800 pb-2">Profile Overview</h3>
              <div className="space-y-1.5 text-slate-300">
                <div className="text-base font-bold text-white">{customerData.user.name}</div>
                <div>Email: <span className="text-slate-200">{customerData.user.email}</span></div>
                <div>Phone: <span className="text-slate-200">{customerData.user.phone || 'N/A'}</span></div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                  <span>Lifetime Spend:</span>
                  <span className="text-amber-400">৳{customerData.total_spend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Loyalty Points:</span>
                  <span className="text-emerald-400">{customerData.loyalty_balance} pts</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Referral Code:</span>
                  <span className="font-mono text-slate-200">{customerData.referral_code}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="font-black text-sm text-white uppercase border-b border-slate-800 pb-2">Recent Order History</h3>
              <div className="space-y-3">
                {customerData.orders && customerData.orders.length > 0 ? (
                  customerData.orders.map(o => (
                    <div key={o.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <a href={`/admin/orders/${o.id}`} className="font-bold text-amber-400 hover:underline">{o.order_number}</a>
                        <div className="text-slate-400 text-[11px]">{new Date(o.created_at).toLocaleDateString()} — {o.items?.length || 0} items</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-white">৳{Number(o.total).toLocaleString()}</div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{o.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-4">No order history recorded.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            Enter a customer name, email, phone number, or order number above to load customer details.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
