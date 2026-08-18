import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical, FileText,
  Search, HelpCircle, Table as TableIcon, Layers, Settings, Eye
} from 'lucide-react';
import MediaPicker from '@/Components/Admin/MediaPicker';

export default function CategoryForm({ categories = [], category = null, specGroups = [], products = [] }) {
  const isEdit = !!category;
  const [activeTab, setActiveTab] = useState('basic');

  const { data, setData, post, put, processing, errors } = useForm({
    name: category ? category.name : '',
    slug: category ? (category.slug || '') : '',
    page_title: category ? (category.page_title || '') : '',
    subtitle: category ? (category.subtitle || '') : '',
    seo_title: category ? (category.seo_title || '') : '',
    meta_description: category ? (category.meta_description || '') : '',
    meta_keywords: category ? (category.meta_keywords || '') : '',
    seo_intro: category ? (category.seo_intro || '') : '',
    sidebar_visible: category ? Boolean(category.sidebar_visible ?? true) : true,
    default_sort: category ? (category.default_sort || 'latest') : 'latest',
    icon: category ? (category.icon || '') : 'Package',
    image: category ? (category.image || '') : '',
    parent_id: category ? (category.parent_id || '') : '',
    is_featured: category ? Boolean(category.is_featured) : true,
    is_nav_visible: category ? Boolean(category.is_nav_visible) : true,
    sort_order: category ? category.sort_order : 0,
    content_sections: category?.content_sections || category?.contentSections || [],
    price_tables: category?.price_tables || category?.priceTables || [],
    faqs: category?.faqs || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(`/admin/categories/${category.id}`);
    } else {
      post('/admin/categories');
    }
  };

  // Content Sections Handlers
  const addContentSection = () => {
    setData('content_sections', [
      ...data.content_sections,
      {
        heading: '',
        section_type: 'rich_text',
        content: '',
        sort_order: data.content_sections.length,
        is_active: true,
      }
    ]);
  };

  const updateContentSection = (idx, field, value) => {
    const updated = [...data.content_sections];
    updated[idx] = { ...updated[idx], [field]: value };
    setData('content_sections', updated);
  };

  const removeContentSection = (idx) => {
    setData('content_sections', data.content_sections.filter((_, i) => i !== idx));
  };

  // Price Table Handlers
  const addPriceTableRow = () => {
    setData('price_tables', [
      ...data.price_tables,
      {
        product_id: '',
        product_name: '',
        price: '',
        specs: '',
        custom_link: '',
        sort_order: data.price_tables.length,
        is_active: true,
      }
    ]);
  };

  const updatePriceTableRow = (idx, field, value) => {
    const updated = [...data.price_tables];
    const row = { ...updated[idx], [field]: value };

    // Auto fill name/price when product is chosen
    if (field === 'product_id' && value) {
      const selectedProd = products.find(p => String(p.id) === String(value));
      if (selectedProd) {
        if (!row.product_name) row.product_name = selectedProd.title;
        if (!row.price) row.price = String(selectedProd.price);
      }
    }

    updated[idx] = row;
    setData('price_tables', updated);
  };

  const removePriceTableRow = (idx) => {
    setData('price_tables', data.price_tables.filter((_, i) => i !== idx));
  };

  // FAQ Handlers
  const addFaq = () => {
    setData('faqs', [
      ...data.faqs,
      {
        question: '',
        answer: '',
        sort_order: data.faqs.length,
        is_active: true,
      }
    ]);
  };

  const updateFaq = (idx, field, value) => {
    const updated = [...data.faqs];
    updated[idx] = { ...updated[idx], [field]: value };
    setData('faqs', updated);
  };

  const removeFaq = (idx) => {
    setData('faqs', data.faqs.filter((_, i) => i !== idx));
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Category' : 'Create Category'}>
      <Head title={`${isEdit ? 'Edit' : 'Create'} Category - TechMarket Admin`} />

      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link href="/admin/categories" className="p-2 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                {isEdit ? `EDIT CATEGORY: ${category.name}` : 'CREATE NEW CATEGORY'}
              </h1>
              <p className="text-xs text-slate-400">Configure basic details, storefront layout, SEO, dynamic price lists, and FAQs.</p>
            </div>
          </div>

          {isEdit && category.slug && (
            <a
              href={`/category/${category.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Live Shop Page</span>
            </a>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
          {[
            { key: 'basic', label: '1. Basic Info', icon: Settings },
            { key: 'seo', label: '2. Shop & SEO Settings', icon: Search },
            { key: 'content', label: `3. SEO Content Sections (${data.content_sections.length})`, icon: FileText },
            { key: 'price_table', label: `4. Dynamic Price Table (${data.price_tables.length})`, icon: TableIcon },
            { key: 'faqs', label: `5. Category FAQs (${data.faqs.length})`, icon: HelpCircle },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-500" />
                <span>Basic Category Configuration</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. Air Conditioner"
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                  />
                  {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">URL Slug (Auto-generated if blank)</label>
                  <input
                    type="text"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    placeholder="e.g. air-conditioner"
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                  />
                  {errors.slug && <p className="text-rose-400 text-[11px] mt-1">{errors.slug}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Parent Category</label>
                  <select
                    value={data.parent_id}
                    onChange={(e) => setData('parent_id', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                  >
                    <option value="">None / Top Level Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Lucide Icon Name</label>
                  <input
                    type="text"
                    value={data.icon}
                    onChange={(e) => setData('icon', e.target.value)}
                    placeholder="Wind, Laptop, Cpu, Monitor, Zap..."
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <MediaPicker
                    label="Category Banner Image"
                    value={data.image}
                    onChange={(url) => setData('image', url)}
                    placeholder="Select category banner from Media Library or enter image URL..."
                    allowClear={true}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={data.sort_order}
                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-3 border-t border-slate-800">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_featured}
                    onChange={(e) => setData('is_featured', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_nav_visible}
                    onChange={(e) => setData('is_nav_visible', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Visible in Mega Navigation Menu</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: SHOP & SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-500" />
                <span>Shop Page Layout & Meta SEO</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Public Page Heading (H1)</label>
                  <input
                    type="text"
                    value={data.page_title}
                    onChange={(e) => setData('page_title', e.target.value)}
                    placeholder="e.g. Air Conditioner Price in Bangladesh 2026"
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Browser Title (SEO Title)</label>
                  <input
                    type="text"
                    value={data.seo_title}
                    onChange={(e) => setData('seo_title', e.target.value)}
                    placeholder="e.g. Best Air Conditioner Price in Bangladesh | TechMarket BD"
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Category Subtitle / Description Snippet</label>
                <textarea
                  rows={2}
                  value={data.subtitle}
                  onChange={(e) => setData('subtitle', e.target.value)}
                  placeholder="Short introductory summary displayed beneath the category title..."
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Meta Description (Search Engines)</label>
                <textarea
                  rows={2}
                  value={data.meta_description}
                  onChange={(e) => setData('meta_description', e.target.value)}
                  placeholder="Comprehensive description for search results..."
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">SEO Top Intro / Editorial Content (Supports HTML)</label>
                <textarea
                  rows={3}
                  value={data.seo_intro}
                  onChange={(e) => setData('seo_intro', e.target.value)}
                  placeholder="<p>An Air Conditioner is an indispensable home appliance for modern living in Bangladesh...</p>"
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Default Sorting Order</label>
                  <select
                    value={data.default_sort}
                    onChange={(e) => setData('default_sort', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:border-amber-500"
                  >
                    <option value="latest">Latest / Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="bestseller">Best Selling / Featured</option>
                    <option value="discount">Highest Discount</option>
                    <option value="title_asc">Title: A to Z</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.sidebar_visible}
                      onChange={(e) => setData('sidebar_visible', e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                    />
                    <span>Show Left Filter Sidebar</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC CONTENT SECTIONS BUILDER */}
          {activeTab === 'content' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Dynamic Rich Text & SEO Content Sections</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Build dynamic editorial sections matching the reference screenshot (e.g. "Lowest Price AC", "Popular Brands", "Buying Guide").
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addContentSection}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              {data.content_sections.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 font-bold">No dynamic content sections added yet.</p>
                  <button
                    type="button"
                    onClick={addContentSection}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    + Click here to add the first section
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.content_sections.map((sec, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={sec.heading || ''}
                            onChange={(e) => updateContentSection(idx, 'heading', e.target.value)}
                            placeholder="Section Heading (e.g. Lowest Price Air Conditioner in BD)"
                            className="flex-1 bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 focus:border-amber-500 font-bold text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-slate-400 text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sec.is_active !== false}
                              onChange={(e) => updateContentSection(idx, 'is_active', e.target.checked)}
                              className="rounded text-amber-500 bg-slate-900 border-slate-800"
                            />
                            <span>Active</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => removeContentSection(idx)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded"
                            title="Remove Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <textarea
                          rows={4}
                          value={sec.content || ''}
                          onChange={(e) => updateContentSection(idx, 'content', e.target.value)}
                          placeholder="Write rich paragraph content, buyer guidance, or HTML markup for this section..."
                          className="w-full bg-slate-900 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500 text-xs font-sans"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DYNAMIC PRICE TABLE BUILDER */}
          {activeTab === 'price_table' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-amber-500" />
                    <span>Dynamic Category Price List Table</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage table rows rendered on the public page matching the reference screenshot. Link to real products or specify custom rows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPriceTableRow}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Table Row</span>
                </button>
              </div>

              {data.price_tables.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                  <TableIcon className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 font-bold">No price table rows configured yet.</p>
                  <button
                    type="button"
                    onClick={addPriceTableRow}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    + Click here to add product rows to the price table
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.price_tables.map((row, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Select Product or Enter Name</label>
                        <input
                          type="text"
                          value={row.product_name || ''}
                          onChange={(e) => updatePriceTableRow(idx, 'product_name', e.target.value)}
                          placeholder="e.g. Gree GS-18XPUV32 Inverter AC"
                          className="w-full bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 focus:border-amber-500 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Linked Product (Optional)</label>
                        <select
                          value={row.product_id || ''}
                          onChange={(e) => updatePriceTableRow(idx, 'product_id', e.target.value)}
                          className="w-full bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 focus:border-amber-500 text-xs"
                        >
                          <option value="">— Custom Row —</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Price (৳)</label>
                        <input
                          type="text"
                          value={row.price || ''}
                          onChange={(e) => updatePriceTableRow(idx, 'price', e.target.value)}
                          placeholder="68500"
                          className="w-full bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 focus:border-amber-500 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Key Specs</label>
                        <input
                          type="text"
                          value={row.specs || ''}
                          onChange={(e) => updatePriceTableRow(idx, 'specs', e.target.value)}
                          placeholder="1.5 Ton, Inverter"
                          className="w-full bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 focus:border-amber-500 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => removePriceTableRow(idx)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded"
                          title="Remove Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DYNAMIC CATEGORY FAQS BUILDER */}
          {activeTab === 'faqs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>Dynamic Category FAQs</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Frequently Asked Questions with answers rendered in an expandable accordion below the category products.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFaq}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ Item</span>
                </button>
              </div>

              {data.faqs.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                  <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 font-bold">No FAQ items added for this category yet.</p>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    + Click here to add the first FAQ
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                            Q{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={faq.question || ''}
                            onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                            placeholder="Question (e.g. Which Air Conditioner brand is best in Bangladesh?)"
                            className="flex-1 bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 focus:border-amber-500 font-bold text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFaq(idx)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded"
                          title="Remove FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          value={faq.answer || ''}
                          onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                          placeholder="Comprehensive, helpful answer for customers..."
                          className="w-full bg-slate-900 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
            <Link
              href="/admin/categories"
              className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg flex items-center space-x-1.5 shadow-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'SAVING CATEGORY...' : (isEdit ? 'UPDATE CATEGORY & CONTENT' : 'CREATE CATEGORY')}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
