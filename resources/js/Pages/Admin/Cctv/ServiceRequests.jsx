import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Wrench,
  Search,
  Filter,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Edit2
} from 'lucide-react';

export default function ServiceRequests({ tickets = { data: [] }, technicians = [], filters = {} }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('submitted');
  const [techId, setTechId] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState(0);

  const handleUpdate = (e) => {
    e.preventDefault();
    router.post(`/admin/cctv/service-requests/${selectedTicket.id}/status`, {
      status,
      assigned_technician_id: techId ? Number(techId) : null,
      internal_notes: notes,
      total_service_cost: Number(cost),
    }, {
      onSuccess: () => {
        setShowModal(false);
        setSelectedTicket(null);
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="CCTV Service Tickets & Work Orders" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              CCTV After-Sales Support & Service Tickets
            </h1>
            <p className="text-xs text-slate-500">
              Manage client support tickets, technician dispatching, warranty repair approvals, and resolution tracking.
            </p>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Ticket #</th>
                  <th className="py-3.5 px-4">Client & Phone</th>
                  <th className="py-3.5 px-4">Problem Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Warranty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tickets.data?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-400">
                      No service tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.data?.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {t.ticket_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{t.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-bold text-[10px] text-slate-600">
                        {t.problem_category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.priority === 'urgent' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {t.technician?.name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {t.warranty_id ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Out of Warranty</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(t);
                            setStatus(t.status);
                            setTechId(t.assigned_technician_id || '');
                            setNotes(t.internal_notes || '');
                            setCost(t.total_service_cost || 0);
                            setShowModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manage Ticket Modal */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Manage Service Ticket #{selectedTicket.ticket_number}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">{selectedTicket.customer_name} ({selectedTicket.customer_phone})</div>
                  <div className="text-slate-600">{selectedTicket.problem_description}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ticket Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 uppercase font-bold"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="assigned">Assigned</option>
                      <option value="diagnosing">Diagnosing</option>
                      <option value="repairing">Repairing</option>
                      <option value="waiting_for_parts">Waiting for Parts</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assign Technician</label>
                    <select
                      value={techId}
                      onChange={(e) => setTechId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                    >
                      <option value="">-- Unassigned --</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Internal Engineering Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Diagnosis observations, parts needed, warranty confirmation"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Update Ticket
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
