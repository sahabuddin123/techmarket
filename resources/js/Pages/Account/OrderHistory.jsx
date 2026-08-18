import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';
import { ChevronsUpDown, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function OrderHistory({ orders, unreadCount = 0, currentSort = 'created_at', currentDirection = 'desc' }) {
  const orderList = orders?.data || (Array.isArray(orders) ? orders : []);

  const handleSort = (column) => {
    const nextDirection = currentSort === column && currentDirection === 'desc' ? 'asc' : 'desc';
    router.get(
      '/account/orders/history',
      { sort: column, direction: nextDirection },
      { preserveState: true, preserveScroll: true }
    );
  };

  const renderSortIndicator = (column) => {
    if (currentSort === column) {
      return currentDirection === 'asc' ? (
        <span className="inline-block ml-1.5 text-[#274a7d] text-[10px]">▲</span>
      ) : (
        <span className="inline-block ml-1.5 text-[#274a7d] text-[10px]">▼</span>
      );
    }
    return <span className="inline-block ml-1.5 text-[#a0aec0] text-[10px] opacity-70">⇅</span>;
  };

  return (
    <AccountLayout unreadCount={unreadCount}>
      <Head title="Order History - TechMarket BD" />

      {/* Main Single Wide Order History Card matching Screenshot 3 */}
      <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#e2e8f0]">
          <h1 className="text-[16px] font-bold text-[#1e293b]">
            Order History
          </h1>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th
                  onClick={() => handleSort('order_number')}
                  className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider cursor-pointer select-none hover:text-[#1e293b]"
                >
                  <span>ORDER</span>
                  {renderSortIndicator('order_number')}
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider cursor-pointer select-none hover:text-[#1e293b]"
                >
                  <span>DATE</span>
                  {renderSortIndicator('created_at')}
                </th>
                <th
                  onClick={() => handleSort('total')}
                  className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider cursor-pointer select-none hover:text-[#1e293b]"
                >
                  <span>AMOUNT</span>
                  {renderSortIndicator('total')}
                </th>
                <th
                  onClick={() => handleSort('payment_method')}
                  className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider cursor-pointer select-none hover:text-[#1e293b]"
                >
                  <span>PAYMENT</span>
                  {renderSortIndicator('payment_method')}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider cursor-pointer select-none hover:text-[#1e293b]"
                >
                  <span>STATUS</span>
                  {renderSortIndicator('status')}
                </th>
                <th className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider text-right">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[13px] text-[#334155]">
              {orderList && orderList.length > 0 ? (
                orderList.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#274a7d]">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1e293b]">
                      ৳{Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">
                      <div className="font-medium text-[#1e293b]">
                        {order.payment_method_label || (
                          order.payment_method?.toLowerCase() === 'cod' ? 'Cash on Delivery' :
                          order.payment_method?.toLowerCase() === 'bkash' ? 'bKash' :
                          order.payment_method?.toLowerCase() === 'nagad' ? 'Nagad' :
                          order.payment_method
                        )}
                      </div>
                      <div className="text-[11px] text-[#94a3b8]">{order.payment_status}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        order.status === 'completed' || order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/invoice/${order.order_number}`}
                        className="inline-flex items-center text-[12px] font-semibold text-[#274a7d] hover:underline"
                      >
                        <span>View Invoice</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#8b95a5] text-[13px] font-medium">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {orders?.links && orders.links.length > 3 && (
          <div className="px-6 py-3 border-t border-[#e2e8f0] bg-[#fafbfc] flex items-center justify-between text-xs text-[#64748b]">
            <div>
              Showing {orders.from} to {orders.to} of {orders.total} results
            </div>
            <div className="flex space-x-1">
              {orders.links.map((link, i) => (
                <Link
                  key={i}
                  href={link.url || '#'}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3 py-1 rounded border text-xs ${
                    link.active
                      ? 'bg-[#274a7d] text-white border-[#274a7d]'
                      : 'bg-white text-[#475569] border-[#d9dde3] hover:bg-slate-50'
                  } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
