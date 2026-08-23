import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  FileText,
  Plus,
  Save,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ReportBuilder({ savedReports = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    report_type: 'sales',
    description: '',
    columns: ['id', 'created_at', 'total_amount', 'status'],
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const handleSave = (e) => {
    e.preventDefault();
    router.post('/admin/cctv/reports/save', formData, {
      onSuccess: () => {
        setShowModal(false);
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="CCTV Custom Report Builder" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              CCTV Report Builder & Saved Queries
            </h1>
            <p className="text-xs text-slate-500">
              Build, customize, and export tailored tabular reports for commercial sales, equipment installations, warranties, and projects.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Report</span>
          </button>
        </div>

        {/* Saved Reports List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savedReports.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-700 text-sm">No Saved Reports Found</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Save reusable reporting templates for management reviews, sales audits, and inventory forecasting.
              </p>
            </div>
          ) : (
            savedReports.map((report) => (
              <div key={report.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                      {report.report_type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{report.name}</h3>
                  </div>
                </div>

                {report.description && (
                  <p className="text-xs text-slate-500">{report.description}</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">By: {report.creator?.name || 'Admin'}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Running report '${report.name}'...`)}
                    className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Execute</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Create Custom Report Template</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Report Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Monthly Enterprise Sales Summary"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dataset / Entity</label>
                  <select
                    value={formData.report_type}
                    onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="sales">CCTV Orders & Revenue</option>
                    <option value="quotes">Commercial Quotations</option>
                    <option value="estimates">System Estimates</option>
                    <option value="projects">Enterprise Projects</option>
                    <option value="installations">Installation Jobs</option>
                    <option value="services">After-Sales Support Tickets</option>
                    <option value="warranties">Active Warranties</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Purpose of report..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">Cancel</button>
                  <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold">Save Template</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
