import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminShell from '@/Components/Admin/AdminShell';
import SEOScorePanel from '@/Components/Admin/SEOScorePanel';
import MediaPicker from '@/Components/Admin/MediaPicker';
import RichTextEditor from '@/Components/Admin/RichTextEditor';
import { 
  Package, Save, ArrowLeft, Image as ImageIcon, Plus, Trash2,
  DollarSign, Boxes, Layers, Cpu, Search, CheckCircle2, ShieldCheck,
  Share2, Eye, Sparkles, ExternalLink, AlertTriangle, HelpCircle,
  FileText, Globe, Tag, Check, RefreshCw, ChevronUp, ChevronDown,
  Edit2, ListPlus, Sliders, Table2, LayoutTemplate, X, Copy, Zap,
  ChevronRight, Calendar, ChevronDown as ChevronDownIcon, FolderTree,
  TrendingUp, BarChart3, AlertCircle, ShoppingBag, Radio, ArrowUpRight
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

  const { data, setData, post, put, processing, errors, isDirty } = useForm({
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
    'Interface: USB Type-C',
    'Connectivity: Wired / Wireless',
    'Sensor / DPI: ',
    'Battery Life: ',
    'Weight: ',
    'Compatibility: Windows 11 / Mac',
    'Warranty: 2 Years Official'
  ];

  // Hardware templates for Full Specs
  const hardwareTemplates = {
    peripherals: {
      name: 'Gaming & Peripherals (Mouse / Keyboard / Headset)',
      groups: [
        {
          group: 'Main Features',
          attributes: [
            { name: 'Model', value: '' },
            { name: 'Connection Type', value: 'Wired USB / 2.4GHz Wireless / Bluetooth' },
            { name: 'Lighting', value: 'RGB Chroma Backlit' },
            { name: 'Sensor / Switch', value: 'Optical Gaming Sensor' },
          ]
        },
        {
          group: 'Physical Specifications',
          attributes: [
            { name: 'Cable Length', value: '1.8m Braided Fiber' },
            { name: 'Dimensions', value: '' },
            { name: 'Weight', value: '' },
            { name: 'Color', value: 'Black' },
          ]
        },
        {
          group: 'Warranty Information',
          attributes: [
            { name: 'Warranty Period', value: '2 Years Official Manufacturer Warranty' },
          ]
        }
      ]
    },
    motherboard: {
      name: 'Motherboard (Intel / AMD Chipset)',
      groups: [
        {
          group: 'Processor Support',
          attributes: [
            { name: 'CPU Socket', value: 'LGA1700 / AM5' },
            { name: 'Supported Processors', value: '14th/13th/12th Gen Intel Core or AMD Ryzen 7000/8000' },
            { name: 'Chipset', value: 'Intel Z790 / AMD B650' },
          ]
        },
        {
          group: 'Memory & Expansion',
          attributes: [
            { name: 'Memory Type', value: 'DDR5 7200+(OC) MHz' },
            { name: 'Memory Slots', value: '4 x DIMM (Max 192GB)' },
            { name: 'PCIe Slots', value: '1 x PCIe 5.0 x16, 2 x PCIe 4.0 x16' },
            { name: 'M.2 Storage', value: '4 x M.2 PCIe 4.0 NVMe' },
          ]
        },
        {
          group: 'Connectivity & Audio',
          attributes: [
            { name: 'LAN', value: '2.5G Realtek Ethernet' },
            { name: 'Wireless', value: 'Wi-Fi 6E + Bluetooth 5.3' },
            { name: 'Audio', value: 'Realtek 7.1 Surround High Definition' },
          ]
        }
      ]
    },
    gpu: {
      name: 'Graphics Card (NVIDIA / AMD Radeon)',
      groups: [
        {
          group: 'GPU Specifications',
          attributes: [
            { name: 'Graphics Engine', value: 'NVIDIA GeForce RTX 4070 Ti SUPER' },
            { name: 'Bus Standard', value: 'PCI Express 4.0 16x' },
            { name: 'CUDA Cores', value: '8448 Units' },
            { name: 'Core Clock', value: 'Boost: 2655 MHz' },
          ]
        },
        {
          group: 'Memory Specifications',
          attributes: [
            { name: 'Memory Size', value: '16GB GDDR6X' },
            { name: 'Memory Bus', value: '256-bit' },
            { name: 'Memory Speed', value: '21 Gbps' },
          ]
        },
        {
          group: 'Power & Output',
          attributes: [
            { name: 'Recommended PSU', value: '750W' },
            { name: 'Power Connectors', value: '1 x 16-pin (12VHPWR)' },
            { name: 'Display Outputs', value: '3 x DisplayPort 1.4a, 1 x HDMI 2.1a' },
          ]
        }
      ]
    },
    processor: {
      name: 'Processor / CPU',
      groups: [
        {
          group: 'Core Specifications',
          attributes: [
            { name: 'Total Cores', value: '16 (8 Performance + 8 Efficient)' },
            { name: 'Total Threads', value: '24' },
            { name: 'Max Turbo Frequency', value: '5.60 GHz' },
            { name: 'Base Frequency', value: '3.40 GHz' },
            { name: 'L3 Cache', value: '30MB Intel Smart Cache' },
          ]
        },
        {
          group: 'Power & Thermal',
          attributes: [
            { name: 'Base Power', value: '125W' },
            { name: 'Maximum Turbo Power', value: '253W' },
            { name: 'Integrated Graphics', value: 'Intel UHD Graphics 770' },
          ]
        }
      ]
    },
    monitor: {
      name: 'Monitor Display',
      groups: [
        {
          group: 'Display Panel',
          attributes: [
            { name: 'Screen Size', value: '27 Inch' },
            { name: 'Resolution', value: 'QHD 2560 x 1440 Pixels' },
            { name: 'Panel Type', value: 'Fast IPS' },
            { name: 'Refresh Rate', value: '180Hz' },
            { name: 'Response Time', value: '0.5ms (GTG)' },
          ]
        },
        {
          group: 'Color & Brightness',
          attributes: [
            { name: 'Color Gamut', value: '99% sRGB, 95% DCI-P3' },
            { name: 'Brightness', value: '350 cd/m² (HDR400)' },
            { name: 'Contrast Ratio', value: '1000:1' },
            { name: 'Sync Technology', value: 'AMD FreeSync Premium / G-Sync Compatible' },
          ]
        }
      ]
    }
  };

  // Profit Margin & Discount Calculations
  const calculatedSavings = useMemo(() => {
    const reg = parseFloat(data.regular_price) || 0;
    const sale = parseFloat(data.price) || 0;
    if (reg > 0 && sale > 0 && reg > sale) {
      const amount = reg - sale;
      const percentage = Math.round((amount / reg) * 100);
      return { amount, percentage };
    }
    return null;
  }, [data.regular_price, data.price]);

  const grossProfit = useMemo(() => {
    const sale = parseFloat(data.price) || 0;
    const cost = parseFloat(data.cost_price) || 0;
    if (sale > 0 && cost > 0) {
      const profit = sale - cost;
      const margin = ((profit / sale) * 100).toFixed(1);
      return { profit, margin };
    }
    return null;
  }, [data.price, data.cost_price]);

  // Selected Category & Brand objects
  const selectedCategory = useMemo(() => {
    return categories.find(c => String(c.id) === String(data.category_id));
  }, [categories, data.category_id]);

  const selectedBrand = useMemo(() => {
    return brands.find(b => String(b.id) === String(data.brand_id));
  }, [brands, data.brand_id]);

  // Submit Handler
  const handleSubmit = (e, forcedActiveState = null) => {
    if (e) e.preventDefault();

    if (forcedActiveState !== null) {
      setData('is_active', forcedActiveState);
    }

    if (isEditing) {
      put(`/admin/products/${product.id}`, {
        preserveScroll: true,
      });
    } else {
      post('/admin/products', {
        preserveScroll: true,
      });
    }
  };

  // Key Spec Bullets Helpers
  const addKeySpec = () => {
    if (!newKeySpec.trim()) return;
    setData('key_specs', [...data.key_specs, newKeySpec.trim()]);
    setNewKeySpec('');
  };

  const removeKeySpec = (index) => {
    const updated = data.key_specs.filter((_, i) => i !== index);
    setData('key_specs', updated);
  };

  const saveEditKeySpec = (index) => {
    if (!editingSpecText.trim()) return;
    const updated = [...data.key_specs];
    updated[index] = editingSpecText.trim();
    setData('key_specs', updated);
    setEditingSpecIndex(null);
    setEditingSpecText('');
  };

  const moveKeySpec = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= data.key_specs.length) return;
    const updated = [...data.key_specs];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setData('key_specs', updated);
  };

  const applyHardwareTemplate = (templateKey) => {
    const tmpl = hardwareTemplates[templateKey];
    if (!tmpl) return;
    if (data.full_specs.length > 0 && !confirm(`Replace current full specs with "${tmpl.name}" template?`)) {
      return;
    }
    setData('full_specs', JSON.parse(JSON.stringify(tmpl.groups)));
  };

  // Full Specs Helpers
  const addSpecGroup = () => {
    setData('full_specs', [
      ...data.full_specs,
      { group: 'New Specification Group', attributes: [{ name: '', value: '' }] }
    ]);
  };

  const removeSpecGroup = (gIndex) => {
    setData('full_specs', data.full_specs.filter((_, i) => i !== gIndex));
  };

  const updateGroupName = (gIndex, newName) => {
    const updated = [...data.full_specs];
    updated[gIndex].group = newName;
    setData('full_specs', updated);
  };

  const addSpecAttribute = (gIndex) => {
    const updated = [...data.full_specs];
    updated[gIndex].attributes.push({ name: '', value: '' });
    setData('full_specs', updated);
  };

  const updateSpecAttribute = (gIndex, aIndex, field, val) => {
    const updated = [...data.full_specs];
    updated[gIndex].attributes[aIndex][field] = val;
    setData('full_specs', updated);
  };

  const removeSpecAttribute = (gIndex, aIndex) => {
    const updated = [...data.full_specs];
    updated[gIndex].attributes = updated[gIndex].attributes.filter((_, i) => i !== aIndex);
    setData('full_specs', updated);
  };

  const handleBulkSpecsApply = () => {
    try {
      const lines = bulkSpecsText.split('\n').filter(l => l.trim().length > 0);
      let currentGroup = 'Main Specifications';
      const parsedGroups = [];
      let currentAttrs = [];

      lines.forEach(line => {
        if (line.startsWith('#') || line.startsWith('[')) {
          if (currentAttrs.length > 0) {
            parsedGroups.push({ group: currentGroup, attributes: currentAttrs });
            currentAttrs = [];
          }
          currentGroup = line.replace(/^[#\[\s]+|[\]\s]+$/g, '').trim();
        } else if (line.includes(':') || line.includes('\t')) {
          const parts = line.includes('\t') ? line.split('\t') : line.split(':');
          const name = (parts[0] || '').trim();
          const value = parts.slice(1).join(':').trim();
          if (name) {
            currentAttrs.push({ name, value });
          }
        }
      });

      if (currentAttrs.length > 0) {
        parsedGroups.push({ group: currentGroup, attributes: currentAttrs });
      }

      if (parsedGroups.length > 0) {
        setData('full_specs', parsedGroups);
        setBulkSpecsOpen(false);
        setBulkSpecsText('');
      } else {
        alert('Could not parse specifications. Use format: "Attribute Name: Value" per line.');
      }
    } catch (e) {
      alert('Error parsing specifications text: ' + e.message);
    }
  };

  // Section navigation tabs
  const navTabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'media', label: 'Media & Gallery', icon: ImageIcon },
    { id: 'description', label: 'Description & Highlights', icon: FileText },
    { id: 'pricing', label: 'Pricing & Schedule', icon: DollarSign },
    { id: 'inventory', label: 'Inventory & SKU', icon: Boxes },
    { id: 'specifications', label: 'Technical Specs', icon: Layers },
    { id: 'seo', label: 'SEO & Search', icon: Globe },
  ];

  return (
    <AdminShell
      title={isEditing ? `Edit: ${data.title || 'Product'}` : 'Create Hardware Product'}
      breadcrumbs={[
        { label: 'Catalog', href: '/admin/products' },
        { label: 'Products', href: '/admin/products' },
        { label: isEditing ? 'Edit Product' : 'Create', href: '#' },
      ]}
    >
      <Head title={isEditing ? `Edit: ${data.title} - Admin` : 'Create Hardware Product - TechMarket Admin'} />

      <form onSubmit={handleSubmit} className="w-full max-w-[1440px] mx-auto space-y-6 pb-20">
        
        {/* =========================================================================
            1. SHOPIFY-STYLE HEADER WITH DYNAMIC CTAs
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/products"
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors"
                title="Back to Products"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-heading">
                {isEditing ? `Edit Product: ${data.title}` : 'Create Hardware Product'}
              </h1>
              {data.is_active ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Draft
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Configure product identity, pricing, inventory stock, technical specs, media assets, and SEO indexing.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all shadow-2xs"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={() => handleSubmit(null, false)}
              disabled={processing}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold inline-flex items-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: 'var(--admin-primary, #4f46e5)',
              }}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. HORIZONTAL SECTION PILL NAVIGATION (SHOPIFY-STYLE)
            ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xs overflow-x-auto no-scrollbar flex items-center space-x-1">
          {navTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                style={isActive ? { backgroundColor: 'var(--admin-primary, #4f46e5)' } : {}}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            3. MAIN TWO-COLUMN WORKSPACE (LEFT: FORM CARDS / RIGHT: STICKY SIDEBAR)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* -----------------------------------------------------------------------
              LEFT COLUMN: PRIMARY FORM SECTIONS (8 OF 12 COLS)
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-6">

            {/* SECTION 1: BASIC INFORMATION */}
            {activeTab === 'basic' && (
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
                style={{ borderRadius: 'var(--admin-radius, 12px)' }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                        Basic Information
                      </h2>
                      <p className="text-xs text-slate-500">
                        Core product identity, model title, categorization, and short summary
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 text-xs">
                  {/* Product Title (Prominent) */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                      Product Title / Model Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder="e.g. ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X"
                      className={`w-full h-12 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 rounded-xl border ${
                        errors.title ? 'border-rose-400 focus:border-rose-500 ring-rose-100' : 'border-slate-200 dark:border-slate-700'
                      } text-sm sm:text-base font-bold tracking-tight shadow-2xs`}
                      required
                    />
                    {errors.title ? (
                      <p className="text-[11.5px] text-rose-500 flex items-center space-x-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.title}</span>
                      </p>
                    ) : (
                      <p className="text-[11.5px] text-slate-500">
                        Use a clear customer-facing product name including brand, model, and primary specification.
                      </p>
                    )}
                  </div>

                  {/* Two-Column Grid: Category & Brand */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={data.category_id}
                        onChange={(e) => setData('category_id', e.target.value)}
                        className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs cursor-pointer"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.parent_id ? `— ${cat.name}` : cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <p className="text-[11px] text-rose-500">{errors.category_id}</p>
                      )}
                    </div>

                    {/* Brand */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Brand / Manufacturer
                      </label>
                      <select
                        value={data.brand_id}
                        onChange={(e) => setData('brand_id', e.target.value)}
                        className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs cursor-pointer"
                      >
                        <option value="">No Brand (Generic / OEM)</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                      {errors.brand_id && (
                        <p className="text-[11px] text-rose-500">{errors.brand_id}</p>
                      )}
                    </div>
                  </div>

                  {/* Two-Column Grid: SKU & Component Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* SKU */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={data.sku}
                          onChange={(e) => setData('sku', e.target.value)}
                          placeholder="e.g. GPU-ASUS-4090-OC"
                          className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const brandPrefix = selectedBrand ? selectedBrand.name.substring(0, 3).toUpperCase() : 'GEN';
                            const randomNum = Math.floor(100000 + Math.random() * 900000);
                            setData('sku', `${brandPrefix}-${randomNum}`);
                          }}
                          className="px-3 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 text-xs font-bold whitespace-nowrap"
                          title="Generate Random SKU"
                        >
                          Generate
                        </button>
                      </div>
                      {errors.sku && <p className="text-[11px] text-rose-500">{errors.sku}</p>}
                    </div>

                    {/* Component Type (PC Builder Compatibility) */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        PC Builder Component Type
                      </label>
                      <select
                        value={data.component_type}
                        onChange={(e) => setData('component_type', e.target.value)}
                        className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs cursor-pointer"
                      >
                        <option value="">Not a PC Builder Component (Standard)</option>
                        {Object.entries(componentTypes).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-500">
                        Assign to link this hardware item into the interactive PC Builder matrix.
                      </p>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                      Short Description / Storefront Summary
                    </label>
                    <textarea
                      rows={3}
                      value={data.short_description}
                      onChange={(e) => setData('short_description', e.target.value)}
                      placeholder="Brief 2-3 sentence overview shown in product search cards, quick views, and quotation printouts..."
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: MEDIA & GALLERY */}
            {activeTab === 'media' && (
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
                style={{ borderRadius: 'var(--admin-radius, 12px)' }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                        Product Media & Gallery
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage primary featured image and multiple high-resolution gallery angles
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-xs">
                  {/* Primary Featured Image */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Primary Cover Image</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                        REQUIRED FOR STOREFRONT
                      </span>
                    </div>

                    <MediaPicker
                      value={data.image}
                      onChange={(url) => setData('image', url)}
                      folder="products"
                      buttonText="Choose Primary Cover Image"
                    />

                    {data.image && (
                      <div className="flex items-center space-x-3 pt-2">
                        <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden shrink-0">
                          <img src={data.image} alt="Cover Preview" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 space-y-1">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[300px]">
                            {data.image.split('/').pop()}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Displayed on product cards, category catalog grids, cart, and invoice slips.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Image Gallery */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          Supplementary Gallery Images ({data.gallery.length})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Additional showcase angles, port layout, packaging, and unboxing images.
                        </div>
                      </div>

                      <MediaPicker
                        value=""
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {data.gallery.map((imgUrl, index) => (
                          <div
                            key={index}
                            className="relative group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xs space-y-2 overflow-hidden"
                          >
                            <div className="w-full h-28 rounded-xl bg-slate-50 dark:bg-slate-900 p-1 flex items-center justify-center overflow-hidden">
                              <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-mono text-slate-400">Angle #{index + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setData('gallery', data.gallery.filter((_, i) => i !== index));
                                }}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                        <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                          No supplementary gallery images added yet
                        </div>
                        <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Click the "Add Gallery Image" button above to select images from your centralized Media Library.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: DESCRIPTION & HIGHLIGHTS */}
            {activeTab === 'description' && (
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
                style={{ borderRadius: 'var(--admin-radius, 12px)' }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                        Description & Key Highlights
                      </h2>
                      <p className="text-xs text-slate-500">
                        Rich formatted description and quick feature bullet points
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-xs">
                  {/* Warranty Input */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                      Warranty Policy Tag
                    </label>
                    <input
                      type="text"
                      value={data.warranty}
                      onChange={(e) => setData('warranty', e.target.value)}
                      placeholder="e.g. 3 Years Official Brand Warranty (1 Year Full + 2 Years Service)"
                      className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-xs"
                    />
                  </div>

                  {/* Key Features Bullet Studio */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center space-x-1.5">
                          <ListPlus className="w-4 h-4 text-indigo-600" />
                          <span>Key Features & Highlights Studio ({data.key_specs.length})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Bullet points shown in the top right highlight block beside product photos.
                        </div>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 py-1 mr-1">Quick Presets:</span>
                      {quickBulletPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewKeySpec(preset)}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10.5px] font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                        >
                          + {preset.split(':')[0]}
                        </button>
                      ))}
                    </div>

                    {/* Bullet Add Input */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newKeySpec}
                        onChange={(e) => setNewKeySpec(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addKeySpec();
                          }
                        }}
                        placeholder="Type bullet highlight and press Enter (e.g. Sensor: HERO 25K with 25,600 DPI)..."
                        className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={addKeySpec}
                        className="px-4 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs whitespace-nowrap shadow-xs"
                      >
                        Add Bullet
                      </button>
                    </div>

                    {/* Bullets List */}
                    {data.key_specs.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {data.key_specs.map((spec, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between space-x-3 shadow-2xs"
                          >
                            <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              {editingSpecIndex === index ? (
                                <input
                                  type="text"
                                  value={editingSpecText}
                                  onChange={(e) => setEditingSpecText(e.target.value)}
                                  className="w-full h-8 px-2 rounded-lg border border-indigo-400 text-xs font-medium"
                                  autoFocus
                                />
                              ) : (
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                                  {spec}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              {editingSpecIndex === index ? (
                                <button
                                  type="button"
                                  onClick={() => saveEditKeySpec(index)}
                                  className="p-1 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs px-2"
                                >
                                  Done
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => moveKeySpec(index, -1)}
                                    disabled={index === 0}
                                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-400"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveKeySpec(index, 1)}
                                    disabled={index === data.key_specs.length - 1}
                                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-400"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSpecIndex(index);
                                      setEditingSpecText(spec);
                                    }}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-500"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeKeySpec(index)}
                                    className="p-1 rounded hover:bg-rose-50 text-rose-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* WYSIWYG Editor */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                      Full Product Description (WYSIWYG HTML)
                    </label>
                    <RichTextEditor
                      value={data.description}
                      onChange={(html) => setData('description', html)}
                      placeholder="Write detailed product overview, performance charts, architecture explanations, and technical features..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: PRICING & DISCOUNTS */}
            {activeTab === 'pricing' && (
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
                style={{ borderRadius: 'var(--admin-radius, 12px)' }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                        Pricing, Discounts & Profit Margin
                      </h2>
                      <p className="text-xs text-slate-500">
                        Set customer selling price, regular MSRP, and cost price to evaluate profit margins
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-xs">
                  {/* Pricing Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Sale / Selling Price */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Selling Price (BDT ৳) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={data.price}
                          onChange={(e) => setData('price', e.target.value)}
                          placeholder="0.00"
                          className="w-full h-11 pl-8 pr-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm"
                          required
                        />
                      </div>
                      {errors.price && <p className="text-[11px] text-rose-500">{errors.price}</p>}
                    </div>

                    {/* Regular / Strike-Through Price */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Regular Price / MSRP (BDT ৳)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={data.regular_price}
                          onChange={(e) => setData('regular_price', e.target.value)}
                          placeholder="0.00"
                          className="w-full h-11 pl-8 pr-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Cost Price */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Cost Price (Wholesale)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={data.cost_price}
                          onChange={(e) => setData('cost_price', e.target.value)}
                          placeholder="0.00"
                          className="w-full h-11 pl-8 pr-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing Insights & Margin Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Discount Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-500">Customer Discount Summary</div>
                      {calculatedSavings ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                            -{calculatedSavings.percentage}% OFF
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            Customers save ৳{calculatedSavings.amount.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">
                          Set a Regular Price higher than Selling Price to show strike-through discount badges.
                        </div>
                      )}
                    </div>

                    {/* Gross Profit Margin Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-500">Estimated Gross Margin</div>
                      {grossProfit ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                            +{grossProfit.margin}% Margin
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            ৳{grossProfit.profit.toLocaleString()} Profit / unit
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">
                          Enter Cost Price to calculate real-time profitability analytics.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: INVENTORY & STOCK */}
            {activeTab === 'inventory' && (
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
                style={{ borderRadius: 'var(--admin-radius, 12px)' }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                        Inventory & Stock Control
                      </h2>
                      <p className="text-xs text-slate-500">
                        Configure warehouse quantities, minimum reorder thresholds, and stock status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Stock Units */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Stock Quantity (Units) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={data.stock}
                        onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                        className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm"
                        required
                      />
                      {errors.stock && <p className="text-[11px] text-rose-500">{errors.stock}</p>}
                    </div>

                    {/* Low Stock Threshold */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={data.low_stock_threshold}
                        onChange={(e) => setData('low_stock_threshold', parseInt(e.target.value) || 0)}
                        className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                      />
                      <p className="text-[11px] text-slate-500">
                        Triggers administrative notification when stock dips to or below this amount.
                      </p>
                    </div>
                  </div>

                  {/* Stock Status Badge Preview */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        Current Storefront Status Indicator
                      </div>
                      <div className="text-[11px] text-slate-500">
                        How customers see availability on the product detail page
                      </div>
                    </div>

                    {data.stock > data.low_stock_threshold ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● In Stock ({data.stock} Units)
                      </span>
                    ) : data.stock > 0 ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        ▲ Low Stock Alert ({data.stock} Units Remaining)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        ✕ Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: TECHNICAL SPECIFICATIONS */}
            {activeTab === 'specifications' && (
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
                style={{ borderRadius: 'var(--admin-radius, 12px)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                        Hardware Specifications Studio
                      </h2>
                      <p className="text-xs text-slate-500">
                        Build structured technical specs matrices for customer spec comparison
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setBulkSpecsOpen(!bulkSpecsOpen)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span>Bulk Paste</span>
                    </button>

                    <button
                      type="button"
                      onClick={addSpecGroup}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>+ Add Group</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6 text-xs">
                  {/* 1-Click Hardware Templates Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>1-Click Industry Hardware Templates:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(hardwareTemplates).map(([key, tmpl]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applyHardwareTemplate(key)}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                        >
                          + {tmpl.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Paste Modal / Expandable */}
                  {bulkSpecsOpen && (
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 text-xs">Bulk Specifications Parser</span>
                        <button
                          type="button"
                          onClick={() => setBulkSpecsOpen(false)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={bulkSpecsText}
                        onChange={(e) => setBulkSpecsText(e.target.value)}
                        placeholder={"# Group Name\nKey: Value\nKey: Value\n\n# Another Group\nKey: Value"}
                        className="w-full p-3 rounded-xl bg-white border border-indigo-200 font-mono text-xs"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleBulkSpecsApply}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                        >
                          Parse & Apply Specs
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Full Specs Groups List */}
                  {data.full_specs.length > 0 ? (
                    <div className="space-y-4">
                      {data.full_specs.map((group, gIndex) => (
                        <div
                          key={gIndex}
                          className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 shadow-2xs"
                        >
                          {/* Group Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                            <input
                              type="text"
                              value={group.group}
                              onChange={(e) => updateGroupName(gIndex, e.target.value)}
                              placeholder="Group Title (e.g. Memory & Expansion)"
                              className="font-bold text-sm text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b border-dashed border-slate-300 focus:border-indigo-500 focus:ring-0 px-1 py-0.5"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => addSpecAttribute(gIndex)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-200"
                              >
                                + Add Row
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSpecGroup(gIndex)}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                                title="Delete Group"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Attributes Table */}
                          <div className="space-y-2">
                            {group.attributes.map((attr, aIndex) => (
                              <div key={aIndex} className="grid grid-cols-12 gap-2 items-center">
                                <input
                                  type="text"
                                  value={attr.name}
                                  onChange={(e) => updateSpecAttribute(gIndex, aIndex, 'name', e.target.value)}
                                  placeholder="Attribute Name (e.g. Memory Speed)"
                                  className="col-span-5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                                />
                                <input
                                  type="text"
                                  value={attr.value}
                                  onChange={(e) => updateSpecAttribute(gIndex, aIndex, 'value', e.target.value)}
                                  placeholder="Value (e.g. 6000MHz CL30)"
                                  className="col-span-6 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSpecAttribute(gIndex, aIndex)}
                                  className="col-span-1 p-1 text-slate-400 hover:text-rose-500 flex justify-center"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        No technical specifications added yet
                      </div>
                      <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Choose a 1-click hardware template above or add custom specification groups.
                      </div>
                    </div>
                  )}

                  {/* Relational Spec Groups (Database Attributes) */}
                  {specGroups.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center space-x-1.5">
                        <FolderTree className="w-4 h-4 text-indigo-600" />
                        <span>Central Database Attribute Matrix</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {specGroups.map(grp => (
                          grp.attributes.map(att => (
                            <div key={att.id} className="space-y-1">
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                {grp.name} → {att.name}
                              </label>
                              <input
                                type="text"
                                value={data.specification_values[att.id] || ''}
                                onChange={(e) => {
                                  setData('specification_values', {
                                    ...data.specification_values,
                                    [att.id]: e.target.value,
                                  });
                                }}
                                placeholder={`Enter ${att.name}...`}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                              />
                            </div>
                          ))
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 7: SEO & SEARCH INDEXING */}
            {activeTab === 'seo' && (
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
                style={{ borderRadius: 'var(--admin-radius, 12px)' }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                        Search Engine Optimization (SEO) & Social Meta
                      </h2>
                      <p className="text-xs text-slate-500">
                        Control search engine snippet previews, keywords, open graph cards, and indexing robots
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-xs">
                  {/* Google Search Live Preview Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Google Search Snippet Preview
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 font-sans">
                      <div className="text-[11px] text-emerald-700 flex items-center space-x-1 truncate font-mono">
                        <span>https://techmarketbd.com/product/{data.seo_slug || 'product-slug'}</span>
                      </div>
                      <div className="text-base font-medium text-blue-700 hover:underline cursor-pointer truncate">
                        {data.seo_title || data.title || 'Product Title — TechMarket BD'}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {data.meta_description || data.short_description || 'Buy authentic computer hardware with official manufacturer warranty at best price in Bangladesh from TechMarket BD.'}
                      </div>
                    </div>
                  </div>

                  {/* SEO Inputs Grid */}
                  <div className="space-y-4">
                    {/* SEO Title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          SEO Meta Title (Title Tag)
                        </label>
                        <span className={`text-[10px] font-mono ${(data.seo_title || '').length > 60 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                          {(data.seo_title || '').length} / 60 characters recommended
                        </span>
                      </div>
                      <input
                        type="text"
                        value={data.seo_title}
                        onChange={(e) => setData('seo_title', e.target.value)}
                        placeholder={data.title || 'Product Title | TechMarket BD'}
                        className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      />
                    </div>

                    {/* SEO Slug */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Custom URL Slug (leave empty for auto-generated slug)
                      </label>
                      <input
                        type="text"
                        value={data.seo_slug}
                        onChange={(e) => setData('seo_slug', e.target.value)}
                        placeholder="e.g. asus-rog-strix-rtx-4090-oc-24gb"
                        className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                      />
                    </div>

                    {/* Focus Keyword & Robots */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          Focus Keyword
                        </label>
                        <input
                          type="text"
                          value={data.focus_keyword}
                          onChange={(e) => setData('focus_keyword', e.target.value)}
                          placeholder="e.g. rtx 4090 price in bd"
                          className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          Robots Indexing Directive
                        </label>
                        <select
                          value={data.meta_robots}
                          onChange={(e) => setData('meta_robots', e.target.value)}
                          className="w-full h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          <option value="index, follow">index, follow (Standard Indexing)</option>
                          <option value="noindex, follow">noindex, follow (Hide from Google)</option>
                          <option value="index, nofollow">index, nofollow (Index without link juice)</option>
                          <option value="noindex, nofollow">noindex, nofollow (Complete exclusion)</option>
                        </select>
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          SEO Meta Description
                        </label>
                        <span className={`text-[10px] font-mono ${(data.meta_description || '').length > 160 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                          {(data.meta_description || '').length} / 160 characters recommended
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={data.meta_description}
                        onChange={(e) => setData('meta_description', e.target.value)}
                        placeholder="Comprehensive 150-160 character description including primary specs, price in Bangladesh, warranty, and authentic guarantee..."
                        className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN: STICKY CONTEXTUAL SIDEBAR (4 OF 12 COLS / 340px)
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            
            {/* CARD 1: PUBLISHING & VISIBILITY */}
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4"
              style={{ borderRadius: 'var(--admin-radius, 12px)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Publishing & Status</span>
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Active / Draft Status */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">Product Status</div>
                    <div className="text-[10.5px] text-slate-500">
                      {data.is_active ? 'Visible on catalog' : 'Hidden from customers'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setData('is_active', !data.is_active)}
                    className={`px-3 py-1 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      data.is_active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {data.is_active ? 'Active' : 'Draft'}
                  </button>
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">Featured Product</div>
                    <div className="text-[10.5px] text-slate-500">Promote on homepage showcase</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.is_featured}
                    onChange={(e) => setData('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>

                {/* Deal of the Day Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">Deal of the Day</div>
                    <div className="text-[10.5px] text-slate-500">Highlight in daily flash deals</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.is_deal_of_day}
                    onChange={(e) => setData('is_deal_of_day', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>
              </div>
            </div>

            {/* CARD 2: LIVE PRODUCT SUMMARY */}
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4"
              style={{ borderRadius: 'var(--admin-radius, 12px)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                  Product Overview
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold">
                  LIVE CARD
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Photo & Title Summary */}
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                    {data.image ? (
                      <img src={data.image} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                      {data.title || 'Untitled Product'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      SKU: {data.sku || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Price & Stock Overview */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-semibold">Selling Price</div>
                    <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                      ৳{parseFloat(data.price || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-semibold">Stock Ledger</div>
                    <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                      {data.stock} units
                    </div>
                  </div>
                </div>

                {/* Category & Brand Pills */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedCategory ? selectedCategory.name : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Brand:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedBrand ? selectedBrand.name : 'Generic'}
                    </span>
                  </div>
                </div>

                {/* Storefront Link if Editing */}
                {isEditing && product?.slug && (
                  <a
                    href={`/product/${product.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>View on Storefront</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* CARD 3: SEO HEALTH & RECOMMENDATIONS */}
            <SEOScorePanel product={data} />

          </div>

        </div>

        {/* =========================================================================
            4. MOBILE STICKY BOTTOM ACTION BAR
            ========================================================================= */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between gap-3 shadow-lg">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs disabled:opacity-50"
          >
            {processing ? 'Saving...' : (isEditing ? 'Save Product' : 'Publish Product')}
          </button>
        </div>

      </form>
    </AdminShell>
  );
}
