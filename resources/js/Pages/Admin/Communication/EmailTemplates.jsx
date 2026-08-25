import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  FileText, Plus, Edit2, Copy, Trash2, Eye, Send, Code, 
  Layers, MoveUp, MoveDown, Smartphone, Monitor, Check, X,
  Sparkles, Palette, Type, Image as ImageIcon, ShoppingBag, 
  Percent, Grid, AlignCenter, AlignLeft, AlignRight, Play
} from 'lucide-react';

export default function EmailTemplates({
  templates = [],
  categories = [],
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'builder'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Builder States
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' or 'mobile'
  const [builderTab, setBuilderTab] = useState('visual'); // 'visual', 'code', or 'preview'
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(null);
  const [compiledHtml, setCompiledHtml] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  // Test Email Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testMessage, setTestMessage] = useState(null);

  // Form
  const { data, setData, post, processing, reset, errors } = useForm({
    id: null,
    name: '',
    slug: '',
    category: 'ORDER',
    subject: '',
    preheader: '',
    html_content: '',
    plain_text_content: '',
    editor_schema: null,
    is_active: true,
  });

  const availableBlockTypes = [
    { type: 'hero_banner', label: 'Hero Banner', icon: Sparkles, defaultProps: { title: 'Level Up Your Tech', subtitle: 'Exclusive deals on desktop components', button_label: 'Explore Catalog', button_url: 'http://localhost/catalog', bg_color: '#1e1b4b' } },
    { type: 'heading', label: 'Heading', icon: Type, defaultProps: { content: 'Welcome to TechMarket BD', level: 'h2', color: '#ffffff', size: '22px', align: 'left' } },
    { type: 'text', label: 'Text Paragraph', icon: FileText, defaultProps: { content: 'Thank you for choosing TechMarket BD. Your order has been received.', color: '#cbd5e1', size: '14px', align: 'left' } },
    { type: 'button', label: 'Call to Action Button', icon: Play, defaultProps: { label: 'Track Order Live', url: 'http://localhost', bg_color: '#f59e0b', text_color: '#0f172a', align: 'center', radius: '10px' } },
    { type: 'order_summary', label: 'Order Summary Box', icon: ShoppingBag, defaultProps: {} },
    { type: 'product', label: 'Single Product Card', icon: ShoppingBag, defaultProps: { title: '{{product_name}}', price: '৳{{order_total}}', image: 'https://via.placeholder.com/150', url: '#' } },
    { type: 'product_grid', label: '2-Column Product Grid', icon: Grid, defaultProps: { products: [{ title: 'Gaming Processor', price: '৳32,000', url: '#' }, { title: '16GB RGB RAM', price: '৳7,500', url: '#' }] } },
    { type: 'coupon', label: 'Coupon Badge', icon: Percent, defaultProps: { code: 'TECH2026', discount: '10% DISCOUNT', note: 'Applicable during online checkout' } },
    { type: 'image', label: 'Image Banner', icon: ImageIcon, defaultProps: { src: 'https://via.placeholder.com/600x200', alt: 'Promotion Banner', align: 'center', radius: '8px' } },
    { type: 'divider', label: 'Divider Line', icon: Layers, defaultProps: { color: '#334155', margin: '20px 0' } },
    { type: 'spacer', label: 'Spacer Gap', icon: Layers, defaultProps: { height: '24px' } },
    { type: 'social_links', label: 'Social Media Links', icon: Layers, defaultProps: { links: [{ name: 'Facebook', url: 'https://facebook.com' }, { name: 'YouTube', url: 'https://youtube.com' }] } },
    { type: 'footer', label: 'Branded Footer', icon: FileText, defaultProps: { text: 'You received this notification regarding your TechMarket BD account.', include_unsubscribe: true } },
  ];

  // Dynamic Variable tags
  const variableChips = [
    '{{customer_name}}', '{{customer_email}}', '{{order_number}}', 
    '{{order_date}}', '{{order_total}}', '{{payment_method}}', 
    '{{order_status}}', '{{courier_name}}', '{{tracking_number}}', 
    '{{tracking_url}}', '{{delivery_address}}', '{{invoice_url}}', 
    '{{product_name}}', '{{stock_quantity}}', '{{fraud_score}}',
    '{{site_name}}', '{{site_url}}', '{{support_phone}}', '{{unsubscribe_url}}'
  ];

  // Re-compile HTML whenever blocks change
  useEffect(() => {
    if (activeTab === 'builder' && blocks.length > 0) {
      setIsCompiling(true);
      fetch('/admin/communication/email-builder/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ schema: { blocks } }),
      })
        .then(res => res.json())
        .then(data => {
          setCompiledHtml(data.html || '');
          setData('html_content', data.html || '');
          setData('editor_schema', { blocks });
          setIsCompiling(false);
        })
        .catch(() => setIsCompiling(false));
    }
  }, [blocks, activeTab]);

  const handleOpenCreate = () => {
    reset();
    setSelectedTemplate(null);
    setBlocks([
      { type: 'heading', props: { content: 'Welcome to TechMarket BD', level: 'h2', color: '#ffffff', size: '22px', align: 'left' } },
      { type: 'text', props: { content: 'Hello {{customer_name}}, thank you for placing your order #{{order_number}} with us.', color: '#cbd5e1', size: '14px', align: 'left' } },
      { type: 'order_summary', props: {} },
      { type: 'button', props: { label: 'Download Invoice', url: '{{invoice_url}}', bg_color: '#f59e0b', text_color: '#0f172a', align: 'center', radius: '10px' } },
      { type: 'footer', props: { text: 'TechMarket BD — Authentic Electronics & Gaming Gear in Bangladesh', include_unsubscribe: false } },
    ]);
    setActiveTab('builder');
  };

  const handleOpenEdit = (template) => {
    setSelectedTemplate(template);
    setData({
      id: template.id,
      name: template.name,
      slug: template.slug,
      category: template.category,
      subject: template.subject,
      preheader: template.preheader || '',
      html_content: template.html_content,
      plain_text_content: template.plain_text_content || '',
      editor_schema: template.editor_schema,
      is_active: template.is_active,
    });

    if (template.editor_schema && template.editor_schema.blocks) {
      setBlocks(template.editor_schema.blocks);
    } else {
      setBlocks([
        { type: 'text', props: { content: template.html_content } }
      ]);
    }
    setCompiledHtml(template.html_content);
    setActiveTab('builder');
  };

  const handleAddBlock = (blockDef) => {
    const newBlock = {
      type: blockDef.type,
      props: { ...blockDef.defaultProps },
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockIndex(blocks.length);
  };

  const handleRemoveBlock = (index) => {
    setBlocks(prev => prev.filter((_, i) => i !== index));
    if (selectedBlockIndex === index) setSelectedBlockIndex(null);
  };

  const handleMoveBlock = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const item = updated.splice(index, 1)[0];
    updated.splice(newIndex, 0, item);
    setBlocks(updated);
    setSelectedBlockIndex(newIndex);
  };

  const handleDuplicateBlock = (index) => {
    const blockToCopy = JSON.parse(JSON.stringify(blocks[index]));
    const updated = [...blocks];
    updated.splice(index + 1, 0, blockToCopy);
    setBlocks(updated);
  };

  const handleBlockPropChange = (key, value) => {
    if (selectedBlockIndex === null) return;
    setBlocks(prev => {
      const updated = [...prev];
      updated[selectedBlockIndex] = {
        ...updated[selectedBlockIndex],
        props: {
          ...updated[selectedBlockIndex].props,
          [key]: value,
        },
      };
      return updated;
    });
  };

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    const endpoint = selectedTemplate 
      ? `/admin/communication/email-templates/${selectedTemplate.id}`
      : '/admin/communication/email-templates';

    post(endpoint, {
      preserveScroll: true,
      onSuccess: () => {
        setActiveTab('list');
      },
    });
  };

  const handleDuplicateTemplate = (t) => {
    router.post(`/admin/communication/email-templates/${t.id}/duplicate`, {}, { preserveScroll: true });
  };

  const handleDeleteTemplate = (t) => {
    if (confirm(`Delete template "${t.name}"?`)) {
      router.delete(`/admin/communication/email-templates/${t.id}`, { preserveScroll: true });
    }
  };

  const handleOpenTestModal = (t) => {
    setSelectedTemplate(t);
    setTestEmailAddress(authEmail || 'admin@techmarketbd.com');
    setTestMessage(null);
    setTestModalOpen(true);
  };

  const handleSendTestEmail = () => {
    if (!testEmailAddress || !selectedTemplate) return;
    setTestSending(true);
    setTestMessage(null);

    fetch(`/admin/communication/email-templates/${selectedTemplate.id}/test-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({ email: testEmailAddress }),
    })
      .then(res => res.json())
      .then(resData => {
        setTestSending(false);
        setTestMessage({ success: resData.success, text: resData.message });
      })
      .catch(() => {
        setTestSending(false);
        setTestMessage({ success: false, text: 'Network transmission error.' });
      });
  };

  const filteredTemplates = templates.filter(t => {
    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.slug.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const authEmail = 'admin@techmarketbd.com';

  return (
    <AdminLayout title="Email Templates & Visual Builder">
      <Head title="Email Templates & Drag-and-Drop Builder — TechMarket BD" />

      <div className="space-y-6 font-['Hind_Siliguri',sans-serif]">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-amber-400" />
              <span>Email Templates & Visual Builder</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Design responsive emails with drag-and-drop blocks, live mobile preview, and dynamic variables
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === 'builder' ? (
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Back to Templates
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: TEMPLATE LIST VIEW */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({templates.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates, subjects..."
                className="w-full md:w-64 bg-slate-900 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-amber-400 font-mono text-[10px] font-bold">
                        {t.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase ${
                        t.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {t.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-sm group-hover:text-amber-400 transition-colors">
                        {t.name}
                      </h3>
                      <div className="font-mono text-[11px] text-slate-500 truncate mt-0.5">slug: {t.slug}</div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 font-medium">
                      Subject: <strong className="text-slate-200">{t.subject}</strong>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleOpenTestModal(t)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-amber-400" />
                      <span>Test Send</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateTemplate(t)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Duplicate Template"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 transition-colors cursor-pointer font-bold"
                        title="Edit in Visual Builder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(t)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL DRAG-AND-DROP EMAIL BUILDER */}
        {activeTab === 'builder' && (
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            
            {/* Top Builder Meta Settings Bar */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. Order Confirmation"
                    className="w-full bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Slug (Identifier) *</label>
                  <input
                    type="text"
                    required
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    placeholder="e.g. order-confirmed"
                    className="w-full bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Category *</label>
                  <select
                    value={data.category}
                    onChange={(e) => setData('category', e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none cursor-pointer"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Subject Line *</label>
                  <input
                    type="text"
                    required
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                    placeholder="e.g. 📦 আপনার অর্ডার #{{order_number}} নিশ্চিত করা হয়েছে"
                    className="w-full bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Preheader Text</label>
                  <input
                    type="text"
                    value={data.preheader}
                    onChange={(e) => setData('preheader', e.target.value)}
                    placeholder="e.g. আপনার পার্সেল প্যাকেজিং হচ্ছে..."
                    className="w-full bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Dynamic Variable Quick Tags */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">Insert Variables:</span>
                {variableChips.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(chip);
                    }}
                    title="Click to copy placeholder"
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-amber-500/20 text-[10px] font-mono text-amber-400 border border-slate-200/80 dark:border-slate-800/80 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Builder Main Work Area (3 Columns: Blocks Sidebar, Canvas/Inspector, Live Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Panel: Available Block Library (3 Cols) */}
              <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider font-mono">
                  Component Blocks
                </h3>
                <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                  {availableBlockTypes.map(blockDef => {
                    const Icon = blockDef.icon;
                    return (
                      <button
                        key={blockDef.type}
                        type="button"
                        onClick={() => handleAddBlock(blockDef)}
                        className="w-full p-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/50 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="truncate">{blockDef.label}</span>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Middle Panel: Active Blocks & Property Inspector (4 Cols) */}
              <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-2.5 mb-3">
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-wider font-mono">
                      Email Structure ({blocks.length} Blocks)
                    </h3>
                  </div>

                  {/* Block List with Reorder/Delete */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {blocks.map((block, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedBlockIndex(idx)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                          selectedBlockIndex === idx
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                            : 'bg-slate-900 border-slate-200/80 dark:border-slate-800/80 text-slate-300 hover:border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="capitalize truncate font-mono text-[11px]">
                          {idx + 1}. {block.type.replace('_', ' ')}
                        </span>

                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(idx, 'down')}
                            disabled={idx === blocks.length - 1}
                            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateBlock(idx)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(idx)}
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Block Property Inspector */}
                {selectedBlockIndex !== null && blocks[selectedBlockIndex] && (
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs">
                    <h4 className="font-black text-amber-400 uppercase text-[10px] font-mono border-b border-slate-200/80 dark:border-slate-800/80 pb-1">
                      Block Settings: {blocks[selectedBlockIndex].type}
                    </h4>

                    {/* Dynamic Inputs based on block type */}
                    {blocks[selectedBlockIndex].props.content !== undefined && (
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Content Text</label>
                        <textarea
                          rows={3}
                          value={blocks[selectedBlockIndex].props.content}
                          onChange={(e) => handleBlockPropChange('content', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-white p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                        />
                      </div>
                    )}

                    {blocks[selectedBlockIndex].props.title !== undefined && (
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={blocks[selectedBlockIndex].props.title}
                          onChange={(e) => handleBlockPropChange('title', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    )}

                    {blocks[selectedBlockIndex].props.label !== undefined && (
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Button Label</label>
                        <input
                          type="text"
                          value={blocks[selectedBlockIndex].props.label}
                          onChange={(e) => handleBlockPropChange('label', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    )}

                    {blocks[selectedBlockIndex].props.url !== undefined && (
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Target Link URL</label>
                        <input
                          type="text"
                          value={blocks[selectedBlockIndex].props.url}
                          onChange={(e) => handleBlockPropChange('url', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                        />
                      </div>
                    )}

                    {blocks[selectedBlockIndex].props.color !== undefined && (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Text Color</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].props.color}
                            onChange={(e) => handleBlockPropChange('color', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                          />
                        </div>
                        {blocks[selectedBlockIndex].props.size && (
                          <div className="w-24">
                            <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Size</label>
                            <input
                              type="text"
                              value={blocks[selectedBlockIndex].props.size}
                              onChange={(e) => handleBlockPropChange('size', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Panel: Live Desktop / Mobile HTML Preview (5 Cols) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3 flex flex-col justify-between">
                
                {/* Device & Mode Selector */}
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        previewDevice === 'desktop' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        previewDevice === 'mobile' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBuilderTab('visual')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        builderTab === 'visual' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderTab('code')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                        builderTab === 'code' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      <span>Code</span>
                    </button>
                  </div>
                </div>

                {/* Preview Frame */}
                {builderTab === 'visual' ? (
                  <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-center min-h-[460px] overflow-x-auto">
                    <div
                      className={`bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-2xl transition-all ${
                        previewDevice === 'mobile' ? 'w-[320px]' : 'w-full max-w-[500px]'
                      }`}
                    >
                      {/* Mock Header */}
                      <div className="p-3.5 bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 text-center">
                        <span className="font-heading font-black text-amber-400 text-sm">TECHMARKET BD</span>
                      </div>
                      
                      {/* Body Output */}
                      <div
                        className="p-5 text-slate-200 text-xs leading-relaxed space-y-3"
                        dangerouslySetInnerHTML={{ __html: compiledHtml || '<p class="text-slate-500 text-center">Empty template...</p>' }}
                      />

                      {/* Mock Footer */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-[10px] text-slate-600">
                        &copy; 2026 TechMarket BD. All rights reserved.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[460px]">
                    <textarea
                      rows={20}
                      value={data.html_content}
                      onChange={(e) => {
                        setData('html_content', e.target.value);
                        setCompiledHtml(e.target.value);
                      }}
                      className="w-full h-full bg-slate-50 dark:bg-slate-800 text-amber-300 font-mono text-xs p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 focus:outline-none"
                    />
                  </div>
                )}

                {/* Save Bar */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    disabled={processing || isCompiling}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{processing ? 'Saving...' : (selectedTemplate ? 'Save Template Changes' : 'Create Template')}</span>
                  </button>
                </div>

              </div>

            </div>

          </form>
        )}

        {/* Test Email Modal */}
        {testModalOpen && selectedTemplate && (
          <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Send Test Email: {selectedTemplate.name}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Recipient Email Address</label>
                  <input
                    type="email"
                    required
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="e.g. admin@techmarketbd.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {testMessage && (
                  <div className={`p-3 rounded-xl border text-xs font-medium ${
                    testMessage.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    {testMessage.text}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={testSending}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testSending ? 'Dispatching...' : 'Send Test'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
