import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import MediaPicker from '../../../Components/Admin/MediaPicker';
import { 
  Sliders, Plus, Edit2, Trash2, Save, Eye, 
  Sparkles, Phone, Mail, MapPin, Globe, Check, 
  ExternalLink, Layers, ArrowUp, MessageCircle, AlertCircle,
  Image as ImageIcon
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
  const { data, setData, post, processing } = useForm({
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

      // Floating Controls
      floating_hotline_enabled: settings.floating_hotline_enabled ?? '1',
      floating_whatsapp_enabled: settings.floating_whatsapp_enabled ?? '1',
      floating_scroll_top_enabled: settings.floating_scroll_top_enabled ?? '1',
    },
  });

  const handleSettingChange = (key, value) => {
    setData('settings', {
      ...data.settings,
      [key]: value,
    });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    post('/admin/header-footer/settings', {
      preserveScroll: true,
    });
  };

  // Link Modal Form State
  const [linkForm, setLinkForm] = useState({
    id: null,
    title: '',
    url: '',
    location: 'footer_info',
    sort_order: 0,
    is_visible: true,
    open_new_tab: false,
  });

  const openCreateLink = (location) => {
    setLinkForm({
      id: null,
      title: '',
      url: '/',
      location,
      sort_order: 0,
      is_visible: true,
      open_new_tab: false,
    });
    setLinkModal({ mode: 'create', location });
  };

  const openEditLink = (link) => {
    setLinkForm({
      id: link.id,
      title: link.title,
      url: link.url,
      location: link.location,
      sort_order: link.sort_order,
      is_visible: link.is_visible,
      open_new_tab: link.open_new_tab,
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

  return (
    <AdminLayout title="Header & Footer Dynamic Builder">
      <Head title="Header & Footer Builder | Admin" />

      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-500" />
              <span>Header & Footer Dynamic Builder</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Customize top announcement tickers, header shortcuts, footer columns, contacts, and affiliations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>

            <button
              onClick={handleSaveSettings}
              disabled={processing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'announcement' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Announcement Bar</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'header' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. Header Actions & Logo</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'contact' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>3. Footer Contacts & Socials</span>
          </button>

          <button
            onClick={() => setActiveTab('info_links')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'info_links' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Info Column Links ({footerInfoLinks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policy_links')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'policy_links' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>5. Policy Column Links ({footerPolicyLinks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'widgets' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>6. Affiliations & Floating Widgets</span>
          </button>
        </div>

        {/* TAB 1: TOP ANNOUNCEMENT BAR */}
        {activeTab === 'announcement' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              Top Announcement Ticker Bar
            </h3>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={data.settings.header_announcement_enabled === '1'}
                  onChange={(e) => handleSettingChange('header_announcement_enabled', e.target.checked ? '1' : '0')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <span className="text-slate-200 font-bold">Enable Top Announcement Bar</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Announcement Message Text</label>
                <input
                  type="text"
                  value={data.settings.header_announcement_text}
                  onChange={(e) => handleSettingChange('header_announcement_text', e.target.value)}
                  placeholder="🎉 Special Eid Campaign 2026: Enjoy Up To 40% Off + Free Shipping on all Laptops!"
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Link URL</label>
                  <input
                    type="text"
                    value={data.settings.header_announcement_link}
                    onChange={(e) => handleSettingChange('header_announcement_link', e.target.value)}
                    placeholder="/offers"
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.settings.header_announcement_bg}
                      onChange={(e) => handleSettingChange('header_announcement_bg', e.target.value)}
                      className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.settings.header_announcement_bg}
                      onChange={(e) => handleSettingChange('header_announcement_bg', e.target.value)}
                      className="w-full bg-slate-950 font-mono text-white rounded px-2.5 py-1.5 border border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.settings.header_announcement_text_color}
                      onChange={(e) => handleSettingChange('header_announcement_text_color', e.target.value)}
                      className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.settings.header_announcement_text_color}
                      onChange={(e) => handleSettingChange('header_announcement_text_color', e.target.value)}
                      className="w-full bg-slate-950 font-mono text-white rounded px-2.5 py-1.5 border border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Ticker Preview */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                Live Announcement Bar Preview
              </span>
              <div
                style={{
                  backgroundColor: data.settings.header_announcement_bg,
                  color: data.settings.header_announcement_text_color,
                }}
                className="w-full p-2 rounded-lg text-xs font-bold flex items-center justify-between shadow"
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{data.settings.header_announcement_text || 'Announcement Text Preview'}</span>
                </div>
                <span className="text-[10px] uppercase underline cursor-pointer">Explore Deal →</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEADER ACTIONS & LOGO */}
        {activeTab === 'header' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 text-xs">
            {/* 1. Storefront Logo Media Pickers */}
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Storefront Brand Logos & Favicon</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-1 mb-4">
                Upload or select official brand logos from the Central Media Library for light mode, dark mode, and browser tabs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Primary Header Logo */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-200 font-bold text-xs">Primary Header Logo</label>
                      <span className="text-[10px] text-amber-400 font-mono">Recommended (200x50)</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">Displayed on white & light header backgrounds.</p>
                  </div>

                  <div className="h-20 p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-center relative group">
                    {data.settings.site_logo ? (
                      <img src={data.settings.site_logo} alt="Header Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-slate-600 font-bold flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-slate-700" />
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
                        className="px-2.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-slate-800 transition-colors cursor-pointer text-[11px] font-bold"
                        title="Remove Logo"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Dark Mode Header Logo */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-200 font-bold text-xs">Dark Mode Header Logo</label>
                      <span className="text-[10px] text-slate-400 font-mono">White / Transparent</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">Displayed on dark theme and sticky header bars.</p>
                  </div>

                  <div className="h-20 p-2 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center relative group">
                    {data.settings.site_logo_dark ? (
                      <img src={data.settings.site_logo_dark} alt="Dark Mode Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-slate-600 font-bold flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-slate-700" />
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
                        className="px-2.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-slate-800 transition-colors cursor-pointer text-[11px] font-bold"
                        title="Remove Dark Logo"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Browser Favicon */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-200 font-bold text-xs">Browser Favicon</label>
                      <span className="text-[10px] text-emerald-400 font-mono">Square (32x32 / 64x64)</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">Displayed on browser tab & mobile bookmarks.</p>
                  </div>

                  <div className="h-20 p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-center relative group">
                    {data.settings.site_favicon ? (
                      <img src={data.settings.site_favicon} alt="Favicon" className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="text-slate-600 font-bold flex flex-col items-center gap-1">
                        <Globe className="w-5 h-5 text-slate-700" />
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
                        className="px-2.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-slate-800 transition-colors cursor-pointer text-[11px] font-bold"
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
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                Store Identity & Search Bar
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Brand Store Title</label>
                  <input
                    type="text"
                    value={data.settings.site_name}
                    onChange={(e) => handleSettingChange('site_name', e.target.value)}
                    placeholder="TechMarket BD"
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-amber-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tagline Subtitle</label>
                  <input
                    type="text"
                    value={data.settings.tagline}
                    onChange={(e) => handleSettingChange('tagline', e.target.value)}
                    placeholder="Trusted Retail Store"
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Search Bar Placeholder</label>
                <input
                  type="text"
                  value={data.settings.search_placeholder}
                  onChange={(e) => handleSettingChange('search_placeholder', e.target.value)}
                  placeholder="Type a product, brand or model..."
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Action Button Toggles */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                Header Action Button Visibility Toggles
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_offers === '1'}
                    onChange={(e) => handleSettingChange('header_show_offers', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">OFFERS Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_emi === '1'}
                    onChange={(e) => handleSettingChange('header_show_emi', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">0% EMI Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_pc_builder === '1'}
                    onChange={(e) => handleSettingChange('header_show_pc_builder', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">PC Builder Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_compare === '1'}
                    onChange={(e) => handleSettingChange('header_show_compare', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Compare Icon</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.header_show_wishlist === '1'}
                    onChange={(e) => handleSettingChange('header_show_wishlist', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Wishlist Icon</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOOTER CONTACTS & SOCIALS */}
        {activeTab === 'contact' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              Footer Contact & Social Media Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Contact Column Heading</label>
                <input
                  type="text"
                  value={data.settings.footer_contact_heading}
                  onChange={(e) => handleSettingChange('footer_contact_heading', e.target.value)}
                  placeholder="Contact Us"
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Customer Care Hotline</label>
                <input
                  type="text"
                  value={data.settings.hotline}
                  onChange={(e) => handleSettingChange('hotline', e.target.value)}
                  placeholder="(+88) 09613562601"
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Support Email</label>
                <input
                  type="email"
                  value={data.settings.support_email}
                  onChange={(e) => handleSettingChange('support_email', e.target.value)}
                  placeholder="info@techmarketbd.com"
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">WhatsApp Hotline Number</label>
                <input
                  type="text"
                  value={data.settings.whatsapp_number}
                  onChange={(e) => handleSettingChange('whatsapp_number', e.target.value)}
                  placeholder="+8801711223344"
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Showroom Address</label>
              <textarea
                rows={2}
                value={data.settings.showroom_dhaka}
                onChange={(e) => handleSettingChange('showroom_dhaka', e.target.value)}
                placeholder="Multiplan Center, Level-6, Shop 608-610, Elephant Road, Dhaka-1205"
                className="w-full bg-slate-950 text-white rounded-lg p-3 border border-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Social Media Links */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                Official Social Media Channels
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Facebook Page URL</label>
                  <input
                    type="text"
                    value={data.settings.facebook_url}
                    onChange={(e) => handleSettingChange('facebook_url', e.target.value)}
                    className="w-full bg-slate-950 text-white rounded px-2.5 py-1.5 border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={data.settings.youtube_url}
                    onChange={(e) => handleSettingChange('youtube_url', e.target.value)}
                    className="w-full bg-slate-950 text-white rounded px-2.5 py-1.5 border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Instagram URL</label>
                  <input
                    type="text"
                    value={data.settings.instagram_url}
                    onChange={(e) => handleSettingChange('instagram_url', e.target.value)}
                    className="w-full bg-slate-950 text-white rounded px-2.5 py-1.5 border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Twitter / X URL</label>
                  <input
                    type="text"
                    value={data.settings.twitter_url}
                    onChange={(e) => handleSettingChange('twitter_url', e.target.value)}
                    className="w-full bg-slate-950 text-white rounded px-2.5 py-1.5 border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">LinkedIn URL</label>
                  <input
                    type="text"
                    value={data.settings.linkedin_url}
                    onChange={(e) => handleSettingChange('linkedin_url', e.target.value)}
                    className="w-full bg-slate-950 text-white rounded px-2.5 py-1.5 border border-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INFORMATION COLUMN LINKS */}
        {activeTab === 'info_links' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Footer Column 2: Information Links
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Manage the navigation items displayed under the Information column.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openCreateLink('footer_info')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Info Link</span>
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Column Title</label>
              <input
                type="text"
                value={data.settings.footer_info_heading}
                onChange={(e) => handleSettingChange('footer_info_heading', e.target.value)}
                className="w-full max-w-sm bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800"
              />
            </div>

            {/* Links Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">URL Target</th>
                    <th className="p-3">New Tab</th>
                    <th className="p-3">Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {footerInfoLinks.length > 0 ? (
                    footerInfoLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{link.title}</td>
                        <td className="p-3 font-mono text-slate-400">{link.url}</td>
                        <td className="p-3">
                          {link.open_new_tab ? (
                            <span className="text-emerald-400 text-[10px] font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No</span>
                          )}
                        </td>
                        <td className="p-3 font-mono">#{link.sort_order}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditLink(link)}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModal(link)}
                              className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 text-xs">
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
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Footer Column 3: Policy Links
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Manage legal, warranty, privacy, and terms policy navigation items.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openCreateLink('footer_policies')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Policy Link</span>
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Column Title</label>
              <input
                type="text"
                value={data.settings.footer_policy_heading}
                onChange={(e) => handleSettingChange('footer_policy_heading', e.target.value)}
                className="w-full max-w-sm bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800"
              />
            </div>

            {/* Policies Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">URL Target</th>
                    <th className="p-3">New Tab</th>
                    <th className="p-3">Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {footerPolicyLinks.length > 0 ? (
                    footerPolicyLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{link.title}</td>
                        <td className="p-3 font-mono text-slate-400">{link.url}</td>
                        <td className="p-3">
                          {link.open_new_tab ? (
                            <span className="text-emerald-400 text-[10px] font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No</span>
                          )}
                        </td>
                        <td className="p-3 font-mono">#{link.sort_order}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditLink(link)}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModal(link)}
                              className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 text-xs">
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
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              Affiliation Badges & Floating Controls
            </h3>

            {/* Affiliations */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                Association & Member Badges
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.footer_basis_enabled === '1'}
                    onChange={(e) => handleSettingChange('footer_basis_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Show BASIS Member Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.footer_bcs_enabled === '1'}
                    onChange={(e) => handleSettingChange('footer_bcs_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Show BCS Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.footer_ecab_enabled === '1'}
                    onChange={(e) => handleSettingChange('footer_ecab_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Show e-CAB Badge</span>
                </label>
              </div>
            </div>

            {/* Copyright Text */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-slate-300 font-bold mb-1">Bottom Footer Copyright Text</label>
              <input
                type="text"
                value={data.settings.copyright_text}
                onChange={(e) => handleSettingChange('copyright_text', e.target.value)}
                placeholder="Copyright © 2026, Tech Market BD. All Rights Reserved."
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Floating Action Controls */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                Floating Quick Action Widgets (Bottom-Right)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.floating_hotline_enabled === '1'}
                    onChange={(e) => handleSettingChange('floating_hotline_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Floating Call Hotline Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.floating_whatsapp_enabled === '1'}
                    onChange={(e) => handleSettingChange('floating_whatsapp_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Floating WhatsApp Chat Button</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={data.settings.floating_scroll_top_enabled === '1'}
                    onChange={(e) => handleSettingChange('floating_scroll_top_enabled', e.target.checked ? '1' : '0')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Floating Scroll-to-Top Button</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Link Create/Edit Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveLink} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-black text-white">
              {linkModal.mode === 'create' ? 'Add Navigation Link' : 'Edit Navigation Link'}
            </h3>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Link Title / Label</label>
              <input
                type="text"
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                placeholder="e.g. Corporate Sales"
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">URL Target</label>
              <input
                type="text"
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                placeholder="/page/corporate-sales or https://..."
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Sort Order</label>
                <input
                  type="number"
                  value={linkForm.sort_order}
                  onChange={(e) => setLinkForm({ ...linkForm, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-800"
                />
              </div>

              <div className="pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkForm.open_new_tab}
                    onChange={(e) => setLinkForm({ ...linkForm, open_new_tab: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Open in New Tab</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLinkModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors"
              >
                Save Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Link Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-white">Delete Link?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteModal.title}"</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLink}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
