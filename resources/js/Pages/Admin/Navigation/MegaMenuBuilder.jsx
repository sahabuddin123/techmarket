import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
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

  const { data, setData, put, processing } = useForm({
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
    put(`/admin/navigation/mega-menu/${category.id}`);
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
    <AdminLayout title={`Mega Menu Builder: ${category.name}`}>
      <Head title={`Edit Mega Menu: ${category.name} - Admin`} />

      <form onSubmit={handleSubmit} className="space-y-6 text-xs pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/navigation"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] uppercase">
                  MEGA MENU BUILDER
                </span>
                <h1 className="text-xl font-black text-white tracking-tight">
                  {category.name}
                </h1>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Configure dropdown display mode, column layouts, custom link groups, and promotional spotlight banner.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* LIVE STOREFRONT PREVIEW CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                Real-Time Storefront Dropdown Preview
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Interactive render of active configuration
            </span>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex justify-center overflow-x-auto">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>1. Menu Display Mode & Column Grid</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mega Menu Enabled Switch */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Enable Mega Dropdown</span>
                    <span className="text-[10px] text-slate-400">Show dropdown when hovering this category</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.mega_menu_enabled}
                    onChange={(e) => setData('mega_menu_enabled', e.target.checked)}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                  />
                </div>

                {/* Nav Visibility */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Header Bar Visibility</span>
                    <span className="text-[10px] text-slate-400">Include category in top navigation bar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.is_nav_visible}
                    onChange={(e) => setData('is_nav_visible', e.target.checked)}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Display Type */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Display Mode *</label>
                  <select
                    value={data.mega_menu_type}
                    onChange={(e) => setData('mega_menu_type', e.target.value)}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-lg border border-slate-800 focus:border-red-500 font-bold"
                  >
                    <option value="auto">Automatic (From Category Hierarchy)</option>
                    <option value="manual">Manual (Custom Column Link Groups)</option>
                    <option value="simple_dropdown">Simple Vertical Dropdown</option>
                    <option value="direct_link">Direct Link (No Dropdown)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Automatic mode dynamically resolves subcategories and grandchildren from the database.
                  </p>
                </div>

                {/* Column Layout */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Column Grid Layout *</label>
                  <select
                    value={data.mega_menu_layout}
                    onChange={(e) => setData('mega_menu_layout', e.target.value)}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-lg border border-slate-800 focus:border-red-500 font-bold"
                  >
                    <option value="4_columns">4 Columns Grid</option>
                    <option value="3_columns">3 Columns Grid</option>
                    <option value="2_columns">2 Columns Grid</option>
                    <option value="auto">Auto Grid</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Defines desktop column distribution for subcategory lists.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. MANUAL COLUMN GROUPS (Visible if Mode === 'manual') */}
            {data.mega_menu_type === 'manual' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                      2. Custom Column Link Groups (Manual Mode)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={addManualGroup}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Column Group</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(data.mega_menu_config?.manual_groups || []).map((group, gIndex) => (
                    <div key={gIndex} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Column {gIndex + 1} Header Title
                          </label>
                          <input
                            type="text"
                            value={group.title}
                            onChange={(e) => updateGroupTitle(gIndex, e.target.value)}
                            placeholder="e.g. Gaming Laptops"
                            className="w-full bg-slate-900 text-white p-2 rounded border border-slate-700 text-xs font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGroup(gIndex)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded transition-colors self-end"
                          title="Delete column group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span>Group Sub-links</span>
                          <button
                            type="button"
                            onClick={() => addGroupItem(gIndex)}
                            className="text-blue-400 hover:underline"
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
                              className="flex-1 bg-slate-900 text-white p-1.5 rounded border border-slate-800 text-xs"
                            />
                            <input
                              type="text"
                              value={item.url}
                              onChange={(e) => updateGroupItem(gIndex, iIndex, 'url', e.target.value)}
                              placeholder="URL or /category/slug"
                              className="flex-1 bg-slate-900 text-slate-300 p-1.5 rounded border border-slate-800 text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => removeGroupItem(gIndex, iIndex)}
                              className="p-1 text-slate-500 hover:text-rose-400"
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                    Promotional Spotlight Panel
                  </h3>
                </div>
                <input
                  type="checkbox"
                  checked={data.mega_menu_config?.promo_enabled ?? true}
                  onChange={(e) => handleConfigChange('promo_enabled', e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-700"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Spotlight Banner Image URL</label>
                  <input
                    type="text"
                    value={data.mega_menu_config?.promo_image || ''}
                    onChange={(e) => handleConfigChange('promo_image', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded border border-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Spotlight Headline Title</label>
                  <input
                    type="text"
                    value={data.mega_menu_config?.promo_title || ''}
                    onChange={(e) => handleConfigChange('promo_title', e.target.value)}
                    placeholder="e.g. GeForce RTX 40-Series"
                    className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Spotlight Subtitle / Tagline</label>
                  <textarea
                    rows={2}
                    value={data.mega_menu_config?.promo_subtitle || ''}
                    onChange={(e) => handleConfigChange('promo_subtitle', e.target.value)}
                    placeholder="e.g. Unleash DLSS 3.5 & Full Ray Tracing"
                    className="w-full bg-slate-950 text-slate-200 p-2 rounded border border-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Button Text</label>
                    <input
                      type="text"
                      value={data.mega_menu_config?.promo_btn_text || ''}
                      onChange={(e) => handleConfigChange('promo_btn_text', e.target.value)}
                      placeholder="e.g. Explore Deals"
                      className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Button URL</label>
                    <input
                      type="text"
                      value={data.mega_menu_config?.promo_btn_url || ''}
                      onChange={(e) => handleConfigChange('promo_btn_url', e.target.value)}
                      placeholder="/category/slug"
                      className="w-full bg-slate-950 text-slate-200 p-2 rounded border border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Quick Category Details
              </h4>
              <div className="text-[11px] space-y-1.5 text-slate-400">
                <p>Slug: <strong className="text-white font-mono">{category.slug}</strong></p>
                <p>Direct Children: <strong className="text-white">{category.children?.length || 0} subcategories</strong></p>
                <p>Sort Order: <strong className="text-white">{category.sort_order}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
