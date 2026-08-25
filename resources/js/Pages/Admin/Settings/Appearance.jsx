import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '@/Components/Admin/AdminShell';
import MediaPicker from '@/Components/Admin/MediaPicker';
import { generateThemeCssVariables, ADMIN_FONT_FAMILIES } from '@/Components/Admin/AdminThemeManager';
import { 
  Palette, Type, Sliders, Image as ImageIcon, Save, RefreshCw,
  CheckCircle2, Sparkles, Eye, ShieldCheck, ShoppingBag, Package,
  Layers, Check, RotateCcw, Layout, Sun, Moon, ArrowRight,
  TrendingUp, Users, DollarSign, Tag, Info, AlertCircle
} from 'lucide-react';

const PRESET_PALETTES = [
  {
    name: 'TechMarket Indigo (Default)',
    primary: '#4f46e5',
    secondary: '#6366f1',
    accent: '#8b5cf6',
    sidebar: '#ffffff',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
  {
    name: 'Deep Violet SaaS',
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    accent: '#a855f7',
    sidebar: '#ffffff',
    bg: '#faf5ff',
    border: '#e9d5ff',
  },
  {
    name: 'Enterprise Royal Blue',
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    sidebar: '#ffffff',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
  {
    name: 'Emerald Commerce',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    sidebar: '#ffffff',
    bg: '#f0fdf4',
    border: '#dcfce7',
  },
  {
    name: 'Rose Luxury',
    primary: '#e11d48',
    secondary: '#f43f5e',
    accent: '#fb7185',
    sidebar: '#ffffff',
    bg: '#fff1f2',
    border: '#ffe4e6',
  },
  {
    name: 'Slate Minimalist',
    primary: '#334155',
    secondary: '#475569',
    accent: '#64748b',
    sidebar: '#ffffff',
    bg: '#f8fafc',
    border: '#cbd5e1',
  },
];

const FONT_OPTIONS = [
  {
    id: 'Inter',
    name: 'Inter',
    category: 'Clean SaaS Standard',
    description: 'Highly legible and meticulously crafted for user interfaces and enterprise web applications.',
    sample: 'The quick brown fox jumps over the lazy dog 1234567890',
  },
  {
    id: 'Plus Jakarta Sans',
    name: 'Plus Jakarta Sans',
    category: 'Modern Geometric',
    description: 'Contemporary geometric sans with clean letterforms and high-contrast personality.',
    sample: 'The quick brown fox jumps over the lazy dog 1234567890',
  },
  {
    id: 'Manrope',
    name: 'Manrope',
    category: 'Modern Semi-Geometric',
    description: 'Open, round, and ultra-readable typography optimized for modern dashboards.',
    sample: 'The quick brown fox jumps over the lazy dog 1234567890',
  },
  {
    id: 'DM Sans',
    name: 'DM Sans',
    category: 'Minimal & Friendly',
    description: 'Low-contrast geometric sans designed for small screen clarity and precision.',
    sample: 'The quick brown fox jumps over the lazy dog 1234567890',
  },
  {
    id: 'IBM Plex Sans',
    name: 'IBM Plex Sans',
    category: 'Technical & Industrial',
    description: 'Engineered for human-machine interaction, enterprise computing, and technical matrices.',
    sample: 'The quick brown fox jumps over the lazy dog 1234567890',
  },
  {
    id: 'Source Sans 3',
    name: 'Source Sans 3',
    category: 'Professional Editorial',
    description: 'Rational, elegant, and versatile typeface optimized for dense administrative text.',
    sample: 'The quick brown fox jumps over the lazy dog 1234567890',
  },
];

export default function AdminAppearance({ themeSettings = {}, defaultTheme = {} }) {
  const [activeTab, setActiveTab] = useState('branding');

  const { data, setData, post, processing, reset } = useForm({
    admin_brand_name: themeSettings.admin_brand_name || 'TechMarket Admin',
    admin_logo: themeSettings.admin_logo || '',
    admin_logo_dark: themeSettings.admin_logo_dark || '',
    admin_favicon: themeSettings.admin_favicon || '',
    admin_font_family: themeSettings.admin_font_family || 'Inter',
    admin_heading_font: themeSettings.admin_heading_font || 'Inter',
    admin_primary_color: themeSettings.admin_primary_color || '#4f46e5',
    admin_secondary_color: themeSettings.admin_secondary_color || '#6366f1',
    admin_accent_color: themeSettings.admin_accent_color || '#8b5cf6',
    admin_success_color: themeSettings.admin_success_color || '#10b981',
    admin_warning_color: themeSettings.admin_warning_color || '#f59e0b',
    admin_danger_color: themeSettings.admin_danger_color || '#ef4444',
    admin_info_color: themeSettings.admin_info_color || '#3b82f6',
    admin_sidebar_bg: themeSettings.admin_sidebar_bg || '#ffffff',
    admin_header_bg: themeSettings.admin_header_bg || '#ffffff',
    admin_page_bg: themeSettings.admin_page_bg || '#f8fafc',
    admin_card_bg: themeSettings.admin_card_bg || '#ffffff',
    admin_border_color: themeSettings.admin_border_color || '#e2e8f0',
    admin_text_primary: themeSettings.admin_text_primary || '#0f172a',
    admin_text_secondary: themeSettings.admin_text_secondary || '#475569',
    admin_border_radius: themeSettings.admin_border_radius || '12px',
    admin_card_style: themeSettings.admin_card_style || 'soft_shadow',
    admin_density: themeSettings.admin_density || 'comfortable',
    admin_sidebar_width: themeSettings.admin_sidebar_width || 'standard',
  });

  // Calculate live preview CSS inline
  const previewCss = useMemo(() => {
    return generateThemeCssVariables(data);
  }, [data]);

  const handleApplyPreset = (preset) => {
    setData((prev) => ({
      ...prev,
      admin_primary_color: preset.primary,
      admin_secondary_color: preset.secondary,
      admin_accent_color: preset.accent,
      admin_sidebar_bg: preset.sidebar,
      admin_page_bg: preset.bg,
      admin_border_color: preset.border,
    }));
  };

  const handleReset = () => {
    if (confirm('Reset all Admin Appearance settings to default project theme?')) {
      router.post('/admin/settings/appearance/reset', {}, {
        onSuccess: () => {
          setData(defaultTheme);
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/settings/appearance');
  };

  const tabs = [
    { id: 'branding', label: 'Brand Identity', icon: ImageIcon },
    { id: 'typography', label: 'Typography System', icon: Type },
    { id: 'colors', label: 'Color Palette', icon: Palette },
    { id: 'layout', label: 'Layout & Density', icon: Sliders },
  ];

  return (
    <AdminShell
      title="Admin Theme & Dynamic Branding"
      breadcrumbs={[
        { label: 'Settings', href: '/admin/settings' },
        { label: 'Appearance', href: '/admin/settings/appearance' },
      ]}
    >
      <Head title="Admin Appearance & Theme Settings - TechMarket" />

      {/* Live Preview Style Tag */}
      <style>{previewCss}</style>

      <div className="w-full max-w-[1440px] mx-auto space-y-6 pb-16">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                <Palette className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-heading">
                Admin Theme & Dynamic Branding
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Customize typography, dynamic colors, logo branding, and layout density with real-time live preview.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset to Default</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center space-x-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving Changes...' : 'Save Appearance'}</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE 2-COLUMN GRID (LEFT CONFIG 65% / RIGHT LIVE PREVIEW 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 7-8 COLUMNS: CONFIGURATION TABS & FORMS */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Section Tab Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xs overflow-x-auto no-scrollbar flex items-center space-x-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: BRAND IDENTITY */}
            {activeTab === 'branding' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Brand Identity & Assets
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configure the admin portal title, logo assets, and browser favicon
                    </p>
                  </div>
                </div>

                <div className="space-y-5 text-xs">
                  {/* Brand Name */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Admin Brand / Portal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.admin_brand_name}
                      onChange={(e) => setData('admin_brand_name', e.target.value)}
                      placeholder="e.g. TechMarket Admin"
                      className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium"
                      required
                    />
                    <p className="text-[11.5px] text-slate-500">
                      Displayed in the top left sidebar, topbar brand area, and browser page title.
                    </p>
                  </div>

                  {/* Admin Logo (Light) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Admin Logo (Light Mode)
                    </label>
                    <MediaPicker
                      value={data.admin_logo}
                      onChange={(url) => setData('admin_logo', url)}
                      folder="banners"
                      buttonText="Choose Admin Logo"
                    />
                    <p className="text-[11px] text-slate-500">
                      Transparent PNG or SVG recommended (height: 32-40px). If empty, stylized initial mark will be used.
                    </p>
                  </div>

                  {/* Admin Logo (Dark) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Admin Logo (Dark Mode)
                    </label>
                    <MediaPicker
                      value={data.admin_logo_dark}
                      onChange={(url) => setData('admin_logo_dark', url)}
                      folder="banners"
                      buttonText="Choose Dark Mode Logo"
                    />
                    <p className="text-[11px] text-slate-500">
                      White or bright colored logo used when dark mode is active.
                    </p>
                  </div>

                  {/* Admin Favicon */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Admin Favicon (.ico / .png)
                    </label>
                    <MediaPicker
                      value={data.admin_favicon}
                      onChange={(url) => setData('admin_favicon', url)}
                      folder="banners"
                      buttonText="Choose Admin Favicon"
                    />
                    <p className="text-[11px] text-slate-500">
                      Browser tab icon for the admin panel (32×32px or 64×64px). Independent of storefront favicon.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY SYSTEM */}
            {activeTab === 'typography' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                    <Type className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Premium Typography System
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select body and heading fonts from curated enterprise typography options
                    </p>
                  </div>
                </div>

                <div className="space-y-6 text-xs">
                  {/* Body Font Selection Grid */}
                  <div className="space-y-3">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Admin Body Font Family
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FONT_OPTIONS.map((font) => {
                        const isSelected = data.admin_font_family === font.id;

                        return (
                          <div
                            key={font.id}
                            onClick={() => setData('admin_font_family', font.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            style={{ fontFamily: ADMIN_FONT_FAMILIES[font.id] }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {font.name}
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                                {font.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                              {font.description}
                            </p>
                            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
                              {font.sample}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Heading Font Selection */}
                  <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Heading Font Family
                    </label>
                    <select
                      value={data.admin_heading_font}
                      onChange={(e) => setData('admin_heading_font', e.target.value)}
                      className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs font-bold cursor-pointer"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.name} ({font.category})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">
                      Applied to page titles, card headers, metric numbers, and modal titles.
                    </p>
                  </div>

                  {/* Live Weights Showcase */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Active Font Weights Preview ({data.admin_font_family})
                    </div>
                    <div className="space-y-2" style={{ fontFamily: ADMIN_FONT_FAMILIES[data.admin_font_family] }}>
                      <div className="font-normal text-xs text-slate-700 dark:text-slate-300">
                        Weight 400 (Regular): Modern Enterprise Commerce OS for high performance retailers.
                      </div>
                      <div className="font-medium text-xs text-slate-800 dark:text-slate-200">
                        Weight 500 (Medium): ৳450,000 Total Revenue across 1,280 Orders today.
                      </div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        Weight 600 (SemiBold): ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB.
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                        Weight 700 (Bold): Create Hardware Product & Catalog Architecture.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COLOR THEME PALETTE */}
            {activeTab === 'colors' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Dynamic Color Palette & Presets
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select curated presets or customize brand primary, secondary, and surface tokens
                    </p>
                  </div>
                </div>

                <div className="space-y-6 text-xs">
                  {/* Curated Preset Chips */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Curated 1-Click Theme Presets
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESET_PALETTES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-white dark:bg-slate-800 hover:bg-slate-50 text-left transition-all cursor-pointer group shadow-2xs flex items-center space-x-2.5"
                        >
                          <span
                            className="w-5 h-5 rounded-full shadow-xs shrink-0"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Colors Grid */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Core Brand Tokens
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Primary Color */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          Primary Action Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={data.admin_primary_color}
                            onChange={(e) => setData('admin_primary_color', e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={data.admin_primary_color}
                            onChange={(e) => setData('admin_primary_color', e.target.value)}
                            className="w-full h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          Secondary Gradient Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={data.admin_secondary_color}
                            onChange={(e) => setData('admin_secondary_color', e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={data.admin_secondary_color}
                            onChange={(e) => setData('admin_secondary_color', e.target.value)}
                            className="w-full h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          Accent / Highlights
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={data.admin_accent_color}
                            onChange={(e) => setData('admin_accent_color', e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={data.admin_accent_color}
                            onChange={(e) => setData('admin_accent_color', e.target.value)}
                            className="w-full h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Surface & Workspace Colors */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Workspace Surfaces & Backgrounds
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Page Background */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          Page Background
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={data.admin_page_bg}
                            onChange={(e) => setData('admin_page_bg', e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={data.admin_page_bg}
                            onChange={(e) => setData('admin_page_bg', e.target.value)}
                            className="w-full h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                          />
                        </div>
                      </div>

                      {/* Card Surface */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          Card Surface
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={data.admin_card_bg}
                            onChange={(e) => setData('admin_card_bg', e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={data.admin_card_bg}
                            onChange={(e) => setData('admin_card_bg', e.target.value)}
                            className="w-full h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                          />
                        </div>
                      </div>

                      {/* Border Color */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          Border Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={data.admin_border_color}
                            onChange={(e) => setData('admin_border_color', e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={data.admin_border_color}
                            onChange={(e) => setData('admin_border_color', e.target.value)}
                            className="w-full h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Tokens */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Status Badges (Success, Warning, Danger)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">Success</label>
                        <input
                          type="color"
                          value={data.admin_success_color}
                          onChange={(e) => setData('admin_success_color', e.target.value)}
                          className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">Warning</label>
                        <input
                          type="color"
                          value={data.admin_warning_color}
                          onChange={(e) => setData('admin_warning_color', e.target.value)}
                          className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">Danger</label>
                        <input
                          type="color"
                          value={data.admin_danger_color}
                          onChange={(e) => setData('admin_danger_color', e.target.value)}
                          className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LAYOUT & DENSITY */}
            {activeTab === 'layout' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Layout Geometry & Density
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configure corner rounding, card shadows, density, and sidebar width
                    </p>
                  </div>
                </div>

                <div className="space-y-5 text-xs">
                  {/* Border Radius */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Border Radius (Curvature)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Sharp (4px)', val: '4px' },
                        { label: 'Medium (8px)', val: '8px' },
                        { label: 'Rounded (12px)', val: '12px' },
                        { label: 'Soft Pill (16px)', val: '16px' },
                      ].map((rad) => (
                        <button
                          key={rad.val}
                          type="button"
                          onClick={() => setData('admin_border_radius', rad.val)}
                          className={`p-3 border font-semibold text-xs transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                            data.admin_border_radius === rad.val
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold shadow-2xs'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                          style={{ borderRadius: rad.val }}
                        >
                          <div className="w-6 h-6 border-2 border-slate-400" style={{ borderRadius: rad.val }} />
                          <span>{rad.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Style */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Card Elevation Style
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'flat', label: 'Flat Clean Border', desc: 'Minimalist 1px border without shadow' },
                        { id: 'soft_shadow', label: 'Soft Subtle Shadow', desc: 'Refined modern SaaS micro-shadow' },
                        { id: 'elevated', label: 'Elevated Shadow', desc: 'High-contrast floating card depth' },
                      ].map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setData('admin_card_style', c.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                            data.admin_card_style === c.id
                              ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{c.label}</div>
                          <div className="text-[11px] text-slate-500">{c.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layout Density */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Information Density
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'compact', label: 'Compact Mode', desc: 'Dense tables & tightly spaced cards' },
                        { id: 'comfortable', label: 'Comfortable (Default)', desc: 'Balanced padding for optimal scanning' },
                        { id: 'spacious', label: 'Spacious Mode', desc: 'Extra breathing room and generous spacing' },
                      ].map((d) => (
                        <div
                          key={d.id}
                          onClick={() => setData('admin_density', d.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                            data.admin_density === d.id
                              ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{d.label}</div>
                          <div className="text-[11px] text-slate-500">{d.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 5-4 COLUMNS: LIVE REAL-TIME INTERACTIVE PREVIEW */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                    Live UI Preview
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  REAL-TIME
                </span>
              </div>

              {/* Miniature Realistic Admin Workspace Preview */}
              <div 
                className="rounded-2xl border p-4 space-y-4 shadow-sm transition-all overflow-hidden"
                style={{
                  backgroundColor: data.admin_page_bg,
                  borderColor: data.admin_border_color,
                  borderRadius: data.admin_border_radius,
                  fontFamily: ADMIN_FONT_FAMILIES[data.admin_font_family],
                }}
              >
                {/* Header Mockup */}
                <div 
                  className="p-3 rounded-xl border flex items-center justify-between shadow-2xs"
                  style={{
                    backgroundColor: data.admin_sidebar_bg,
                    borderColor: data.admin_border_color,
                    borderRadius: data.admin_border_radius,
                  }}
                >
                  <div className="flex items-center space-x-2">
                    {data.admin_logo ? (
                      <img src={data.admin_logo} alt="" className="h-6 object-contain" />
                    ) : (
                      <div 
                        className="w-6 h-6 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shadow-xs"
                        style={{
                          background: `linear-gradient(135deg, ${data.admin_primary_color} 0%, ${data.admin_secondary_color} 100%)`,
                        }}
                      >
                        {data.admin_brand_name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="font-bold text-xs truncate max-w-[120px]" style={{ color: data.admin_text_primary }}>
                      {data.admin_brand_name}
                    </span>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                    AD
                  </div>
                </div>

                {/* Metric Card Mockup */}
                <div 
                  className="p-3.5 border space-y-2 transition-all shadow-2xs"
                  style={{
                    backgroundColor: data.admin_card_bg,
                    borderColor: data.admin_border_color,
                    borderRadius: data.admin_border_radius,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: data.admin_text_secondary }}>
                      Total Sales Revenue
                    </span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: data.admin_primary_color }}
                    />
                  </div>
                  <div 
                    className="text-lg font-black tracking-tight" 
                    style={{ 
                      color: data.admin_text_primary,
                      fontFamily: ADMIN_FONT_FAMILIES[data.admin_heading_font],
                    }}
                  >
                    ৳316,518.00
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10.5px]">
                    <span className="font-bold text-emerald-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +14.8%
                    </span>
                    <span style={{ color: data.admin_text_secondary }}>vs last week</span>
                  </div>
                </div>

                {/* Interactive Elements Mockup */}
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="flex-1 py-2 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1"
                      style={{
                        backgroundColor: data.admin_primary_color,
                        borderRadius: data.admin_border_radius,
                      }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                      <span>Primary Action</span>
                    </button>

                    <button
                      type="button"
                      className="px-3 py-2 border font-semibold text-xs transition-all"
                      style={{
                        borderColor: data.admin_border_color,
                        backgroundColor: data.admin_card_bg,
                        color: data.admin_text_secondary,
                        borderRadius: data.admin_border_radius,
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-1.5">
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: data.admin_success_color }}
                    >
                      In Stock
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: data.admin_warning_color }}
                    >
                      Low Stock
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: data.admin_danger_color }}
                    >
                      Out of Stock
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Save */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={processing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Applying Theme...' : 'Save & Apply Theme Globally'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}
