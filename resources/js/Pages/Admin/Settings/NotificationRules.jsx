import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Sliders, Plus, Edit2, Check, X, ShieldAlert, Radio, 
  Layers, Code, Eye, AlertTriangle, AlertOctagon, Save
} from 'lucide-react';

export default function NotificationRules({
  rules = [],
  availableRoles = [],
  availableCategories = [],
  availablePriorities = [],
}) {
  const [editingRule, setEditingRule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    id: null,
    event_key: '',
    name: '',
    description: '',
    category: 'ORDER',
    default_priority: 'NORMAL',
    enabled: true,
    notify_roles: ['Super Admin', 'Admin'],
    channels: ['in_app', 'browser'],
    template_title: '',
    template_message: '',
    action_url_template: '',
  });

  const openCreateModal = () => {
    reset();
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setData({
      id: rule.id,
      event_key: rule.event_key,
      name: rule.name,
      description: rule.description || '',
      category: rule.category,
      default_priority: rule.default_priority,
      enabled: rule.enabled,
      notify_roles: rule.notify_roles || [],
      channels: rule.channels || ['in_app', 'browser'],
      template_title: rule.template_title,
      template_message: rule.template_message,
      action_url_template: rule.action_url_template || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleRole = (role) => {
    setData('notify_roles', data.notify_roles.includes(role)
      ? data.notify_roles.filter(r => r !== role)
      : [...data.notify_roles, role]
    );
  };

  const handleToggleChannel = (ch) => {
    setData('channels', data.channels.includes(ch)
      ? data.channels.filter(c => c !== ch)
      : [...data.channels, ch]
    );
  };

  const handleToggleRuleActive = (rule) => {
    router.post(`/admin/settings/notification-rules/${rule.id}/toggle`, {}, { preserveScroll: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/settings/notification-rules', {
      preserveScroll: true,
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
    });
  };

  const placeholderTags = [
    '{{order_number}}', '{{customer_name}}', '{{customer_phone}}', 
    '{{order_total}}', '{{courier_name}}', '{{tracking_number}}', 
    '{{fraud_score}}', '{{product_name}}', '{{stock_quantity}}', '{{admin_name}}'
  ];

  return (
    <AdminLayout title="Notification Rules">
      <Head title="Notification & Alert Rules Engine — TechMarket BD" />

      <div className="space-y-6 font-['Hind_Siliguri',sans-serif]">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-amber-400" />
              <span>Event Alert Rules Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure trigger mappings, dynamic templates, role recipients, and dispatch channels
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/settings/notifications"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              Preferences
            </Link>

            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Rule</span>
            </button>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-black text-white text-sm">System Event Rules ({rules.length})</h2>
            <span className="text-[11px] text-slate-400 font-mono">Real-time automation</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {rules.map((rule) => {
              const isCritical = rule.default_priority === 'CRITICAL';
              const isUrgent = rule.default_priority === 'URGENT';

              return (
                <div
                  key={rule.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    !rule.enabled ? 'opacity-50 bg-slate-900/20' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-400">
                        {rule.event_key}
                      </span>
                      <span className="font-extrabold text-white text-sm">
                        {rule.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 font-mono">
                        {rule.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                        isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        isUrgent ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {rule.default_priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      {rule.description || rule.template_title}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                      <span>Roles: <strong className="text-slate-300">{(rule.notify_roles || []).join(', ') || 'All Admins'}</strong></span>
                      <span>• Channels: <strong className="text-slate-300">{(rule.channels || []).join(', ')}</strong></span>
                    </div>
                  </div>

                  {/* Actions & Status Toggle */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleRuleActive(rule)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        rule.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(rule)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rule Edit / Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white">
                  {editingRule ? `Edit Rule: ${editingRule.name}` : 'Create Notification Rule'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Event Key *</label>
                    <input
                      type="text"
                      required
                      value={data.event_key}
                      onChange={(e) => setData('event_key', e.target.value)}
                      placeholder="e.g. order.created"
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Rule Name *</label>
                    <input
                      type="text"
                      required
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g. New Order Received"
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Category *</label>
                    <select
                      value={data.category}
                      onChange={(e) => setData('category', e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none cursor-pointer"
                    >
                      {availableCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Default Priority *</label>
                    <select
                      value={data.default_priority}
                      onChange={(e) => setData('default_priority', e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none cursor-pointer"
                    >
                      {availablePriorities.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Roles */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Notify Roles</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableRoles.map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleToggleRole(role)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          data.notify_roles.includes(role)
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Active Channels *</label>
                  <div className="flex flex-wrap gap-2">
                    {['in_app', 'browser', 'sms', 'email'].map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => handleToggleChannel(ch)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          data.channels.includes(ch)
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-950 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {ch.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Placeholder Guide */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Dynamic Placeholders</span>
                  <div className="flex flex-wrap gap-1">
                    {placeholderTags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-amber-400 border border-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Templates */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Title Template *</label>
                    <input
                      type="text"
                      required
                      value={data.template_title}
                      onChange={(e) => setData('template_title', e.target.value)}
                      placeholder="e.g. 📦 New Order Received #{{order_number}}"
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Message Template *</label>
                    <textarea
                      rows={2}
                      required
                      value={data.template_message}
                      onChange={(e) => setData('template_message', e.target.value)}
                      placeholder="e.g. Customer {{customer_name}} ({{customer_phone}}) placed order #{{order_number}} for ৳{{order_total}}."
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Action URL Template</label>
                    <input
                      type="text"
                      value={data.action_url_template}
                      onChange={(e) => setData('action_url_template', e.target.value)}
                      placeholder="e.g. /admin/orders"
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{processing ? 'Saving...' : 'Save Rule'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
