import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Wrench, Search, Filter, Phone, Mail, MapPin, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function ServiceRequestsIndex({ serviceRequests, filters = {} }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [editStatus, setEditStatus] = useState('pending');
  const [editTech, setEditTech] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    router.get('/admin/service-requests', { status: status !== 'all' ? status : undefined }, { preserveState: true });
  };

  const openModal = (req) => {
    setSelectedRequest(req);
    setEditStatus(req.status);
    setEditTech(req.assigned_technician || '');
    setEditNotes(req.admin_notes || '');
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    router.put(`/admin/service-requests/${selectedRequest.id}`, {
      status: editStatus,
      assigned_technician: editTech,
      admin_notes: editNotes,
    }, {
      onSuccess: () => setSelectedRequest(null),
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">Pending</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase">Contacted</span>;
      case 'scheduled':
        return <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase">Scheduled</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <Head title="Service & Repair Requests - TechMarket BD Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              <span>Hardware Service & Repair Requests</span>
            </h1>
            <p className="text-xs text-slate-400">Track and manage customer laptop repairs, diagnostics, and RMA tickets.</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-bold">
            {['all', 'pending', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => handleFilterChange(st)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                  statusFilter === st ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="p-4">Tracking Code</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Device & Brand</th>
                <th className="p-4">Service Branch</th>
                <th className="p-4">Status</th>
                <th className="p-4">Technician</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {!serviceRequests?.data || serviceRequests.data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No service requests found for this status.
                  </td>
                </tr>
              ) : (
                serviceRequests.data.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">
                      {req.tracking_code}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{req.customer_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{req.customer_phone}</div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="font-bold text-xs">{req.device_type}</div>
                      <div className="text-[11px] text-slate-500">{req.brand_name || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {req.service_branch}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="p-4 text-slate-300 text-xs">
                      {req.assigned_technician || <span className="text-slate-600 italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openModal(req)}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded text-xs font-bold transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Manage Request Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-sm text-white">
                  Manage Service Ticket #{selectedRequest.tracking_code}
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Customer & Device Summary */}
              <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-xs border border-slate-800/80">
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div><strong>Customer:</strong> {selectedRequest.customer_name}</div>
                  <div><strong>Phone:</strong> {selectedRequest.customer_phone}</div>
                  <div><strong>Device:</strong> {selectedRequest.device_type}</div>
                  <div><strong>Branch:</strong> {selectedRequest.service_branch}</div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-slate-300">
                  <strong>Reported Issue:</strong>
                  <p className="text-slate-400 mt-0.5">{selectedRequest.issue_description}</p>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Ticket Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted Customer</option>
                    <option value="scheduled">Diagnostic Scheduled</option>
                    <option value="in_progress">In Progress (Repairing)</option>
                    <option value="completed">Completed & Ready for Pickup</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Assigned Hardware Engineer</label>
                  <input
                    type="text"
                    value={editTech}
                    onChange={(e) => setEditTech(e.target.value)}
                    placeholder="e.g. Engr. Shafiqul Islam"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Internal Lab & Diagnostic Notes</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Replaced display cable, thermal pad changed, 24h stress test passed..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md"
                  >
                    Update Service Ticket
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
