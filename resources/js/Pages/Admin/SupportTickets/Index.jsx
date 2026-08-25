import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminModal from '../../../Components/Admin/AdminModal';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { 
  LifeBuoy, MessageSquare, Edit, Trash2, CheckCircle2, 
  Clock, AlertCircle, Sparkles, User, ChevronRight, Phone, Mail
} from 'lucide-react';

export default function SupportTicketsIndex({ 
  tickets = { data: [] }, 
  stats = { total: 0, new: 0, in_progress: 0, resolved: 0, closed: 0 }, 
  adminAgents = [],
  filters = {} 
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editStatus, setEditStatus] = useState('new');
  const [editPriority, setEditPriority] = useState('medium');
  const [editNotes, setEditNotes] = useState('');
  const [editAgent, setEditAgent] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const ticketList = Array.isArray(tickets?.data) ? tickets.data : [];

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    if (!value || value === 'all') delete updated[key];
    router.get('/admin/support-tickets', updated, { preserveState: true, preserveScroll: true });
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status || 'new');
    setEditPriority(ticket.priority || 'medium');
    setEditNotes(ticket.resolution_notes || '');
    setEditAgent(ticket.assigned_to || '');
  };

  const handleUpdateTicket = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    router.put(`/admin/support-tickets/${selectedTicket.id}`, {
      status: editStatus,
      priority: editPriority,
      assigned_to: editAgent || null,
      resolution_notes: editNotes,
    }, {
      preserveScroll: true,
      onSuccess: () => setSelectedTicket(null),
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/support-tickets/${deleteTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Ticket # / Subject',
      accessor: 'ticket_number',
      render: (t) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
            {t.ticket_number}
          </span>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {t.subject}
          </div>
          <div className="text-[10.5px] text-slate-400">
            Source: <span className="capitalize font-mono">{t.source?.replace('_', ' ') || 'Web Portal'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Customer Information',
      accessor: 'customer_name',
      render: (t) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
            {t.customer_name || t.user?.name || 'Guest User'}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {t.customer_email || t.user?.email || t.customer_phone || 'No contact info'}
          </div>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (t) => (
        <AdminStatusBadge
          status={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'draft'}
          label={t.priority || 'Normal'}
          size="xs"
        />
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (t) => (
        <AdminStatusBadge
          status={t.status === 'resolved' ? 'active' : t.status === 'in_progress' ? 'pending' : t.status === 'closed' ? 'draft' : 'warning'}
          label={t.status ? t.status.replace('_', ' ') : 'New'}
          size="xs"
        />
      ),
    },
    {
      header: 'Assigned Agent',
      accessor: 'agent',
      render: (t) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">
          {t.agent?.name || '— Unassigned —'}
        </span>
      ),
    },
    {
      header: 'Created Date',
      accessor: 'created_at',
      render: (t) => (
        <span className="font-mono text-slate-400 text-xs">
          {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (t) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => openTicketModal(t)}
            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(t)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Support Tickets">
      <Head title="Customer Support Tickets - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Customer Support Tickets & Escalations"
          subtitle="Triage customer inquiries, AI chatbot escalations, order dispute tickets, and assign support specialists."
          badge={`${stats.total || tickets.total || ticketList.length} Tickets`}
        />

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <AdminKpiCard
            title="Total Tickets"
            value={stats.total || 0}
            icon={LifeBuoy}
            color="indigo"
          />
          <AdminKpiCard
            title="New Inquiries"
            value={stats.new || 0}
            icon={AlertCircle}
            color="amber"
          />
          <AdminKpiCard
            title="In Progress"
            value={stats.in_progress || 0}
            icon={Clock}
            color="blue"
          />
          <AdminKpiCard
            title="Resolved Tickets"
            value={stats.resolved || 0}
            icon={CheckCircle2}
            color="emerald"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {['all', 'new', 'in_progress', 'resolved', 'closed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleFilterChange('status', st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  status === st
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <AdminPageToolbar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              handleFilterChange('search', val);
            }}
            searchPlaceholder="Search ticket #, subject, or customer..."
            onRefresh={() => router.get('/admin/support-tickets')}
          />
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={ticketList}
          pagination={tickets}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No support tickets found"
          emptyDescription="Customer tickets and live chatbot escalations will appear here for staff assistance."
        />
      </div>

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <AdminModal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={`Support Ticket: ${selectedTicket.ticket_number}`}
          subtitle={selectedTicket.subject}
          icon={LifeBuoy}
          size="lg"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateTicket}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Save Ticket
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                <span>Customer: {selectedTicket.customer_name || 'Guest'}</span>
                <span>Contact: {selectedTicket.customer_phone || selectedTicket.customer_email || 'N/A'}</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                "{selectedTicket.description}"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden capitalize"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden capitalize"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Assign Agent</label>
                <select
                  value={editAgent}
                  onChange={(e) => setEditAgent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                >
                  <option value="">Unassigned</option>
                  {adminAgents.map((ag) => (
                    <option key={ag.id} value={ag.id}>{ag.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Internal Resolution Notes</label>
              <textarea
                rows={3}
                placeholder="Log steps taken, communication with customer, or escalation notes..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
          </div>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Support Ticket"
        message={`Are you sure you want to permanently delete ticket ${deleteTarget?.ticket_number}?`}
        confirmText="Delete Ticket"
        isDestructive
      />
    </AdminShell>
  );
}
