import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import ChatWidgetV3 from '@/Pages/Storefront/Version3/Components/ChatWidgetV3';
import {
  Layers,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  ArrowRight,
  ShieldCheck,
  Video,
  FileText
} from 'lucide-react';

export default function CctvProjects({
  storefront_version,
  projects = [],
}) {
  const { props } = usePage();
  const activeVersion = getStorefrontVersion(storefront_version || props?.storefront_version || props?.settings?.storefront_version || 'v1');
  const NavbarComponent = activeVersion.Navbar;
  const FooterComponent = activeVersion.Footer;
  const MobileBottomNavComponent = activeVersion.MobileBottomNav;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization_name: '',
    project_type: 'commercial',
    industry: 'Corporate',
    priority: 'normal',
    budget: 500000,
    expected_completion_date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post('/account/cctv-projects', formData);
      if (res.data.status === 'success') {
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-poppins selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Head title="Enterprise CCTV Surveillance Projects | TechMarket BD" />

      {NavbarComponent && <NavbarComponent />}

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600" />
              <span>Enterprise CCTV Surveillance Projects</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Multi-site, multi-building commercial security deployments, aggregated BOMs, and milestones.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Enterprise Project</span>
          </button>
        </div>

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-700 text-sm">No Enterprise Projects Found</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a multi-site project for factories, offices, campuses, or shopping complexes.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Start Enterprise Project
              </button>
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 hover:border-blue-300 transition-colors flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                        #{proj.project_number}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{proj.name}</h3>
                      {proj.organization_name && (
                        <div className="text-xs text-slate-500 font-medium">{proj.organization_name}</div>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {proj.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Aggregated KPIs */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs">
                    <div className="text-center space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase">Sites</div>
                      <div className="font-bold text-slate-800">{proj.aggregated_metrics?.sites_count || 0}</div>
                    </div>
                    <div className="text-center space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase">Cameras</div>
                      <div className="font-bold text-blue-600">{proj.aggregated_metrics?.total_cameras || 0}</div>
                    </div>
                    <div className="text-center space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase">Est. Value</div>
                      <div className="font-bold text-emerald-600">৳{Number(proj.aggregated_metrics?.total_project_value || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Budget: ৳{Number(proj.budget).toLocaleString()}</span>
                  <Link
                    href={`/account/cctv-projects/${proj.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1"
                  >
                    <span>Inspect Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Create Enterprise CCTV Project
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Garments Multi-Unit Surveillance"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organization / Client</label>
                    <input
                      type="text"
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      placeholder="e.g. Apex Holdings Ltd"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Project Type</label>
                    <select
                      value={formData.project_type}
                      onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    >
                      <option value="commercial">Commercial Corporate Office</option>
                      <option value="factory">Garments / Industrial Factory</option>
                      <option value="warehouse">Logistics Warehouse</option>
                      <option value="hospital">Hospital / Healthcare</option>
                      <option value="institutional">School / University Campus</option>
                      <option value="residential">Residential Complex</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estimated Budget (BDT)</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 uppercase font-bold"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    {submitting ? 'Creating...' : 'Initialize Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {storefront_version === 'v3' && <ChatWidgetV3 />}
      {MobileBottomNavComponent && <MobileBottomNavComponent />}
      {FooterComponent && <FooterComponent />}
    </div>
  );
}
