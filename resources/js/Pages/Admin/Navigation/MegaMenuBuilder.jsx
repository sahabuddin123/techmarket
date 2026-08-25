import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  ArrowLeft, Save, Sparkles, LayoutGrid, Layers, Plus, 
  Trash2, Eye, Sliders, CheckCircle2, ChevronRight 
} from 'lucide-react';
import MegaMenu from '@/Components/Navigation/MegaMenu';

export default function MegaMenuBuilder({ category, allCategories = [], sampleProducts = [] }) {
  const initialConfig = category.mega_menu_config || {
    promo_enabled: true,
    promo_image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop',
    promo_title: `${category.name} Spotlight`,
    promo_subtitle: 'Genuine official warranty & best pricing in Bangladesh.',
    promo_btn_text: 'Explore Catalog',
    promo_btn_url: `/category/${category.slug}`,
    manual_groups: [
      {
        title: 'Popular Series',
        items: [
          { title: 'Flagship Edition', url: `/category/${category.slug}` },
          { title: 'Gaming Series', url: `/category/${category.slug}` },
        ]
      }
    ]
  };

  const { data, setData, put, processing, recentlySuccessful } = useForm({
    mega_menu_enabled: category.mega_menu_enabled ?? true,
    mega_menu_type: category.mega_menu_type || 'auto',
    mega_menu_layout: category.mega_menu_layout || '4_columns',
    mega_menu_config: initialConfig,
    is_nav_visible: category.is_nav_visible ?? true,
  });

  const handleConfigChange = (key, value) => {
    setData('mega_menu_config', {
      ...data.mega_menu_config,
      [key]: value
    });
  };

  // Manual Groups helper methods
  const addManualGroup = () => {
    const currentGroups = data.mega_menu_config?.manual_groups || [];
    setData('mega_menu_config', {
      ...data.mega_menu_config,
      manual_groups: [
        ...currentGroups,
        {
          title: `New Column ${currentGroups.length + 1}`,
          items: [{ title: 'Sample Item 1', url: '#' }]
        }
      ]
    });
  };

  const updateGroupTitle = (gIndex, title) => {
    const groups = [...(data.mega_menu_config?.manual_groups || [])];
    groups[gIndex].title = title;
    setData('mega_menu_config', { ...data.mega_menu_config, manual_groups: groups });
  };

  const removeGroup = (gIndex) => {
    const groups = [...(data.mega_menu_config?.manual_groups || [])];
    groups.splice(gIndex, 1);
    setData('mega_menu_config', { ...data.mega_menu_config, manual_groups: groups });
  };

  const addGroupItem = (gIndex) => {
    const groups = [...(data.mega_menu_config?.manual_groups || [])];
    groups[gIndex].items.push({ title: 'New Sub-link', url: '#' });
    setData('mega_menu_config', { ...data.mega_menu_config, manual_groups: groups });
  };

  const updateGroupItem = (gIndex, iIndex, key, val) => {
    const groups = [...(data.mega_menu_config?.manual_groups || [])];
    groups[gIndex].items[iIndex][key] = val;
    setData('mega_menu_config', { ...data.mega_menu_config, manual_groups: groups });
  };

  const removeGroupItem = (gIndex, iIndex) => {
    const groups = [...(data.mega_menu_config?.manual_groups || [])];
    groups[gIndex].items.splice(iIndex, 1);
    setData('mega_menu_config', { ...data.mega_menu_config, manual_groups: groups });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/admin/navigation/mega-menu/${category.id}`, { preserveScroll: true });
  };

  // Build preview category object
  const previewCategory = {
    ...category,
    mega_menu_enabled: data.mega_menu_enabled,
    mega_menu_type: data.mega_menu_type,
    mega_menu_layout: data.mega_menu_layout,
    mega_menu_config: data.mega_menu_config,
  };

  return (
    <AdminShell title={`Mega Menu: ${category.name}`}>
      <Head title={`Edit Mega Menu: ${category.name} - TechMarket Admin`} />

      <form onSubmit={handleSubmit} className="space-y-6 text-xs pb-12">
        {/* Top Header */}
        <AdminPageHeader
          title={`Mega Menu Builder: ${category.name}`}
          subtitle="Configure dropdown display mode, column layouts, custom link groups, and promotional spotlight banner."
          badge="Category Navigation"
          actions={
            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/navigation"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Navigation</span>
              </Link>

              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Mega menu configuration for "{category.name}" saved successfully.</span>
          </div>
        )}

        {/* LIVE STOREFRONT PREVIEW CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                Real-Time Storefront Dropdown Preview
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Interactive render of active configuration
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex justify-center overflow-x-auto">
            <div className="relative inline-block">
              <MegaMenu
                category={previewCategory}
                isOpen={true}
                onClose={() => {}}
                align="left"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: CONFIGURATION & BUILDER */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. GENERAL DISPLAY SETTINGS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center gap-2 font-heading">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. Menu Display Mode & Column Grid</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mega Menu Enabled Switch */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Enable Mega Dropdown</span>
                    <span className="text-[10px] text-slate-500">Show dropdown when hovering this category</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.mega_menu_enabled}
                    onChange={(e) => setData('mega_menu_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </div>

                {/* Nav Visibility */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Header Bar Visibility</span>
                    <span className="text-[10px] text-slate-500">Include category in top navigation bar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.is_nav_visible}
                    onChange={(e) => setData('is_nav_visible', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Display Type */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Display Mode *</label>
                  <select
                    value={data.mega_menu_type}
                    onChange={(e) => setData('mega_menu_type', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-bold"
                  >
                    <option value="auto">Automatic (From Category Hierarchy)</option>
                    <option value="manual">Manual (Custom Column Link Groups)</option>
                    <option value="simple_dropdown">Simple Vertical Dropdown</option>
                    <option value="direct_link">Direct Link (No Dropdown)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Automatic mode dynamically resolves subcategories and grandchildren from the database.
                  </p>
                </div>

                {/* Column Layout */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Column Grid Layout *</label>
                  <select
                    value={data.mega_menu_layout}
                    onChange={(e) => setData('mega_menu_layout', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-bold"
                  >
                    <option value="4_columns">4 Columns Grid</option>
                    <option value="3_columns">3 Columns Grid</option>
                    <option value="2_columns">2 Columns Grid</option>
                    <option value="auto">Auto Grid</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Defines desktop column distribution for subcategory lists.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. MANUAL COLUMN GROUPS (Visible if Mode === 'manual') */}
            {data.mega_menu_type === 'manual' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                      2. Custom Column Link Groups (Manual Mode)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={addManualGroup}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Column Group</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(data.mega_menu_config?.manual_groups || []).map((group, gIndex) => (
                    <div key={gIndex} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Column {gIndex + 1} Header Title
                          </label>
                          <input
                            type="text"
                            value={group.title}
                            onChange={(e) => updateGroupTitle(gIndex, e.target.value)}
                            placeholder="e.g. Gaming Laptops"
                            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-hidden"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGroup(gIndex)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end cursor-pointer"
                          title="Delete column group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>Group Sub-links</span>
                          <button
                            type="button"
                            onClick={() => addGroupItem(gIndex)}
                            className="text-indigo-600 hover:underline cursor-pointer"
                          >
                            + Add Link
                          </button>
                        </div>

                        {group.items?.map((item, iIndex) => (
                          <div key={iIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateGroupItem(gIndex, iIndex, 'title', e.target.value)}
                              placeholder="Link text"
                              className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                            />
                            <input
                              type="text"
                              value={item.url}
                              onChange={(e) => updateGroupItem(gIndex, iIndex, 'url', e.target.value)}
                              placeholder="URL or /category/slug"
                              className="flex-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => removeGroupItem(gIndex, iIndex)}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1 COL: PROMOTIONAL SPOTLIGHT BANNER SETTINGS */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                    Promotional Spotlight Panel
                  </h3>
                </div>
                <input
                  type="checkbox"
                  checked={data.mega_menu_config?.promo_enabled ?? true}
                  onChange={(e) => handleConfigChange('promo_enabled', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Spotlight Banner Image URL</label>
                  <input
                    type="text"
                    value={data.mega_menu_config?.promo_image || ''}
                    onChange={(e) => handleConfigChange('promo_image', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Spotlight Headline Title</label>
                  <input
                    type="text"
                    value={data.mega_menu_config?.promo_title || ''}
                    onChange={(e) => handleConfigChange('promo_title', e.target.value)}
                    placeholder="e.g. GeForce RTX 40-Series"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Spotlight Subtitle / Tagline</label>
                  <textarea
                    rows={2}
                    value={data.mega_menu_config?.promo_subtitle || ''}
                    onChange={(e) => handleConfigChange('promo_subtitle', e.target.value)}
                    placeholder="e.g. Unleash DLSS 3.5 & Full Ray Tracing"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Button Text</label>
                    <input
                      type="text"
                      value={data.mega_menu_config?.promo_btn_text || ''}
                      onChange={(e) => handleConfigChange('promo_btn_text', e.target.value)}
                      placeholder="e.g. Explore Deals"
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Button URL</label>
                    <input
                      type="text"
                      value={data.mega_menu_config?.promo_btn_url || ''}
                      onChange={(e) => handleConfigChange('promo_btn_url', e.target.value)}
                      placeholder="/category/slug"
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                Quick Category Details
              </h4>
              <div className="text-[11px] space-y-1.5 text-slate-500">
                <p>Slug: <strong className="text-slate-900 dark:text-slate-100 font-mono">{category.slug}</strong></p>
                <p>Direct Children: <strong className="text-slate-900 dark:text-slate-100">{category.children?.length || 0} subcategories</strong></p>
                <p>Sort Order: <strong className="text-slate-900 dark:text-slate-100">#{category.sort_order}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
