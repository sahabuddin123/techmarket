import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../AdminLayout';
import MediaPicker from '@/Components/Admin/MediaPicker';
import { 
  Sparkles, Layers, ArrowLeft, Save, Eye, Smartphone, Monitor,
  Plus, Trash2, Copy, MoveUp, MoveDown, EyeOff, Sliders,
  ShoppingBag, ShieldCheck, Truck, Star, HelpCircle, Film,
  Image as ImageIcon, Layout, CheckCircle2, ChevronRight,
  ExternalLink, DollarSign, Tag, CreditCard, Flame, Award,
  Check, X, RefreshCw, Radio, Phone, MessageSquare
} from 'lucide-react';

const SECTION_TEMPLATES = [
  {
    type: 'hero',
    name: 'Hero Section',
    desc: 'Main high-converting banner with headline, badges, and countdown timer.',
    icon: Flame,
    defaultSettings: {
      badge: '🔥 LIMITED TIME OFFER',
      offer_pill: 'Mega Savings Deal',
      countdown_enabled: true,
      countdown_hours: 48,
      cta_text: 'অর্ডার করতে ক্লিক করুন / ORDER NOW',
      cta_subtext: 'Cash on Delivery Available Nationwide',
      background_type: 'gradient',
      hero_image: '',
    }
  },
  {
    type: 'product_highlight',
    name: 'Product Highlight',
    desc: 'Dynamic product details, live pricing, savings badge, and stock status.',
    icon: ShoppingBag,
    defaultSettings: {
      highlight_points: ['100% Genuine Official Product', 'Official Brand Warranty in Bangladesh', 'Fastest Home Delivery'],
      show_stock_badge: true,
      show_warranty_badge: true,
      show_sku: true,
    }
  },
  {
    type: 'image_text',
    name: 'Image + Text Story',
    desc: 'Flexible 2-column image and marketing text presentation.',
    icon: Layout,
    defaultSettings: {
      image: '',
      image_position: 'left', // 'left' | 'right'
      badge: 'PROVEN PERFORMANCE',
      cta_text: 'Order Now',
      cta_action: '#order-form',
    }
  },
  {
    type: 'features',
    name: 'Feature Cards Grid',
    desc: 'Key selling points with custom icons in a 2 or 4 column grid.',
    icon: Award,
    defaultSettings: {
      items: [
        { title: 'Authentic Quality', desc: '100% genuine sealed pack directly from authorized distributors.', icon: 'ShieldCheck' },
        { title: 'Official Warranty', desc: 'Hassle-free brand warranty support across all service centers in BD.', icon: 'Award' },
        { title: 'Lightning Fast Delivery', desc: '24-48 hours delivery inside Dhaka, 2-3 days nationwide.', icon: 'Truck' },
        { title: 'Check on Delivery', desc: 'Inspect your package before accepting and pay cash.', icon: 'CheckCircle2' },
      ]
    }
  },
  {
    type: 'gallery',
    name: 'Product Gallery',
    desc: 'Multi-image visual gallery showcase with thumbnail carousel.',
    icon: ImageIcon,
    defaultSettings: {
      images: [],
      video_url: '',
    }
  },
  {
    type: 'offer',
    name: 'Special Deal & Discount',
    desc: 'High-contrast promotional callout with free gift and scarcity badges.',
    icon: Tag,
    defaultSettings: {
      show_gift: true,
      gift_text: 'Free Protection Accessories Included with Every Order',
      urgency_text: 'Only limited stock left at this promotional rate.',
      cta_text: 'অর্ডার করতে ক্লিক করুন / ORDER NOW',
    }
  },
  {
    type: 'comparison',
    name: 'Product Comparison',
    desc: 'Comparison table showcasing advantages over regular/cheap alternatives.',
    icon: Sliders,
    defaultSettings: {
      competitor_name: 'Others / Cheap Clones',
      rows: [
        { feature: 'Product Authenticity', us: '100% Original Brand Intake Pack', them: 'Refurbished / Unknown Source' },
        { feature: 'Warranty Support', us: 'Official Brand Warranty in BD', them: 'No Warranty / 7 Days Seller' },
        { feature: 'Build & Quality', us: 'Certified Durable Components', them: 'Cheap Low Grade Material' },
        { feature: 'Delivery Inspection', us: 'Open Box Check Before Cash Pay', them: 'No Checking Allowed' },
      ]
    }
  },
  {
    type: 'why_us',
    name: 'Why Choose TechMarket BD',
    desc: 'Trust builders highlighting company reputation and guarantee policies.',
    icon: ShieldCheck,
    defaultSettings: {
      points: [
        { title: 'Cash On Delivery', desc: 'No advance payment needed for standard orders. Pay cash at your doorstep.' },
        { title: '24/7 Dedicated Support', desc: 'Direct phone & WhatsApp support for instant setup help & queries.' },
        { title: '7-Days Replacement', desc: 'Instant replacement if any manufacturing fault is discovered.' },
        { title: 'Official Invoice & Tax', desc: 'Computerized printed tax invoice with full warranty validation.' },
      ]
    }
  },
  {
    type: 'reviews',
    name: 'Customer Reviews',
    desc: 'Verified buyer testimonials and 5-star social proof.',
    icon: Star,
    defaultSettings: {
      show_verified_badge: true,
      max_items: 6,
    }
  },
  {
    type: 'faq',
    name: 'FAQ Accordion',
    desc: 'Collapsible questions & answers for reducing purchase hesitation.',
    icon: HelpCircle,
    defaultSettings: {
      faqs: [
        { q: 'পণ্যটি কি ১০০% অরিজিনাল?', a: 'হ্যাঁ, TechMarket BD-এর প্রতিটি পণ্য ১০০% অরিজিনাল ও ইনটেক সিল প্যাক করা।' },
        { q: 'আমি কীভাবে পণ্যটি রিসিভ করব এবং পেমেন্ট করব?', a: 'সারাদেশে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি দেওয়া হয়। ডেলিভারি ম্যানের কাছ থেকে পণ্য দেখে পেমেন্ট করতে পারবেন।' },
        { q: 'ডেলিভারি হতে কত সময় লাগবে?', a: 'ঢাকার ভিতরে ২৪ থেকে ৪৮ ঘণ্টা এবং ঢাকার বাইরে ২ থেকে ৩ দিনের মধ্যে ডেলিভারি সম্পন্ন হয়।' },
        { q: 'কোনো সমস্যা থাকলে কি পরিবর্তন করা যাবে?', a: 'হ্যাঁ, পণ্যটিতে কোনো ম্যানুফ্যাকচারিং ত্রুটি থাকলে ৭ দিনের মধ্যে সরাসরি রিপ্লেসমেন্ট সুবিধা রয়েছে।' },
      ]
    }
  },
  {
    type: 'video',
    name: 'Video Showcase',
    desc: 'Embed YouTube, Facebook, or HTML5 product demonstration video.',
    icon: Film,
    defaultSettings: {
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      caption: 'Watch full hands-on review and feature walkthrough',
    }
  },
  {
    type: 'banner',
    name: 'Promotional Banner',
    desc: 'Full-width graphic banner callout linking directly to the order form.',
    icon: Radio,
    defaultSettings: {
      desktop_banner: '',
      mobile_banner: '',
      link_url: '#order-form',
    }
  },
  {
    type: 'rich_content',
    name: 'Rich HTML Content',
    desc: 'Custom detailed article, user guide, and formatted text blocks.',
    icon: Layout,
    defaultSettings: {
      html_content: '<p>Detailed product overview and technical description goes here...</p>',
    }
  },
  {
    type: 'quick_order',
    name: '1-Click Quick Order Form',
    desc: 'High-converting embedded order section with district delivery rates & payment.',
    icon: CheckCircle2,
    defaultSettings: {
      heading_bn: 'অর্ডার করতে নিচের ফর্মটি সঠিক তথ্য দিয়ে পূরণ করুন',
      order_btn_text: 'অর্ডার কনফার্ম করুন (Confirm Order)',
      guarantee_badge: '🔒 100% Secure & Fast Ordering',
    }
  }
];

