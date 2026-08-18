import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Plus, Search, Edit2, Trash2, Copy, Eye, 
  Tag, Calendar, Clock, CheckCircle2, XCircle, 
  AlertCircle, Sparkles, Filter, ExternalLink 
} from 'lucide-react';

export default function AdminOffersIndex({ offers = { data: [] }, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [isActive, setIsActive] = useState(filters.is_active || 'all');
  const [deleteModal, setDeleteModal] = useState(null);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    if (!value || value === 'all') delete updated[key];
    router.get('/admin/offers', updated, { preserveState: true, preserveScroll: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', search);
  };

  const handleToggle = (offerId) => {
    router.post(`/admin/offers/${offerId}/toggle`, {}, { preserveScroll: true });
  };

  const handleDuplicate = (offerId) => {
    router.post(`/admin/offers/${offerId}/duplicate`, {}, { preserveScroll: true });
  };

  const confirmDelete = () => {
    if (!deleteModal) return;
    router.delete(`/admin/offers/${deleteModal.id}`, {
      preserveScroll: true,
      onSuccess: () => setDeleteModal(null),
    });
  };

  const getStatusBadge = (offer) => {
    const s = offer.computed_status || offer.status;
    switch (s) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">Active</span>;
      case 'scheduled':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase">Scheduled</span>;
      case 'expired':
        return <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] font-black uppercase">Expired</span>;
      case 'draft':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase">Draft</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase">Disabled</span>;
    }
  };

  return (
    <AdminLayout title="Offers & Campaign Management">
      <Head title="Offers & Campaign Management | Admin" />

      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-red-500" />
              <span>Offers & Campaign Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create seasonal sales, hero banner promotions, brand fests, and gift campaigns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/offers"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>

            <Link
              href="/admin/offers/create"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors flex items-center gap-1.5 shadow-lg shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaign title, slug, or headline..."
              className="w-full bg-slate-950 text-white rounded-lg pl-8 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-red-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilterChange('status', e.target.value);
              }}
              className="bg-slate-950 text-slate-300 rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-red-500 font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>

            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                handleFilterChange('is_active', e.target.value);
              }}
              className="bg-slate-950 text-slate-300 rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-red-500 font-bold"
            >
              <option value="all">Visibility: All</option>
              <option value="1">Active Only</option>
              <option value="0">Hidden Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Campaign</th>
                  <th className="p-3.5">Schedule</th>
                  <th className="p-3.5">Products</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Active</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {offers.data && offers.data.length > 0 ? (
                  offers.data.map((offer) => {
                    const imgSrc = offer.thumbnail_image || offer.banner_image || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=100';

                    return (
                      <tr key={offer.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Campaign Info */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={imgSrc}
                              alt={offer.title}
                              className="w-14 h-9 object-cover rounded border border-slate-700 bg-slate-950 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate max-w-[200px]">
                                {offer.title}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                /offers/{offer.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Schedule */}
                        <td className="p-3.5 text-slate-400">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>
                              {offer.start_at ? new Date(offer.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Anytime'}
                              {' – '}
                              {offer.end_at ? new Date(offer.end_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Indefinite'}
                            </span>
                          </div>
                        </td>

                        {/* Products Count */}
                        <td className="p-3.5">
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] font-bold">
                            {offer.products_count || 0} items
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {getStatusBadge(offer)}
                        </td>

                        {/* Order */}
                        <td className="p-3.5 font-mono text-slate-400">
                          #{offer.display_order}
                        </td>

                        {/* Active Toggle Switch */}
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggle(offer.id)}
                            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 flex items-center ${
                              offer.is_active ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                                offer.is_active ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/offers/${offer.slug}`}
                              target="_blank"
                              title="Preview on Storefront"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <Link
                              href={`/admin/offers/${offer.id}/edit`}
                              title="Edit Campaign"
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDuplicate(offer.id)}
                              title="Duplicate Campaign"
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteModal(offer)}
                              title="Delete Campaign"
                              className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      No campaigns found. Click "Create Campaign" to launch your first promotional offer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {offers.links && offers.links.length > 3 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing {offers.from || 0} to {offers.to || 0} of {offers.total} campaigns
              </div>
              <div className="flex items-center gap-1">
                {offers.links.map((link, idx) => (
                  <button
                    key={idx}
                    disabled={!link.url || link.active}
                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      link.active
                        ? 'bg-red-600 text-white'
                        : link.url
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-white">Delete Campaign?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteModal.title}"</span>? This will remove the campaign and detach all associated products.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
