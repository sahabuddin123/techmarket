import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Save, ArrowLeft, Image as ImageIcon, Calendar, Tag, 
  Sparkles, Gift, Check, Trash2, Plus, Search, 
  Eye, HelpCircle, Layers, Globe, ShoppingBag 
} from 'lucide-react';

export default function AdminOfferForm({ offer = null, products = [] }) {
  const isEditing = !!offer;

  const [activeTab, setActiveTab] = useState('basic');
  const [productSearch, setProductSearch] = useState('');

  // Initial form values
  const { data, setData, post, put, processing, errors } = useForm({
    title: offer?.title || '',
    slug: offer?.slug || '',
    short_description: offer?.short_description || '',
    description: offer?.description || '',
    banner_image: offer?.banner_image || '',
    mobile_banner_image: offer?.mobile_banner_image || '',
    thumbnail_image: offer?.thumbnail_image || '',
    banner_file: null,
    mobile_banner_file: null,
    thumbnail_file: null,
    badge_text: offer?.badge_text || 'LIMITED TIME EXCLUSIVE OFFER',
    headline: offer?.headline || '',
    offer_validity_text: offer?.offer_validity_text || '',
    cta_button_text: offer?.cta_button_text || 'BUY NOW →',
    cta_button_url: offer?.cta_button_url || '',
    terms_and_conditions: offer?.terms_and_conditions || '* শর্ত প্রযোজ্য।',
    perks: offer?.perks || [
      { title: 'Best Price Guaranteed', desc: 'Shop genuine hardware at the most competitive price in BD.' },
      { title: 'Special Discount & Gifts', desc: 'Enjoy exclusive gifts, vouchers & instant discount.' },
      { title: 'Movie Ticket Free', desc: 'Get free couple movie ticket on qualifying purchases.' },
    ],
    features: offer?.features || [
      { title: 'Wide Selection of Products', desc: 'Choose from top global tier-1 brands.' },
      { title: 'Best Price & Quick EMI', desc: 'Up to 36 months zero-cost EMI facilities available.' },
      { title: 'Fast & Secure Delivery', desc: 'Express shipping across all 64 districts in Bangladesh.' },
    ],
    start_at: offer?.start_at ? offer.start_at.substring(0, 16) : '',
    end_at: offer?.end_at ? offer.end_at.substring(0, 16) : '',
    status: offer?.status || 'active',
    is_active: offer?.is_active ?? true,
    is_featured: offer?.is_featured ?? false,
    display_order: offer?.display_order || 0,
    show_countdown: offer?.show_countdown ?? true,
    show_date_range: offer?.show_date_range ?? true,
    show_product_count: offer?.show_product_count ?? true,
    card_layout_style: offer?.card_layout_style || 'standard',
    seo_title: offer?.seo_title || '',
    seo_description: offer?.seo_description || '',
    product_ids: offer?.products ? offer.products.map((p) => p.id) : [],
    product_badges: offer?.products ? offer.products.reduce((acc, p) => ({ ...acc, [p.id]: p.pivot?.badge || '' }), {}) : {},
  });

  // Auto-generate slug from title
  const handleTitleChange = (val) => {
    setData((prev) => ({
      ...prev,
      title: val,
      slug: !isEditing ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug,
    }));
  };

  const handlePerkChange = (idx, field, value) => {
    const updated = [...data.perks];
    updated[idx] = { ...updated[idx], [field]: value };
    setData('perks', updated);
  };

  const handleFeatureChange = (idx, field, value) => {
    const updated = [...data.features];
    updated[idx] = { ...updated[idx], [field]: value };
    setData('features', updated);
  };

  const addProduct = (productId) => {
    if (!data.product_ids.includes(productId)) {
      setData((prev) => ({
        ...prev,
        product_ids: [...prev.product_ids, productId],
      }));
    }
  };

  const removeProduct = (productId) => {
    setData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.filter((id) => id !== productId),
    }));
  };

  const setProductBadge = (productId, badgeText) => {
    setData((prev) => ({
      ...prev,
      product_badges: {
        ...prev.product_badges,
        [productId]: badgeText,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      router.post(`/admin/offers/${offer.id}`, {
        _method: 'put',
        ...data,
      });
    } else {
      post('/admin/offers');
    }
  };

  // Filter catalog products for search
  const filteredProducts = products.filter((p) => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const selectedProducts = products.filter((p) => data.product_ids.includes(p.id));

  return (
    <AdminLayout title={isEditing ? `Edit Campaign: ${offer.title}` : 'Create New Campaign'}>
      <Head title={isEditing ? `Edit: ${offer.title} | Admin` : 'Create Campaign | Admin'} />

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-none pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/offers"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                {isEditing ? `Edit Offer: ${offer.title}` : 'Create New Promotional Offer'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure campaign hero copy, countdown, schedules, media, and attached products.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing && (
              <Link
                href={`/offers/${offer.slug}`}
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </Link>
            )}

            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update Campaign' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-1.5 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'basic' ? 'bg-[#0084ff] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>1. Basic Information</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'schedule' ? 'bg-[#0084ff] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>2. Schedule & Dates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'media' ? 'bg-[#0084ff] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>3. Banners & Visuals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'content' ? 'bg-[#0084ff] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. Perks & Story</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'products' ? 'bg-[#0084ff] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>5. Attached Products ({data.product_ids.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'seo' ? 'bg-[#0084ff] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>6. Storefront & SEO</span>
          </button>
        </div>

        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 'basic' && (
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-5 text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              Basic Campaign Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. laptop spider-man"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                  required
                />
                {errors.title && <p className="text-red-400 text-[11px] mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  placeholder="laptop-spider-man"
                  className="w-full bg-slate-50 dark:bg-slate-800 font-mono text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                  required
                />
                {errors.slug && <p className="text-red-400 text-[11px] mt-1">{errors.slug}</p>}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Short Tagline / Summary</label>
              <input
                type="text"
                value={data.short_description}
                onChange={(e) => setData('short_description', e.target.value)}
                placeholder="Couple Movie Ticket on Us With Every Laptop Purchase!"
                className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Campaign Description</label>
              <textarea
                rows={4}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Techland থেকে আপনার পছন্দের Laptop কিনুন, Best Price & Special Discount-এর সাথে পান Spider-Man: Brand New Day-এর Couple Movie Ticket একদম ফ্রি!"
                className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg p-3 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Status</label>
                <select
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none font-bold"
                >
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                  <option value="expired">Expired</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={data.display_order}
                  onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Publicly Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_featured}
                    onChange={(e) => setData('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Featured Offer</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE & DATES */}
        {activeTab === 'schedule' && (
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-5 text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              Campaign Timing & Validity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Campaign Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={data.start_at}
                  onChange={(e) => setData('start_at', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Campaign End Date & Time</label>
                <input
                  type="datetime-local"
                  value={data.end_at}
                  onChange={(e) => setData('end_at', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
                {errors.end_at && <p className="text-red-400 text-[11px] mt-1">{errors.end_at}</p>}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Custom Storefront Validity Text (Optional Override)
              </label>
              <input
                type="text"
                value={data.offer_validity_text}
                onChange={(e) => setData('offer_validity_text', e.target.value)}
                placeholder="e.g. 14 AUGUST – 21 AUGUST 2026"
                className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Leave blank to automatically format start and end dates.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: BANNERS & VISUALS */}
        {activeTab === 'media' && (
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-6 text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              Campaign Media & Banners
            </h3>

            {/* Desktop Hero Banner */}
            <div className="space-y-3">
              <label className="block text-slate-300 font-bold">Desktop Hero Banner (Large)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={data.banner_image}
                    onChange={(e) => setData('banner_image', e.target.value)}
                    placeholder="https://example.com/banner.jpg or /storage/uploads/offers/banner.png"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                  />
                  <div className="mt-2">
                    <span className="text-slate-400 text-[11px]">Or upload image file:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setData('banner_file', e.target.files[0])}
                      className="w-full mt-1 text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                    />
                  </div>
                </div>

                {/* Banner Preview */}
                <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 h-32 flex items-center justify-center">
                  {data.banner_image ? (
                    <img src={data.banner_image} alt="Desktop Banner" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-600 text-[11px]">No desktop banner specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Thumbnail Image */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <label className="block text-slate-300 font-bold">Campaign Card Thumbnail</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={data.thumbnail_image}
                    onChange={(e) => setData('thumbnail_image', e.target.value)}
                    placeholder="https://example.com/thumb.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                  />
                  <div className="mt-2">
                    <span className="text-slate-400 text-[11px]">Or upload file:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setData('thumbnail_file', e.target.files[0])}
                      className="w-full mt-1 text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                    />
                  </div>
                </div>

                <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 h-28 flex items-center justify-center">
                  {data.thumbnail_image ? (
                    <img src={data.thumbnail_image} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-600 text-[11px]">Thumbnail preview (defaults to banner if empty)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PERKS & STORY */}
        {activeTab === 'content' && (
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-6 text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              Promotional Content, Headline & Highlights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Badge Pill Text</label>
                <input
                  type="text"
                  value={data.badge_text}
                  onChange={(e) => setData('badge_text', e.target.value)}
                  placeholder="e.g. LIMITED TIME LAPTOP OFFER"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Main Campaign Headline</label>
                <input
                  type="text"
                  value={data.headline}
                  onChange={(e) => setData('headline', e.target.value)}
                  placeholder="LAPTOP কিনলেই SPIDER-MAN MOVIE TICKET FREE!"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Action Button Text</label>
                <input
                  type="text"
                  value={data.cta_button_text}
                  onChange={(e) => setData('cta_button_text', e.target.value)}
                  placeholder="BUY LAPTOP NOW →"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Terms Footnote Notice</label>
                <input
                  type="text"
                  value={data.terms_and_conditions}
                  onChange={(e) => setData('terms_and_conditions', e.target.value)}
                  placeholder="* শর্ত প্রযোজ্য।"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 3 Key Perks Editor */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                3 Key Campaign Perks (Displayed in Highlights Grid)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.perks.map((perk, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-red-400 uppercase">Perk #{idx + 1}</span>
                    <input
                      type="text"
                      value={perk.title}
                      onChange={(e) => handlePerkChange(idx, 'title', e.target.value)}
                      placeholder="Title"
                      className="w-full bg-slate-900 text-white rounded px-2.5 py-1.5 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={perk.desc}
                      onChange={(e) => handlePerkChange(idx, 'desc', e.target.value)}
                      placeholder="Description"
                      className="w-full bg-slate-900 text-white rounded px-2.5 py-1.5 border border-slate-200/80 dark:border-slate-800/80 text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ATTACHED PRODUCTS */}
        {activeTab === 'products' && (
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Campaign Eligible Products ({data.product_ids.length} Attached)
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Attach products that qualify for this campaign.
                </p>
              </div>

              {/* Product Catalog Search */}
              <div className="relative min-w-[260px]">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search catalog to add..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg pl-8 pr-3 py-1.5 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Live Catalog Search Results Dropdown */}
            {productSearch.trim().length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-1">
                  Catalog Search Matches
                </span>
                {filteredProducts.slice(0, 10).map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <img src={prod.image || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=50'} alt="" className="w-8 h-8 object-cover rounded bg-slate-50 dark:bg-slate-800" />
                      <div>
                        <div className="font-bold text-white text-xs truncate max-w-sm">{prod.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">৳{Number(prod.price).toLocaleString()} • SKU: {prod.sku || 'N/A'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProduct(prod.id)}
                      disabled={data.product_ids.includes(prod.id)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        data.product_ids.includes(prod.id)
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {data.product_ids.includes(prod.id) ? 'Added' : 'Add to Offer'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Attached Products List */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                Currently Attached Products
              </span>

              {selectedProducts.length > 0 ? (
                <div className="space-y-2">
                  {selectedProducts.map((prod, idx) => (
                    <div
                      key={prod.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 text-xs w-5">#{idx + 1}</span>
                        <img src={prod.image || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=50'} alt="" className="w-10 h-10 object-cover rounded bg-slate-900 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate max-w-xs md:max-w-md">{prod.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">৳{Number(prod.price).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Custom Badge Tag */}
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={data.product_badges[prod.id] || ''}
                            onChange={(e) => setProductBadge(prod.id, e.target.value)}
                            placeholder="Custom Badge (e.g. FREE TICKET)"
                            className="bg-slate-900 text-white rounded px-2.5 py-1 text-[11px] border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none w-44"
                          />
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeProduct(prod.id)}
                          className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  No products attached yet. Search above to add qualifying hardware products.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: STOREFRONT & SEO */}
        {activeTab === 'seo' && (
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-5 text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              Storefront Toggles & SEO Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <input
                  type="checkbox"
                  checked={data.show_countdown}
                  onChange={(e) => setData('show_countdown', e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-200 dark:border-slate-700"
                />
                <span className="text-slate-300 font-bold">Show Live Countdown</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <input
                  type="checkbox"
                  checked={data.show_date_range}
                  onChange={(e) => setData('show_date_range', e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-200 dark:border-slate-700"
                />
                <span className="text-slate-300 font-bold">Show Date Range</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <input
                  type="checkbox"
                  checked={data.show_product_count}
                  onChange={(e) => setData('show_product_count', e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-200 dark:border-slate-700"
                />
                <span className="text-slate-300 font-bold">Show Product Count</span>
              </label>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <div>
                <label className="block text-slate-300 font-bold mb-1">SEO Meta Title</label>
                <input
                  type="text"
                  value={data.seo_title}
                  onChange={(e) => setData('seo_title', e.target.value)}
                  placeholder="Laptop Spider-Man Offer | TechMarket BD"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={data.seo_description}
                  onChange={(e) => setData('seo_description', e.target.value)}
                  placeholder="Get free movie ticket on purchasing selected gaming and ultrabook laptops at TechMarket BD."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-white rounded-lg p-3 border border-slate-200/80 dark:border-slate-800/80 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </AdminLayout>
  );
}
