import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import MediaPicker from '../../../Components/Admin/MediaPicker';
import { 
  ArrowLeft, Save, Image as ImageIcon, Sparkles, 
  ExternalLink, Layers, CheckCircle, Info, Eye, Smartphone, Monitor
} from 'lucide-react';

const PLACEMENT_INFO = {
  hero_slider: {
    label: 'Hero Slider Slide (70% Width)',
    recommendedDesktop: '980 × 480 px',
    recommendedMobile: '600 × 400 px',
    aspectRatio: '16 : 7.8 (Desktop) / 3 : 2 (Mobile)',
    description: 'Main rotating carousel banner on the homepage left section (70% column).',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    maxSize: 'Under 350 KB (WebP or JPG)',
  },
  side_banner_top: {
    label: 'Side Promo Banner - Top (30% Stacked)',
    recommendedDesktop: '420 × 225 px',
    recommendedMobile: '420 × 225 px',
    aspectRatio: '16 : 8.5 (~1.85 : 1)',
    description: 'Upper promo card on the homepage right sidebar (30% stacked column).',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    maxSize: 'Under 180 KB (WebP or JPG)',
  },
  side_banner_bottom: {
    label: 'Side Promo Banner - Bottom (30% Stacked)',
    recommendedDesktop: '420 × 225 px',
    recommendedMobile: '420 × 225 px',
    aspectRatio: '16 : 8.5 (~1.85 : 1)',
    description: 'Lower promo card on the homepage right sidebar (30% stacked column).',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    maxSize: 'Under 180 KB (WebP or JPG)',
  },
  promo_banner: {
    label: 'Generic / Category Strip Banner',
    recommendedDesktop: '1400 × 280 px',
    recommendedMobile: '600 × 250 px',
    aspectRatio: '5 : 1 (Desktop)',
    description: 'Full-width promotional strip or category section banner.',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    maxSize: 'Under 300 KB (WebP or JPG)',
  },
};

const QUICK_URLS = [
  { label: 'All Products (/catalog)', url: '/catalog' },
  { label: 'Exclusive Offers (/offers)', url: '/offers' },
  { label: 'PC Builder Studio (/pc-builder)', url: '/pc-builder' },
  { label: 'CCTV Estimator (/cctv-estimator)', url: '/cctv-estimator' },
  { label: 'Servicing & Repair (/servicing)', url: '/servicing' },
  { label: 'Brands Directory (/brands)', url: '/brands' },
];

