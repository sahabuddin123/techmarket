import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import { Wrench, Phone, Mail, MapPin, Edit, Eye, UserCheck } from 'lucide-react';

export default function ServiceRequestsIndex({ serviceRequests = { data: [] }, filters = {} }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [editStatus, setEditStatus] = useState('pending');
  const [editTech, setEditTech] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [density, setDensity] = useState('comfortable');

  const requestList = Array.isArray(serviceRequests?.data) ? serviceRequests.data : [];

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    router.get('/admin/service-requests', { status: status !== 'all' ? status : undefined }, { preserveState: true });
  };

  const openModal = (req) => {
    setSelectedRequest(req);
    setEditStatus(req.status || 'pending');
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

  const columns = [
    {
      header: 'Tracking Code',
      accessor: 'tracking_code',
      render: (req) => (
        <div>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
            {req.tracking_code}
          </span>
          <div className="text-[10.5px] text-slate-400">
            {req.service_type ? req.service_type.replace('_', ' ') : 'Hardware RMA'}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer Information',
      accessor: 'customer_name',
      render: (req) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {req.customer_name}
          </div>
          <div className="flex items-center space-x-2 text-[10.5px] text-slate-400 font-mono">
            <span>{req.phone}</span>
            {req.email && <span>• {req.email}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Hardware Device',
      accessor: 'device_type',
      render: (req) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
            {req.brand} {req.model_number}
          </div>
          <div className="text-[10.5px] text-slate-500 font-mono capitalize">
            {req.device_type}
          </div>
        </div>
      ),
    },
    {
      header: 'Service Branch',
      accessor: 'branch',
      render: (req) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
          {req.branch || 'Main Center (Dhaka)'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (req) => (
        <AdminStatusBadge
          status={req.status}
          label={req.status ? req.status.replace('_', ' ') : 'Pending'}
          size="xs"
        />
      ),
    },
    {
      header: 'Assigned Tech',
      accessor: 'assigned_technician',
      render: (req) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 font-mono">
          {req.assigned_technician || '— Unassigned —'}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      render: (req) => (
        <span className="font-mono text-slate-400 text-xs">
          {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (req) => (
        <button
          type="button"
          onClick={() => openModal(req)}
          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Manage</span>
        </button>
      ),
    },
  ];

  return (
    <AdminShell title="Service & RMA Requests">
      <Head title="Hardware Service & Repair Requests - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Hardware Service & RMA Requests"
          subtitle="Manage customer computer repair tickets, diagnostic bench queues, warranty claims, and technician dispatches."
          badge={`${serviceRequests.total || requestList.length} Tickets`}
        />

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
          {['all', 'pending', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => handleFilterChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={requestList}
          pagination={serviceRequests}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No service repair requests found"
          emptyDescription="Customer warranty claims and repair requests submitted through the service portal will appear here."
        />
      </div>

      {/* Detail / Update Modal */}
      {selectedRequest && (
        <AdminModal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title={`Service Ticket: ${selectedRequest.tracking_code}`}
          subtitle={`${selectedRequest.customer_name} • ${selectedRequest.device_type}`}
          icon={Wrench}
          size="lg"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Save Ticket Updates
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Customer Details */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                <div><span className="text-slate-400 font-mono">Customer:</span> {selectedRequest.customer_name}</div>
                <div><span className="text-slate-400 font-mono">Phone:</span> {selectedRequest.phone}</div>
                <div><span className="text-slate-400 font-mono">Device:</span> {selectedRequest.brand} {selectedRequest.model_number}</div>
                <div><span className="text-slate-400 font-mono">Branch:</span> {selectedRequest.branch}</div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700/80 pt-2 text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-400 font-mono block mb-0.5">Reported Issue:</span>
                "{selectedRequest.issue_description}"
              </div>
            </div>

            {/* Status Update Form */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Ticket Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Assigned Technician</label>
                <input
                  type="text"
                  placeholder="Technician name..."
                  value={editTech}
                  onChange={(e) => setEditTech(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Internal Diagnostic Notes</label>
              <textarea
                rows={3}
                placeholder="Hardware test findings, parts replaced, RMA details..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
          </div>
        </AdminModal>
      )}
    </AdminShell>
  );
}
