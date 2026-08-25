import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import MediaPicker from '../../../Components/Admin/MediaPicker';
import { 
  Sliders, Plus, Edit2, Trash2, Save, Eye, 
  Sparkles, Phone, Mail, MapPin, Globe, Check, 
  ExternalLink, Layers, ArrowUp, MessageCircle, AlertCircle,
  Image as ImageIcon, CheckCircle2
} from 'lucide-react';

export default function HeaderFooterBuilder({
  settings = {},
  headerLinks = [],
  footerInfoLinks = [],
  footerPolicyLinks = [],
}) {
  const [activeTab, setActiveTab] = useState('announcement');
  const [linkModal, setLinkModal] = useState(null); // { mode: 'create'|'edit', location, link: null }
  const [deleteModal, setDeleteModal] = useState(null);

  // Settings Form
  const { data, setData, post, processing, recentlySuccessful } = useForm({
    settings: {
      site_name: settings.site_name || 'TechMarket BD',
      tagline: settings.tagline || 'Trusted Retail Computer & Electronics Store in Bangladesh',
      search_placeholder: settings.search_placeholder || 'Type a product, brand or model...',
      
      // Storefront & Header Branding Logos
      site_logo: settings.site_logo || '',
      site_logo_dark: settings.site_logo_dark || '',
      site_favicon: settings.site_favicon || '',
      
      // Header Announcement Bar
      header_announcement_enabled: settings.header_announcement_enabled || '0',
      header_announcement_text: settings.header_announcement_text || '🎉 Special Eid Campaign 2026: Enjoy Up To 40% Off + Free Shipping on all Laptops!',
      header_announcement_link: settings.header_announcement_link || '/offers',
      header_announcement_bg: settings.header_announcement_bg || '#1c4289',
      header_announcement_text_color: settings.header_announcement_text_color || '#ffffff',

      // Header Quick Actions
      header_show_offers: settings.header_show_offers ?? '1',
      header_show_emi: settings.header_show_emi ?? '1',
      header_show_pc_builder: settings.header_show_pc_builder ?? '1',
      header_show_compare: settings.header_show_compare ?? '1',
      header_show_wishlist: settings.header_show_wishlist ?? '1',

      // Footer Contacts & Headings
      footer_contact_heading: settings.footer_contact_heading || 'Contact Us',
      hotline: settings.hotline || '(+88) 09613562601',
      support_email: settings.support_email || 'info@techmarketbd.com',
      showroom_dhaka: settings.showroom_dhaka || 'Multiplan Center, Level-6, Shop 608-610, Elephant Road, Dhaka-1205',
      whatsapp_number: settings.whatsapp_number || '+8801711223344',
      facebook_url: settings.facebook_url || 'https://facebook.com',
      youtube_url: settings.youtube_url || 'https://youtube.com',
      instagram_url: settings.instagram_url || 'https://instagram.com',
      twitter_url: settings.twitter_url || 'https://twitter.com',
      linkedin_url: settings.linkedin_url || 'https://linkedin.com',

      // Footer Columns Headings
      footer_info_heading: settings.footer_info_heading || 'Information',
      footer_policy_heading: settings.footer_policy_heading || 'Policies',
      footer_affiliation_heading: settings.footer_affiliation_heading || 'Affiliation',

      // Affiliations & Copyright
      footer_basis_enabled: settings.footer_basis_enabled ?? '1',
      footer_bcs_enabled: settings.footer_bcs_enabled ?? '1',
      footer_ecab_enabled: settings.footer_ecab_enabled ?? '1',
      copyright_text: settings.copyright_text || 'Copyright © 2026, Tech Market BD. All Rights Reserved.',

      // Floating Action Widgets
      floating_whatsapp_enabled: settings.floating_whatsapp_enabled ?? '1',
      floating_hotline_enabled: settings.floating_hotline_enabled ?? '1',
      floating_scroll_top_enabled: settings.floating_scroll_top_enabled ?? '1',
    }
  });

  // Link Form for Modal
  const [linkForm, setLinkForm] = useState({
    id: null,
    location: 'footer_info',
    title: '',
    url: '',
    sort_order: 0,
    open_new_tab: false,
  });

  const handleSettingChange = (key, value) => {
    setData('settings', {
      ...data.settings,
      [key]: value
    });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    post('/admin/header-footer/settings', {
      preserveScroll: true,
    });
  };

  const openCreateLink = (location) => {
    setLinkForm({
      id: null,
      location,
      title: '',
      url: '',
      sort_order: 0,
      open_new_tab: false,
    });
    setLinkModal({ mode: 'create', location, link: null });
  };

  const openEditLink = (link) => {
    setLinkForm({
      id: link.id,
      location: link.location,
      title: link.title,
      url: link.url,
      sort_order: link.sort_order,
      open_new_tab: Boolean(link.open_new_tab),
    });
    setLinkModal({ mode: 'edit', location: link.location, link });
  };

  const handleSaveLink = (e) => {
    e.preventDefault();
    if (linkModal.mode === 'create') {
      router.post('/admin/header-footer/links', linkForm, {
        preserveScroll: true,
        onSuccess: () => setLinkModal(null),
      });
    } else {
      router.put(`/admin/header-footer/links/${linkForm.id}`, linkForm, {
        preserveScroll: true,
        onSuccess: () => setLinkModal(null),
      });
    }
  };

  const handleDeleteLink = () => {
    if (!deleteModal) return;
    router.delete(`/admin/header-footer/links/${deleteModal.id}`, {
      preserveScroll: true,
      onSuccess: () => setDeleteModal(null),
    });
  };

  const tabs = [
    { id: 'announcement', label: '1. Announcement Bar', icon: Sparkles },
    { id: 'header', label: '2. Header Actions & Logo', icon: Globe },
    { id: 'contact', label: '3. Footer Contacts & Socials', icon: Phone },
    { id: 'info_links', label: `4. Info Links (${footerInfoLinks.length})`, icon: Layers },
    { id: 'policy_links', label: `5. Policy Links (${footerPolicyLinks.length})`, icon: Layers },
    { id: 'widgets', label: '6. Affiliations & Widgets', icon: ArrowUp },
  ];

  return (
    <AdminShell title="Header & Footer Builder">
      <Head title="Header & Footer Dynamic Builder - TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none pb-12">
        {/* Header Bar */}
        <AdminPageHeader
          title="Header & Footer Dynamic Builder"
          subtitle="Customize top announcement tickers, header shortcuts, footer columns, contacts, and affiliations."
          badge="Storefront Shell"
          actions={
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Storefront</span>
              </Link>

              <button
                onClick={handleSaveSettings}
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Header & footer storefront configuration saved and published successfully.</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-x-auto admin-scrollbar shadow-2xs">
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
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: TOP ANNOUNCEMENT BAR */}
        {activeTab === 'announcement' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-5 text-xs shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 font-heading">
              Top Announcement Ticker Bar
            </h3>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <input
                  type="checkbox"
                  checked={data.settings.header_announcement_enabled === '1'}
                  onChange={(e) => handleSettingChange('header_announcement_enabled', e.target.checked ? '1' : '0')}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-slate-800 dark:text-slate-200 font-bold">Enable Top Announcement Bar</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Announcement Message Text</label>
                <input
                  type="text"
                  value={data.settings.header_announcement_text}
                  onChange={(e) => handleSettingChange('header_announcement_text', e.target.value)}
                  placeholder="🎉 Special Eid Campaign 2026: Enjoy Up To 40% Off + Free Shipping on all Laptops!"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Link URL</label>
                  <input
                    type="text"
                    value={data.settings.header_announcement_link}
                    onChange={(e) => handleSettingChange('header_announcement_link', e.target.value)}
                    placeholder="/offers"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.settings.header_announcement_bg}
                      onChange={(e) => handleSettingChange('header_announcement_bg', e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.settings.header_announcement_bg}
                      onChange={(e) => handleSettingChange('header_announcement_bg', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.settings.header_announcement_text_color}
                      onChange={(e) => handleSettingChange('header_announcement_text_color', e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.settings.header_announcement_text_color}
                      onChange={(e) => handleSettingChange('header_announcement_text_color', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Ticker Preview (Preserves Storefront Theme Colors) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Live Storefront Announcement Bar Preview
              </span>
              <div
                style={{
                  backgroundColor: data.settings.header_announcement_bg,
                  color: data.settings.header_announcement_text_color,
                }}
                className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{data.settings.header_announcement_text || 'Announcement Text Preview'}</span>
                </div>
                <span className="text-[10px] uppercase underline cursor-pointer shrink-0">Explore Deal →</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEADER ACTIONS & LOGO */}
        {activeTab === 'header' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-6 text-xs shadow-2xs">
            {/* 1. Storefront Logo Media Pickers */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 font-heading">
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Storefront Brand Logos & Favicon</span>
              </h3>
              <p className="text-slate-500 text-[11px] mt-1 mb-4">
                Upload or select official brand logos from the Central Media Library for light mode, dark mode, and browser tabs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Primary Header Logo */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs">Primary Header Logo</label>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Recommended (200x50)</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Displayed on white & light header backgrounds.</p>
                  </div>

                  <div className="h-20 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center relative group">
                    {data.settings.site_logo ? (
                      <img src={data.settings.site_logo} alt="Header Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-slate-400 font-bold flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                        <span className="text-[10px]">No Logo Selected</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1">
                      <MediaPicker
                        value={data.settings.site_logo}
                        onChange={(url) => handleSettingChange('site_logo', url)}
                        folder="general"
                        buttonText="Choose Header Logo"
                      />
                    </div>
                    {data.settings.site_logo && (
                      <button
                        type="button"
                        onClick={() => handleSettingChange('site_logo', '')}
                        className="px-2.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-[11px] font-bold"
                        title="Remove Logo"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Dark Mode Header Logo */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs">Dark Mode Header Logo</label>
                      <span className="text-[10px] text-slate-400 font-mono">White / Transparent</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Displayed on dark theme and sticky header bars.</p>
                  </div>

                  <div className="h-20 p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative group">
                    {data.settings.site_logo_dark ? (
                      <img src={data.settings.site_logo_dark} alt="Dark Mode Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-slate-500 font-bold flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-slate-600" />
                        <span className="text-[10px]">Uses Primary Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1">
                      <MediaPicker
                        value={data.settings.site_logo_dark}
                        onChange={(url) => handleSettingChange('site_logo_dark', url)}
                        folder="general"
                        buttonText="Choose Dark Logo"
                      />
                    </div>
                    {data.settings.site_logo_dark && (
                      <button
                        type="button"
                        onClick={() => handleSettingChange('site_logo_dark', '')}
                        className="px-2.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-[11px] font-bold"
                        title="Remove Dark Logo"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Browser Favicon */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs">Browser Favicon</label>
                      <span className="text-[10px] text-emerald-600 font-mono">Square (32x32)</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Displayed on browser tab & mobile bookmarks.</p>
                  </div>

                  <div className="h-20 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center relative group">
                    {data.settings.site_favicon ? (
                      <img src={data.settings.site_favicon} alt="Favicon" className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="text-slate-400 font-bold flex flex-col items-center gap-1">
                        <Globe className="w-5 h-5 text-slate-400" />
                        <span className="text-[10px]">Default Icon</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1">
                      <MediaPicker
                        value={data.settings.site_favicon}
                        onChange={(url) => handleSettingChange('site_favicon', url)}
                        folder="general"
                        buttonText="Choose Favicon"
                      />
                    </div>
                    {data.settings.site_favicon && (
                      <button
                        type="button"
                        onClick={() => handleSettingChange('site_favicon', '')}
                        className="px-2.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-[11px] font-bold"
                        title="Remove Favicon"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Store Title & Taglines */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                Store Identity & Search Bar
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Brand Store Title</label>
                  <input
                    type="text"
                    value={data.settings.site_name}
                    onChange={(e) => handleSettingChange('site_name', e.target.value)}
                    placeholder="TechMarket BD"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tagline Subtitle</label>
                  <input
                    type="text"
                    value={data.settings.tagline}
                    onChange={(e) => handleSettingChange('tagline', e.target.value)}
                    placeholder="Trusted Retail Store"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Search Bar Placeholder</label>
                <input
                  type="text"
                  value={data.settings.search_placeholder}
                  onChange={(e) => handleSettingChange('search_placeholder', e.target.value)}
                  placeholder="Type a product, brand or model..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Quick Action Button Toggles */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                Header Action Button Visibility Toggles
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_offers === '1'}
                    onChange={(e) => handleSettingChange('header_show_offers', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">OFFERS Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_emi === '1'}
                    onChange={(e) => handleSettingChange('header_show_emi', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">0% EMI Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_pc_builder === '1'}
                    onChange={(e) => handleSettingChange('header_show_pc_builder', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">PC Builder Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_compare === '1'}
                    onChange={(e) => handleSettingChange('header_show_compare', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Compare Icon</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_wishlist === '1'}
                    onChange={(e) => handleSettingChange('header_show_wishlist', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Wishlist Icon</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOOTER CONTACTS & SOCIALS */}
        {activeTab === 'contact' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-5 text-xs shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 font-heading">
              Footer Contact & Social Media Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Contact Column Heading</label>
                <input
                  type="text"
                  value={data.settings.footer_contact_heading}
                  onChange={(e) => handleSettingChange('footer_contact_heading', e.target.value)}
                  placeholder="Contact Us"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Customer Care Hotline</label>
                <input
                  type="text"
                  value={data.settings.hotline}
                  onChange={(e) => handleSettingChange('hotline', e.target.value)}
                  placeholder="(+88) 09613562601"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Support Email</label>
                <input
                  type="email"
                  value={data.settings.support_email}
                  onChange={(e) => handleSettingChange('support_email', e.target.value)}
                  placeholder="info@techmarketbd.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">WhatsApp Hotline Number</label>
                <input
                  type="text"
                  value={data.settings.whatsapp_number}
                  onChange={(e) => handleSettingChange('whatsapp_number', e.target.value)}
                  placeholder="+8801711223344"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Showroom Address</label>
              <textarea
                rows={2}
                value={data.settings.showroom_dhaka}
                onChange={(e) => handleSettingChange('showroom_dhaka', e.target.value)}
                placeholder="Multiplan Center, Level-6, Shop 608-610, Elephant Road, Dhaka-1205"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-3 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>

            {/* Social Media Links */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                Official Social Media Channels
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-bold">Facebook Page URL</label>
                  <input
                    type="text"
                    value={data.settings.facebook_url}
                    onChange={(e) => handleSettingChange('facebook_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-bold">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={data.settings.youtube_url}
                    onChange={(e) => handleSettingChange('youtube_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-bold">Instagram URL</label>
                  <input
                    type="text"
                    value={data.settings.instagram_url}
                    onChange={(e) => handleSettingChange('instagram_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-bold">Twitter / X URL</label>
                  <input
                    type="text"
                    value={data.settings.twitter_url}
                    onChange={(e) => handleSettingChange('twitter_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-bold">LinkedIn URL</label>
                  <input
                    type="text"
                    value={data.settings.linkedin_url}
                    onChange={(e) => handleSettingChange('linkedin_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INFORMATION COLUMN LINKS */}
        {activeTab === 'info_links' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-5 text-xs shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
                  Footer Column 2: Information Links
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Manage the navigation items displayed under the Information column.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openCreateLink('footer_info')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Info Link</span>
              </button>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Column Title</label>
              <input
                type="text"
                value={data.settings.footer_info_heading}
                onChange={(e) => handleSettingChange('footer_info_heading', e.target.value)}
                className="w-full max-w-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>

            {/* Links Table */}
            <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200/80 dark:border-slate-800/80">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">URL Target</th>
                    <th className="p-3">New Tab</th>
                    <th className="p-3">Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {footerInfoLinks.length > 0 ? (
                    footerInfoLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{link.title}</td>
                        <td className="p-3 font-mono text-slate-500">{link.url}</td>
                        <td className="p-3">
                          {link.open_new_tab ? (
                            <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">Yes</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">No</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">#{link.sort_order}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditLink(link)}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModal(link)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                        No custom information links added yet (storefront uses default fallback).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: POLICY COLUMN LINKS */}
        {activeTab === 'policy_links' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-5 text-xs shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
                  Footer Column 3: Policy Links
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Manage legal, warranty, privacy, and terms policy navigation items.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openCreateLink('footer_policies')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Policy Link</span>
              </button>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Column Title</label>
              <input
                type="text"
                value={data.settings.footer_policy_heading}
                onChange={(e) => handleSettingChange('footer_policy_heading', e.target.value)}
                className="w-full max-w-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>

            {/* Policies Table */}
            <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200/80 dark:border-slate-800/80">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">URL Target</th>
                    <th className="p-3">New Tab</th>
                    <th className="p-3">Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {footerPolicyLinks.length > 0 ? (
                    footerPolicyLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{link.title}</td>
                        <td className="p-3 font-mono text-slate-500">{link.url}</td>
                        <td className="p-3">
                          {link.open_new_tab ? (
                            <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">Yes</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">No</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">#{link.sort_order}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditLink(link)}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModal(link)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                        No custom policy links added yet (storefront uses default fallback).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: AFFILIATIONS & FLOATING WIDGETS */}
        {activeTab === 'widgets' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-6 text-xs shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 font-heading">
              Affiliation Badges & Floating Controls
            </h3>

            {/* Affiliations */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                Association & Member Badges
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.footer_basis_enabled === '1'}
                    onChange={(e) => handleSettingChange('footer_basis_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Show BASIS Member Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.footer_bcs_enabled === '1'}
                    onChange={(e) => handleSettingChange('footer_bcs_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Show BCS Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.footer_ecab_enabled === '1'}
                    onChange={(e) => handleSettingChange('footer_ecab_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Show e-CAB Badge</span>
                </label>
              </div>
            </div>

            {/* Copyright Text */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Bottom Footer Copyright Text</label>
              <input
                type="text"
                value={data.settings.copyright_text}
                onChange={(e) => handleSettingChange('copyright_text', e.target.value)}
                placeholder="Copyright © 2026, Tech Market BD. All Rights Reserved."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>

            {/* Floating Action Controls */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider font-heading">
                Floating Quick Action Widgets (Bottom-Right)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.floating_hotline_enabled === '1'}
                    onChange={(e) => handleSettingChange('floating_hotline_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Floating Call Hotline Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.floating_whatsapp_enabled === '1'}
                    onChange={(e) => handleSettingChange('floating_whatsapp_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Floating WhatsApp Chat Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <input
                    type="checkbox"
                    checked={data.settings.floating_scroll_top_enabled === '1'}
                    onChange={(e) => handleSettingChange('floating_scroll_top_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Floating Scroll-to-Top Button</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Link Create/Edit Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveLink} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              {linkModal.mode === 'create' ? 'Add Navigation Link' : 'Edit Navigation Link'}
            </h3>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Link Title / Label</label>
              <input
                type="text"
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                placeholder="e.g. Corporate Sales"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">URL Target</label>
              <input
                type="text"
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                placeholder="/page/corporate-sales or https://..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Sort Order</label>
                <input
                  type="number"
                  value={linkForm.sort_order}
                  onChange={(e) => setLinkForm({ ...linkForm, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div className="pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkForm.open_new_tab}
                    onChange={(e) => setLinkForm({ ...linkForm, open_new_tab: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Open in New Tab</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLinkModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Save Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Link Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Delete Link?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-slate-100">"{deleteModal.title}"</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLink}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
