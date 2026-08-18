import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function BannerForm({ banner }) {
  const isEdit = !!banner;

  const { data, setData, post, put, processing, errors } = useForm({
    title: banner ? banner.title : '',
    subtitle: banner ? (banner.subtitle || '') : '',
    badge: banner ? (banner.badge || '') : '',
    image: banner ? banner.image : '',
    mobile_image: banner ? (banner.mobile_image || '') : '',
    placement: banner ? (banner.placement || 'hero_slider') : 'hero_slider',
    button_text: banner ? (banner.button_text || 'Explore Deals') : 'Explore Deals',
    button_url: banner ? (banner.button_url || '/catalog') : '/catalog',
    is_active: banner ? Boolean(banner.is_active) : true,
    sort_order: banner ? banner.sort_order : 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(`/admin/banners/${banner.id}`);
    } else {
      post('/admin/banners');
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Banner / Promo' : 'Create Banner / Promo'}>
      <Head title={`${isEdit ? 'Edit' : 'Create'} Banner - TechMarket Admin`} />

      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link href="/admin/banners" className="p-2 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {isEdit ? 'EDIT BANNER / PROMOTION' : 'CREATE BANNER / PROMOTION'}
            </h1>
            <p className="text-xs text-slate-400">Configure slide headline, placement, promotional badge, and target link.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Banner Placement *</label>
              <select
                value={data.placement}
                onChange={(e) => setData('placement', e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500 font-bold"
              >
                <option value="hero_slider">Hero Slider Slide (70% Width)</option>
                <option value="side_banner_top">Side Promo Banner - Top (30% Stacked)</option>
                <option value="side_banner_bottom">Side Promo Banner - Bottom (30% Stacked)</option>
                <option value="promo_banner">Generic Promotional Banner</option>
              </select>
              {errors.placement && <p className="text-rose-400 text-[11px] mt-1">{errors.placement}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Badge Pill Text (e.g. 🔥 14th Gen Gaming)</label>
              <input
                type="text"
                value={data.badge}
                onChange={(e) => setData('badge', e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Banner Title *</label>
            <input
              type="text"
              required
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              placeholder="e.g. ASUS ROG STRIX G16 & RTX 4070 SUPER"
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500"
            />
            {errors.title && <p className="text-rose-400 text-[11px] mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Subtitle / Promotional Details</label>
            <textarea
              rows={2}
              value={data.subtitle}
              onChange={(e) => setData('subtitle', e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Desktop Image URL *</label>
              <input
                type="text"
                required
                value={data.image}
                onChange={(e) => setData('image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500"
              />
              {errors.image && <p className="text-rose-400 text-[11px] mt-1">{errors.image}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Mobile Image URL (Optional)</label>
              <input
                type="text"
                value={data.mobile_image}
                onChange={(e) => setData('mobile_image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Button Text</label>
              <input
                type="text"
                value={data.button_text}
                onChange={(e) => setData('button_text', e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Button Target URL</label>
              <input
                type="text"
                value={data.button_url}
                onChange={(e) => setData('button_url', e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Sort Order</label>
              <input
                type="number"
                value={data.sort_order}
                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="rounded text-blue-500"
              />
              <span>Banner Active & Live</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-[#1c4289] hover:bg-[#15326b] text-white font-black text-xs py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg uppercase"
          >
            <Save className="w-4 h-4" />
            <span>{isEdit ? 'SAVE CHANGES' : 'CREATE BANNER'}</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