export default function LandingPageBuilder({
  isNew = false,
  landingPage = null,
  products = [],
  globalSettings = {},
}) {
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'settings' | 'seo' | 'tracking'
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Form State
  const { data, setData, post, put, processing, errors } = useForm({
    name: landingPage?.name || 'New Campaign Offer',
    slug: landingPage?.slug || '',
    product_id: landingPage?.product_id || (products[0]?.id || ''),
    status: landingPage?.status || 'published',
    campaign_name: landingPage?.campaign_name || 'Facebook Ads Campaign',
    campaign_code: landingPage?.campaign_code || 'META_2026',
    theme_color: landingPage?.theme_color || '#f59e0b',
    show_header: Boolean(landingPage?.show_header ?? true),
    show_footer: Boolean(landingPage?.show_footer ?? true),
    show_sticky_order_btn: Boolean(landingPage?.show_sticky_order_btn ?? true),
    show_whatsapp_btn: Boolean(landingPage?.show_whatsapp_btn ?? true),
    show_call_btn: Boolean(landingPage?.show_call_btn ?? true),
    whatsapp_number: landingPage?.whatsapp_number || '01700000000',
    call_number: landingPage?.call_number || '09600000000',
    custom_order_button_text: landingPage?.custom_order_button_text || 'অর্ডার করতে ক্লিক করুন / ORDER NOW',
    payment_methods: Array.isArray(landingPage?.payment_methods) ? landingPage.payment_methods : ['cod', 'bkash', 'nagad'],
    inside_dhaka_charge: landingPage?.inside_dhaka_charge ?? 60,
    outside_dhaka_charge: landingPage?.outside_dhaka_charge ?? 120,
    is_free_delivery: Boolean(landingPage?.is_free_delivery ?? false),
    custom_discount_amount: landingPage?.custom_discount_amount || '',
    meta_title: landingPage?.meta_title || '',
    meta_description: landingPage?.meta_description || '',
    meta_image: landingPage?.meta_image || '',
    canonical_url: landingPage?.canonical_url || '',
    meta_pixel_id: landingPage?.meta_pixel_id || '',
    ga4_measurement_id: landingPage?.ga4_measurement_id || '',
    gtm_container_id: landingPage?.gtm_container_id || '',
    custom_css: landingPage?.custom_css || '',
    custom_js: landingPage?.custom_js || '',
    sections: Array.isArray(landingPage?.sections) && landingPage.sections.length > 0 
      ? landingPage.sections.map(s => ({
          section_type: s.section_type,
          title: s.title || '',
          subtitle: s.subtitle || '',
          is_visible: Boolean(s.is_visible ?? true),
          settings: typeof s.settings === 'object' && s.settings !== null ? s.settings : {},
        }))
      : [
          {
            section_type: 'hero',
            title: 'Special Offer on Tech Product',
            subtitle: 'Get the best deal today with official warranty & super fast home delivery.',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'hero').defaultSettings }
          },
          {
            section_type: 'product_highlight',
            title: 'Product Highlights & Specifications',
            subtitle: 'Designed for superior performance and everyday reliability',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'product_highlight').defaultSettings }
          },
          {
            section_type: 'features',
            title: 'Why This Is The Best Choice For You',
            subtitle: 'Premium build, certified quality, and backed by official warranty.',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'features').defaultSettings }
          },
          {
            section_type: 'gallery',
            title: 'Product Visual Showcase',
            subtitle: 'High-resolution photographs from all angles',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'gallery').defaultSettings }
          },
          {
            section_type: 'offer',
            title: 'Exclusive Campaign Pricing',
            subtitle: 'Order today to lock in special price before stock runs out!',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'offer').defaultSettings }
          },
          {
            section_type: 'why_us',
            title: 'Why Choose TechMarket BD?',
            subtitle: 'Trusted by 100,000+ satisfied tech enthusiasts across Bangladesh',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'why_us').defaultSettings }
          },
          {
            section_type: 'quick_order',
            title: 'অর্ডার সম্পন্ন করতে নিচের ফর্মটি পূরণ করুন',
            subtitle: 'Please fill in your delivery details to confirm your order immediately.',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'quick_order').defaultSettings }
          },
          {
            section_type: 'reviews',
            title: 'Customer Feedback & Ratings',
            subtitle: 'What verified buyers in Bangladesh say about this product',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'reviews').defaultSettings }
          },
          {
            section_type: 'faq',
            title: 'Frequently Asked Questions',
            subtitle: 'Everything you need to know before ordering',
            is_visible: true,
            settings: { ...SECTION_TEMPLATES.find(t => t.type === 'faq').defaultSettings }
          }
        ]
  });

  const selectedProduct = useMemo(() => {
    return products.find(p => String(p.id) === String(data.product_id)) || products[0] || null;
  }, [data.product_id, products]);

  const activeSection = data.sections[selectedSectionIdx] || null;

  // Section Manipulation Handlers
  const handleAddSection = (template) => {
    const newSection = {
      section_type: template.type,
      title: template.name,
      subtitle: template.desc,
      is_visible: true,
      settings: { ...template.defaultSettings }
    };
    const updated = [...data.sections, newSection];
    setData('sections', updated);
    setSelectedSectionIdx(updated.length - 1);
    setShowAddSectionModal(false);
  };

  const handleRemoveSection = (idx) => {
    const updated = data.sections.filter((_, i) => i !== idx);
    setData('sections', updated);
    setSelectedSectionIdx(Math.max(0, idx - 1));
  };

  const handleMoveSection = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= data.sections.length) return;
    const updated = [...data.sections];
    const [moved] = updated.splice(idx, 1);
    updated.splice(newIdx, 0, moved);
    setData('sections', updated);
    setSelectedSectionIdx(newIdx);
  };

  const handleDuplicateSection = (idx) => {
    const target = data.sections[idx];
    const clone = JSON.parse(JSON.stringify(target));
    clone.title = `${clone.title || 'Section'} (Copy)`;
    const updated = [...data.sections];
    updated.splice(idx + 1, 0, clone);
    setData('sections', updated);
    setSelectedSectionIdx(idx + 1);
  };

  const handleToggleSectionVisibility = (idx) => {
    const updated = [...data.sections];
    updated[idx].is_visible = !updated[idx].is_visible;
    setData('sections', updated);
  };

  const handleUpdateActiveSectionField = (field, value) => {
    const updated = [...data.sections];
    updated[selectedSectionIdx] = {
      ...updated[selectedSectionIdx],
      [field]: value
    };
    setData('sections', updated);
  };

  const handleUpdateActiveSectionSetting = (key, value) => {
    const updated = [...data.sections];
    const currentSettings = updated[selectedSectionIdx]?.settings || {};
    updated[selectedSectionIdx] = {
      ...updated[selectedSectionIdx],
      settings: {
        ...currentSettings,
        [key]: value
      }
    };
    setData('sections', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNew) {
      post('/admin/marketing/landing-pages');
    } else {
      put(`/admin/marketing/landing-pages/${landingPage.id}`);
    }
  };

  return (
    <AdminLayout title={isNew ? 'Create Landing Page' : `Builder: ${data.name}`}>
      <Head title={isNew ? 'Create Landing Page' : `Builder — ${data.name}`} />

      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/marketing/landing-pages"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Back to Landing Pages"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="bg-transparent text-white font-black text-base sm:text-lg border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none px-1"
                  placeholder="Landing Page Campaign Name"
                />
              </div>
              <p className="text-[11px] font-mono text-slate-400 px-1">
                Live URL: <span className="text-amber-400">/l/{data.slug || 'your-slug'}</span>
              </p>
            </div>
          </div>

          {/* Viewport Switcher & Primary Save Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewport === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewport === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile (Ads)</span>
              </button>
            </div>

            {/* Status Selector */}
            <select
              value={data.status}
              onChange={(e) => setData('status', e.target.value)}
              className="bg-slate-950 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="published">🟢 Live / Published</option>
              <option value="draft">⚪ Draft Mode</option>
              <option value="paused">🟡 Paused Campaign</option>
              <option value="scheduled">🔵 Scheduled</option>
            </select>

            {!isNew && landingPage?.slug && (
              <a
                href={`/l/${landingPage.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Preview Tab</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{processing ? 'Saving...' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>

        {/* 3-Pane Page Builder Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[750px]">
          {/* LEFT PANE: Section Navigator & Manager (3 cols) */}
          <div className="lg:col-span-3 bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Page Sections ({data.sections.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSectionModal(true)}
                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-[620px] overflow-y-auto custom-scrollbar pr-1">
              {data.sections.map((sec, idx) => {
                const isSelected = selectedSectionIdx === idx;
                const tmpl = SECTION_TEMPLATES.find(t => t.type === sec.section_type) || SECTION_TEMPLATES[0];
                const Icon = tmpl.icon;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedSectionIdx(idx)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 text-white shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate leading-tight">{sec.title || tmpl.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{tmpl.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleToggleSectionVisibility(idx); }}
                        className="p-1 text-slate-500 hover:text-white"
                        title={sec.is_visible ? 'Hide Section' : 'Show Section'}
                      >
                        {sec.is_visible ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, -1); }}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                        title="Move Up"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 1); }}
                        disabled={idx === data.sections.length - 1}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                        title="Move Down"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDuplicateSection(idx); }}
                        className="p-1 text-slate-500 hover:text-white"
                        title="Duplicate Section"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveSection(idx); }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Section Button */}
            <button
              type="button"
              onClick={() => setShowAddSectionModal(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/60 text-slate-400 hover:text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dynamic Section</span>
            </button>
          </div>

          {/* CENTER PANE: Live Interactive Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start bg-slate-950 rounded-2xl border border-slate-800 p-4 min-h-[700px] overflow-hidden shadow-2xl">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Preview: {viewport === 'desktop' ? 'Desktop 100%' : 'Mobile 380px'}</span>
              </span>
              <span>Theme: <strong style={{ color: data.theme_color }}>{data.theme_color}</strong></span>
            </div>

            <div
              className={`transition-all duration-300 bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-300 font-sans ${
                viewport === 'mobile' ? 'w-[380px] max-w-full' : 'w-full'
              }`}
            >
              {/* Mock Landing Header */}
              {data.show_header && (
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">TM</div>
                    <span className="font-black text-xs tracking-tight">TECHMARKET BD</span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Official Guarantee
                  </div>
                </div>
              )}

              {/* Sections Live Mock Render */}
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                {data.sections.filter(s => s.is_visible).map((sec, idx) => {
                  const isSelected = data.sections.indexOf(sec) === selectedSectionIdx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSectionIdx(data.sections.indexOf(sec))}
                      className={`p-4 transition-all cursor-pointer relative ${
                        isSelected ? 'ring-2 ring-amber-500 bg-amber-50/20' : 'hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded uppercase shadow-xs">
                          Editing
                        </span>
                      )}

                      {/* Section Type Specific Mock Previews */}
                      {sec.section_type === 'hero' && (
                        <div className="text-center py-4 space-y-2">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                            {sec.settings?.badge || '🔥 SPECIAL OFFER'}
                          </span>
                          <h2 className="text-base font-black text-slate-900 leading-tight">
                            {sec.title || selectedProduct?.title || 'Massive Promotional Discount'}
                          </h2>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {sec.subtitle || 'Get the best deal today with official brand warranty.'}
                          </p>
                          {sec.settings?.hero_image && (
                            <img src={sec.settings.hero_image} alt="Hero" className="w-32 h-32 object-contain mx-auto my-2" />
                          )}
                          <button type="button" className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-md uppercase tracking-wider">
                            {sec.settings?.cta_text || 'অর্ডার করতে ক্লিক করুন / ORDER NOW'}
                          </button>
                        </div>
                      )}

                      {sec.section_type === 'product_highlight' && (
                        <div className="py-2 space-y-2">
                          <h3 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1">{sec.title || 'Product Highlights'}</h3>
                          <div className="flex gap-3 items-center">
                            {selectedProduct?.image && (
                              <img src={selectedProduct.image} alt="Prod" className="w-16 h-16 object-contain shrink-0 bg-slate-50 rounded border border-slate-200 p-1" />
                            )}
                            <div className="text-xs">
                              <p className="font-bold text-slate-900 leading-tight">{selectedProduct?.title || 'Selected Product'}</p>
                              <p className="text-amber-600 font-black text-sm mt-0.5">৳{Number(selectedProduct?.price || 0).toLocaleString()}</p>
                              <p className="text-[10px] text-slate-400">Stock: <span className="text-emerald-600 font-bold">In Stock (Verified)</span></p>
                            </div>
                          </div>
                        </div>
                      )}

                      {sec.section_type === 'quick_order' && (
                        <div className="py-3 bg-slate-900 text-white rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{sec.settings?.heading_bn || '১-ক্লিক দ্রুত অর্ডার ফর্ম'}</span>
                          </div>
                          <div className="space-y-1.5">
                            <input disabled placeholder="আপনার নাম (Full Name)" className="w-full bg-slate-950 text-slate-200 p-1.5 rounded text-[11px] border border-slate-700" />
                            <input disabled placeholder="মোবাইল নম্বর (Phone Number)" className="w-full bg-slate-950 text-slate-200 p-1.5 rounded text-[11px] border border-slate-700" />
                            <input disabled placeholder="পূর্ণ ঠিকানা (Delivery Address)" className="w-full bg-slate-950 text-slate-200 p-1.5 rounded text-[11px] border border-slate-700" />
                          </div>
                          <button type="button" className="w-full py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded shadow-md uppercase">
                            {sec.settings?.order_btn_text || 'অর্ডার কনফার্ম করুন (Confirm Order)'}
                          </button>
                        </div>
                      )}

                      {sec.section_type !== 'hero' && sec.section_type !== 'product_highlight' && sec.section_type !== 'quick_order' && (
                        <div className="py-2">
                          <h4 className="font-bold text-xs text-slate-900">{sec.title || sec.section_type}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{sec.subtitle || 'Section content configured in settings.'}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mock Sticky Bottom Bar */}
              {data.show_sticky_order_btn && (
                <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-white">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase">Offer Price</span>
                    <p className="text-amber-400 font-black text-xs leading-none">৳{Number(selectedProduct?.price || 0).toLocaleString()}</p>
                  </div>
                  <button type="button" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-sm">
                    🛒 ORDER NOW
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Active Section Settings & Global Config (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-lg">
            {/* Top Sub-tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('sections')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'sections' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Section Props
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'settings' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Page Setup
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tracking')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'tracking' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Meta/GA4
              </button>
            </div>

            {/* TAB 1: SECTION PROPERTIES */}
            {activeTab === 'sections' && activeSection && (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase font-mono">Active Section</span>
                    <h3 className="font-bold text-white text-sm capitalize">{activeSection.section_type}</h3>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeSection.is_visible}
                      onChange={(e) => handleUpdateActiveSectionField('is_visible', e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Visible</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Section Heading / Title</label>
                  <input
                    type="text"
                    value={activeSection.title || ''}
                    onChange={(e) => handleUpdateActiveSectionField('title', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                    placeholder="Enter section heading..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Section Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={activeSection.subtitle || ''}
                    onChange={(e) => handleUpdateActiveSectionField('subtitle', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                    placeholder="Short description or subtext..."
                  />
                </div>

                {/* Section-Specific Customizable Settings */}
                {activeSection.section_type === 'hero' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Badge Text (Top Pill)</label>
                      <input
                        type="text"
                        value={activeSection.settings?.badge || ''}
                        onChange={(e) => handleUpdateActiveSectionSetting('badge', e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800"
                        placeholder="🔥 LIMITED TIME OFFER"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">CTA Button Text</label>
                      <input
                        type="text"
                        value={activeSection.settings?.cta_text || ''}
                        onChange={(e) => handleUpdateActiveSectionSetting('cta_text', e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800"
                        placeholder="অর্ডার করতে ক্লিক করুন / ORDER NOW"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Hero Showcase Image</label>
                      <MediaPicker
                        value={activeSection.settings?.hero_image || ''}
                        onChange={(url) => handleUpdateActiveSectionSetting('hero_image', url)}
                        label="Hero Graphic"
                        buttonText="Choose Image"
                      />
                    </div>
                  </div>
                )}

                {activeSection.section_type === 'offer' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Free Gift Callout</label>
                      <input
                        type="text"
                        value={activeSection.settings?.gift_text || ''}
                        onChange={(e) => handleUpdateActiveSectionSetting('gift_text', e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Urgency / Scarcity Subtext</label>
                      <input
                        type="text"
                        value={activeSection.settings?.urgency_text || ''}
                        onChange={(e) => handleUpdateActiveSectionSetting('urgency_text', e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800"
                      />
                    </div>
                  </div>
                )}

                {activeSection.section_type === 'video' && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block text-slate-300 font-bold">YouTube / Video Embed URL</label>
                    <input
                      type="text"
                      value={activeSection.settings?.video_url || ''}
                      onChange={(e) => handleUpdateActiveSectionSetting('video_url', e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800 font-mono text-xs"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                )}

                {activeSection.section_type === 'gallery' && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block text-slate-300 font-bold">Gallery Images</label>
                    <MediaPicker
                      value={activeSection.settings?.images || []}
                      onChange={(urls) => handleUpdateActiveSectionSetting('images', urls)}
                      multiple={true}
                      label="Select Gallery Photos"
                      buttonText="Manage Gallery Images"
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PAGE SETUP & PRODUCT BINDING */}
            {activeTab === 'settings' && (
              <div className="space-y-3.5 text-xs text-slate-300">
                {/* Product Binding */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Target Hardware Product *</label>
                  <select
                    value={data.product_id}
                    onChange={(e) => setData('product_id', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} (৳{Number(p.price).toLocaleString()} - Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Campaign Slug */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Custom URL Slug *</label>
                  <input
                    type="text"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    placeholder="e.g. logitech-f310-special-offer"
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-mono"
                  />
                  {errors.slug && <p className="text-rose-400 text-[11px]">{errors.slug}</p>}
                </div>

                {/* Theme Accent Color */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Theme Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.theme_color}
                      onChange={(e) => setData('theme_color', e.target.value)}
                      className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={data.theme_color}
                      onChange={(e) => setData('theme_color', e.target.value)}
                      className="flex-1 bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* Delivery Rates */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200">Delivery Rules</label>
                    <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.is_free_delivery}
                        onChange={(e) => setData('is_free_delivery', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500"
                      />
                      <span className="text-emerald-400 font-bold">Free Delivery</span>
                    </label>
                  </div>

                  {!data.is_free_delivery && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400">Inside Dhaka (৳)</span>
                        <input
                          type="number"
                          value={data.inside_dhaka_charge}
                          onChange={(e) => setData('inside_dhaka_charge', e.target.value)}
                          className="w-full bg-slate-900 text-slate-200 p-1.5 rounded border border-slate-700"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Outside Dhaka (৳)</span>
                        <input
                          type="number"
                          value={data.outside_dhaka_charge}
                          onChange={(e) => setData('outside_dhaka_charge', e.target.value)}
                          className="w-full bg-slate-900 text-slate-200 p-1.5 rounded border border-slate-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Floaters & Support Contacts */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200 block">Contact & Floating Buttons</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">WhatsApp Number</span>
                      <input
                        type="text"
                        value={data.whatsapp_number}
                        onChange={(e) => setData('whatsapp_number', e.target.value)}
                        className="w-full bg-slate-900 text-slate-200 p-1.5 rounded border border-slate-700 text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Call Support Phone</span>
                      <input
                        type="text"
                        value={data.call_number}
                        onChange={(e) => setData('call_number', e.target.value)}
                        className="w-full bg-slate-900 text-slate-200 p-1.5 rounded border border-slate-700 text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TRACKING & PIXEL OVERRIDES */}
            {activeTab === 'tracking' && (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
                  <strong>Meta Pixel & GA4 Integration:</strong> Overrides global pixels for campaign-specific attribution. Catalog Product IDs are automatically matched.
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Meta / Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={data.meta_pixel_id}
                    onChange={(e) => setData('meta_pixel_id', e.target.value)}
                    placeholder={globalSettings.meta_pixel_id ? `Global (${globalSettings.meta_pixel_id})` : 'e.g. 123456789012345'}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Google Analytics (GA4) ID</label>
                  <input
                    type="text"
                    value={data.ga4_measurement_id}
                    onChange={(e) => setData('ga4_measurement_id', e.target.value)}
                    placeholder={globalSettings.ga4_measurement_id ? `Global (${globalSettings.ga4_measurement_id})` : 'G-XXXXXXXXXX'}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Campaign Code (UTM Tag)</label>
                  <input
                    type="text"
                    value={data.campaign_code}
                    onChange={(e) => setData('campaign_code', e.target.value)}
                    placeholder="e.g. FB_SUMMER_2026"
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Section Modal */}
        {showAddSectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base">Add New Dynamic Section</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar p-1 flex-1">
                {SECTION_TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  return (
                    <div
                      key={tmpl.type}
                      onClick={() => handleAddSection(tmpl)}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/40 transition-all cursor-pointer space-y-1.5 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-white text-xs leading-tight group-hover:text-amber-400 transition-colors">{tmpl.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{tmpl.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
