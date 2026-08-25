import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { 
  Plus, Edit2, Trash2, Copy, Eye, 
  Tag, Calendar, ExternalLink 
} from 'lucide-react';

export default function AdminOffersIndex({ offers = { data: [] }, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const offerList = Array.isArray(offers?.data) ? offers.data : [];

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    if (!value || value === 'all') delete updated[key];
    router.get('/admin/offers', updated, { preserveState: true, preserveScroll: true });
  };

  const handleToggle = (offerId) => {
    router.post(`/admin/offers/${offerId}/toggle`, {}, { preserveScroll: true });
  };

  const handleDuplicate = (offerId) => {
    router.post(`/admin/offers/${offerId}/duplicate`, {}, { preserveScroll: true });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/offers/${deleteTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Campaign Banner & Title',
      accessor: 'title',
      sortable: true,
      render: (offer) => (
        <div className="flex items-center space-x-3">
          <div className="w-14 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
            {offer.banner_image ? (
              <img src={offer.banner_image} alt={offer.title} className="w-full h-full object-cover" />
            ) : (
              <Tag className="w-4 h-4 text-indigo-500" />
            )}
          </div>
          <div className="space-y-0.5 max-w-sm">
            {offer.badge_text && (
              <span className="font-mono font-bold text-[10px] uppercase text-indigo-600 dark:text-indigo-400">
                {offer.badge_text}
              </span>
            )}
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
              {offer.title}
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{offer.subtitle}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Campaign Type',
      accessor: 'type',
      render: (offer) => (
        <span className="font-mono text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
          {offer.type?.replace('_', ' ') || 'General Promo'}
        </span>
      ),
    },
    {
      header: 'Discount Rule',
      accessor: 'discount_type',
      render: (offer) => (
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
          {offer.discount_type === 'percentage' && `${offer.discount_value}% OFF`}
          {offer.discount_type === 'fixed' && `৳${Number(offer.discount_value || 0).toLocaleString()} OFF`}
          {offer.discount_type === 'free_shipping' && 'FREE SHIPPING'}
          {!['percentage', 'fixed', 'free_shipping'].includes(offer.discount_type) && 'Special Bundle'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (offer) => {
        const s = offer.computed_status || offer.status;
        return (
          <AdminStatusBadge
            status={s === 'active' ? 'active' : s === 'scheduled' ? 'pending' : 'draft'}
            label={s ? s.toUpperCase() : 'DRAFT'}
            size="xs"
          />
        );
      },
    },
    {
      header: 'Schedule Timeline',
      accessor: 'start_date',
      render: (offer) => (
        <div className="text-[11px] font-mono text-slate-400">
          <div>Start: {offer.start_date ? new Date(offer.start_date).toLocaleDateString() : 'Immediate'}</div>
          <div>End: {offer.end_date ? new Date(offer.end_date).toLocaleDateString() : 'No expiry'}</div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (offer) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <a
            href={`/offers/${offer.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"
            title="Preview Live Campaign"
          >
            <Eye className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => handleDuplicate(offer.id)}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
            title="Clone Campaign"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <Link
            href={`/admin/offers/${offer.id}/edit`}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
            title="Edit Offer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(offer)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Offer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Campaign Offers">
      <Head title="Campaign Offers & Promotions - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Campaign Offers & Bundle Promotions"
          subtitle="Manage seasonal holiday promotions, brand discount festivals, bundle deal gifts, and countdown timers."
          badge={`${offers.total || offerList.length} Campaigns`}
          actions={
            <div className="flex items-center space-x-2">
              <a
                href="/offers"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <span>Storefront Hub</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
              <Link
                href="/admin/offers/create"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </Link>
            </div>
          }
        />

        {/* Filters and Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {['all', 'active', 'scheduled', 'expired', 'draft'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleFilterChange('status', st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  status === st
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <AdminPageToolbar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              handleFilterChange('search', val);
            }}
            searchPlaceholder="Search campaigns by title or type..."
            onRefresh={() => router.get('/admin/offers')}
          />
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={offerList}
          pagination={offers}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No promotional campaigns found"
          emptyDescription="Create seasonal promo campaigns, holiday discounts, and bundle offers to drive storefront sales."
        />
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Campaign Offer"
        message={`Are you sure you want to permanently delete campaign "${deleteTarget?.title}"?`}
        confirmText="Delete Campaign"
        isDestructive
      />
    </AdminShell>
  );
}
