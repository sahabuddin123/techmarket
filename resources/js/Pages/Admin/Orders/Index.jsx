import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { ExternalLink, Eye, ShoppingBag } from 'lucide-react';

export default function AdminOrders({ orders = { data: [], links: [] }, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [density, setDensity] = useState('comfortable');

  const orderList = Array.isArray(orders?.data) ? orders.data : [];

  const handleSearchSubmit = (val) => {
    setSearch(val);
    router.get('/admin/orders', { 
      search: val || undefined, 
      status: statusFilter || undefined 
    }, { preserveState: true, replace: true });
  };

  const handleStatusChange = (orderId, newStatus) => {
    router.post(`/admin/orders/${orderId}/status`, { status: newStatus }, { preserveScroll: true });
  };

  const tableColumns = [
    {
      header: 'Order ID & Date',
      accessor: 'order_number',
      sortable: true,
      render: (order) => (
        <div className="space-y-0.5">
          <Link
            href={`/admin/orders/${order.id}`}
            className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>#{order.order_number || order.id}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      render: (order) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{order.customer_name || 'Guest User'}</div>
          <div className="text-[10.5px] text-slate-400 font-mono">{order.customer_phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      header: 'District / Region',
      accessor: 'district',
      render: (order) => (
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          {order.district || 'Dhaka'}
        </span>
      ),
    },
    {
      header: 'Payment',
      accessor: 'payment_method',
      render: (order) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">{order.payment_method || 'COD'}</div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">{order.payment_status || 'Pending'}</div>
        </div>
      ),
    },
    {
      header: 'Total (BDT)',
      accessor: 'total',
      align: 'right',
      sortable: true,
      render: (order) => (
        <span className="font-mono font-black text-slate-900 dark:text-slate-100">
          ৳ {Number(order.total || order.total_amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Fulfillment Status',
      accessor: 'status',
      render: (order) => (
        <div className="flex items-center space-x-2">
          <AdminStatusBadge status={order.status || 'Pending'} size="xs" />
          <select
            value={order.status || 'Pending'}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
            className="text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-slate-700 dark:text-slate-200 font-bold focus:outline-hidden"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      align: 'right',
      render: (order) => (
        <div className="flex items-center justify-end space-x-2 whitespace-nowrap">
          <Link
            href={`/admin/orders/${order.id}`}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors"
          >
            Manage
          </Link>
          <a
            href={`/invoice/${order.order_number || order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Print Official Invoice"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Orders">
      <Head title="Customer Orders - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Customer Orders Management"
          subtitle="Track customer order fulfillment status, shipment dispatches, and payment verification."
          badge={`${orders?.total || orderList.length} Orders`}
        />

        {/* Page Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={handleSearchSubmit}
          searchPlaceholder="Search by Order #, Customer Name, Phone..."
          sortOptions={[
            { value: '', label: 'All Fulfillment States' },
            { value: 'Pending', label: 'Pending Orders' },
            { value: 'Processing', label: 'Processing' },
            { value: 'Shipped', label: 'Shipped' },
            { value: 'Delivered', label: 'Delivered' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          currentSort={statusFilter}
          onSortChange={(st) => {
            setStatusFilter(st);
            router.get('/admin/orders', { search, status: st || undefined }, { preserveState: true });
          }}
          onRefresh={() => router.get('/admin/orders')}
        />

        {/* Orders Table */}
        <AdminTable
          columns={tableColumns}
          data={orderList}
          pagination={orders}
          selectable={true}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No customer orders found"
          emptyDescription="Customer checkouts will appear here as soon as orders are placed."
        />
      </div>
    </AdminShell>
  );
}
