import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import SectionCard from '../../../Components/Admin/SectionCard';
import MediaPicker from '../../../Components/Admin/MediaPicker';
import { 
  Sliders, Save, Globe, Image as ImageIcon, Store, Search, 
  Phone, CreditCard, Truck, Activity, RefreshCw, CheckCircle2,
  AlertTriangle, ShieldCheck, Database, Server, HardDrive, Sparkles,
  Palette, Info, ExternalLink, HelpCircle, Check, Zap, Layers,
  ArrowRight, Table, Tag, ShoppingBag
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

    // 3. Store & Inventory
    store_name: settings.store_name || 'TechMarket BD Online Shop',
    order_prefix: settings.order_prefix || 'TM-',
    min_order_amount: settings.min_order_amount || '0',
    default_low_stock_threshold: settings.default_low_stock_threshold || '3',
    out_of_stock_behavior: settings.out_of_stock_behavior || 'show_badge',
    allow_guest_checkout: settings.allow_guest_checkout !== undefined ? (settings.allow_guest_checkout === '1' || settings.allow_guest_checkout === true) : true,

    // 4. SEO & Analytics
    seo_robots_indexing: settings.seo_robots_indexing || 'index, follow',
    default_meta_title: settings.default_meta_title || 'TechMarket BD | Best Computer & Laptop Shop in Bangladesh',
    default_meta_description: settings.default_meta_description || 'Buy authentic Laptops, Desktop PC, Graphics Cards, Processors, and Gaming Accessories at the best price in Bangladesh with official manufacturer warranty from TechMarket BD.',
    default_meta_keywords: settings.default_meta_keywords || 'computer shop bd, pc builder bangladesh, laptop price in bd, graphics card price, techland alternative, cctv bd',
    default_og_image: settings.default_og_image || '',
    google_search_console_code: settings.google_search_console_code || settings.google_site_verification || '',
    bing_webmaster_code: settings.bing_webmaster_code || settings.bing_site_verification || '',
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
    footer_payment_methods_image: settings.footer_payment_methods_image || '',

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
    <AdminShell title="Global Settings">
      <Head title="System & Store Settings - TechMarket Admin" />

      <div className="space-y-6 text-xs">
        {/* Header Bar */}
        <AdminPageHeader
          title="Global System Configuration"
          subtitle="Manage store identity, branding, payment methods, delivery charges, SEO tags, and system telemetry."
          badge="Core Configuration"
          actions={
            <div className="flex items-center space-x-2.5">
              <Link
                href="/admin/settings/appearance"
                className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl flex items-center space-x-1.5 hover:bg-indigo-100 transition-colors shadow-2xs"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Admin Theme & Branding</span>
              </Link>

              <button
                type="button"
                onClick={handlePurgeCache}
                disabled={isPurgingCache}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPurgingCache ? 'animate-spin' : ''}`} />
                <span>{isPurgingCache ? 'Purging Cache...' : 'Flush Cache'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={processing}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          }
        />

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center space-x-1.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-x-auto admin-scrollbar shadow-2xs">
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
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
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
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Site / Store Name *</label>
                    <input
                      type="text"
                      required
                      value={data.site_name}
                      onChange={(e) => setData('site_name', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Public Canonical URL</label>
                    <input
                      type="url"
                      value={data.site_url}
                      onChange={(e) => setData('site_url', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Site Tagline / Slogan</label>
                  <input
                    type="text"
                    value={data.site_tagline}
                    onChange={(e) => setData('site_tagline', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Currency Code</label>
                    <input
                      type="text"
                      value={data.default_currency}
                      onChange={(e) => setData('default_currency', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={data.currency_symbol}
                      onChange={(e) => setData('currency_symbol', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Timezone</label>
                    <input
                      type="text"
                      value={data.default_timezone}
                      onChange={(e) => setData('default_timezone', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Headquarters Physical Address</label>
                  <textarea
                    rows={2}
                    value={data.company_address}
                    onChange={(e) => setData('company_address', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
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
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {data.storefront_version === 'v1' && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="h-28 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-2.5 overflow-hidden flex flex-col justify-between select-none">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-[9px] font-mono text-slate-500 pl-1 truncate">Classic (v1)</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1 h-12">
                          <div className="col-span-8 bg-slate-800 rounded p-1 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white/80">Carousel</span>
                          </div>
                          <div className="col-span-4 flex flex-col gap-0.5">
                            <div className="h-1/2 bg-blue-100 rounded flex items-center justify-center text-[7px] font-bold text-blue-900">Promo 1</div>
                            <div className="h-1/2 bg-indigo-100 rounded flex items-center justify-center text-[7px] font-bold text-indigo-900">Promo 2</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Version 1 — Classic</h4>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono">v1</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Original retail ecommerce design with multi-banner carousel and dense grid.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Version 2 (Modern Tech Storefront) */}
                  <div 
                    onClick={() => setData('storefront_version', 'v2')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      data.storefront_version === 'v2'
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {data.storefront_version === 'v2' && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="h-28 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-2.5 overflow-hidden flex flex-col justify-between relative select-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-rose-400" />
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 pl-1 truncate">Modern (v2)</span>
                          </div>
                          <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Modern</span>
                        </div>
                        <div className="bg-slate-200 dark:bg-slate-700 rounded p-1 flex items-center justify-between">
                          <div>
                            <div className="text-[7px] font-bold text-slate-800 dark:text-slate-200">SMART TECH</div>
                          </div>
                          <div className="w-6 h-6 rounded bg-indigo-100 text-[6px] text-indigo-700 flex items-center justify-center">
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
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Version 2 — Modern Tech</h4>
                          <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">v2</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Animated hero slider, floating category chips, and refined electronics store layout.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Version 3 (TechJhuli Gadget Hub) */}
                  <div 
                    onClick={() => setData('storefront_version', 'v3')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      data.storefront_version === 'v3'
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {data.storefront_version === 'v3' && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="h-28 rounded-xl bg-white border border-blue-300 p-2.5 overflow-hidden flex flex-col justify-between relative select-none shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="text-[9px] font-black text-blue-600">Tech</span>
                            <span className="text-[9px] font-black text-slate-900">Jhuli</span>
                          </div>
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">v3 Hub</span>
                        </div>
                        <div className="relative bg-slate-50 border border-blue-200 rounded-lg p-2 text-center">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 bg-blue-600 text-white rounded-full text-[6px] font-bold">
                            Trending Gadgets
                          </div>
                          <div className="grid grid-cols-3 gap-1 pt-1">
                            <div className="h-4 bg-white rounded border border-slate-200" />
                            <div className="h-4 bg-white rounded border border-slate-200" />
                            <div className="h-4 bg-white rounded border border-slate-200" />
                          </div>
                        </div>
                        <div className="h-2 rounded bg-gradient-to-r from-blue-600 to-indigo-900" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Version 3 — TechJhuli Hub</h4>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">v3 • New</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Signature TechJhuli gadget hub UI with electric blue colors, section card glow boxes, floating pill badges, and royal blue footer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 3: BRANDING & MEDIA */}
          {activeTab === 'branding' && (
            <SectionCard title="Centralized Branding & Media Assets" subtitle="Brand logos, favicon, and default social share graphics" icon={ImageIcon}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Store Primary Header Logo</label>
                  {data.site_logo ? (
                    <div className="h-16 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
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

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Browser Favicon</label>
                  {data.site_favicon ? (
                    <div className="w-12 h-12 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
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

          {/* TAB 4: STORE & INVENTORY */}
          {activeTab === 'store' && (
            <SectionCard title="Storefront Rules & Inventory Thresholds" subtitle="Order identifiers, guest checkout, and stock warning thresholds" icon={Store}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Order Number Prefix</label>
                  <input
                    type="text"
                    value={data.order_prefix}
                    onChange={(e) => setData('order_prefix', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Default Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={data.default_low_stock_threshold}
                    onChange={(e) => setData('default_low_stock_threshold', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 5: SEO & ANALYTICS */}
          {activeTab === 'seo' && (
            <SectionCard title="Search Engine Optimization & Marketing Tracking" subtitle="Manage search engine indexing, meta tags, social share graphics, webmaster verification, and tracking IDs" icon={Search}>
              <div className="space-y-6">
                
                {/* 1. Robots Indexing & Crawl Directives */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs">Search Engine Indexing Directive (Robots Meta Tag)</label>
                      <p className="text-[11px] text-slate-500 mt-0.5">Control whether Google, Bing, and other search engines are allowed to index and rank your pages.</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold ${data.seo_robots_indexing?.includes('noindex') ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'}`}>
                      {data.seo_robots_indexing?.includes('noindex') ? '🚫 No-Index (Hidden)' : '🟢 Public Indexing Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <label 
                      onClick={() => setData('seo_robots_indexing', 'index, follow')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${data.seo_robots_indexing === 'index, follow' ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 shadow-2xs' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">index, follow</span>
                        <input type="radio" checked={data.seo_robots_indexing === 'index, follow'} onChange={() => {}} className="text-indigo-600" />
                      </div>
                      <span className="text-[10.5px] text-slate-500 mt-1">Recommended for live public stores. All pages indexed & ranked.</span>
                    </label>

                    <label 
                      onClick={() => setData('seo_robots_indexing', 'noindex, follow')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${data.seo_robots_indexing === 'noindex, follow' ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 shadow-2xs' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">noindex, follow</span>
                        <input type="radio" checked={data.seo_robots_indexing === 'noindex, follow'} onChange={() => {}} className="text-indigo-600" />
                      </div>
                      <span className="text-[10.5px] text-slate-500 mt-1">Follow internal links but hide pages from search result listings.</span>
                    </label>

                    <label 
                      onClick={() => setData('seo_robots_indexing', 'noindex, nofollow')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${data.seo_robots_indexing === 'noindex, nofollow' ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 shadow-2xs' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">noindex, nofollow</span>
                        <input type="radio" checked={data.seo_robots_indexing === 'noindex, nofollow'} onChange={() => {}} className="text-indigo-600" />
                      </div>
                      <span className="text-[10.5px] text-slate-500 mt-1">Block all search engine indexing (Staging / Maintenance).</span>
                    </label>
                  </div>
                </div>

                {/* 2. Global Meta Title, Description & Keywords */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Default Global Meta Title</label>
                      <span className="text-[11px] text-slate-400 font-mono">{data.default_meta_title?.length || 0} / 60 chars</span>
                    </div>
                    <input
                      type="text"
                      value={data.default_meta_title}
                      onChange={(e) => setData('default_meta_title', e.target.value)}
                      placeholder="TechMarket BD | Best Computer & Laptop Shop in Bangladesh"
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Default Global Meta Description</label>
                      <span className={`text-[11px] font-mono ${data.default_meta_description?.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {data.default_meta_description?.length || 0} / 160 chars (Recommended 150-160)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={data.default_meta_description}
                      onChange={(e) => setData('default_meta_description', e.target.value)}
                      placeholder="Buy authentic Laptops, Desktop PC, Graphics Cards, Processors, and Gaming Accessories at the best price in Bangladesh with official manufacturer warranty from TechMarket BD."
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Default Global Meta Keywords</label>
                    <input
                      type="text"
                      value={data.default_meta_keywords}
                      onChange={(e) => setData('default_meta_keywords', e.target.value)}
                      placeholder="computer shop bd, pc builder bangladesh, laptop price in bd, graphics card price, cctv package bangladesh"
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                    />
                    <p className="text-[10.5px] text-slate-500">Separate keywords with commas (e.g. <code className="text-[#0084ff]">computer shop bd, laptop price in bd, cctv camera bd</code>).</p>
                  </div>
                </div>

                {/* 3. Social Share / Open Graph (OG) Graph Image */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs">Site SEO Social Graph Image (OG Image / Social Share Banner)</label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      This image will appear in rich link previews when your website URL is shared on <strong>Facebook, WhatsApp, Messenger, Telegram, LinkedIn & Twitter</strong>.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                    <div className="w-56 h-28 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-900 flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-2xs">
                      {data.default_og_image ? (
                        <img 
                          src={data.default_og_image} 
                          alt="SEO Graph Banner" 
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <ImageIcon className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                          <span className="text-[10.5px] text-slate-500 font-medium">Using Site Logo</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <MediaPicker
                        value={data.default_og_image}
                        onChange={(url) => setData('default_og_image', url)}
                        folder="seo"
                        buttonText="Choose OG Graph Image"
                      />
                      {data.default_og_image && (
                        <button
                          type="button"
                          onClick={() => setData('default_og_image', '')}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold block cursor-pointer"
                        >
                          Remove Custom Graph Image
                        </button>
                      )}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[10.5px] font-bold text-amber-700 dark:text-amber-300">
                        <span>📐 Recommended Resolution: 1200 × 630 px (1.91:1 ratio, JPG / PNG / WebP)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Google & Bing Webmaster Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Google Search Console Verification Code</label>
                    <input
                      type="text"
                      value={data.google_search_console_code}
                      onChange={(e) => setData('google_search_console_code', e.target.value)}
                      placeholder="e.g. google-site-verification token or HTML meta content"
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                    />
                    <p className="text-[10.5px] text-slate-500">Injects <code className="text-slate-700 dark:text-slate-300">&lt;meta name="google-site-verification" content="..."&gt;</code> in header.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Bing Webmaster Verification Code</label>
                    <input
                      type="text"
                      value={data.bing_webmaster_code}
                      onChange={(e) => setData('bing_webmaster_code', e.target.value)}
                      placeholder="e.g. msvalidate.01 token"
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                    />
                    <p className="text-[10.5px] text-slate-500">Injects <code className="text-slate-700 dark:text-slate-300">&lt;meta name="msvalidate.01" content="..."&gt;</code> in header.</p>
                  </div>
                </div>

                {/* 5. Marketing & Tracking IDs */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#0084ff]" />
                    <span>Analytics, Tag Manager & Conversion Pixel Identifiers</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">GA4 Measurement ID</label>
                      <input
                        type="text"
                        value={data.ga_measurement_id}
                        onChange={(e) => setData('ga_measurement_id', e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Google Tag Manager ID</label>
                      <input
                        type="text"
                        value={data.gtm_container_id}
                        onChange={(e) => setData('gtm_container_id', e.target.value)}
                        placeholder="GTM-XXXXXXX"
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Meta Pixel ID</label>
                      <input
                        type="text"
                        value={data.fb_pixel_id}
                        onChange={(e) => setData('fb_pixel_id', e.target.value)}
                        placeholder="123456789012345"
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Setup Guidelines Card */}
                <div className="mt-4 p-4.5 rounded-xl bg-blue-50/80 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700 space-y-3.5">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm">
                    <Info className="w-4 h-4 text-[#0084ff]" />
                    <span>Tracking Setup Guidelines & Instructions</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    {/* GA4 Guide */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Google Analytics 4 (GA4)
                        </span>
                        <a 
                          href="https://analytics.google.com" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#0084ff] hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <ol className="text-slate-600 dark:text-slate-400 text-[11.5px] space-y-1 list-decimal list-inside leading-relaxed">
                        <li>Go to <strong>Admin (⚙️)</strong> in Google Analytics.</li>
                        <li>Click <strong>Data Streams</strong> &rarr; Select your Web stream.</li>
                        <li>Copy the <strong>Measurement ID</strong> (e.g. <code className="bg-slate-100 dark:bg-slate-800 text-[#0084ff] px-1 py-0.5 rounded font-mono font-bold">G-XXXXXXXXXX</code>).</li>
                      </ol>
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>Auto-tracks page views, add to cart & checkout in BDT</span>
                      </div>
                    </div>

                    {/* GTM Guide */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Google Tag Manager (GTM)
                        </span>
                        <a 
                          href="https://tagmanager.google.com" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#0084ff] hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <ol className="text-slate-600 dark:text-slate-400 text-[11.5px] space-y-1 list-decimal list-inside leading-relaxed">
                        <li>Log in to <strong>Google Tag Manager</strong>.</li>
                        <li>Select your website container.</li>
                        <li>Copy the <strong>Container ID</strong> in the header (e.g. <code className="bg-slate-100 dark:bg-slate-800 text-[#0084ff] px-1 py-0.5 rounded font-mono font-bold">GTM-XXXXXXX</code>).</li>
                      </ol>
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>Injects scripts & populates eCommerce dataLayer</span>
                      </div>
                    </div>

                    {/* Meta Pixel Guide */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          Meta (Facebook) Pixel
                        </span>
                        <a 
                          href="https://business.facebook.com/events_manager" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#0084ff] hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <ol className="text-slate-600 dark:text-slate-400 text-[11.5px] space-y-1 list-decimal list-inside leading-relaxed">
                        <li>Open <strong>Meta Events Manager</strong>.</li>
                        <li>Click <strong>Data Sources</strong> &rarr; Select your Pixel / Dataset.</li>
                        <li>Go to <strong>Settings</strong> and copy the <strong>Dataset ID</strong> (15-16 digits).</li>
                      </ol>
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>Fires PageView, ViewContent, AddToCart & Purchases</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Tracking & GTM Setup Cheatsheet */}
                <div className="mt-4 p-4.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>E-Commerce Event Tracking Map & GTM Recipes</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0084ff] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                      ⚡ Automated DataLayer Engine Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                    {/* Left: What Events Are Tracked */}
                    <div className="space-y-2.5">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                        <span>১. যেসব ইভেন্ট স্বয়ংক্রিয়ভাবে ট্র্যাক হয় (Automated Events)</span>
                      </h5>
                      
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        <div className="p-2.5 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">page_view</div>
                            <div className="text-slate-500 text-[10.5px]">যে কোনো পেজ লোড বা নেভিগেট করলে ফায়ার হয়।</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">GA4 + Pixel</span>
                        </div>

                        <div className="p-2.5 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">view_item <span className="text-slate-400 font-normal">/ ViewContent</span></div>
                            <div className="text-slate-500 text-[10.5px]">কাস্টমার প্রোডাক্ট ডিটেইল বা কুইক ভিউ ওপেন করলে প্রডাক্ট আইডি, নাম ও প্রাইস সহ ফায়ার হয়।</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">GA4 + Pixel</span>
                        </div>

                        <div className="p-2.5 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">add_to_cart <span className="text-slate-400 font-normal">/ AddToCart</span></div>
                            <div className="text-slate-500 text-[10.5px]">"Add to Cart" অথবা "Buy Now" বাটনে ক্লিক করলে কার্ট ভ্যালু ও কোয়ান্টিটি সহ ফায়ার হয়।</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">GA4 + Pixel</span>
                        </div>

                        <div className="p-2.5 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">begin_checkout <span className="text-slate-400 font-normal">/ InitiateCheckout</span></div>
                            <div className="text-slate-500 text-[10.5px]">কাস্টমার চেকআউট পেজে প্রবেশ করলে পুরো কার্টের টোটাল টাকার পরিমাণ সহ ফায়ার হয়।</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">GA4 + Pixel</span>
                        </div>

                        <div className="p-2.5 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">purchase <span className="text-slate-400 font-normal">/ Purchase</span></div>
                            <div className="text-slate-500 text-[10.5px]">অর্ডার কনফার্ম হলে অর্ডার নম্বর (Transaction ID), ডেলিভারি চার্জ ও প্রোডাক্ট লিস্ট সহ একবারই রেকর্ড হয়।</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold shrink-0">Conversion</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: How to configure in GTM */}
                    <div className="space-y-2.5">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        <span>২. Google Tag Manager (GTM)-এ সেটআপ করার সহজ নিয়ম</span>
                      </h5>

                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-[11.5px]">
                            <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0084ff] flex items-center justify-center text-[10px] font-bold">A</span>
                            <span>Google Tag (Main Configuration Tag)</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pl-5">
                            GTM &rarr; <strong>Tags</strong> &rarr; <strong>New</strong> &rarr; Tag Type: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-slate-800 dark:text-slate-200">Google Tag</code>.<br />
                            Tag ID: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[#0084ff] font-bold">{data.ga_measurement_id || 'G-739XJECS0D'}</code> &rarr; Trigger: <strong>Initialization - All Pages</strong>.
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-[11.5px]">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-[10px] font-bold">B</span>
                            <span>GA4 E-Commerce Events Tag (সব ইভেন্টের জন্য ১টি ট্যাগ)</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pl-5">
                            Tag Type: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-slate-800 dark:text-slate-200">Google Analytics: GA4 Event</code>.<br />
                            Event Name: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-purple-600 font-bold">{'{{Event}}'}</code>.<br />
                            More Settings &rarr; টিক দিন: <strong>Send Ecommerce data (Data Layer)</strong>.<br />
                            Trigger &rarr; <strong>Custom Event</strong> &rarr; Event Name: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-emerald-600 font-bold">view_item|add_to_cart|begin_checkout|purchase</code> (Regex matching: On).
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-[11.5px]">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-[10px] font-bold">C</span>
                            <span>Submit & Publish</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pl-5">
                            ট্যাগ দুটি তৈরি করে GTM-এর উপরের ডানপাশের <strong>Submit &rarr; Publish</strong> বাটনে ক্লিক করুন। সাথে সাথে সব ইভেন্ট লাইভ ট্র্যাক হওয়া শুরু হবে!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 6: CONTACT & SOCIAL */}
          {activeTab === 'contact' && (
            <SectionCard title="Customer Support Hotlines & Showrooms" subtitle="Official contact channels and social media profiles" icon={Phone}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Hotline Number</label>
                  <input
                    type="text"
                    value={data.hotline}
                    onChange={(e) => setData('hotline', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">WhatsApp Support</label>
                  <input
                    type="text"
                    value={data.whatsapp_number}
                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={data.facebook_url}
                    onChange={(e) => setData('facebook_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">YouTube Channel</label>
                  <input
                    type="url"
                    value={data.youtube_url}
                    onChange={(e) => setData('youtube_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 7: PAYMENT GATEWAYS */}
          {activeTab === 'payment' && (
            <SectionCard title="Payment Gateway Provider Settings" subtitle="Cash on Delivery, bKash, and Nagad provider credentials" icon={CreditCard}>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-slate-400">Accept payment upon physical doorstep delivery</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.cod_enabled}
                    onChange={(e) => setData('cod_enabled', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">bKash Merchant Gateway</div>
                    <div className="text-[11px] text-slate-400">Direct mobile financial services checkout</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.bkash_enabled}
                    onChange={(e) => setData('bkash_enabled', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                </div>

                {/* Accepted Payment Methods Image Banner */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs">
                      Storefront Footer Payment Methods Banner Image
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload an image banner showing accepted payment gateways & card badges on the storefront footer.
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] font-bold text-amber-700 dark:text-amber-300 shadow-2xs">
                      <span>📐 Recommended Size: 450 × 35 px or 500 × 40 px (Transparent PNG / WebP, Max Height 40px)</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-64 h-14 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-900 flex items-center justify-center p-2 overflow-hidden shrink-0">
                      {data.footer_payment_methods_image ? (
                        <img
                          src={data.footer_payment_methods_image}
                          alt="Payment Methods"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">Default Badges Active</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <MediaPicker
                        value={data.footer_payment_methods_image}
                        onChange={(url) => setData('footer_payment_methods_image', url)}
                        buttonText="Choose Payment Banner Image"
                      />
                      {data.footer_payment_methods_image && (
                        <button
                          type="button"
                          onClick={() => setData('footer_payment_methods_image', '')}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold block cursor-pointer"
                        >
                          Reset to Default Badges
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 8: SHIPPING & DELIVERY */}
          {activeTab === 'shipping' && (
            <SectionCard title="Courier & Shipping Charge Rates" subtitle="Standard rates for Dhaka and outside Dhaka divisions" icon={Truck}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Inside Dhaka Rate (BDT)</label>
                  <input
                    type="number"
                    value={data.shipping_inside_dhaka}
                    onChange={(e) => setData('shipping_inside_dhaka', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Outside Dhaka Rate (BDT)</label>
                  <input
                    type="number"
                    value={data.shipping_outside_dhaka}
                    onChange={(e) => setData('shipping_outside_dhaka', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Free Shipping Threshold (BDT)</label>
                  <input
                    type="number"
                    value={data.free_shipping_threshold}
                    onChange={(e) => setData('free_shipping_threshold', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB 9: SYSTEM & DIAGNOSTICS */}
          {activeTab === 'system' && (
            <SectionCard title="System Diagnostics & Server Telemetry" subtitle="Environment status and database connectivity" icon={Activity}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <div><span className="text-slate-400">Framework:</span> Laravel {systemInfo?.laravel_version || '11.x'}</div>
                  <div><span className="text-slate-400">PHP Version:</span> {systemInfo?.php_version || '8.2+'}</div>
                  <div><span className="text-slate-400">Database Driver:</span> {systemInfo?.db_connection || 'SQLite'}</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <div><span className="text-slate-400">Cache Driver:</span> {systemInfo?.cache_driver || 'File / Array'}</div>
                  <div><span className="text-slate-400">Session Driver:</span> {systemInfo?.session_driver || 'Database / Cookie'}</div>
                  <div><span className="text-slate-400">App Environment:</span> production / local</div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Save Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