export default function BannerForm({ banner }) {
  const isEdit = !!banner;
  const [previewTab, setPreviewTab] = useState('desktop');

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

  const activePlacement = PLACEMENT_INFO[data.placement] || PLACEMENT_INFO.hero_slider;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(`/admin/banners/${banner.id}`);
    } else {
      post('/admin/banners');
    }
  };

  return (
    <AdminShell>
      <Head title={`${isEdit ? 'Edit' : 'Create'} Banner - TechMarket Admin`} />

      <div className="space-y-6 max-w-5xl mx-auto">
        <AdminPageHeader
          title={isEdit ? 'Edit Banner / Promotion' : 'Create Banner / Promotion'}
          subtitle="Configure promotional artwork, banner placement, dimensions, badge, and CTA link."
          actions={
            <Link
              href="/admin/banners"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Banners</span>
            </Link>
          }
        />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Placement & Sizing Alert Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Placement & Target Slot</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 text-xs">
                    Banner Placement *
                  </label>
                  <select
                    value={data.placement}
                    onChange={(e) => setData('placement', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all focus:outline-hidden"
                  >
                    <option value="hero_slider">Hero Slider Slide (70% Left Main Column)</option>
                    <option value="side_banner_top">Side Promo Banner - Top (30% Stacked Right)</option>
                    <option value="side_banner_bottom">Side Promo Banner - Bottom (30% Stacked Right)</option>
                    <option value="promo_banner">Generic / Category Strip Banner</option>
                  </select>
                  {errors.placement && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.placement}</p>}
                </div>

                {/* Dimension Requirement Badge Box */}
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 text-xs font-heading">
                      Recommended Dimensions for {activePlacement.label}:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                      <div className="text-[10.5px] text-slate-500 font-medium">Desktop Resolution:</div>
                      <div className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {activePlacement.recommendedDesktop}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Aspect: {activePlacement.aspectRatio}</div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                      <div className="text-[10.5px] text-slate-500 font-medium">Mobile Resolution:</div>
                      <div className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {activePlacement.recommendedMobile}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Max size: {activePlacement.maxSize}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Artwork Upload & Media Library */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Artwork & Media Assets</span>
              </h3>

              <div className="space-y-4">
                {/* Desktop Image */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs">
                      Desktop Artwork URL * <span className="font-mono text-indigo-600 dark:text-indigo-400 font-normal">({activePlacement.recommendedDesktop})</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <MediaPicker
                      value={data.image}
                      onChange={(url) => setData('image', url)}
                      folder="banners"
                      label="Desktop Banner"
                      buttonText="Choose / Upload Desktop Artwork"
                    />
                    <input
                      type="text"
                      required
                      value={data.image}
                      onChange={(e) => setData('image', e.target.value)}
                      placeholder="e.g. /storage/media/banners/banner1.webp or https://..."
                      className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                  {errors.image && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.image}</p>}
                </div>

                {/* Mobile Image */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs">
                      Mobile Artwork URL (Optional) <span className="font-mono text-slate-400 font-normal">({activePlacement.recommendedMobile})</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <MediaPicker
                      value={data.mobile_image}
                      onChange={(url) => setData('mobile_image', url)}
                      folder="banners"
                      label="Mobile Banner"
                      buttonText="Choose / Upload Mobile Artwork"
                    />
                    <input
                      type="text"
                      value={data.mobile_image}
                      onChange={(e) => setData('mobile_image', e.target.value)}
                      placeholder="Optional mobile crop image..."
                      className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Text Content & Messaging */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Text Messaging & Call-to-Action</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Promotional Badge Pill (Optional)
                    </label>
                    <input
                      type="text"
                      value={data.badge}
                      onChange={(e) => setData('badge', e.target.value)}
                      placeholder="e.g. 🔥 Special Offer / 14th Gen"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Banner Main Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="e.g. ASUS ROG STRIX G16 & RTX 4070 SUPER"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                  />
                  {errors.title && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Subtitle / Promotional Summary
                  </label>
                  <textarea
                    rows={2}
                    value={data.subtitle}
                    onChange={(e) => setData('subtitle', e.target.value)}
                    placeholder="e.g. Experience next-level gaming performance with official brand warranty..."
                    className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={data.button_text}
                      onChange={(e) => setData('button_text', e.target.value)}
                      placeholder="e.g. Explore Deals"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Button Target URL
                    </label>
                    <input
                      type="text"
                      value={data.button_url}
                      onChange={(e) => setData('button_url', e.target.value)}
                      placeholder="e.g. /catalog or /offers/flash-sale"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Quick Link Chips */}
                <div>
                  <div className="text-[11px] text-slate-400 font-medium mb-1.5">Quick Target Links:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_URLS.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setData('button_url', q.url)}
                        className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[10.5px] font-medium transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mockup Preview & Publish Card (1 Col) */}
          <div className="space-y-6">
            
            {/* Publish & Status Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading border-b border-slate-100 dark:border-slate-800 pb-2.5">
                Visibility & Publish
              </h3>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Active & Live</div>
                  <div className="text-[11px] text-slate-500">Show on public storefront</div>
                </div>
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                />
              </label>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Banner'}</span>
              </button>
            </div>

            {/* Live Interactive Artwork Mockup */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-heading">
                    Live Banner Mockup
                  </h3>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('desktop')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      previewTab === 'desktop'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('mobile')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      previewTab === 'mobile'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Artwork Box Preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700/80 aspect-video flex items-center justify-center">
                {(previewTab === 'mobile' && data.mobile_image ? data.mobile_image : data.image) ? (
                  <img
                    src={previewTab === 'mobile' && data.mobile_image ? data.mobile_image : data.image}
                    alt={data.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-500 p-4 space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                    <div className="text-[11px] font-medium">Select an image to preview</div>
                  </div>
                )}

                {/* Optional Text Overlay Representation */}
                {(data.title || data.badge) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end text-white">
                    {data.badge && (
                      <span className="inline-block self-start px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-500 text-slate-950 mb-1">
                        {data.badge}
                      </span>
                    )}
                    {data.title && (
                      <div className="font-bold text-xs truncate drop-shadow">
                        {data.title}
                      </div>
                    )}
                    {data.button_text && (
                      <span className="mt-1.5 inline-block self-start px-2.5 py-1 rounded bg-[#0084ff] text-[9.5px] font-bold shadow-xs">
                        {data.button_text} →
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono text-center">
                Format: {activePlacement.label.split(' ')[0]} • Ratio {activePlacement.aspectRatio.split(' ')[0]}
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
