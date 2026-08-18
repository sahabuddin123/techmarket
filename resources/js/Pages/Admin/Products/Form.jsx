import React, { useState, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import SectionCard from '../../../Components/Admin/SectionCard';
import StatusBadge from '../../../Components/Admin/StatusBadge';
import SEOScorePanel from '../../../Components/Admin/SEOScorePanel';
import MediaPicker from '@/Components/Admin/MediaPicker';
import RichTextEditor from '@/Components/Admin/RichTextEditor';
import { 
  Package, Save, ArrowLeft, Image as ImageIcon, Plus, Trash2,
  DollarSign, Boxes, Layers, Cpu, Search, CheckCircle2, ShieldCheck,
  Share2, Eye, Sparkles, ExternalLink, AlertTriangle, HelpCircle,
  FileText, Globe, Tag, Check, RefreshCw, ChevronUp, ChevronDown,
  Edit2, ListPlus, Sliders, Table2, LayoutTemplate, X, Copy, Zap
} from 'lucide-react';

export default function ProductForm({ 
  product = null, 
  categories = [], 
  brands = [], 
  specGroups = [], 
  componentTypes = {} 
}) {
  const isEditing = Boolean(product?.id);

  // Initialize existing specification values map
  const initialSpecValues = useMemo(() => {
    const map = {};
    if (product?.specification_values && Array.isArray(product.specification_values)) {
      product.specification_values.forEach(v => {
        map[v.specification_attribute_id] = v.value;
      });
    }
    return map;
  }, [product]);

  // Normalize full_specs
  const initialFullSpecs = useMemo(() => {
    if (Array.isArray(product?.full_specs) && product.full_specs.length > 0) {
      return product.full_specs.map(g => ({
        group: g.group || 'General Specifications',
        attributes: Array.isArray(g.attributes) 
          ? g.attributes.map(a => ({ name: a.name || '', value: a.value || '' }))
          : []
      }));
    }
    if (typeof product?.full_specs === 'object' && product?.full_specs !== null) {
      return Object.entries(product.full_specs).map(([group, attrs]) => ({
        group,
        attributes: typeof attrs === 'object' && attrs !== null 
          ? Object.entries(attrs).map(([name, value]) => ({ name, value: String(value) }))
          : []
      }));
    }
    return [];
  }, [product]);

  const { data, setData, post, put, processing, errors } = useForm({
    title: product?.title || '',
    sku: product?.sku || '',
    category_id: product?.category_id || (categories[0]?.id || ''),
    brand_id: product?.brand_id || '',
    price: product?.price || '',
    regular_price: product?.regular_price || '',
    cost_price: product?.cost_price || '',
    stock: product?.stock ?? 10,
    low_stock_threshold: product?.low_stock_threshold ?? 3,
    is_featured: Boolean(product?.is_featured),
    is_deal_of_day: Boolean(product?.is_deal_of_day),
    is_active: Boolean(product?.is_active ?? true),
    component_type: product?.component_type || '',
    warranty: product?.warranty || '2 Years Official Warranty',
    short_description: product?.short_description || '',
    description: product?.description || '',
    image: product?.image || '',
    gallery: Array.isArray(product?.gallery) ? product.gallery : [],
    
    // SEO Core
    seo_title: product?.seo_title || product?.meta_title || '',
    meta_description: product?.meta_description || '',
    focus_keyword: product?.focus_keyword || '',
    seo_slug: product?.slug || '',
    canonical_url: product?.canonical_url || '',
    meta_robots: product?.meta_robots || 'index, follow',
    is_indexable: Boolean(product?.is_indexable ?? true),

    // Social SEO
    og_title: product?.og_title || '',
    og_description: product?.og_description || '',
    og_image: product?.og_image || '',
    twitter_title: product?.twitter_title || '',
    twitter_description: product?.twitter_description || '',
    twitter_image: product?.twitter_image || '',

    // Key Specs & Full Specifications
    key_specs: Array.isArray(product?.key_specs) ? product.key_specs : [],
    full_specs: initialFullSpecs,
    specification_values: initialSpecValues,
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newKeySpec, setNewKeySpec] = useState('');
  const [editingSpecIndex, setEditingSpecIndex] = useState(null);
  const [editingSpecText, setEditingSpecText] = useState('');
  const [bulkSpecsOpen, setBulkSpecsOpen] = useState(false);
  const [bulkSpecsText, setBulkSpecsText] = useState('');
  const [specPreviewMode, setSpecPreviewMode] = useState(false);

  // Common quick bullet presets
  const quickBulletPresets = [
    'Model: ',
    'Interface: USB',
    'Connectivity: Wired / Wireless',
    'Sensor / DPI: ',
    'Battery Life: ',
    'Weight: ',
    'Compatibility: Windows / Mac / Android',
    'Warranty: 1 Year Official'
  ];

  // Hardware templates for Full Specs
  const hardwareTemplates = {
    peripherals: {
      name: 'Gaming & Peripherals (Gamepad / Mouse / Keyboard)',
      groups: [
        {
          group: 'Main Features',
          attributes: [
            { name: 'Model', value: '' },
            { name: 'Connection Type', value: 'Wired USB / 2.4GHz Wireless' },
            { name: 'Buttons / Keys', value: 'Standard Layout' },
            { name: 'Feedback / Vibration', value: 'Dual Vibration Motors' },
          ]
        },
        {
          group: 'Physical Specifications',
          attributes: [
            { name: 'Cable Length', value: '1.8 Meter' },
            { name: 'Dimensions', value: '' },
            { name: 'Weight', value: '' },
            { name: 'Color', value: 'Black / Dark Blue' },
          ]
        },
        {
          group: 'Compatibility & Warranty',
          attributes: [
            { name: 'System Requirements', value: 'Windows 11, Windows 10, Windows 8, Windows 7' },
            { name: 'Warranty', value: '1 Year Official Brand Warranty' },
          ]
        }
      ]
    },
    monitor: {
      name: 'Monitor & Display',
      groups: [
        {
          group: 'Display Specifications',
          attributes: [
            { name: 'Screen Size', value: '24 Inch / 27 Inch' },
            { name: 'Panel Type', value: 'IPS / VA' },
            { name: 'Resolution', value: '1920 x 1080 (FHD)' },
            { name: 'Refresh Rate', value: '100Hz / 180Hz' },
            { name: 'Response Time', value: '1ms (GTG)' },
            { name: 'Brightness', value: '250 cd/m²' },
          ]
        },
        {
          group: 'Connectivity & I/O Ports',
          attributes: [
            { name: 'HDMI', value: '1x HDMI 1.4 / 2.0' },
            { name: 'DisplayPort', value: '1x DP 1.2' },
            { name: 'Audio Jack', value: '3.5mm Headphone Out' },
          ]
        },
        {
          group: 'Warranty Details',
          attributes: [
            { name: 'Warranty', value: '3 Years (Panel, Parts & Service)' }
          ]
        }
      ]
    },
    gpu: {
      name: 'Graphics Card (GPU)',
      groups: [
        {
          group: 'GPU Architecture',
          attributes: [
            { name: 'Chipset', value: '' },
            { name: 'Boost Clock', value: '' },
            { name: 'CUDA Cores / Stream Processors', value: '' },
          ]
        },
        {
          group: 'Memory Details',
          attributes: [
            { name: 'Memory Size', value: '8GB / 12GB / 16GB' },
            { name: 'Memory Type', value: 'GDDR6 / GDDR6X' },
            { name: 'Memory Bus', value: '128-bit / 256-bit' },
          ]
        },
        {
          group: 'Power & Ports',
          attributes: [
            { name: 'Recommended PSU', value: '550W / 650W' },
            { name: 'Power Connectors', value: '1x 8-pin' },
            { name: 'Display Outputs', value: '3x DP 1.4a, 1x HDMI 2.1' },
            { name: 'Warranty', value: '3 Years Replacement Warranty' },
          ]
        }
      ]
    },
    general: {
      name: 'General Hardware / Audio / Accessory',
      groups: [
        {
          group: 'General Information',
          attributes: [
            { name: 'Brand', value: '' },
            { name: 'Model', value: '' },
            { name: 'Type', value: '' },
          ]
        },
        {
          group: 'Key Technical Features',
          attributes: [
            { name: 'Interface', value: '' },
            { name: 'Frequency Response', value: '' },
            { name: 'Power / Battery', value: '' },
          ]
        },
        {
          group: 'Warranty Details',
          attributes: [
            { name: 'Warranty', value: '1 Year Official Warranty' }
          ]
        }
      ]
    }
  };

  // Auto SEO Generator helper
  const handleAutoGenerateSeo = () => {
    if (!data.title) {
      alert('Please enter a product title first.');
      return;
    }

    const cleanTitle = data.title.trim();
    const brandObj = brands.find(b => String(b.id) === String(data.brand_id));
    const brandName = brandObj ? brandObj.name : '';

    const autoTitle = `${cleanTitle} Price in Bangladesh | TechMarket`;
    const autoSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const autoKeyword = cleanTitle.split(' ').slice(0, 4).join(' ');
    const autoDesc = `Buy authentic ${cleanTitle}${brandName ? ` from ${brandName}` : ''} at the best price in Bangladesh from TechMarket. Official warranty, instant EMI, and express nationwide delivery.`;

    setData(prev => ({
      ...prev,
      seo_title: prev.seo_title || autoTitle,
      meta_description: prev.meta_description || autoDesc,
      focus_keyword: prev.focus_keyword || autoKeyword,
      seo_slug: prev.seo_slug || autoSlug,
      og_title: prev.og_title || autoTitle,
      og_description: prev.og_description || autoDesc,
      og_image: prev.og_image || prev.image,
    }));
  };

  // SEO Score Calculation
  const seoScoreData = useMemo(() => {
    let score = 0;
    const checklist = [];

    const effectiveTitle = data.seo_title || data.title;
    const effectiveDesc = data.meta_description || data.description;
    const kw = data.focus_keyword;

    // 1. Title
    if (effectiveTitle && effectiveTitle.length >= 30 && effectiveTitle.length <= 65) {
      score += 25;
      checklist.push({ label: 'SEO Title optimal (30-65 chars)', passed: true });
    } else {
      checklist.push({ label: 'SEO Title (target 30-65 chars)', passed: false });
    }

    // 2. Description
    if (effectiveDesc && effectiveDesc.length >= 70 && effectiveDesc.length <= 160) {
      score += 25;
      checklist.push({ label: 'Meta description optimal (70-160 chars)', passed: true });
    } else {
      checklist.push({ label: 'Meta description (target 70-160 chars)', passed: false });
    }

    // 3. Focus keyword
    if (kw && effectiveTitle.toLowerCase().includes(kw.toLowerCase())) {
      score += 20;
      checklist.push({ label: `Focus keyword "${kw}" in title`, passed: true });
    } else {
      checklist.push({ label: 'Focus keyword defined in title', passed: false });
    }

    // 4. Primary Image
    if (data.image) {
      score += 15;
      checklist.push({ label: 'Showcase image attached', passed: true });
    } else {
      checklist.push({ label: 'Showcase image attached', passed: false });
    }

    // 5. Indexable
    if (data.is_indexable && data.meta_robots !== 'noindex') {
      score += 15;
      checklist.push({ label: 'Search engine indexation enabled', passed: true });
    } else {
      checklist.push({ label: 'Search engine indexation enabled', passed: false });
    }

    return { score, checklist };
  }, [data.seo_title, data.title, data.meta_description, data.description, data.focus_keyword, data.image, data.is_indexable, data.meta_robots]);

  // Key Specs Highlight Handlers
  const handleAddKeySpec = (text = newKeySpec) => {
    const val = text.trim();
    if (!val) return;
    if (data.key_specs.includes(val)) return;
    setData('key_specs', [...data.key_specs, val]);
    setNewKeySpec('');
  };

  const handleRemoveKeySpec = (index) => {
    setData('key_specs', data.key_specs.filter((_, i) => i !== index));
    if (editingSpecIndex === index) {
      setEditingSpecIndex(null);
    }
  };

  const handleMoveKeySpec = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= data.key_specs.length) return;
    const updated = [...data.key_specs];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setData('key_specs', updated);
  };

  const handleStartEditKeySpec = (index) => {
    setEditingSpecIndex(index);
    setEditingSpecText(data.key_specs[index]);
  };

  const handleSaveEditKeySpec = (index) => {
    if (!editingSpecText.trim()) {
      handleRemoveKeySpec(index);
    } else {
      const updated = [...data.key_specs];
      updated[index] = editingSpecText.trim();
      setData('key_specs', updated);
    }
    setEditingSpecIndex(null);
    setEditingSpecText('');
  };

  const handleBulkParseKeySpecs = () => {
    if (!bulkSpecsText.trim()) return;
    const lines = bulkSpecsText
      .split(/\r?\n|;/)
      .map(l => l.replace(/^[•\-\*\s]+/, '').trim())
      .filter(l => l.length > 0);

    const merged = Array.from(new Set([...data.key_specs, ...lines]));
    setData('key_specs', merged);
    setBulkSpecsText('');
    setBulkSpecsOpen(false);
  };

  // Full Technical Specifications Handlers (full_specs)
  const handleAddSpecGroup = (groupName = 'General Specifications') => {
    const newGroup = {
      group: groupName,
      attributes: [
        { name: 'Model', value: '' },
        { name: 'Key Feature', value: '' }
      ]
    };
    setData('full_specs', [...data.full_specs, newGroup]);
  };

  const handleRemoveSpecGroup = (groupIndex) => {
    setData('full_specs', data.full_specs.filter((_, idx) => idx !== groupIndex));
  };

  const handleRenameSpecGroup = (groupIndex, newName) => {
    const updated = [...data.full_specs];
    updated[groupIndex] = { ...updated[groupIndex], group: newName };
    setData('full_specs', updated);
  };

  const handleAddSpecRow = (groupIndex) => {
    const updated = [...data.full_specs];
    const attrs = updated[groupIndex].attributes || [];
    updated[groupIndex] = {
      ...updated[groupIndex],
      attributes: [...attrs, { name: '', value: '' }]
    };
    setData('full_specs', updated);
  };

  const handleUpdateSpecRow = (groupIndex, attrIndex, field, value) => {
    const updated = [...data.full_specs];
    const attrs = [...updated[groupIndex].attributes];
    attrs[attrIndex] = { ...attrs[attrIndex], [field]: value };
    updated[groupIndex] = { ...updated[groupIndex], attributes: attrs };
    setData('full_specs', updated);
  };

  const handleRemoveSpecRow = (groupIndex, attrIndex) => {
    const updated = [...data.full_specs];
    const attrs = updated[groupIndex].attributes.filter((_, idx) => idx !== attrIndex);
    updated[groupIndex] = { ...updated[groupIndex], attributes: attrs };
    setData('full_specs', updated);
  };

  const handleApplyHardwareTemplate = (templateKey) => {
    const template = hardwareTemplates[templateKey];
    if (!template) return;
    if (data.full_specs.length > 0 && !confirm('Replace current custom specifications with the ' + template.name + ' template?')) {
      return;
    }
    setData('full_specs', JSON.parse(JSON.stringify(template.groups)));
  };

  const handleSpecChange = (attrId, val) => {
    setData('specification_values', {
      ...data.specification_values,
      [attrId]: val,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      put(`/admin/products/${product.id}`);
    } else {
      post('/admin/products');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'media', label: 'Media & Gallery', icon: ImageIcon },
    { id: 'pricing', label: 'Pricing & Schedule', icon: DollarSign },
    { id: 'inventory', label: 'Inventory & SKU', icon: Boxes },
    { id: 'specs', label: 'Specifications', icon: Layers },
    { id: 'seo', label: 'SEO Engine', icon: Search, badge: `${seoScoreData.score}%` },
  ];

  return (
    <AdminLayout title={isEditing ? `Edit: ${data.title || 'Product'}` : 'Create New Product'}>
      <Head title={`${isEditing ? 'Edit Product' : 'Create Product'} - TechMarket BD Admin`} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title={isEditing ? `Edit Product: ${data.title}` : 'Create Hardware Product'}
          subtitle="Configure specifications, inventory allocation, media assets, and search engine metadata."
          breadcrumbs={[
            { label: 'Products', href: '/admin/products' },
            { label: isEditing ? 'Edit' : 'Create' }
          ]}
          actions={
            <div className="flex items-center space-x-2.5">
              <Link
                href="/admin/products"
                className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancel</span>
              </Link>

              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black inline-flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}</span>
              </button>
            </div>
          }
        />

        {/* WORKSPACE GRID: LEFT MAIN TABS + RIGHT STICKY SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2 COLUMNS: WORKSPACE TABS */}
          <div className="lg:col-span-2 space-y-5">
            
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
                    {t.badge && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-950 text-slate-400'}`}>
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: BASIC INFORMATION */}
            {activeTab === 'basic' && (
              <SectionCard title="Basic Information" subtitle="Primary product identity, model, and overview" icon={Package}>
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Product Title <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder="e.g. ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X"
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                      required
                    />
                    {errors.title && <p className="text-rose-400 text-[11px] mt-1">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">SKU Code</label>
                      <input
                        type="text"
                        value={data.sku}
                        onChange={(e) => setData('sku', e.target.value)}
                        placeholder="e.g. GPU-ASUS-4090-OC"
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Warranty Period</label>
                      <input
                        type="text"
                        value={data.warranty}
                        onChange={(e) => setData('warranty', e.target.value)}
                        placeholder="e.g. 3 Years Official Warranty"
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">PC Builder Component Category</label>
                    <select
                      value={data.component_type}
                      onChange={(e) => setData('component_type', e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                    >
                      <option value="">-- Not a PC Component (General Hardware) --</option>
                      {Object.entries(componentTypes || {}).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Short Details / Summary Overview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-300 font-bold">
                        Short Details / Summary Overview
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">Storefront Card & Quick View Excerpt</span>
                    </div>
                    <textarea
                      rows={3}
                      value={data.short_description || ''}
                      onChange={(e) => setData('short_description', e.target.value)}
                      placeholder="Brief 1-3 line highlight summary displayed prominently on product pages, catalog cards, and quick preview modals..."
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500">
                      Concise overview displayed right below the product title & metadata on the storefront.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-300 font-bold">Comprehensive Product Description</label>
                      <span className="text-[10px] text-slate-500 font-mono">WYSIWYG & HTML Supported</span>
                    </div>
                    <RichTextEditor
                      value={data.description || ''}
                      onChange={(html) => setData('description', html)}
                      placeholder="Detailed overview, architecture, thermal design, key features, warranty policy, and accessories..."
                      minHeight="220px"
                    />
                  </div>
                </div>
              </SectionCard>
            )}

            {/* TAB 2: MEDIA & GALLERY */}
            {activeTab === 'media' && (
              <SectionCard title="Product Media & Gallery" subtitle="Showcase photograph and supplementary gallery images" icon={ImageIcon}>
                <div className="space-y-5 text-xs">
                  {/* Primary Showcase Image */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-bold">Primary Showcase Image</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {data.image ? (
                        <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center relative group shrink-0">
                          <img src={data.image} alt="Preview" className="max-h-full max-w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setData('image', '')}
                            className="absolute top-1 right-1 p-1 bg-rose-900/80 text-rose-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <MediaPicker
                          value={data.image}
                          onChange={(url) => setData('image', url)}
                          folder="products"
                          buttonText="Choose Showcase Image"
                        />
                        <p className="text-[11px] text-slate-500">
                          High resolution transparent PNG or WEBP recommended (minimum 800×800px).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supplementary Gallery */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-300">Supplementary Image Gallery</div>
                        <div className="text-[11px] text-slate-500">Additional angles, ports, packaging, and showcase shots</div>
                      </div>

                      <MediaPicker
                        onChange={(url) => {
                          if (url && !data.gallery.includes(url)) {
                            setData('gallery', [...data.gallery, url]);
                          }
                        }}
                        folder="products"
                        buttonText="+ Add Gallery Image"
                      />
                    </div>

                    {data.gallery.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                        {data.gallery.map((url, idx) => (
                          <div key={idx} className="aspect-square bg-slate-950 border border-slate-800 rounded-xl p-2 relative group flex items-center justify-center">
                            <img src={url} alt="" className="max-h-full max-w-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setData('gallery', data.gallery.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 p-1 bg-rose-900/80 text-rose-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                        No supplementary images attached yet.
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* TAB 3: PRICING & SCHEDULE */}
            {activeTab === 'pricing' && (
              <SectionCard title="Pricing & Financial Schedules" subtitle="Regular pricing, promotional discounts, and unit cost" icon={DollarSign}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Special / Sale Price (BDT) <span className="text-rose-400">*</span></label>
                    <input
                      type="number"
                      value={data.price}
                      onChange={(e) => setData('price', e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono font-bold"
                      required
                    />
                    <p className="text-[10px] text-slate-500">Live checkout price charged to customer</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Regular / MSRP Price (BDT)</label>
                    <input
                      type="number"
                      value={data.regular_price}
                      onChange={(e) => setData('regular_price', e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500">Crossed-out anchor price</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Unit Cost Price (BDT)</label>
                    <input
                      type="number"
                      value={data.cost_price}
                      onChange={(e) => setData('cost_price', e.target.value)}
                      placeholder="e.g. 38000"
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500">Internal procurement cost for margins</p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* TAB 4: INVENTORY LEDGER */}
            {activeTab === 'inventory' && (
              <SectionCard title="Inventory & Stock Ledger" subtitle="Real-time physical stock counts and replenishment thresholds" icon={Boxes}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Current In-Stock Quantity</label>
                    <input
                      type="number"
                      value={data.stock}
                      onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono font-bold"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Low Stock Warning Alert Threshold</label>
                    <input
                      type="number"
                      value={data.low_stock_threshold}
                      onChange={(e) => setData('low_stock_threshold', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono font-bold"
                      min="0"
                    />
                  </div>
                </div>
              </SectionCard>
            )}

            {/* TAB 5: SPECIFICATIONS & HIGHLIGHTS STUDIO */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                
                {/* 1. KEY BULLET HIGHLIGHTS STUDIO */}
                <SectionCard 
                  title="Key Bullet Highlights" 
                  subtitle="Short feature bullet points displayed prominently on storefront product cards & top overview" 
                  icon={Layers}
                  badge={<span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30">{data.key_specs.length} Highlights</span>}
                >
                  <div className="space-y-4 text-xs">
                    
                    {/* Quick Preset Tags */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Quick Insert Preset Chips:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {quickBulletPresets.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              setNewKeySpec(preset);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white font-mono text-[11px] transition-all cursor-pointer"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Single Add Input Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={newKeySpec}
                          onChange={(e) => setNewKeySpec(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeySpec())}
                          placeholder="e.g. Model: F310, Connection: USB Cable (1.8m), Dual Vibration Feedback..."
                          className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAddKeySpec()}
                          disabled={!newKeySpec.trim()}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer disabled:opacity-40 transition-all flex items-center space-x-1.5 shrink-0 uppercase tracking-tight"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Add Spec</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBulkSpecsOpen(!bulkSpecsOpen)}
                          className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                            bulkSpecsOpen 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                          title="Bulk paste multiple lines from manufacturer spec sheet"
                        >
                          <ListPlus className="w-3.5 h-3.5 text-amber-400" />
                          <span>Bulk Paste</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Bulk Paste Drawer */}
                    {bulkSpecsOpen && (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                            <ListPlus className="w-4 h-4 text-amber-500" />
                            <span>Bulk Highlights Multi-line Parser</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">1 bullet point per line</span>
                        </div>
                        <textarea
                          rows={4}
                          value={bulkSpecsText}
                          onChange={(e) => setBulkSpecsText(e.target.value)}
                          placeholder="Paste bullet points directly from manufacturer spec sheet:&#10;Model: F310 Gamepad&#10;Dual vibration feedback motors&#10;Standard 4-switch D-pad&#10;1.8m durable USB cable&#10;1 Year Brand Warranty"
                          className="w-full bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs leading-relaxed"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBulkSpecsText('');
                              setBulkSpecsOpen(false);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleBulkParseKeySpecs}
                            disabled={!bulkSpecsText.trim()}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl disabled:opacity-40 flex items-center space-x-1 uppercase"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Parse & Add All</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Active Highlights List */}
                    <div className="space-y-2 pt-2">
                      {data.key_specs.length > 0 ? (
                        data.key_specs.map((spec, i) => (
                          <div 
                            key={i} 
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 group transition-all"
                          >
                            {/* Number & Content */}
                            <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 text-slate-500 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>

                              {editingSpecIndex === i ? (
                                <div className="flex items-center space-x-2 flex-1">
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingSpecText}
                                    onChange={(e) => setEditingSpecText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEditKeySpec(i)}
                                    className="flex-1 bg-slate-900 text-slate-100 px-2 py-1 rounded-lg border border-amber-500 focus:outline-none text-xs font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditKeySpec(i)}
                                    className="p-1 rounded bg-amber-500 text-slate-950 font-bold"
                                    title="Save Edit"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSpecIndex(null)}
                                    className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                                    title="Cancel Edit"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="font-mono text-slate-200 text-xs truncate">
                                  {spec}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons: Reorder, Edit, Delete */}
                            {editingSpecIndex !== i && (
                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveKeySpec(i, -1)}
                                  disabled={i === 0}
                                  className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 hover:bg-slate-900 rounded"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveKeySpec(i, 1)}
                                  disabled={i === data.key_specs.length - 1}
                                  className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 hover:bg-slate-900 rounded"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditKeySpec(i)}
                                  className="p-1 text-slate-500 hover:text-amber-400 hover:bg-slate-900 rounded transition-colors"
                                  title="Edit Highlight"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKeySpec(i)}
                                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                                  title="Remove Highlight"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-slate-400 text-xs font-medium">No highlights added yet.</p>
                          <p className="text-[11px] text-slate-600">
                            Add key bullet highlights above or click one of the quick preset chips to enhance storefront product cards.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </SectionCard>

                {/* 2. CUSTOM TECHNICAL SPECIFICATIONS TABLE STUDIO (full_specs) */}
                <SectionCard
                  title="Comprehensive Technical Specifications Table"
                  subtitle="Build structured multi-section technical specification sheets rendered on the storefront"
                  icon={Table2}
                  badge={
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSpecPreviewMode(!specPreviewMode)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          specPreviewMode 
                            ? 'bg-amber-500 text-slate-950 shadow-xs' 
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {specPreviewMode ? 'Edit Mode' : 'Storefront Preview'}
                      </button>
                    </div>
                  }
                >
                  <div className="space-y-5 text-xs">
                    
                    {/* Top Action Bar: Template Presets + Add Group */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      
                      {/* Template Selector */}
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 font-bold text-[11px] flex items-center space-x-1">
                          <LayoutTemplate className="w-3.5 h-3.5 text-amber-500" />
                          <span>Apply Preset:</span>
                        </span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleApplyHardwareTemplate(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                          className="bg-slate-900 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                        >
                          <option value="" disabled>Choose Hardware Template...</option>
                          <option value="peripherals">Gaming Peripherals (Gamepad / Mouse / Keyboard)</option>
                          <option value="monitor">Monitors & Displays</option>
                          <option value="gpu">Graphics Cards (GPU)</option>
                          <option value="general">General Audio / Accessories</option>
                        </select>
                      </div>

                      {/* Add Custom Group Button */}
                      <button
                        type="button"
                        onClick={() => handleAddSpecGroup('General Specifications')}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-bold rounded-xl border border-amber-500/30 flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Specification Group</span>
                      </button>
                    </div>

                    {/* LIVE STOREFRONT PREVIEW */}
                    {specPreviewMode ? (
                      <div className="p-4 bg-white rounded-xl border border-slate-300 text-[#111] space-y-4 shadow-sm">
                        <div className="text-xs font-bold text-[#002a5c] uppercase tracking-wider pb-2 border-b border-slate-200">
                          Storefront Specification Table Preview
                        </div>
                        {data.full_specs.length > 0 ? (
                          data.full_specs.map((group, gIdx) => (
                            <div key={gIdx} className="rounded border border-slate-200 overflow-hidden text-xs">
                              <div className="bg-slate-100 px-3 py-2 font-bold text-slate-900 uppercase border-b border-slate-200">
                                {group.group || 'General Specifications'}
                              </div>
                              <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-100">
                                  {group.attributes?.map((attr, aIdx) => (
                                    <tr key={aIdx} className="hover:bg-slate-50">
                                      <td className="w-1/3 px-3 py-2 font-medium text-slate-600 bg-slate-50 border-r border-slate-100">
                                        {attr.name || 'Feature'}
                                      </td>
                                      <td className="px-3 py-2 text-slate-900">
                                        {attr.value || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-slate-400 text-xs">
                            No specification groups defined. Add a group or apply a preset above.
                          </div>
                        )}
                      </div>
                    ) : (
                      /* SPECIFICATION GROUPS BUILDER */
                      <div className="space-y-4">
                        {data.full_specs.length > 0 ? (
                          data.full_specs.map((group, gIdx) => (
                            <div 
                              key={gIdx} 
                              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                            >
                              {/* Group Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                  <input
                                    type="text"
                                    value={group.group}
                                    onChange={(e) => handleRenameSpecGroup(gIdx, e.target.value)}
                                    placeholder="Group Name (e.g. Main Features, Connectivity, Physical Dimensions)..."
                                    className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-800 focus:border-amber-500 text-xs flex-1 max-w-md"
                                  />
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddSpecRow(gIdx)}
                                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold border border-slate-800 flex items-center space-x-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Row</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSpecGroup(gIdx)}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg"
                                    title="Delete Group"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Attributes Key-Value Rows */}
                              <div className="space-y-2 pt-1">
                                {group.attributes?.map((attr, aIdx) => (
                                  <div key={aIdx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={attr.name}
                                      onChange={(e) => handleUpdateSpecRow(gIdx, aIdx, 'name', e.target.value)}
                                      placeholder="Attribute (e.g. Connection Type, Cable Length, Warranty)..."
                                      className="w-1/3 bg-slate-900 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:border-amber-500 text-xs font-medium"
                                    />
                                    <input
                                      type="text"
                                      value={attr.value}
                                      onChange={(e) => handleUpdateSpecRow(gIdx, aIdx, 'value', e.target.value)}
                                      placeholder="Specification Value (e.g. Wired USB 2.0, 1.8 Meter, 1 Year)..."
                                      className="flex-1 bg-slate-900 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:border-amber-500 text-xs font-mono"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSpecRow(gIdx, aIdx)}
                                      className="p-2 text-slate-600 hover:text-rose-400 hover:bg-slate-900 rounded-xl"
                                      title="Remove Row"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}

                                {(!group.attributes || group.attributes.length === 0) && (
                                  <div className="p-3 text-center text-slate-500 text-[11px] font-mono">
                                    No attribute rows in this group. Click "+ Add Row" above to add attributes.
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 rounded-3xl bg-slate-950/60 border-2 border-dashed border-slate-800 text-center space-y-3">
                            <Table2 className="w-10 h-10 text-slate-600 mx-auto" />
                            <div>
                              <h4 className="text-slate-200 font-bold text-sm">No Custom Specification Tables Yet</h4>
                              <p className="text-slate-400 text-xs mt-1">
                                Click a hardware template preset above or add a custom specification group to build a structured spec sheet.
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => handleApplyHardwareTemplate('peripherals')}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl text-xs font-bold"
                              >
                                + Gaming Peripherals Template
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyHardwareTemplate('monitor')}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl text-xs font-bold"
                              >
                                + Monitors Template
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddSpecGroup('General Specifications')}
                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase"
                              >
                                + Create Custom Group
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </SectionCard>

                {/* 3. CATEGORY PREDEFINED GLOBAL ATTRIBUTES (EAV if available) */}
                {specGroups.length > 0 && (
                  <SectionCard 
                    title="Category Standard Attribute Values" 
                    subtitle="Pre-configured global specifications defined for this product category" 
                    icon={Cpu}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {specGroups.flatMap(g => g.attributes || []).map((attr) => (
                        <div key={attr.id} className="space-y-1">
                          <label className="block text-slate-400 font-bold">{attr.name}</label>
                          <input
                            type="text"
                            value={data.specification_values[attr.id] || ''}
                            onChange={(e) => handleSpecChange(attr.id, e.target.value)}
                            placeholder={`Enter ${attr.name}...`}
                            className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

              </div>
            )}

            {/* TAB 6: SEO WORKSPACE */}
            {activeTab === 'seo' && (
              <div className="space-y-5">
                <SEOScorePanel
                  score={seoScoreData.score}
                  checklist={seoScoreData.checklist}
                  title={data.seo_title || data.title}
                  description={data.meta_description || data.description}
                  slug={data.seo_slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                  onGenerateAuto={handleAutoGenerateSeo}
                />

                <SectionCard title="Search Engine Metadata" subtitle="Canonical URLs, search crawler instructions, and indexing" icon={Search}>
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">SEO Meta Title (Title Tag)</label>
                      <input
                        type="text"
                        value={data.seo_title}
                        onChange={(e) => setData('seo_title', e.target.value)}
                        placeholder="e.g. ASUS ROG Strix RTX 4090 Price in Bangladesh | TechMarket"
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Meta Description</label>
                      <textarea
                        rows={3}
                        value={data.meta_description}
                        onChange={(e) => setData('meta_description', e.target.value)}
                        placeholder="Comprehensive specs, official warranty, and doorstep fast delivery in Bangladesh from TechMarket..."
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-bold">Focus Keyword</label>
                        <input
                          type="text"
                          value={data.focus_keyword}
                          onChange={(e) => setData('focus_keyword', e.target.value)}
                          placeholder="e.g. RTX 4090 price in bd"
                          className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-300 font-bold">Custom URL Slug</label>
                        <input
                          type="text"
                          value={data.seo_slug}
                          onChange={(e) => setData('seo_slug', e.target.value)}
                          placeholder="e.g. asus-rog-strix-rtx-4090"
                          className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

          </div>

          {/* RIGHT 1 COLUMN: STICKY PUBLISHING SIDEBAR */}
          <div className="space-y-5 sticky top-20">
            
            {/* Publish & Status Card */}
            <SectionCard title="Publishing & Status" icon={Globe}>
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Catalog Visibility</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Featured Showcase</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.is_featured}
                      onChange={(e) => setData('is_featured', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Deal of the Day</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.is_deal_of_day}
                      onChange={(e) => setData('is_deal_of_day', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{processing ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}</span>
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Category & Brand Association */}
            <SectionCard title="Organization" icon={Tag}>
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Category Hierarchy <span className="text-rose-400">*</span></label>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Brand / Manufacturer</label>
                  <select
                    value={data.brand_id}
                    onChange={(e) => setData('brand_id', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                  >
                    <option value="">-- No Brand / Generic --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

          </div>

        </div>
      </form>
    </AdminLayout>
  );
}
