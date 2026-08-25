import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { Plus, Edit2, Trash2, Ticket } from 'lucide-react';

export default function AdminCoupons({ coupons = [] }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const couponList = Array.isArray(coupons) ? coupons : [];

  const filteredCoupons = couponList.filter(c => 
    !search || c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/coupons/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Coupon Code',
      accessor: 'code',
      sortable: true,
      render: (c) => (
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Ticket className="w-4 h-4" />
          </div>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
            {c.code}
          </span>
        </div>
      ),
    },
    {
      header: 'Discount Amount',
      accessor: 'value',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {c.type === 'percent' ? `${c.value}% OFF` : `৳ ${Number(c.value).toLocaleString()} OFF`}
        </span>
      ),
    },
    {
      header: 'Minimum Spend',
      accessor: 'min_spend',
      align: 'right',
      render: (c) => (
        <span className="font-mono text-slate-700 dark:text-slate-300">
          ৳ {Number(c.min_spend || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (c) => (
        <AdminStatusBadge
          status={c.is_active ? 'active' : 'draft'}
          label={c.is_active ? 'Active' : 'Disabled'}
          size="xs"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <Link
            href={`/admin/coupons/${c.id}/edit`}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
            title="Edit Coupon"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(c)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Coupon"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Coupons">
      <Head title="Discount Coupons - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Discount Coupons & Promo Codes"
          subtitle="Configure percentage and fixed value promo codes with minimum basket thresholds."
          badge={`${couponList.length} Coupons`}
          actions={
            <Link
              href="/admin/coupons/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Coupon</span>
            </Link>
          }
        />

        {/* Page Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search coupon code..."
          onRefresh={() => router.get('/admin/coupons')}
        />

        {/* Coupons Table */}
        <AdminTable
          columns={columns}
          data={filteredCoupons}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No coupons found"
          emptyDescription="Create discount coupons for promotional campaigns and customer loyalty."
          emptyAction={
            <Link
              href="/admin/coupons/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </Link>
          }
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete promo code "${deleteTarget?.code}"?`}
        confirmText="Delete Coupon"
        isDestructive
      />
    </AdminShell>
  );
}
