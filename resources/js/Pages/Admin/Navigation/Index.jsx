import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  Menu, Plus, Trash2, Sliders, Eye, EyeOff, Layers, 
  ExternalLink, Sparkles, CheckCircle2, XCircle, ArrowUpDown
} from 'lucide-react';

export default function AdminNavigation({ categories = [], navigations = [] }) {
  const { data, setData, post, processing, reset } = useForm({
    title: '',
    url: '',
    location: 'header',
    sort_order: 0,
    is_visible: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/navigation', {
      onSuccess: () => reset()
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this menu link?')) {
      router.delete(`/admin/navigation/${id}`);
    }
  };

  const handleToggleCategory = (catId) => {
    router.post(`/admin/navigation/categories/${catId}/toggle`, {}, {
      preserveScroll: true
    });
  };

  return (
    <AdminShell title="Navigation & Mega Menus">
      <Head title="Dynamic Navigation & Mega Menu Builder - TechMarket Admin" />

      <div className="space-y-6 text-xs">
        {/* Header Title */}
        <AdminPageHeader
          title="Dynamic Navigation & Mega Menu Builder"
          subtitle="Manage database-driven top category navigation, multi-column mega menus, promotional spotlight panels, and footer links."
          badge="Storefront Navigation"
        />

        {/* SECTION 1: TOP-LEVEL CATEGORIES & MEGA MENU MATRIX */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
                Storefront Top Category Navigation & Mega Menu Matrix
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Total Categories: <strong className="text-slate-900 dark:text-slate-100 font-bold">{categories.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Subcategories</th>
                  <th className="p-3.5">Mega Menu Status</th>
                  <th className="p-3.5">Display Mode</th>
                  <th className="p-3.5">Column Layout</th>
                  <th className="p-3.5">Promotional Panel</th>
                  <th className="p-3.5">Visibility</th>
                  <th className="p-3.5 text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map(cat => {
                  const hasChildren = cat.children && cat.children.length > 0;
                  const config = cat.mega_menu_config || {};
                  const isPromoActive = config.promo_enabled !== false && (config.promo_title || config.promo_image);

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        <span className="font-heading">{cat.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({cat.slug})</span>
                      </td>

                      {/* Subcategories */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {hasChildren ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200/60">
                            {cat.children.length} Children
                          </span>
                        ) : (
                          <span className="text-slate-400">0 Items</span>
                        )}
                      </td>

                      {/* Mega Menu Status */}
                      <td className="p-3.5">
                        {cat.mega_menu_enabled !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Display Mode */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800 font-mono uppercase text-[10px] font-bold">
                          {cat.mega_menu_type || 'auto'}
                        </span>
                      </td>

                      {/* Layout */}
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {cat.mega_menu_layout || 'auto'}
                      </td>

                      {/* Promotional Spotlight */}
                      <td className="p-3.5">
                        {isPromoActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold">
                            <Sparkles className="w-3 h-3" />
                            Active Promo
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No Banner</span>
                        )}
                      </td>

                      {/* Visibility Toggle */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            cat.is_nav_visible !== false
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {cat.is_nav_visible !== false ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Configure Button */}
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/admin/navigation/mega-menu/${cat.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl font-bold transition-colors shadow-2xs text-xs"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: CUSTOM NAVIGATION MENU ITEMS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CREATE FORM */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs h-fit">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-slate-100 font-heading">Add Custom Menu Link</h3>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Link Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Corporate Procurement"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target URL *</label>
              <input
                type="text"
                required
                placeholder="e.g. /page/corporate-sales"
                value={data.url}
                onChange={(e) => setData('url', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Menu Location *</label>
              <select
                value={data.location}
                onChange={(e) => setData('location', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-bold"
              >
                <option value="header">Main Header Menu</option>
                <option value="footer">Footer Menu Links</option>
                <option value="mega_menu">Mega Menu Featured Spotlight</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={processing} 
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl uppercase hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Add Navigation Link
            </button>
          </form>

          {/* NAVIGATIONS LIST TABLE */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                Custom Navigation Links
              </h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">URL</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {navigations && navigations.length > 0 ? (
                  navigations.map(n => (
                    <tr key={n.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{n.title}</td>
                      <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400">{n.url}</td>
                      <td className="p-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">{n.location}</td>
                      <td className="p-3.5 text-right">
                        <button 
                          onClick={() => handleDelete(n.id)} 
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No custom navigation links added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
