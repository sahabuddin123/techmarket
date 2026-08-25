import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { ShoppingCart } from 'lucide-react';

export default function AdminAbandonedCarts({ carts = { data: [] } }) {
  const [density, setDensity] = useState('comfortable');

  const cartList = Array.isArray(carts?.data) ? carts.data : [];

  const columns = [
    {
      header: 'Customer / Session',
      accessor: 'user',
      render: (c) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {c.user?.name || `Guest (${(c.session_id || '').substring(0, 12)}...)`}
          </div>
          {c.user?.email && (
            <div className="text-[10.5px] text-slate-400 font-mono">{c.user.email}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Cart Items Count',
      accessor: 'items',
      render: (c) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-xs">
          {Array.isArray(c.items) ? c.items.length : 0} items
        </span>
      ),
    },
    {
      header: 'Total Value',
      accessor: 'total_value',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          ৳ {Number(c.total_value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (c) => (
        <AdminStatusBadge
          status={c.status === 'recovered' ? 'active' : c.status === 'abandoned' ? 'cancelled' : 'pending'}
          label={c.status}
          size="xs"
        />
      ),
    },
    {
      header: 'Last Active',
      accessor: 'last_activity_at',
      render: (c) => (
        <span className="font-mono text-slate-400 text-xs">
          {c.last_activity_at ? new Date(c.last_activity_at).toLocaleString() : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Abandoned Carts">
      <Head title="Abandoned Carts Recovery - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Abandoned Carts Recovery"
          subtitle="Monitor uncompleted checkout sessions and analyze recovery potential."
          badge={`${carts.total || cartList.length} Sessions`}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={cartList}
          pagination={carts}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No abandoned cart sessions recorded"
          emptyDescription="Customer shopping carts that remain incomplete after checkout will appear here."
        />
      </div>
    </AdminShell>
  );
}
