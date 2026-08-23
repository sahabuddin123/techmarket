import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Layers,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  User,
  Plus,
  ArrowRight,
  FileText,
  Wrench,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ProjectDetails({ project = {} }) {
  const [status, setStatus] = useState(project.status || 'draft');
  const [priority, setPriority] = useState(project.priority || 'normal');
  const [budget, setBudget] = useState(project.budget || 0);

  const handleUpdate = (e) => {
    e.preventDefault();
    router.post(`/admin/cctv/projects/${project.id}/status`, {
      status,
      priority,
      budget: Number(budget),
    });
  };

  return (
    <AdminLayout>
      <Head title={`Project #${project.project_number} - ${project.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase">
                  #{project.project_number}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md uppercase bg-slate-100 text-slate-700">
                  {project.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">{project.name}</h1>
              {project.organization_name && <div className="text-xs text-slate-500 font-medium">{project.organization_name}</div>}
            </div>

            <form onSubmit={handleUpdate} className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold uppercase"
              >
                <option value="draft">Draft</option>
                <option value="survey">Site Survey</option>
                <option value="design">Design</option>
                <option value="estimation">Estimation</option>
                <option value="quotation">Quotation</option>
                <option value="approved">Approved</option>
                <option value="installation">Installation</option>
                <option value="testing">Testing</option>
                <option value="handover">Handover</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
              >
                Update Status
              </button>
            </form>
          </div>

          {/* Aggregated Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Sites Count</div>
              <div className="font-bold text-slate-900 text-base">{project.aggregated_metrics?.sites_count || 0}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Total Cameras</div>
              <div className="font-bold text-blue-600 text-base">{project.aggregated_metrics?.total_cameras || 0}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Total Storage</div>
              <div className="font-bold text-slate-800 text-base">{project.aggregated_metrics?.total_storage_tb || 0} TB</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Total Cabling</div>
              <div className="font-bold text-slate-800 text-base">{project.aggregated_metrics?.total_cable_meters || 0} m</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-[10px] text-emerald-600 uppercase font-bold">Aggregated Project Value</div>
              <div className="font-bold text-emerald-700 text-base">৳{Number(project.aggregated_metrics?.total_project_value || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Sites & Structures */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Multi-Site Infrastructure ({project.sites?.length || 0})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.sites?.map((s) => (
              <div key={s.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <div className="text-xs text-slate-500">{s.address}, {s.district}</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                    {s.site_type}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-700">Buildings ({s.buildings?.length || 0}):</div>
                  {s.buildings?.length === 0 ? (
                    <div className="text-[11px] text-slate-400">Single building premise.</div>
                  ) : (
                    s.buildings.map((b) => (
                      <div key={b.id} className="text-[11px] text-slate-600 font-mono">
                        • {b.name} ({b.floors_count} Floors)
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Change Requests */}
        {project.changeRequests?.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scope Change Requests</h2>
            <div className="space-y-2 text-xs">
              {project.changeRequests.map((cr) => (
                <div key={cr.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{cr.title} (#{cr.change_number})</div>
                    <div className="text-slate-500">{cr.description}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-amber-50 text-amber-700">
                      {cr.status}
                    </span>
                    {cr.cost_impact > 0 && (
                      <div className="font-mono text-slate-700 font-bold mt-1">+৳{Number(cr.cost_impact).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
