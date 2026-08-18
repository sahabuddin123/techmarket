import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Search, ShoppingBag, ExternalLink } from 'lucide-react';

export default function AdminOrders({ orders, filters }) {
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/orders', { search, status: statusFilter }, { preserveState: true });
  };

  const handleStatusChange = (orderId, newStatus) => {
    router.post(`/admin/orders/${orderId}/status`, { status: newStatus }, { preserveScroll: true });
  };

  return (
    <AdminLayout title="Manage Customer Orders">
      <Head title="Customer Orders - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            CUSTOMER ORDERS MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400">Track and update fulfillment status for customer hardware orders.</p>
        </div>

        {/* SEARCH & STATUS FILTER TOOLBAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative w-full">
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded p-2.5 pr-8 border border-slate-800 focus:border-amber-500"
            />
            <button type="submit" className="absolute right-2 top-2.5 text-slate-400 hover:text-amber-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                router.get('/admin/orders', { search, status: e.target.value }, { preserveState: true });
              }}
              className="bg-slate-950 text-slate-100 border border-slate-800 rounded px-3 py-2 text-xs focus:border-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Customer Info</th>
                  <th className="p-3.5">District</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Total (BDT)</th>
                  <th className="p-3.5">Status Action</th>
                  <th className="p-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.data && orders.data.length > 0 ? (
                  orders.data.map(o => (
                    <tr key={o.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white">
                        <Link href={`/admin/orders/${o.id}`} className="hover:text-amber-400 flex items-center gap-1 font-mono">
                          <span>{o.order_number}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </Link>
                        <div className="text-[10px] text-slate-500 font-normal">{new Date(o.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-200">{o.customer_name}</div>
                        <div className="text-[11px] text-slate-400">{o.customer_phone}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">{o.district}</td>
                      <td className="p-3.5 text-slate-300">
                        <div>{o.payment_method}</div>
                        <div className="text-[10px] text-slate-500">{o.payment_status}</div>
                      </td>
                      <td className="p-3.5 font-black text-amber-400">৳{Number(o.total).toLocaleString()}</td>
                      <td className="p-3.5">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-slate-950 text-slate-100 border border-slate-800 rounded px-2 py-1 text-xs font-bold focus:border-amber-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <Link href={`/admin/orders/${o.id}`} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-[11px] font-bold inline-block">
                          Manage
                        </Link>
                        <Link href={`/invoice/${o.order_number}`} target="_blank" className="text-slate-400 hover:text-white text-[11px] inline-flex items-center">
                          Print <ExternalLink className="w-3 h-3 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No customer orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar */}
        {orders?.links && orders.links.length > 3 && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1 font-medium">
            <div>
              Showing <span className="font-bold text-white font-mono">{orders.from || 0}</span> to <span className="font-bold text-white font-mono">{orders.to || 0}</span> of <span className="font-bold text-white font-mono">{orders.total || 0}</span> orders
            </div>

            <div className="flex items-center space-x-1 font-mono">
              {orders.links.map((link, idx) => (
                <button
                  key={idx}
                  disabled={!link.url || link.active}
                  onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    link.active
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : link.url
                      ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 cursor-pointer'
                      : 'bg-slate-950 text-slate-700 opacity-40 cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
