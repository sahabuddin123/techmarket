import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Search, Filter, Eye, Trash2, CheckCircle2, Clock, 
  AlertCircle, MessageSquare, Phone, Mail, User, 
  ChevronRight, Bot, Sparkles, Send, X, ShieldAlert
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
  
  // Active Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editStatus, setEditStatus] = useState('new');
  const [editPriority, setEditPriority] = useState('medium');
  const [editNotes, setEditNotes] = useState('');
  const [editAgent, setEditAgent] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    if (!value || value === 'all') delete updated[key];
    router.get('/admin/support-tickets', updated, { preserveState: true, preserveScroll: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', search);
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
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

  const confirmDelete = () => {
    if (!deleteModal) return;
    router.delete(`/admin/support-tickets/${deleteModal.id}`, {
      preserveScroll: true,
      onSuccess: () => setDeleteModal(null),
    });
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">New</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider">In Progress</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">Resolved</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] font-black uppercase tracking-wider">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-gray-500/10 text-gray-400 text-[10px] font-bold uppercase">{s}</span>;
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high':
        return <span className="text-[10px] font-black text-rose-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>HIGH</span>;
      case 'medium':
        return <span className="text-[10px] font-black text-amber-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>MEDIUM</span>;
      case 'low':
        return <span className="text-[10px] font-black text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>LOW</span>;
      default:
        return <span className="text-[10px] text-slate-400">{p}</span>;
    }
  };

  return (
    <AdminLayout title="AI Chatbot & Support Tickets Inbox">
      <Head title="AI Support Tickets & Inquiries | Admin Panel" />

      <div className="space-y-6">
        
        {/* HEADER & METRICS ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" />
              <span>AI Support Tickets Inbox</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time customer inquiries escalated from the AI Chatbot when database resolution requires human intervention.
            </p>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Total Inquiries</span>
            <div className="text-xl font-black text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-slate-900/60 border border-amber-900/40 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-amber-400 font-bold uppercase">New / Pending</span>
            <div className="text-xl font-black text-amber-400 mt-1">{stats.new}</div>
          </div>
          <div className="bg-slate-900/60 border border-blue-900/40 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-blue-400 font-bold uppercase">In Progress</span>
            <div className="text-xl font-black text-blue-400 mt-1">{stats.in_progress}</div>
          </div>
          <div className="bg-slate-900/60 border border-emerald-900/40 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-emerald-400 font-bold uppercase">Resolved</span>
            <div className="text-xl font-black text-emerald-400 mt-1">{stats.resolved}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Closed</span>
            <div className="text-xl font-black text-slate-400 mt-1">{stats.closed}</div>
          </div>
        </div>

        {/* FILTERS & SEARCH TOOLBAR */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
            <input
              type="text"
              placeholder="Search by ticket #, customer name, phone, email, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilterChange('status', e.target.value);
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                handleFilterChange('priority', e.target.value);
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* TICKETS TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="p-3.5">Ticket #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Inquiry Question / Summary</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Assigned Agent</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tickets.data && tickets.data.length > 0 ? (
                  tickets.data.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-400">
                        #{t.ticket_number}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white leading-tight">{t.customer_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{t.customer_phone}</span>
                        </div>
                        {t.customer_email && (
                          <div className="text-[10px] text-slate-500">{t.customer_email}</div>
                        )}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <p className="line-clamp-2 text-slate-300 leading-relaxed font-medium">
                          {t.inquiry_text}
                        </p>
                      </td>
                      <td className="p-3.5">
                        {getPriorityBadge(t.priority)}
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {t.assigned_agent ? t.assigned_agent.name : '— Unassigned —'}
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openTicketModal(t)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                            title="View Transcript & Manage"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(t)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-500 text-xs">
                      No support tickets found matching your selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {tickets.links && tickets.links.length > 3 && (
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {tickets.data.length} out of {tickets.total} tickets</span>
              <div className="flex items-center gap-1">
                {tickets.links.map((l, idx) => (
                  <button
                    key={idx}
                    disabled={!l.url || l.active}
                    onClick={() => l.url && router.get(l.url, {}, { preserveScroll: true })}
                    dangerouslySetInnerHTML={{ __html: l.label }}
                    className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                      l.active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : l.url
                        ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TICKET DETAILS & TRANSCRIPT MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Ticket #{selectedTicket.ticket_number}</span>
                    {getStatusBadge(selectedTicket.status)}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Customer: <strong className="text-slate-200">{selectedTicket.customer_name}</strong> • Phone: <strong className="text-slate-200">{selectedTicket.customer_phone}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split 2 Columns (Left: Chat Transcript, Right: Resolution & Status) */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Full Chat Session Transcript */}
              <div className="lg:col-span-7 space-y-3 flex flex-col">
                <span className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Customer Chat Transcript</span>
                </span>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 flex-1 max-h-[420px] overflow-y-auto custom-scrollbar">
                  {selectedTicket.session?.messages && selectedTicket.session.messages.length > 0 ? (
                    selectedTicket.session.messages.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-500 uppercase font-bold px-1 mb-0.5">
                          {m.sender === 'user' ? selectedTicket.customer_name : 'AI Assistant'}
                        </span>
                        <div
                          className={`p-3 rounded-xl text-xs max-w-[88%] leading-relaxed ${
                            m.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No prior chat messages logged for this session.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Manage Ticket Status & Notes */}
              <div className="lg:col-span-5 space-y-4">
                <span className="font-black text-xs uppercase tracking-wider text-slate-400">
                  Ticket Management & Actions
                </span>

                <form onSubmit={handleUpdateTicket} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3.5 text-xs">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="new">New / Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Priority Dropdown */}
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Assign Agent */}
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Assigned Support Agent</label>
                    <select
                      value={editAgent}
                      onChange={(e) => setEditAgent(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="">— Unassigned —</option>
                      {adminAgents.map((ag) => (
                        <option key={ag.id} value={ag.id}>{ag.name} ({ag.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* Resolution Notes */}
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Internal Resolution Notes</label>
                    <textarea
                      rows={4}
                      placeholder="Add notes about customer follow-up, call details, or resolution..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="px-3.5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-xs"
                    >
                      Save Ticket Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Delete Support Ticket?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete ticket <strong className="text-white">#{deleteModal.ticket_number}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
