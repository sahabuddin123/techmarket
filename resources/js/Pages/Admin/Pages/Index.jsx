import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '@/Components/Admin/PageHeader';
import { 
  FileText, Plus, Search, ExternalLink, Edit3, Trash2, 
  CheckCircle2, XCircle, Eye, EyeOff, Calendar, ShieldCheck 
} from 'lucide-react';

export default function PagesIndex({ pages, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/pages', { search }, { preserveState: true, replace: true });
  };

  const handleToggle = (id) => {
    router.post(`/admin/pages/${id}/toggle`, {}, { preserveScroll: true });
  };

  const handleDelete = (id, title) => {
    if (confirm(`Are you sure you want to delete '${title}'? This action cannot be undone.`)) {
      router.delete(`/admin/pages/${id}`);
    }
  };

  const getPublicUrl = (slug) => {
    if (slug === 'privacy-policy') return '/privacy-policy';
    if (slug === 'warranty-policy') return '/warranty-policy';
    if (slug === 'about-us') return '/about-us';
    return `/page/${slug}`;
  };

  return (
    <AdminLayout>
      <Head title="CMS & Policy Pages - Admin Panel" />

      <div className="space-y-6">
        <PageHeader
          title="CMS & Policy Pages"
          description="Manage customer-facing policy documents, legal terms, warranty conditions, and custom static pages."
          breadcrumbs={[
            { label: 'Content & Media' },
            { label: 'CMS & Policies' }
          ]}
          actions={
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/pages/about-us"
                className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span>About Us Visual Builder</span>
              </Link>
              <Link
                href="/admin/pages/create"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-2 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Page</span>
              </Link>
            </div>
          }
        />

        {/* Filters Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages by title or slug..."
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-amber-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </form>

          <div className="text-xs text-slate-400 font-medium">
            Total Pages: <span className="font-bold text-white">{pages.total || pages.data.length}</span>
          </div>
        </div>

        {/* Pages Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Page Title</th>
                  <th className="py-3.5 px-4">Public URL</th>
                  <th className="py-3.5 px-4">Sections</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pages.data.length > 0 ? (
                  pages.data.map((p) => {
                    const sectionCount = Array.isArray(p.sections) ? p.sections.length : 0;
                    const publicUrl = getPublicUrl(p.slug);

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <Link 
                                href={`/admin/pages/${p.id}/edit`}
                                className="font-bold text-white hover:text-amber-400 transition-colors text-xs block"
                              >
                                {p.title}
                              </Link>
                              <span className="text-[10px] text-slate-500 font-mono">
                                slug: {p.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            <span>{publicUrl}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                          </a>
                        </td>

                        <td className="py-3.5 px-4">
                          {sectionCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                              {sectionCount} Styled Sections
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Standard HTML</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggle(p.id)}
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              p.is_published
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {p.is_published ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                              title="Preview Live Storefront Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>

                            <Link
                              href={`/admin/pages/${p.id}/edit`}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                              title="Edit Content & Sections"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>

                            {!['about-us', 'privacy-policy', 'warranty-policy'].includes(p.slug) && (
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id, p.title)}
                                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                title="Delete Page"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      No CMS or Policy pages found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
