import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
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
    <AdminLayout title="Navigation & Mega Menu Engine">
      <Head title="Navigation & Mega Menu Engine - Admin" />

      <div className="space-y-8 text-xs">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Menu className="w-6 h-6 text-red-500" />
              <span>DYNAMIC NAVIGATION & MEGA MENU BUILDER</span>
            </h1>
            <p className="text-slate-400">
              Manage database-driven top category navigation, multi-column mega menus, promotional spotlight panels, and footer links.
            </p>
          </div>
        </div>

        {/* SECTION 1: TOP-LEVEL CATEGORIES & MEGA MENU MATRIX */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                Storefront Top Category Navigation & Mega Menu Settings
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Total Categories: <strong className="text-white">{categories.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800">
                {categories.map(cat => {
                  const hasChildren = cat.children && cat.children.length > 0;
                  const config = cat.mega_menu_config || {};
                  const isPromoActive = config.promo_enabled !== false && (config.promo_title || config.promo_image);

                  return (
                    <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="p-3.5 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>{cat.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">({cat.slug})</span>
                      </td>

                      {/* Subcategories */}
                      <td className="p-3.5 text-slate-300">
                        {hasChildren ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 font-bold text-[11px]">
                            {cat.children.length} Children
                          </span>
                        ) : (
                          <span className="text-slate-500">0 Items</span>
                        )}
                      </td>

                      {/* Mega Menu Status */}
                      <td className="p-3.5">
                        {cat.mega_menu_enabled !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Display Mode */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono uppercase text-[10px] font-bold">
                          {cat.mega_menu_type || 'auto'}
                        </span>
                      </td>

                      {/* Layout */}
                      <td className="p-3.5 font-medium text-slate-300">
                        {cat.mega_menu_layout || 'auto'}
                      </td>

                      {/* Promotional Spotlight */}
                      <td className="p-3.5">
                        {isPromoActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/50 text-[10px] font-bold">
                            <Sparkles className="w-3 h-3" />
                            Active Promo
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">No Banner</span>
                        )}
                      </td>

                      {/* Visibility Toggle */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleCategory(cat.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                            cat.is_nav_visible !== false
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/60'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors shadow-sm"
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
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl h-fit">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <h3 className="font-black text-sm text-white uppercase">Add Custom Menu Link</h3>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Link Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Corporate Procurement"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Target URL *</label>
              <input
                type="text"
                required
                placeholder="e.g. /page/corporate-sales"
                value={data.url}
                onChange={(e) => setData('url', e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-red-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Menu Location *</label>
              <select
                value={data.location}
                onChange={(e) => setData('location', e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-red-500 font-bold"
              >
                <option value="header">Main Header Menu</option>
                <option value="footer">Footer Menu Links</option>
                <option value="mega_menu">Mega Menu Featured Spotlight</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={processing} 
              className="w-full py-2.5 bg-red-600 text-white font-black rounded-lg uppercase hover:bg-red-700 transition-colors shadow"
            >
              Add Navigation Link
            </button>
          </form>

          {/* NAVIGATIONS LIST TABLE */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                Custom Navigation Links
              </h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">URL</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {navigations && navigations.length > 0 ? (
                  navigations.map(n => (
                    <tr key={n.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white">{n.title}</td>
                      <td className="p-3.5 font-mono text-red-400">{n.url}</td>
                      <td className="p-3.5 font-semibold text-slate-300 uppercase text-[10px]">{n.location}</td>
                      <td className="p-3.5 text-right">
                        <button 
                          onClick={() => handleDelete(n.id)} 
                          className="p-1 bg-slate-800 text-rose-400 hover:text-rose-300 rounded hover:bg-slate-700 transition-colors"
                          title="Delete link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No custom navigation links added yet.
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
