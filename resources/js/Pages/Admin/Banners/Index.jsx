import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { Plus, Edit2, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function AdminBanners({ banners = [] }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const bannerList = Array.isArray(banners) ? banners : [];

  const filteredBanners = bannerList.filter(b =>
    !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.badge?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/banners/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Banner Artwork',
      accessor: 'image',
      render: (b) => (
        <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shrink-0 flex items-center justify-center">
          {b.image ? (
            <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      header: 'Headline & Content',
      accessor: 'title',
      sortable: true,
      render: (b) => (
        <div className="space-y-0.5">
          {b.badge && (
            <span className="font-mono font-bold text-[10px] uppercase text-indigo-600 dark:text-indigo-400">
              {b.badge}
            </span>
          )}
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {b.title}
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1">{b.subtitle}</p>
        </div>
      ),
    },
    {
      header: 'Call-to-Action Link',
      accessor: 'button_text',
      render: (b) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{b.button_text || 'Shop Now'}</div>
          <div className="text-[10.5px] text-slate-400 font-mono truncate max-w-xs">{b.button_url || '/'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (b) => (
        <AdminStatusBadge
          status={b.is_active ? 'active' : 'draft'}
          label={b.is_active ? 'Active' : 'Disabled'}
          size="xs"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (b) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <Link
            href={`/admin/banners/${b.id}/edit`}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
            title="Edit Banner"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(b)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Banner"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Promo Banners">
      <Head title="Homepage Hero Banners - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Homepage Hero Banners & Promo Sliders"
          subtitle="Configure high-impact promotional carousel slides, custom typography headlines, and CTA navigation links."
          badge={`${bannerList.length} Slides`}
          actions={
            <Link
              href="/admin/banners/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hero Banner</span>
            </Link>
          }
        />

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search banners by headline..."
          onRefresh={() => router.get('/admin/banners')}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredBanners}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No hero banners created"
          emptyDescription="Add promotional slider banners to showcase campaign sales and featured deals on the homepage."
          emptyAction={
            <Link
              href="/admin/banners/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Banner</span>
            </Link>
          }
        />
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete banner "${deleteTarget?.title}"?`}
        confirmText="Delete Banner"
        isDestructive
      />
    </AdminShell>
  );
}
