import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import SectionCard from '../../../Components/Admin/SectionCard';
import MediaPicker from '../../../Components/Admin/MediaPicker';
import { 
  Sliders, Save, Globe, Image as ImageIcon, Store, Search, 
  Phone, CreditCard, Truck, Activity, RefreshCw, CheckCircle2,
  AlertTriangle, ShieldCheck, Database, Server, HardDrive, Sparkles
} from 'lucide-react';

export default function AdminGlobalSettings({ settings = {}, systemInfo = {} }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'general';
    }
    return 'general';
  });
  const [isPurgingCache, setIsPurgingCache] = useState(false);

  const { data, setData, post, processing, wasSuccessful } = useForm({
    // 1. General & Storefront
    site_name: settings.site_name || 'TechMarket BD',
    site_tagline: settings.site_tagline || 'Leading Computer & Gaming Hardware Store in Bangladesh',
    site_url: settings.site_url || 'https://techmarketbd.com',
    storefront_version: settings.storefront_version || 'v1',
    storefront_v2_promo_title: settings.storefront_v2_promo_title || 'Professional CCTV Installation Service',
    storefront_v2_promo_bullets: settings.storefront_v2_promo_bullets || 'Residential, Office, Factory, Apartment, Shop, All Over Bangladesh',
    storefront_v2_promo_cta_text: settings.storefront_v2_promo_cta_text || 'Book Installation',
    storefront_v2_promo_cta_url: settings.storefront_v2_promo_cta_url || '/servicing',
    storefront_v2_stat1_num: settings.storefront_v2_stat1_num || '5000+',
    storefront_v2_stat1_label: settings.storefront_v2_stat1_label || 'Happy Customers',
    storefront_v2_stat2_num: settings.storefront_v2_stat2_num || '10K+',
    storefront_v2_stat2_label: settings.storefront_v2_stat2_label || 'Products Sold',
    storefront_v2_stat3_num: settings.storefront_v2_stat3_num || '50+',
    storefront_v2_stat3_label: settings.storefront_v2_stat3_label || 'Expert Members',
    storefront_v2_stat4_num: settings.storefront_v2_stat4_num || '5+',
    storefront_v2_stat4_label: settings.storefront_v2_stat4_label || 'Years of Trust',
    storefront_v2_show_category_bar: settings.storefront_v2_show_category_bar !== undefined ? (settings.storefront_v2_show_category_bar === '1' || settings.storefront_v2_show_category_bar === true) : true,
    storefront_v2_show_trust_strip: settings.storefront_v2_show_trust_strip !== undefined ? (settings.storefront_v2_show_trust_strip === '1' || settings.storefront_v2_show_trust_strip === true) : true,
    storefront_v2_show_featured: settings.storefront_v2_show_featured !== undefined ? (settings.storefront_v2_show_featured === '1' || settings.storefront_v2_show_featured === true) : true,
    storefront_v2_show_deal_of_day: settings.storefront_v2_show_deal_of_day !== undefined ? (settings.storefront_v2_show_deal_of_day === '1' || settings.storefront_v2_show_deal_of_day === true) : true,
    storefront_v2_show_brands: settings.storefront_v2_show_brands !== undefined ? (settings.storefront_v2_show_brands === '1' || settings.storefront_v2_show_brands === true) : true,
    storefront_v2_show_promo_banner: settings.storefront_v2_show_promo_banner !== undefined ? (settings.storefront_v2_show_promo_banner === '1' || settings.storefront_v2_show_promo_banner === true) : true,
    storefront_v2_show_stats: settings.storefront_v2_show_stats !== undefined ? (settings.storefront_v2_show_stats === '1' || settings.storefront_v2_show_stats === true) : true,
    admin_email: settings.admin_email || 'admin@techmarketbd.com',
    support_email: settings.support_email || 'support@techmarketbd.com',
    support_phone: settings.support_phone || '01700-000000',
    hotline: settings.hotline || '09612-888888',
    company_address: settings.company_address || 'Multiplan Center, Level-6, Shop 608-610, Elephant Road, Dhaka-1205',
    default_currency: settings.default_currency || 'BDT',
    currency_symbol: settings.currency_symbol || '৳',
    default_timezone: settings.default_timezone || 'Asia/Dhaka',
    default_language: settings.default_language || 'en',

    // 2. Branding (Media Library Pickers)
    site_logo: settings.site_logo || '',
    site_logo_dark: settings.site_logo_dark || '',
    site_favicon: settings.site_favicon || '',
    admin_logo: settings.admin_logo || '',
    default_og_image: settings.default_og_image || '',

    // 3. Store & Inventory
    store_name: settings.store_name || 'TechMarket BD Online Shop',
    order_prefix: settings.order_prefix || 'TM-',
    min_order_amount: settings.min_order_amount || '0',
    default_low_stock_threshold: settings.default_low_stock_threshold || '3',
    out_of_stock_behavior: settings.out_of_stock_behavior || 'show_badge',
    allow_guest_checkout: settings.allow_guest_checkout !== undefined ? (settings.allow_guest_checkout === '1' || settings.allow_guest_checkout === true) : true,

    // 4. SEO & Analytics
    default_meta_title: settings.default_meta_title || 'TechMarket BD | Best Computer & Laptop Shop in Bangladesh',
    default_meta_description: settings.default_meta_description || 'Buy authentic Laptops, Desktop PC, Graphics Cards, Processors, and Gaming Accessories at the best price in Bangladesh with official manufacturer warranty from TechMarket BD.',
    default_meta_keywords: settings.default_meta_keywords || 'computer shop bd, pc builder bangladesh, laptop price in bd, graphics card price, techland alternative',
    ga_measurement_id: settings.ga_measurement_id || '',
    gtm_container_id: settings.gtm_container_id || '',
    fb_pixel_id: settings.fb_pixel_id || '',

    // 5. Contact & Social
    showroom_dhaka: settings.showroom_dhaka || 'Multiplan Center, Level-6, Shop 608-610, Elephant Road, Dhaka',
    showroom_idb: settings.showroom_idb || 'IDB Bhaban, Level-3, Agargaon, Dhaka',
    showroom_chittagong: settings.showroom_chittagong || 'Computer City, Agrabad, Chittagong',
    working_hours: settings.working_hours || 'Everyday: 9:30 AM – 8:00 PM (Friday Closed)',
    whatsapp_number: settings.whatsapp_number || '01700000000',
    facebook_url: settings.facebook_url || 'https://facebook.com/techmarketbd',
    messenger_url: settings.messenger_url || 'https://m.me/techmarketbd',
    youtube_url: settings.youtube_url || 'https://youtube.com/@techmarketbd',
    instagram_url: settings.instagram_url || 'https://instagram.com/techmarketbd',
    linkedin_url: settings.linkedin_url || 'https://linkedin.com/company/techmarketbd',

    // 6. Payments
    cod_enabled: settings.cod_enabled !== undefined ? (settings.cod_enabled === '1' || settings.cod_enabled === true) : true,
    cod_title: settings.cod_title || 'Cash on Delivery (COD)',
    cod_instruction: settings.cod_instruction || 'Pay with cash upon delivery to your doorstep across Bangladesh.',
    bkash_enabled: settings.bkash_enabled !== undefined ? (settings.bkash_enabled === '1' || settings.bkash_enabled === true) : true,
    bkash_number: settings.bkash_number || '01700-000000',
    bkash_charge_percent: settings.bkash_charge_percent || '0',
    bkash_instruction: settings.bkash_instruction || 'Send payment via bKash Payment or Checkout Gateway.',
    nagad_enabled: settings.nagad_enabled !== undefined ? (settings.nagad_enabled === '1' || settings.nagad_enabled === true) : true,
    nagad_number: settings.nagad_number || '01800-000000',
    nagad_charge_percent: settings.nagad_charge_percent || '0',
    nagad_instruction: settings.nagad_instruction || 'Send payment via Nagad Merchant Gateway.',

    // 7. Shipping
    shipping_inside_dhaka: settings.shipping_inside_dhaka || '60.00',
    shipping_outside_dhaka: settings.shipping_outside_dhaka || '120.00',
    shipping_express: settings.shipping_express || '150.00',
    free_shipping_threshold: settings.free_shipping_threshold || '50000.00',
    delivery_time_dhaka: settings.delivery_time_dhaka || '24 - 48 Hours',
    delivery_time_outside: settings.delivery_time_outside || '2 - 4 Days',

    // 8. Maintenance
    maintenance_mode: settings.maintenance_mode === '1' || settings.maintenance_mode === true,
    maintenance_message: settings.maintenance_message || 'TechMarket BD is currently undergoing scheduled maintenance and upgrades. We will be back online shortly!',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/settings', {
      preserveScroll: true,
    });
  };

  const handlePurgeCache = () => {
    if (!confirm('Are you sure you want to flush all system application caches?')) return;
    setIsPurgingCache(true);
    router.post('/admin/settings/clear-cache', {}, {
      preserveScroll: true,
      onFinish: () => setIsPurgingCache(false),
    });
  };

  const tabs = [
    { id: 'general', label: '1. General Info', icon: Globe },
    { id: 'storefront', label: '2. Storefront Design', icon: Sparkles },
    { id: 'branding', label: '3. Branding & Media', icon: ImageIcon },
    { id: 'store', label: '4. Store & Inventory', icon: Store },
    { id: 'seo', label: '5. SEO & Analytics', icon: Search },
    { id: 'contact', label: '6. Contact & Social', icon: Phone },
    { id: 'payment', label: '7. Payment Gateways', icon: CreditCard },
    { id: 'shipping', label: '8. Delivery & Shipping', icon: Truck },
    { id: 'system', label: '9. System & Diagnostics', icon: Activity },
  ];

  return (
    <AdminLayout title="Global System Settings">
      <Head title="System & Store Settings - TechMarket BD Admin" />

      <div className="space-y-6 text-xs">
        {/* Header Bar */}
        <PageHeader
          title="Global System Configuration"
          subtitle="Manage store identity, branding, payment methods, delivery charges, SEO tags, and system telemetry."
          badge="Core Configuration"
          actions={
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={handlePurgeCache}
                disabled={isPurgingCache}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPurgingCache ? 'animate-spin' : ''}`} />
                <span>{isPurgingCache ? 'Purging Cache...' : 'Flush Cache'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={processing}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving Settings...' : 'Save Changes'}</span>
              </button>
            </div>
          }
        />

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-x-auto admin-scrollbar shadow-xs">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* SETTINGS FORM BODY */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <SectionCard title="General Store Identity & Localization" subtitle="Store naming, official domains, headquarters address, and default currency" icon={Globe}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Site / Store Name *</label>
                    <input
                      type="text"
                      required
                      value={data.site_name}
                      onChange={(e) => setData('site_name', e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Public Canonical URL</label>
                    <input
                      type="url"
                      value={data.site_url}
                      onChange={(e) => setData('site_url', e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Site Tagline / Slogan</label>
                  <input
                    type="text"
                    value={data.site_tagline}
                    onChange={(e) => setData('site_tagline', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Currency Code</label>
                    <input
                      type="text"
                      value={data.default_currency}
                      onChange={(e) => setData('default_currency', e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Currency Symbol</label>
                    <input
                      type="text"
                      value={data.currency_symbol}
                      onChange={(e) => setData('currency_symbol', e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Timezone</label>
                    <input
                      type="text"
                      value={data.default_timezone}
                      onChange={(e) => setData('default_timezone', e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Headquarters Physical Address</label>
                  <textarea
                    rows={2}
                    value={data.company_address}
                    onChange={(e) => setData('company_address', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 2: STOREFRONT DESIGN / APPEARANCE */}
          {activeTab === 'storefront' && (
            <SectionCard 
              title="Storefront Design & Appearance Version" 
              subtitle="Choose which storefront presentation version is dynamically displayed to public customers across all devices." 
              icon={Sparkles}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Option 1: Version 1 (Classic Storefront) */}
                  <div 
                    onClick={() => setData('storefront_version', 'v1')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      data.storefront_version === 'v1'
                        ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {data.storefront_version === 'v1' && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Visual Mock Preview Box */}
                      <div className="h-28 rounded-xl bg-[#f4f7f9] border border-slate-300/40 p-2.5 overflow-hidden flex flex-col justify-between select-none">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-[9px] font-mono text-slate-500 pl-1 truncate">Classic (v1)</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1 h-12">
                          <div className="col-span-8 bg-[#0a0e17] rounded p-1 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white/80">Carousel</span>
                          </div>
                          <div className="col-span-4 flex flex-col gap-0.5">
                            <div className="h-1/2 bg-blue-100 rounded flex items-center justify-center text-[7px] font-bold text-blue-900">Promo 1</div>
                            <div className="h-1/2 bg-indigo-100 rounded flex items-center justify-center text-[7px] font-bold text-indigo-900">Promo 2</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <div className="h-2 bg-slate-200 rounded" />
                          <div className="h-2 bg-slate-200 rounded" />
                          <div className="h-2 bg-slate-200 rounded" />
                          <div className="h-2 bg-slate-200 rounded" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-black text-white">Version 1 — Classic</h4>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">v1</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Original retail ecommerce design with multi-banner carousel and dense grid.
                        </p>
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-slate-300 border-t border-slate-800/80 pt-3">
                        <li className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Multi-banner carousel & category filter tree</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Classic 4-column category listing</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="storefront_version"
                          value="v1"
                          checked={data.storefront_version === 'v1'}
                          onChange={() => setData('storefront_version', 'v1')}
                          className="text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                        />
                        <span>{data.storefront_version === 'v1' ? 'Selected' : 'Switch to v1'}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setData('storefront_version', 'v1')}
                        className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                          data.storefront_version === 'v1'
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {data.storefront_version === 'v1' ? 'Active' : 'Select'}
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Version 2 (Modern Tech Storefront) */}
                  <div 
                    onClick={() => setData('storefront_version', 'v2')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      data.storefront_version === 'v2'
                        ? 'bg-slate-900 border-sky-400 shadow-lg shadow-sky-400/10'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {data.storefront_version === 'v2' && (
                      <div className="absolute top-0 right-0 bg-sky-400 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Visual Mock Preview Box */}
                      <div className="h-28 rounded-xl bg-[#080f1e] border border-blue-900/40 p-2.5 overflow-hidden flex flex-col justify-between relative select-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-rose-400" />
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-[9px] font-mono text-sky-400 pl-1 truncate">Modern (v2)</span>
                          </div>
                          <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-sky-400/20 text-sky-300">Modern</span>
                        </div>
                        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 rounded p-1 flex items-center justify-between border border-blue-800/40">
                          <div>
                            <div className="text-[7px] font-bold text-sky-400">SMART TECH</div>
                          </div>
                          <div className="w-6 h-6 rounded bg-sky-500/20 text-[6px] text-sky-300 flex items-center justify-center">
                            CAM
                          </div>
                        </div>
                        <div className="bg-white rounded p-0.5 shadow-xs flex items-center justify-between">
                          <div className="w-3 h-1.5 bg-blue-100 rounded" />
                          <div className="w-3 h-1.5 bg-blue-100 rounded" />
                          <div className="w-3 h-1.5 bg-blue-100 rounded" />
                          <div className="w-3 h-1.5 bg-blue-100 rounded" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-black text-white">Version 2 — Modern Tech</h4>
                          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-mono font-bold">v2</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Dark navy animated hero, floating categories, and refined electronics store layout.
                        </p>
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-slate-300 border-t border-slate-800/80 pt-3">
                        <li className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                          <span>Animated hero slider & floating bar</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                          <span>Mobile slide-over filter drawer</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="storefront_version"
                          value="v2"
                          checked={data.storefront_version === 'v2'}
                          onChange={() => setData('storefront_version', 'v2')}
                          className="text-sky-400 focus:ring-sky-400 bg-slate-900 border-slate-700"
                        />
                        <span>{data.storefront_version === 'v2' ? 'Selected' : 'Switch to v2'}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setData('storefront_version', 'v2')}
                        className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                          data.storefront_version === 'v2'
                            ? 'bg-sky-400 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {data.storefront_version === 'v2' ? 'Active' : 'Select'}
                      </button>
                    </div>
                  </div>

                  {/* Option 3: Version 3 (TechJhuli Gadget Hub) */}
                  <div 
                    onClick={() => setData('storefront_version', 'v3')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      data.storefront_version === 'v3'
                        ? 'bg-slate-900 border-[#0153FD] shadow-lg shadow-blue-500/20'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {data.storefront_version === 'v3' && (
                      <div className="absolute top-0 right-0 bg-[#0153FD] text-white font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Visual Mock Preview Box */}
                      <div className="h-28 rounded-xl bg-white border border-[#8BB1FF] p-2.5 overflow-hidden flex flex-col justify-between relative select-none shadow-[0_0_10px_#CAE0FF]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="text-[9px] font-black text-[#0153FD]">Tech</span>
                            <span className="text-[9px] font-black text-[#002268]">Jhuli</span>
                          </div>
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-[#0153FD] text-white">v3 Hub</span>
                        </div>
                        {/* Section Card Wireframe with Floating Pill */}
                        <div className="relative bg-[#F4F7FC] border border-[#8BB1FF]/70 rounded-lg p-2 text-center">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 bg-[#0153FD] text-white rounded-full text-[6px] font-black">
                            Trending Gadgets
                          </div>
                          <div className="grid grid-cols-3 gap-1 pt-1">
                            <div className="h-4 bg-white rounded border border-slate-200" />
                            <div className="h-4 bg-white rounded border border-slate-200" />
                            <div className="h-4 bg-white rounded border border-slate-200" />
                          </div>
                        </div>
                        {/* Blue gradient footer line */}
                        <div className="h-2 rounded bg-gradient-to-r from-[#0153FD] to-[#002268]" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-black text-white">Version 3 — TechJhuli Hub</h4>
                          <span className="px-2 py-0.5 rounded bg-[#0153FD]/20 text-blue-400 text-[10px] font-mono font-bold">v3 • New</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Signature TechJhuli gadget hub UI with electric blue colors, section card glow boxes, floating pill badges, and royal blue footer.
                        </p>
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-slate-300 border-t border-slate-800/80 pt-3">
                        <li className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0153FD] shrink-0" />
                          <span>Exact color tokens (#0153FD, #002268, #8BB1FF)</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0153FD] shrink-0" />
                          <span>Floating pill section headers & card glow boxes</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0153FD] shrink-0" />
                          <span>Black discount pills & full-width blue Add to Cart</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="storefront_version"
                          value="v3"
                          checked={data.storefront_version === 'v3'}
                          onChange={() => setData('storefront_version', 'v3')}
                          className="text-[#0153FD] focus:ring-[#0153FD] bg-slate-900 border-slate-700"
                        />
                        <span>{data.storefront_version === 'v3' ? 'Selected' : 'Switch to v3'}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setData('storefront_version', 'v3')}
                        className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                          data.storefront_version === 'v3'
                            ? 'bg-[#0153FD] text-white font-black shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {data.storefront_version === 'v3' ? 'Active' : 'Select'}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Version 2 Section Visibility Toggles */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/80">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Version 2 — Section Visibility Controls
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:border-slate-700">
                      <span>Floating Category Bar</span>
                      <input
                        type="checkbox"
                        checked={data.storefront_v2_show_category_bar}
                        onChange={(e) => setData('storefront_v2_show_category_bar', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-400 focus:ring-sky-400 h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:border-slate-700">
                      <span>Trust / Service Strips</span>
                      <input
                        type="checkbox"
                        checked={data.storefront_v2_show_trust_strip}
                        onChange={(e) => setData('storefront_v2_show_trust_strip', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-400 focus:ring-sky-400 h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:border-slate-700">
                      <span>Featured Products</span>
                      <input
                        type="checkbox"
                        checked={data.storefront_v2_show_featured}
                        onChange={(e) => setData('storefront_v2_show_featured', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-400 focus:ring-sky-400 h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:border-slate-700">
                      <span>Deal of the Day Card</span>
                      <input
                        type="checkbox"
                        checked={data.storefront_v2_show_deal_of_day}
                        onChange={(e) => setData('storefront_v2_show_deal_of_day', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-400 focus:ring-sky-400 h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:border-slate-700">
                      <span>Top Brands Strip</span>
                      <input
                        type="checkbox"
                        checked={data.storefront_v2_show_brands}
                        onChange={(e) => setData('storefront_v2_show_brands', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-400 focus:ring-sky-400 h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:border-slate-700">
                      <span>Promotional Service Banner</span>
                      <input
                        type="checkbox"
                        checked={data.storefront_v2_show_promo_banner}
                        onChange={(e) => setData('storefront_v2_show_promo_banner', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-400 focus:ring-sky-400 h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

                {/* Promotional Service Banner Configurator */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/80">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Version 2 — Promotional Service Banner Customizer
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Banner Headline</label>
                      <input
                        type="text"
                        value={data.storefront_v2_promo_title}
                        onChange={(e) => setData('storefront_v2_promo_title', e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-sky-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">CTA Button Text</label>
                      <input
                        type="text"
                        value={data.storefront_v2_promo_cta_text}
                        onChange={(e) => setData('storefront_v2_promo_cta_text', e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-sky-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-slate-300 font-bold">Feature Bullets (comma separated)</label>
                      <input
                        type="text"
                        value={data.storefront_v2_promo_bullets}
                        onChange={(e) => setData('storefront_v2_promo_bullets', e.target.value)}
                        placeholder="Residential, Office, Factory, Apartment, Shop, All Over Bangladesh"
                        className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Statistics Configurator */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/80">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Version 2 — Trust Statistics Cards
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="block text-slate-400 text-[11px] font-bold">Stat 1 Number</label>
                      <input
                        type="text"
                        value={data.storefront_v2_stat1_num}
                        onChange={(e) => setData('storefront_v2_stat1_num', e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 p-2 rounded-lg border border-slate-800 text-xs font-bold font-mono"
                      />
                      <input
                        type="text"
                        value={data.storefront_v2_stat1_label}
                        onChange={(e) => setData('storefront_v2_stat1_label', e.target.value)}
                        className="w-full bg-slate-900 text-slate-300 p-2 rounded-lg border border-slate-800 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-400 text-[11px] font-bold">Stat 2 Number</label>
                      <input
                        type="text"
                        value={data.storefront_v2_stat2_num}
                        onChange={(e) => setData('storefront_v2_stat2_num', e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 p-2 rounded-lg border border-slate-800 text-xs font-bold font-mono"
                      />
                      <input
                        type="text"
                        value={data.storefront_v2_stat2_label}
                        onChange={(e) => setData('storefront_v2_stat2_label', e.target.value)}
                        className="w-full bg-slate-900 text-slate-300 p-2 rounded-lg border border-slate-800 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-400 text-[11px] font-bold">Stat 3 Number</label>
                      <input
                        type="text"
                        value={data.storefront_v2_stat3_num}
                        onChange={(e) => setData('storefront_v2_stat3_num', e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 p-2 rounded-lg border border-slate-800 text-xs font-bold font-mono"
                      />
                      <input
                        type="text"
                        value={data.storefront_v2_stat3_label}
                        onChange={(e) => setData('storefront_v2_stat3_label', e.target.value)}
                        className="w-full bg-slate-900 text-slate-300 p-2 rounded-lg border border-slate-800 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-400 text-[11px] font-bold">Stat 4 Number</label>
                      <input
                        type="text"
                        value={data.storefront_v2_stat4_num}
                        onChange={(e) => setData('storefront_v2_stat4_num', e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 p-2 rounded-lg border border-slate-800 text-xs font-bold font-mono"
                      />
                      <input
                        type="text"
                        value={data.storefront_v2_stat4_label}
                        onChange={(e) => setData('storefront_v2_stat4_label', e.target.value)}
                        className="w-full bg-slate-900 text-slate-300 p-2 rounded-lg border border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-white font-bold text-xs flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Shared Data & Business Logic Architecture</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Both versions share identical products, categories, cart, wishlist, checkout, and inventory without duplication.
                    </p>
                  </div>

                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-xs flex items-center space-x-1.5 border border-slate-800 transition-colors"
                  >
                    <span>View Public Storefront</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 3: BRANDING & MEDIA */}
          {activeTab === 'branding' && (
            <SectionCard title="Centralized Branding & Media Assets" subtitle="Brand logos, favicon, and default social share graphics" icon={ImageIcon}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <label className="block text-slate-300 font-bold">Store Primary Header Logo</label>
                  {data.site_logo ? (
                    <div className="h-16 p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                      <img src={data.site_logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : null}
                  <MediaPicker
                    value={data.site_logo}
                    onChange={(url) => setData('site_logo', url)}
                    folder="general"
                    buttonText="Choose Header Logo"
                  />
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <label className="block text-slate-300 font-bold">Browser Favicon</label>
                  {data.site_favicon ? (
                    <div className="w-12 h-12 p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                      <img src={data.site_favicon} alt="Favicon" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : null}
                  <MediaPicker
                    value={data.site_favicon}
                    onChange={(url) => setData('site_favicon', url)}
                    folder="general"
                    buttonText="Choose Favicon"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 3: STORE & INVENTORY */}
          {activeTab === 'store' && (
            <SectionCard title="Storefront Rules & Inventory Thresholds" subtitle="Order identifiers, guest checkout, and stock warning thresholds" icon={Store}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Order Number Prefix</label>
                  <input
                    type="text"
                    value={data.order_prefix}
                    onChange={(e) => setData('order_prefix', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Default Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={data.default_low_stock_threshold}
                    onChange={(e) => setData('default_low_stock_threshold', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 4: SEO & ANALYTICS */}
          {activeTab === 'seo' && (
            <SectionCard title="Search Engine Optimization & Marketing Tracking" subtitle="Global meta defaults and tag manager identifiers" icon={Search}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Default Global Meta Title</label>
                  <input
                    type="text"
                    value={data.default_meta_title}
                    onChange={(e) => setData('default_meta_title', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Default Global Meta Description</label>
                  <textarea
                    rows={3}
                    value={data.default_meta_description}
                    onChange={(e) => setData('default_meta_description', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">GA4 Measurement ID</label>
                    <input
                      type="text"
                      value={data.ga_measurement_id}
                      onChange={(e) => setData('ga_measurement_id', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Google Tag Manager ID</label>
                    <input
                      type="text"
                      value={data.gtm_container_id}
                      onChange={(e) => setData('gtm_container_id', e.target.value)}
                      placeholder="GTM-XXXXXXX"
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Meta Pixel ID</label>
                    <input
                      type="text"
                      value={data.fb_pixel_id}
                      onChange={(e) => setData('fb_pixel_id', e.target.value)}
                      placeholder="123456789012345"
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 5: CONTACT & SOCIAL */}
          {activeTab === 'contact' && (
            <SectionCard title="Customer Support Hotlines & Showrooms" subtitle="Official contact channels and social media profiles" icon={Phone}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Hotline Number</label>
                  <input
                    type="text"
                    value={data.hotline}
                    onChange={(e) => setData('hotline', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">WhatsApp Support</label>
                  <input
                    type="text"
                    value={data.whatsapp_number}
                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Facebook URL</label>
                  <input
                    type="url"
                    value={data.facebook_url}
                    onChange={(e) => setData('facebook_url', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">YouTube Channel</label>
                  <input
                    type="url"
                    value={data.youtube_url}
                    onChange={(e) => setData('youtube_url', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 6: PAYMENT GATEWAYS */}
          {activeTab === 'payment' && (
            <SectionCard title="Payment Gateway Provider Settings" subtitle="Cash on Delivery, bKash, and Nagad provider credentials" icon={CreditCard}>
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-slate-400">Accept payment upon physical doorstep delivery</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.cod_enabled}
                    onChange={(e) => setData('cod_enabled', e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">bKash Merchant Gateway</div>
                    <div className="text-[11px] text-slate-400">Direct mobile financial services checkout</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.bkash_enabled}
                    onChange={(e) => setData('bkash_enabled', e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 7: SHIPPING & DELIVERY */}
          {activeTab === 'shipping' && (
            <SectionCard title="Courier & Shipping Charge Rates" subtitle="Standard rates for Dhaka and outside Dhaka divisions" icon={Truck}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Inside Dhaka Rate (BDT)</label>
                  <input
                    type="number"
                    value={data.shipping_inside_dhaka}
                    onChange={(e) => setData('shipping_inside_dhaka', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Outside Dhaka Rate (BDT)</label>
                  <input
                    type="number"
                    value={data.shipping_outside_dhaka}
                    onChange={(e) => setData('shipping_outside_dhaka', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Free Shipping Threshold (BDT)</label>
                  <input
                    type="number"
                    value={data.free_shipping_threshold}
                    onChange={(e) => setData('free_shipping_threshold', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 8: SYSTEM & DIAGNOSTICS */}
          {activeTab === 'system' && (
            <SectionCard title="System Diagnostics & Server Telemetry" subtitle="Environment status and database connectivity" icon={Activity}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                  <div><span className="text-slate-500">Framework:</span> Laravel {systemInfo?.laravel_version || '11.x'}</div>
                  <div><span className="text-slate-500">PHP Version:</span> {systemInfo?.php_version || '8.2+'}</div>
                  <div><span className="text-slate-500">Database Driver:</span> {systemInfo?.db_connection || 'SQLite'}</div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                  <div><span className="text-slate-500">Cache Driver:</span> {systemInfo?.cache_driver || 'File / Array'}</div>
                  <div><span className="text-slate-500">Session Driver:</span> {systemInfo?.session_driver || 'Database / Cookie'}</div>
                  <div><span className="text-slate-500">App Environment:</span> production / local</div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Save Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
}
