import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminModal from '../../../Components/Admin/AdminModal';
import { 
  Sliders, Plus, Edit2, Check, X, ShieldAlert, Radio, 
  Layers, Code, Eye, AlertTriangle, AlertOctagon, Save, CheckCircle2 
} from 'lucide-react';

export default function NotificationRules({
  rules = [],
  availableRoles = [],
  availableCategories = [],
  availablePriorities = [],
}) {
  const [editingRule, setEditingRule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors, recentlySuccessful } = useForm({
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

  const handleToggleChannel = (channel) => {
    setData('channels', data.channels.includes(channel)
      ? data.channels.filter(c => c !== channel)
      : [...data.channels, channel]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = editingRule
      ? `/admin/settings/notification-rules/${editingRule.id}`
      : '/admin/settings/notification-rules';

    post(endpoint, {
      preserveScroll: true,
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  return (
    <AdminShell title="Notification Rules">
      <Head title="Notification Event Rules Engine - TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none">
        {/* Page Header */}
        <AdminPageHeader
          title="Notification Event Rules Engine"
          subtitle="Define event listener triggers, template interpolation, channel destinations, and role recipients."
          badge="Rule Automation"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/settings/notifications"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <span>Channel Matrix</span>
              </Link>
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event Rule</span>
              </button>
            </div>
          }
        />

        {/* Rules Cards List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rules.map((rule) => (
              <div key={rule.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-heading">{rule.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {rule.event_key}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{rule.description || 'Dispatched on system trigger event'}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(rule)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Rule</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AdminModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRule ? `Edit Rule: ${editingRule.name}` : 'Create Notification Event Rule'}
          subtitle="Configure system listener key, message template, and destination roles."
          icon={Sliders}
          size="lg"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{processing ? 'Saving...' : 'Save Rule'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Rule Name *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g. Order High-Risk Fraud Alert"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Event Key *</label>
                <input
                  type="text"
                  value={data.event_key}
                  onChange={(e) => setData('event_key', e.target.value)}
                  placeholder="e.g. order.high_risk_flagged"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Template Title</label>
              <input
                type="text"
                value={data.template_title}
                onChange={(e) => setData('template_title', e.target.value)}
                placeholder="High Risk Order #{order_id} Flagged"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Template Body Message</label>
              <textarea
                rows={2}
                value={data.template_message}
                onChange={(e) => setData('template_message', e.target.value)}
                placeholder="Customer {customer_name} placed an order with fraud risk score {risk_score}/100."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </AdminModal>
      )}
    </AdminShell>
  );
}
