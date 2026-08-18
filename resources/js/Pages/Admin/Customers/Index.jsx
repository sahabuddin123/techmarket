import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Search, Users, Mail, Phone, ShoppingBag } from 'lucide-react';

export default function AdminCustomers({ customers, filters }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/customers', { search }, { preserveState: true });
  };

  return (
    <AdminLayout title="Registered Customers">
      <Head title="Registered Customers - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>REGISTERED CUSTOMERS DIRECTORY</span>
          </h1>
          <p className="text-xs text-slate-400">View customer profiles, contact info, and total order counts.</p>
        </div>

        {/* SEARCH TOOLBAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search by Customer Name, Email, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded p-2.5 pr-8 border border-slate-800 focus:border-amber-500"
            />
            <button type="submit" className="absolute right-2 top-2.5 text-slate-400 hover:text-amber-400">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Orders Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.data && customers.data.length > 0 ? (
                  customers.data.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-300">{c.email}</td>
                      <td className="p-3.5 text-slate-400">{c.phone || '—'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-amber-400">{c.orders_count} Orders</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No customers registered yet.</td>
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
