import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { Search, UserCheck, Package, Award, Share2 } from 'lucide-react';

export default function AdminCustomerSupport({ customerData, filters }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/support', { search }, { preserveState: true });
  };

  return (
    <AdminShell title="Customer Support">
      <Head title="Customer Support Intelligence - TechMarket Admin" />

      <div className="space-y-6 text-xs w-full max-w-none pb-12">
        <AdminPageHeader
          title="Customer Support Intelligence"
          subtitle="Lookup customer profile, orders history, loyalty balance, and referral data in real-time."
          badge="Support Desk"
        />

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-3 rounded-xl focus:outline-hidden font-medium shadow-2xs"
          />
          <button type="submit" className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl uppercase flex items-center space-x-1.5 shadow-xs cursor-pointer">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* CUSTOMER DETAIL VIEW */}
        {customerData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 font-heading">Profile Overview</h3>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">{customerData.user.name}</div>
                <div>Email: <span className="text-slate-800 dark:text-slate-200 font-medium">{customerData.user.email}</span></div>
                <div>Phone: <span className="text-slate-800 dark:text-slate-200 font-medium">{customerData.user.phone || 'N/A'}</span></div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold">
                  <span>Lifetime Spend:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">৳{customerData.total_spend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Loyalty Points:</span>
                  <span className="text-emerald-600 font-mono">{customerData.loyalty_balance} pts</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Referral Code:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{customerData.referral_code}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 font-heading">Recent Order History</h3>
              <div className="space-y-2.5">
                {customerData.orders && customerData.orders.length > 0 ? (
                  customerData.orders.map(o => (
                    <div key={o.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center">
                      <div>
                        <Link href={`/admin/orders/${o.id}`} className="font-bold text-indigo-600 hover:underline">{o.order_number}</Link>
                        <div className="text-slate-500 text-[11px]">{new Date(o.created_at).toLocaleDateString()} — {o.items?.length || 0} items</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">৳{Number(o.total).toLocaleString()}</div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{o.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-4">No order history recorded.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 shadow-2xs">
            Enter a customer name, email, phone number, or order number above to load customer details.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
