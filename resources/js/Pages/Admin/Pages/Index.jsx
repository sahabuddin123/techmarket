import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { 
  FileText, Plus, ExternalLink, Edit3, Trash2, 
  CheckCircle2, XCircle, Eye, Sparkles 
} from 'lucide-react';

export default function PagesIndex({ pages = { data: [] }, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const pageList = Array.isArray(pages?.data) ? pages.data : [];

  const handleToggle = (id) => {
    router.post(`/admin/pages/${id}/toggle`, {}, { preserveScroll: true });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/pages/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const getPublicUrl = (slug) => {
    if (slug === 'privacy-policy') return '/privacy-policy';
    if (slug === 'warranty-policy') return '/warranty-policy';
    if (slug === 'about-us') return '/about-us';
    return `/page/${slug}`;
  };

  const filteredPages = pageList.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Page Document',
      accessor: 'title',
      sortable: true,
      render: (p) => (
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <Link 
              href={`/admin/pages/${p.id}/edit`}
              className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs font-heading block"
            >
              {p.title}
            </Link>
            <span className="text-[10.5px] text-slate-400 font-mono">
              slug: /{p.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Public Storefront URL',
      accessor: 'slug',
      render: (p) => {
        const publicUrl = getPublicUrl(p.slug);
        return (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 font-mono text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>{publicUrl}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        );
      },
    },
    {
      header: 'Content Structure',
      accessor: 'sections',
      render: (p) => {
        const sectionCount = Array.isArray(p.sections) ? p.sections.length : 0;
        return (
          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-xs">
            {sectionCount > 0 ? `${sectionCount} Dynamic Blocks` : 'Standard HTML'}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'is_published',
      render: (p) => (
        <AdminStatusBadge
          status={p.is_published ? 'published' : 'draft'}
          label={p.is_published ? 'Published' : 'Draft'}
          size="xs"
        />
      ),
    },
    {
      header: 'Last Updated',
      accessor: 'updated_at',
      render: (p) => (
        <span className="font-mono text-slate-400 text-xs">
          {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (p) => {
        const isProtected = ['about-us', 'privacy-policy', 'warranty-policy'].includes(p.slug);
        const publicUrl = getPublicUrl(p.slug);

        return (
          <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"
              title="Preview Public Page"
            >
              <Eye className="w-3.5 h-3.5" />
            </a>

            <Link
              href={`/admin/pages/${p.id}/edit`}
              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
              title="Edit Page"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Link>

            {!isProtected && (
              <button
                type="button"
                onClick={() => setDeleteTarget(p)}
                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                title="Delete Page"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminShell title="CMS Pages">
      <Head title="CMS & Policy Pages - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="CMS, Legal & Policy Pages"
          subtitle="Manage customer-facing legal terms, warranty conditions, privacy policies, and marketing information pages."
          badge={`${pages.total || pageList.length} Pages`}
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/pages/about-us"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>About Us Builder</span>
              </Link>
              <Link
                href="/admin/pages/create"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Page</span>
              </Link>
            </div>
          }
        />

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search pages by title or slug..."
          onRefresh={() => router.get('/admin/pages')}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredPages}
          pagination={pages}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No CMS or policy pages found"
          emptyDescription="Create custom landing and legal document pages for the storefront."
        />
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Page"
        message={`Are you sure you want to permanently delete page "${deleteTarget?.title}"?`}
        confirmText="Delete Page"
        isDestructive
      />
    </AdminShell>
  );
}
