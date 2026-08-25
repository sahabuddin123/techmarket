import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../../Components/Admin/AdminKpiCard';
import AdminTable from '../../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../../Components/Admin/AdminStatusBadge';
import ConfirmDialog from '../../../../Components/Admin/ConfirmDialog';
import { 
  Plus, Search, Edit2, Trash2, Copy, Eye, 
  Sparkles, Layers, TrendingUp, DollarSign, 
  ShoppingCart, ExternalLink, BarChart3, CheckCircle2, 
  Play, Pause, Check 
} from 'lucide-react';

export default function LandingPagesIndex({
  pages = { data: [] },
  filters = {},
  metrics = {}
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [deleteModal, setDeleteModal] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const pageList = Array.isArray(pages?.data) ? pages.data : [];

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    if (!value || value === 'all') delete updated[key];
    router.get('/admin/marketing/landing-pages', updated, { preserveState: true, preserveScroll: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', search);
  };

  const handleToggle = (pageId) => {
    router.post(`/admin/marketing/landing-pages/${pageId}/toggle`, {}, { preserveScroll: true });
  };

  const handleDuplicate = (pageId) => {
    router.post(`/admin/marketing/landing-pages/${pageId}/duplicate`, {}, { preserveScroll: true });
  };

  const confirmDelete = () => {
    if (!deleteModal) return;
    router.delete(`/admin/marketing/landing-pages/${deleteModal.id}`, {
      preserveScroll: true,
      onSuccess: () => setDeleteModal(null),
    });
  };

  const copyUrl = (url, slug) => {
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const columns = [
    {
      header: 'Landing Page Campaign',
      accessor: 'title',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {p.title}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
            <span>/lp/{p.slug}</span>
            <button
              type="button"
              onClick={() => copyUrl(`${window.location.origin}/lp/${p.slug}`, p.slug)}
              className="text-indigo-600 hover:text-indigo-800 cursor-pointer ml-1"
              title="Copy URL"
            >
              {copiedSlug === p.slug ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      ),
    },
    {
      header: 'Template / Product',
      accessor: 'template',
      render: (p) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs capitalize font-medium">
          {p.template || 'Direct Single Product'}
        </span>
      ),
    },
    {
      header: 'Conversion Rate',
      accessor: 'conversion_rate',
      render: (p) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {p.conversion_rate || 0}%
          </span>
          <span className="text-slate-400 text-[10px] ml-1">
            ({p.orders_count || 0} orders / {p.views_count || 0} views)
          </span>
        </div>
      ),
    },
    {
      header: 'Revenue (BDT)',
      accessor: 'revenue',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
          ৳{Number(p.revenue || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (p) => (
        <AdminStatusBadge
          status={p.status === 'published' ? 'active' : p.status === 'paused' ? 'warning' : 'draft'}
          label={p.status || 'Draft'}
          size="xs"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end space-x-1.5">
          <a
            href={`/lp/${p.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Preview Live Page"
          >
            <Eye className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`/admin/marketing/landing-pages/${p.id}/builder`}
            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
            title="Visual Page Builder"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => handleDuplicate(p.id)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Duplicate Campaign"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteModal(p)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
            title="Delete Landing Page"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Landing Pages">
      <Head title="High-Converting Landing Pages - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Direct-Response Landing Pages"
          subtitle="High-converting standalone sales funnels with frictionless 1-click checkout and Meta CAPI integration."
          badge="Conversion Funnels"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/marketing/landing-pages/templates"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Templates</span>
              </Link>
              <Link
                href="/admin/marketing/landing-pages/create"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Page</span>
              </Link>
            </div>
          }
        />

        {/* Funnel Conversion Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Total Funnel Pages"
            value={metrics.total_pages || 0}
            icon={Layers}
            color="indigo"
            description="Active campaigns in database"
          />
          <AdminKpiCard
            title="Funnel Orders"
            value={metrics.total_orders || 0}
            icon={ShoppingCart}
            color="emerald"
            description="Orders via 1-click checkout"
          />
          <AdminKpiCard
            title="Funnel Revenue"
            value={`৳${Number(metrics.total_revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="amber"
            description="Direct campaign sales (BDT)"
          />
          <AdminKpiCard
            title="Avg Conversion Rate"
            value={`${metrics.avg_conversion_rate || 0}%`}
            icon={TrendingUp}
            color="purple"
            description="Funnel visit to order ratio"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {['all', 'published', 'draft', 'paused'].map((st) => (
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

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search landing pages..."
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={pageList}
          pagination={pages}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No landing pages created"
          emptyDescription="Create high-converting landing pages for paid social ad campaigns."
        />
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteModal)}
        onClose={() => setDeleteModal(null)}
        onConfirm={confirmDelete}
        title="Delete Landing Page?"
        message={`Are you sure you want to permanently delete "${deleteModal?.title}"? Visitors to this URL will receive a 404.`}
        confirmText="Delete Campaign"
        type="danger"
      />
    </AdminShell>
  );
}
