import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Wrench,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Check,
  X
} from 'lucide-react';

export default function Installations({ jobs = { data: [] }, technicians = [], filters = {} }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklist, setChecklist] = useState({
    camera_test: 'passed',
    night_vision_test: 'passed',
    recording_test: 'passed',
    playback_test: 'passed',
    storage_test: 'passed',
    network_test: 'passed',
    mobile_app_test: 'passed',
    ptz_test: 'not_applicable',
    ups_power_test: 'passed',
  });
  const [installedCount, setInstalledCount] = useState(4);
  const [notes, setNotes] = useState('');

  const handleStatusUpdate = (jobId, status, techId = null) => {
    router.post(`/admin/cctv/installations/${jobId}/status`, {
      status,
      assigned_technician_id: techId,
    });
  };

  const handleChecklistSubmit = (e) => {
    e.preventDefault();
    router.post(`/admin/cctv/installations/${selectedJob.id}/status`, {
      status: 'completed',
      assigned_technician_id: selectedJob.assigned_technician_id,
      installed_camera_count: installedCount,
      testing_checklist: checklist,
      technician_notes: notes,
    }, {
      onSuccess: () => {
        setShowChecklistModal(false);
        setSelectedJob(null);
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="CCTV Installation Jobs Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              CCTV Installation & Service Jobs
            </h1>
            <p className="text-xs text-slate-500">
              Track on-site physical hardware installations, technician deployment, and post-installation testing validation.
            </p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Job #</th>
                  <th className="py-3.5 px-4">Client & Phone</th>
                  <th className="py-3.5 px-4">Premises Address</th>
                  <th className="py-3.5 px-4">Cameras</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {jobs.data?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-slate-400">
                      No installation jobs recorded.
                    </td>
                  </tr>
                ) : (
                  jobs.data?.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {job.job_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{job.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{job.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-800 truncate max-w-xs">{job.customer_address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold">{job.installed_camera_count} / {job.camera_count} Installed</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={job.assigned_technician_id || ''}
                          onChange={(e) => handleStatusUpdate(job.id, job.status, e.target.value ? Number(e.target.value) : null)}
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                        >
                          <option value="">-- Unassigned --</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusUpdate(job.id, e.target.value, job.assigned_technician_id)}
                          className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 uppercase"
                        >
                          <option value="pending">Pending</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJob(job);
                            setInstalledCount(job.camera_count);
                            if (job.testing_checklist) {
                              setChecklist(job.testing_checklist);
                            }
                            if (job.technician_notes) {
                              setNotes(job.technician_notes);
                            }
                            setShowChecklistModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Checklist & Testing</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Post-Installation Validation Checklist Modal */}
        {showChecklistModal && selectedJob && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Post-Installation Quality Validation Checklist
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">Job #{selectedJob.job_number}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChecklistModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChecklistSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Installed Cameras Count</label>
                  <input
                    type="number"
                    required
                    value={installedCount}
                    onChange={(e) => setInstalledCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                    Testing Checklist & Quality Assurance (QA)
                  </div>

                  {Object.entries({
                    camera_test: 'All camera feeds live & aligned',
                    night_vision_test: 'IR night vision & illumination verified',
                    recording_test: 'Continuous / motion recording active',
                    playback_test: 'Playback retrieval tested',
                    storage_test: 'HDD storage formatted & recognized',
                    network_test: 'Local network & bandwidth verified',
                    mobile_app_test: 'Client mobile app live view linked',
                    ptz_test: 'PTZ rotation / zoom responsiveness',
                    ups_power_test: 'UPS backup power & voltage surge test',
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-700 font-medium">{label}</span>
                      <select
                        value={checklist[key] || 'passed'}
                        onChange={(e) => setChecklist({ ...checklist, [key]: e.target.value })}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          checklist[key] === 'passed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : checklist[key] === 'failed'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="not_applicable">N/A</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Technician Commissioning Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Customer trained on mobile app, handover completed"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowChecklistModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Complete Job & Save QA
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
