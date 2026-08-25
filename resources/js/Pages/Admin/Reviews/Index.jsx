import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function AdminReviews({ reviews = { data: [] } }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const reviewList = Array.isArray(reviews?.data) ? reviews.data : [];

  const handleStatus = (id, newStatus) => {
    router.post(`/admin/reviews/${id}/status`, { status: newStatus }, { preserveScroll: true });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/reviews/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Product & Star Rating',
      accessor: 'product',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 font-heading text-xs">
            {r.product?.title || 'Unknown Product'}
          </div>
          <div className="flex items-center text-amber-500 space-x-0.5 mt-1 font-mono text-[11px]">
            {[...Array(r.rating || 5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
            <span className="ml-1 text-slate-600 dark:text-slate-400 font-bold">{r.rating}.0</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Customer Feedback',
      accessor: 'comment',
      render: (r) => (
        <div className="max-w-md space-y-0.5">
          {r.title && <div className="font-bold text-slate-800 dark:text-slate-200">{r.title}</div>}
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{r.comment}</p>
          <div className="text-[10px] text-slate-400 font-mono">By: {r.user?.name || 'Guest User'} • {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => (
        <AdminStatusBadge status={r.status || 'pending'} size="xs" />
      ),
    },
    {
      header: 'Moderation Actions',
      accessor: 'actions',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          {r.status !== 'approved' && (
            <button
              type="button"
              onClick={() => handleStatus(r.id, 'approved')}
              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
              title="Approve Review"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          {r.status !== 'rejected' && (
            <button
              type="button"
              onClick={() => handleStatus(r.id, 'rejected')}
              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
              title="Reject Review"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Review"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Reviews">
      <Head title="Product Reviews Moderation - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Product Reviews Moderation"
          subtitle="Approve, reject, or delete customer ratings and product testimonials."
          badge={`${reviews.total || reviewList.length} Reviews`}
        />

        {/* Reviews Table */}
        <AdminTable
          columns={columns}
          data={reviewList}
          pagination={reviews}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No product reviews submitted"
          emptyDescription="Verified customer reviews submitted on product pages will appear here for moderation."
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review?"
        confirmText="Delete Review"
        isDestructive
      />
    </AdminShell>
  );
}
