import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Plus
} from 'lucide-react';

export default function Surveys({ surveys = { data: [] }, technicians = [], filters = {} }) {
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    actual_camera_count: 4,
    indoor_cameras: 2,
    outdoor_cameras: 2,
    ptz_cameras: 0,
    recommended_system_type: 'ip',
    cable_length_meters: 100,
    power_requirement_watts: 60,
    installation_difficulty: 'standard',
    special_materials: '',
    technician_notes: '',
  });

  const handleStatusUpdate = (surveyId, status, techId = null) => {
    router.post(`/admin/cctv/surveys/${surveyId}/status`, {
      status,
      assigned_technician_id: techId,
    });
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    router.post(`/admin/cctv/surveys/${selectedSurvey.id}/report`, reportData, {
      onSuccess: () => {
        setShowReportModal(false);
        setSelectedSurvey(null);
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="CCTV Site Surveys Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              CCTV Site Surveys & Assessments
            </h1>
            <p className="text-xs text-slate-500">
              Manage client premise site surveys, engineer assignments, and technical site survey reports.
            </p>
          </div>
        </div>

        {/* Survey List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Survey #</th>
                  <th className="py-3.5 px-4">Client & Phone</th>
                  <th className="py-3.5 px-4">Premises & District</th>
                  <th className="py-3.5 px-4">Scope</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {surveys.data?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-slate-400">
                      No site survey requests recorded in system.
                    </td>
                  </tr>
                ) : (
                  surveys.data?.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {srv.survey_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{srv.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{srv.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{srv.district}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{srv.project_address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold">{srv.estimated_camera_count} Cameras</div>
                        <div className="text-[10px] text-slate-400">{srv.floors_count} Floors</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={srv.assigned_technician_id || ''}
                          onChange={(e) => handleStatusUpdate(srv.id, srv.status, e.target.value ? Number(e.target.value) : null)}
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
                          value={srv.status}
                          onChange={(e) => handleStatusUpdate(srv.id, e.target.value, srv.assigned_technician_id)}
                          className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 uppercase"
                        >
                          <option value="requested">Requested</option>
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
                            setSelectedSurvey(srv);
                            if (srv.report) {
                              setReportData({
                                actual_camera_count: srv.report.actual_camera_count,
                                indoor_cameras: srv.report.indoor_cameras,
                                outdoor_cameras: srv.report.outdoor_cameras,
                                ptz_cameras: srv.report.ptz_cameras,
                                recommended_system_type: srv.report.recommended_system_type,
                                cable_length_meters: srv.report.cable_length_meters,
                                power_requirement_watts: srv.report.power_requirement_watts,
                                installation_difficulty: srv.report.installation_difficulty,
                                special_materials: srv.report.special_materials || '',
                                technician_notes: srv.report.technician_notes || '',
                              });
                            }
                            setShowReportModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{srv.report ? 'Edit Report' : 'Record Report'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Site Survey Report Modal */}
        {showReportModal && selectedSurvey && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Site Survey Engineering Report: {selectedSurvey.survey_number}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Cameras</label>
                    <input
                      type="number"
                      required
                      value={reportData.actual_camera_count}
                      onChange={(e) => setReportData({ ...reportData, actual_camera_count: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Indoor</label>
                    <input
                      type="number"
                      value={reportData.indoor_cameras}
                      onChange={(e) => setReportData({ ...reportData, indoor_cameras: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Outdoor</label>
                    <input
                      type="number"
                      value={reportData.outdoor_cameras}
                      onChange={(e) => setReportData({ ...reportData, outdoor_cameras: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PTZ</label>
                    <input
                      type="number"
                      value={reportData.ptz_cameras}
                      onChange={(e) => setReportData({ ...reportData, ptz_cameras: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">System Type</label>
                    <select
                      value={reportData.recommended_system_type}
                      onChange={(e) => setReportData({ ...reportData, recommended_system_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 uppercase"
                    >
                      <option value="ip">IP Surveillance</option>
                      <option value="analog">Analog HD</option>
                      <option value="hybrid">Hybrid Architecture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cable Distance (m)</label>
                    <input
                      type="number"
                      required
                      value={reportData.cable_length_meters}
                      onChange={(e) => setReportData({ ...reportData, cable_length_meters: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                    <select
                      value={reportData.installation_difficulty}
                      onChange={(e) => setReportData({ ...reportData, installation_difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    >
                      <option value="easy">Easy / Direct</option>
                      <option value="standard">Standard Premises</option>
                      <option value="complex">Complex / High Ceiling</option>
                      <option value="hazardous">Hazardous / Industrial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Special Materials & Conduit Notes</label>
                  <input
                    type="text"
                    value={reportData.special_materials}
                    onChange={(e) => setReportData({ ...reportData, special_materials: e.target.value })}
                    placeholder="e.g. 1-inch PVC conduit, wall brackets, 4U rack"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Technician Engineering Observations</label>
                  <textarea
                    rows={2}
                    value={reportData.technician_notes}
                    onChange={(e) => setReportData({ ...reportData, technician_notes: e.target.value })}
                    placeholder="Blind spots, power outlets availability, internet router location"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Save Report
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
