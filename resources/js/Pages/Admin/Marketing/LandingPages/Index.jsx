import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../AdminLayout';
import { 
  Plus, Search, Edit2, Trash2, Copy, Eye, 
  Sparkles, Layers, TrendingUp, DollarSign, 
  ShoppingCart, ExternalLink, BarChart3, CheckCircle2, 
  XCircle, Clock, AlertCircle, Play, Pause, Share2
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

  const getStatusBadge = (pageStatus) => {
    switch (pageStatus) {
      case 'published':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] font-bold uppercase">Draft</span>;
      case 'paused':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase">Paused</span>;
      case 'scheduled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase">Scheduled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] font-bold uppercase">{pageStatus}</span>;
    }
  };

  return (
    <AdminLayout title="Product-Wise Landing Page Hub">
      <Head title="Landing Pages — Meta & Facebook Ads Builder" />

      <div className="space-y-6">
        {/* Header Title & CTA Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
                Facebook / Meta Ads Optimized
              </span>
              <span className="text-xs text-slate-400">High-Conversion 1-Click Order</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
              Product-Wise Landing Pages
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Build dedicated high-converting marketing funnels with server-authoritative checkout, fraud protection, and live Meta/GA4 tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/marketing/landing-pages/templates"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700 shadow-xs"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Templates</span>
            </Link>

            <Link
              href="/admin/marketing/landing-pages/analytics"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700 shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Funnel Analytics</span>
            </Link>

            <Link
              href="/admin/marketing/landing-pages/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Create Landing Page</span>
            </Link>
          </div>
        </div>

        {/* Aggregate KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Campaigns</p>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {metrics.published_pages || 0} <span className="text-xs font-medium text-slate-500">/ {metrics.total_pages || 0} total</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Campaign Traffic</p>
              <p className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">
                {(metrics.total_views || 0).toLocaleString()} <span className="text-xs font-medium text-slate-500">views</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Orders & Conv. Rate</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                {metrics.total_orders || 0} <span className="text-xs font-bold text-emerald-300">({metrics.overall_conversion || 0}%)</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Landing Revenue</p>
              <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                ৳{Number(metrics.total_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, slug, campaign..."
              className="w-full bg-slate-950 text-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['all', 'published', 'draft', 'paused'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatus(st);
                  handleFilterChange('status', st);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                  status === st
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Landing Page / Campaign</th>
                  <th className="py-3.5 px-4">Attached Product</th>
                  <th className="py-3.5 px-4">Public URL</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Traffic</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Revenue</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {pages.data && pages.data.length > 0 ? (
                  pages.data.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-800/30 transition-colors group">
                      {/* Name & Campaign */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                            {page.product?.image ? (
                              <img src={page.product.image} alt={page.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/marketing/landing-pages/${page.id}/edit`}
                              className="font-bold text-white hover:text-amber-400 transition-colors text-xs line-clamp-1"
                            >
                              {page.name}
                            </Link>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {page.campaign_name && <span className="text-amber-400/90 font-medium">{page.campaign_name}</span>}
                              <span>•</span>
                              <span>{page.sections_count || 0} Sections</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        {page.product ? (
                          <div>
                            <p className="font-semibold text-slate-200 line-clamp-1">{page.product.title}</p>
                            <p className="text-[10px] font-mono text-slate-400">৳{Number(page.product.price).toLocaleString()}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No Product Attached</span>
                        )}
                      </td>

                      {/* URL with Copy */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 truncate max-w-[140px]">/l/{page.slug}</span>
                          <button
                            type="button"
                            onClick={() => copyUrl(page.public_url, page.slug)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Live URL"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedSlug === page.slug && (
                            <span className="text-[9px] font-bold text-emerald-400 animate-in fade-in">Copied!</span>
                          )}
                          <a
                            href={page.public_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                            title="View Public Storefront"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(page.status)}
                      </td>

                      {/* Traffic */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                        {page.view_count.toLocaleString()}
                      </td>

                      {/* Orders & Conv */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-emerald-400">{page.order_count}</div>
                        <div className="text-[10px] text-slate-400 font-medium">({page.conversion_rate}%)</div>
                      </td>

                      {/* Revenue */}
                      <td className="py-3.5 px-4 text-right font-black text-amber-300">
                        ৳{Number(page.revenue_total).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/marketing/landing-pages/${page.id}/edit`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Page Builder"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/marketing/landing-pages/analytics/${page.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-blue-400 transition-colors"
                            title="View Funnel Analytics"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleToggle(page.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                            title={page.status === 'published' ? 'Pause Campaign' : 'Publish Campaign'}
                          >
                            {page.status === 'published' ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(page.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Duplicate Landing Page"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteModal(page)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Sparkles className="w-8 h-8 text-slate-600" />
                        <p className="text-sm font-semibold text-slate-400">No Landing Pages Found</p>
                        <p className="text-xs text-slate-500">Get started by creating your first dedicated Facebook ads landing page.</p>
                        <Link
                          href="/admin/marketing/landing-pages/create"
                          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Now</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Delete Landing Page</h3>
                  <p className="text-xs text-slate-400">Are you sure you want to delete this promotional page?</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                {deleteModal.name} <br/>
                <span className="text-slate-500 text-[10px]">/l/{deleteModal.slug}</span>
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
