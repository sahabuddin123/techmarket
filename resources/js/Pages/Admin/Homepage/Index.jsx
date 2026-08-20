import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Sliders, Eye, EyeOff, ArrowUp, ArrowDown, Edit3, Plus, 
  Trash2, Check, ExternalLink, Image, FolderTree, Sparkles, Move
} from 'lucide-react';

export default function HomepageIndex({ 
  sections = [], 
  quickActions = [], 
  heroBanners = [], 
  sideBanners = [], 
  featuredCategories = [],
  settings = {} 
}) {
  const [activeTab, setActiveTab] = useState('sections');
  const [editingSection, setEditingSection] = useState(null);
  const [editingQuickAction, setEditingQuickAction] = useState(null);
  const [newQuickActionOpen, setNewQuickActionOpen] = useState(false);

  // Quick Action form state
  const [qaForm, setQaForm] = useState({
    title: '',
    subtitle: '',
    icon: 'Cpu',
    url: '/pc-builder',
    sort_order: 0,
    is_active: true,
  });

  // Section edit form state
  const [secForm, setSecForm] = useState({
    title: '',
    subtitle: '',
    sort_order: 0,
    is_enabled: true,
  });

  const handleToggleSection = (sec) => {
    router.put(`/admin/homepage/sections/${sec.id}`, {
      title: sec.title,
      subtitle: sec.subtitle,
      sort_order: sec.sort_order,
      is_enabled: !sec.is_enabled,
    }, { preserveScroll: true });
  };

  const handleMoveSection = (index, direction) => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const payload = newSections.map((s, idx) => ({
      id: s.id,
      sort_order: idx + 1,
    }));

    router.post('/admin/homepage/sections/reorder', { sections: payload }, { preserveScroll: true });
  };

  const handleSaveSection = (e) => {
    e.preventDefault();
    if (!editingSection) return;

    router.put(`/admin/homepage/sections/${editingSection.id}`, secForm, {
      preserveScroll: true,
      onSuccess: () => setEditingSection(null),
    });
  };

  const handleSaveQuickAction = (e) => {
    e.preventDefault();
    if (editingQuickAction) {
      router.put(`/admin/homepage/quick-actions/${editingQuickAction.id}`, qaForm, {
        preserveScroll: true,
        onSuccess: () => setEditingQuickAction(null),
      });
    } else {
      router.post('/admin/homepage/quick-actions', qaForm, {
        preserveScroll: true,
        onSuccess: () => {
          setNewQuickActionOpen(false);
          setQaForm({ title: '', subtitle: '', icon: 'Cpu', url: '', sort_order: 0, is_active: true });
        },
      });
    }
  };

  const handleDeleteQuickAction = (id) => {
    if (confirm('Are you sure you want to delete this quick action card?')) {
      router.delete(`/admin/homepage/quick-actions/${id}`, { preserveScroll: true });
    }
  };

  return (
    <AdminLayout>
      <Head title="Homepage Management - TechMarket Admin" />

      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              <Sliders className="w-6 h-6 text-blue-500 mr-2.5" />
              Homepage Layout & Section Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure homepage section ordering, enable/disable live blocks, and customize promotional actions.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <a
              href="/admin/settings?tab=storefront"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Design: <strong className="text-amber-400">{settings?.storefront_version === 'v2' ? 'v2 Modern Tech' : 'v1 Classic'}</strong></span>
            </a>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-[#3b82f6] font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 border border-slate-700 w-fit"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview Live</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'sections' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Move className="w-4 h-4" />
            <span>Homepage Sections ({sections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quick_actions')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'quick_actions' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Quick Action Cards ({quickActions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'banners' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Hero & Promos ({heroBanners.length + sideBanners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'categories' ? 'bg-[#1c4289] text-white shadow' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Featured Categories ({featuredCategories.length})</span>
          </button>
        </div>

        {/* TAB 1: SECTIONS */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Drag or use arrows to reorder. Toggle switches to hide or show on storefront.</span>
                <span className="font-mono text-[11px] text-amber-400">Deterministic Sort Engine Active</span>
              </div>

              <div className="divide-y divide-slate-800">
                {sections.map((sec, idx) => (
                  <div key={sec.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors gap-4">
                    <div className="flex items-center space-x-4">
                      {/* Order Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, 'up')}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMoveSection(idx, 'down')}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-slate-400 text-xs">#{sec.sort_order}</span>
                      </div>

                      {/* Section Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{sec.title}</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                            {sec.section_key}
                          </span>
                        </div>
                        {sec.subtitle && (
                          <div className="text-xs text-slate-400 mt-0.5">{sec.subtitle}</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setEditingSection(sec);
                          setSecForm({
                            title: sec.title,
                            subtitle: sec.subtitle || '',
                            sort_order: sec.sort_order,
                            is_enabled: sec.is_enabled,
                          });
                        }}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1 border border-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Text</span>
                      </button>

                      <button
                        onClick={() => handleToggleSection(sec)}
                        className={`px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                          sec.is_enabled 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                      >
                        {sec.is_enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{sec.is_enabled ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUICK ACTION CARDS */}
        {activeTab === 'quick_actions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Quick Action Cards (Directly Below Hero Banner)
              </h2>
              <button
                onClick={() => {
                  setEditingQuickAction(null);
                  setQaForm({ title: '', subtitle: '', icon: 'Cpu', url: '', sort_order: quickActions.length + 1, is_active: true });
                  setNewQuickActionOpen(true);
                }}
                className="bg-[#1c4289] hover:bg-[#15326b] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Quick Action</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((qa) => (
                <div key={qa.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow hover:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-[#1c4289]/20 border border-[#1c4289]/40 flex items-center justify-center text-blue-400 font-bold">
                      {qa.icon.charAt(0)}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${qa.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {qa.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{qa.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{qa.subtitle}</p>
                    <div className="text-[11px] font-mono text-blue-400 mt-2 truncate">{qa.url}</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-500 font-mono">Order: #{qa.sort_order}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingQuickAction(qa);
                          setQaForm({
                            title: qa.title,
                            subtitle: qa.subtitle || '',
                            icon: qa.icon,
                            url: qa.url,
                            sort_order: qa.sort_order,
                            is_active: qa.is_active,
                          });
                          setNewQuickActionOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuickAction(qa.id)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BANNERS OVERVIEW */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Hero Slider Slides (70% Width)</h3>
                <a href="/admin/banners/create" className="text-xs text-blue-400 hover:underline font-bold">+ Create Slide</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroBanners.map((b) => (
                  <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex gap-4 p-4 shadow">
                    <img src={b.image} alt={b.title} className="w-32 h-20 object-cover rounded-lg bg-slate-950 shrink-0" />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-bold text-white text-xs truncate">{b.title}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{b.subtitle}</p>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-800">
                        <span className="text-emerald-400 font-bold">{b.is_active ? 'Active' : 'Inactive'}</span>
                        <a href={`/admin/banners/${b.id}/edit`} className="text-blue-400 hover:underline">Edit Banner</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Side Promotional Banners (30% Stacked)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sideBanners.map((b) => (
                  <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex gap-4 p-4 shadow">
                    <img src={b.image} alt={b.title} className="w-24 h-20 object-cover rounded-lg bg-slate-950 shrink-0" />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <span className="text-[9px] font-bold text-amber-500 uppercase">{b.placement}</span>
                        <h4 className="font-bold text-white text-xs truncate">{b.title}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{b.subtitle}</p>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-800">
                        <span className="text-emerald-400 font-bold">{b.is_active ? 'Active' : 'Inactive'}</span>
                        <a href={`/admin/banners/${b.id}/edit`} className="text-blue-400 hover:underline">Edit Banner</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FEATURED CATEGORIES OVERVIEW */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Top 16 Homepage Featured Categories</h3>
              <a href="/admin/categories" className="text-xs text-blue-400 hover:underline font-bold">Manage All Categories in Category Matrix &rarr;</a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {featuredCategories.map((c) => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center flex flex-col items-center justify-between space-y-2 shadow">
                  <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-blue-400 font-bold border border-slate-800">
                    {c.icon ? c.icon.charAt(0) : 'C'}
                  </div>
                  <div className="text-xs font-bold text-white truncate w-full">{c.name}</div>
                  <span className="text-[10px] text-slate-500 font-mono">Order #{c.sort_order}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT SECTION MODAL */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Section: {editingSection.section_key}</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Section Title</label>
                <input
                  type="text"
                  value={secForm.title}
                  onChange={(e) => setSecForm({ ...secForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={secForm.subtitle}
                  onChange={(e) => setSecForm({ ...secForm, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={secForm.sort_order}
                    onChange={(e) => setSecForm({ ...secForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={secForm.is_enabled ? '1' : '0'}
                    onChange={(e) => setSecForm({ ...secForm, is_enabled: e.target.value === '1' })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="1">Enabled (Visible)</option>
                    <option value="0">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1c4289] hover:bg-[#15326b] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ACTION MODAL */}
      {newQuickActionOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">{editingQuickAction ? 'Edit Quick Action' : 'New Quick Action Card'}</h3>
              <button onClick={() => setNewQuickActionOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleSaveQuickAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={qaForm.title}
                  onChange={(e) => setQaForm({ ...qaForm, title: e.target.value })}
                  placeholder="e.g. PC Builder"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Subtitle</label>
                <input
                  type="text"
                  value={qaForm.subtitle}
                  onChange={(e) => setQaForm({ ...qaForm, subtitle: e.target.value })}
                  placeholder="e.g. Configure your ideal PC"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Icon Name (Lucide)</label>
                  <input
                    type="text"
                    value={qaForm.icon}
                    onChange={(e) => setQaForm({ ...qaForm, icon: e.target.value })}
                    placeholder="Cpu, Wrench, MessageSquare, Sliders"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={qaForm.url}
                    onChange={(e) => setQaForm({ ...qaForm, url: e.target.value })}
                    placeholder="/pc-builder"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={qaForm.sort_order}
                    onChange={(e) => setQaForm({ ...qaForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={qaForm.is_active ? '1' : '0'}
                    onChange={(e) => setQaForm({ ...qaForm, is_active: e.target.value === '1' })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewQuickActionOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1c4289] hover:bg-[#15326b] text-white font-bold"
                >
                  Save Quick Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
