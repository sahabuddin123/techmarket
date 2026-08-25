import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import { Zap, Plus, CheckCircle, XCircle } from 'lucide-react';

export default function AdminMarketingAutomations({ automations = { data: [] } }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState('comfortable');

  const automationList = Array.isArray(automations?.data) ? automations.data : [];

  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    trigger_event: 'order_completed',
    channel: 'database',
    template: 'Thank you for your order! Your loyalty points have been updated.',
    is_active: true,
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    post('/admin/marketing-automations', {
      onSuccess: () => {
        setShowCreateModal(false);
        reset();
      }
    });
  };

  const handleToggle = (id) => {
    router.post(`/admin/marketing-automations/${id}/toggle`, {}, { preserveScroll: true });
  };

  const filteredAutomations = automationList.filter(a =>
    !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.trigger_event?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Campaign Name',
      accessor: 'name',
      sortable: true,
      render: (a) => (
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {a.name}
          </span>
        </div>
      ),
    },
    {
      header: 'Trigger Event',
      accessor: 'trigger_event',
      render: (a) => (
        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
          {a.trigger_event}
        </span>
      ),
    },
    {
      header: 'Delivery Channel',
      accessor: 'channel',
      render: (a) => (
        <span className="font-mono uppercase text-[11px] font-bold text-slate-700 dark:text-slate-300">
          {a.channel}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (a) => (
        <AdminStatusBadge
          status={a.is_active ? 'active' : 'draft'}
          label={a.is_active ? 'Active' : 'Disabled'}
          size="xs"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (a) => (
        <button
          type="button"
          onClick={() => handleToggle(a.id)}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            a.is_active 
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
          }`}
          title={a.is_active ? 'Disable Automation' : 'Activate Automation'}
        >
          {a.is_active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
        </button>
      ),
    },
  ];

  return (
    <AdminShell title="Marketing Automations">
      <Head title="Marketing Automations - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Event-Driven Marketing Automations"
          subtitle="Trigger automated multichannel notifications upon registration, completed checkouts, and price alerts."
          badge={`${automations.total || automationList.length} Journeys`}
          actions={
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Automation</span>
            </button>
          }
        />

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search automations by name or trigger..."
          onRefresh={() => router.get('/admin/marketing-automations')}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredAutomations}
          pagination={automations}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No marketing automations configured"
          emptyDescription="Create event triggers to engage customers during critical checkout and onboarding milestones."
          emptyAction={
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Automation</span>
            </button>
          }
        />
      </div>

      {/* Create Modal */}
      <AdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Marketing Automation"
        subtitle="Configure event triggers and notification content"
        icon={Zap}
        size="md"
        footer={
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSubmit}
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {processing ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Campaign Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Welcome Loyalty Gift"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Trigger Event *</label>
            <select
              value={data.trigger_event}
              onChange={(e) => setData('trigger_event', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            >
              <option value="user_registered">Customer Registration</option>
              <option value="order_completed">Order Completed</option>
              <option value="cart_abandoned">Cart Abandoned</option>
              <option value="product_price_dropped">Product Price Dropped</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Channel *</label>
            <select
              value={data.channel}
              onChange={(e) => setData('channel', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            >
              <option value="database">Database In-App Notification</option>
              <option value="email">Email Message</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Template / Message *</label>
            <textarea
              rows={3}
              required
              value={data.template}
              onChange={(e) => setData('template', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
            />
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
