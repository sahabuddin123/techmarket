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
  FileText,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export default function CctvProjectShow({
  storefront_version = 'v3',
  project = {},
}) {
  const { props } = usePage();
  const activeVersion = getStorefrontVersion(storefront_version || props?.settings?.storefront_version || 'v3');
  const NavbarComponent = activeVersion.Navbar;
  const FooterComponent = activeVersion.Footer;
  const MobileBottomNavComponent = activeVersion.MobileBottomNav;

  const [showSiteModal, setShowSiteModal] = useState(false);
  const [siteData, setSiteData] = useState({
    name: '',
    address: '',
    district: 'Dhaka',
    site_type: 'branch',
  });

  const [showCrModal, setShowCrModal] = useState(false);
  const [crData, setCrData] = useState({
    title: '',
    description: '',
    cost_impact: 0,
  });

  const handleAddSite = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/account/cctv-projects/${project.id}/sites`, siteData);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add site.');
    }
  };

  const handleSubmitCr = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/account/cctv-projects/${project.id}/change-requests`, crData);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit change request.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-poppins selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Head title={`${project.name} | Enterprise CCTV Project`} />

      {NavbarComponent && <NavbarComponent />}

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        {/* Project Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase">
                  #{project.project_number}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md uppercase bg-slate-100 text-slate-700">
                  {project.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-1">{project.name}</h1>
              {project.organization_name && <div className="text-xs text-slate-500 font-medium">{project.organization_name}</div>}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowCrModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                + Change Request
              </button>
              <button
                type="button"
                onClick={() => setShowSiteModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                + Add Site
              </button>
            </div>
          </div>

          {/* Aggregated KPIs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Sites / Branches</div>
              <div className="font-bold text-slate-900 text-base">{project.aggregated_metrics?.sites_count || 0}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Total Cameras</div>
              <div className="font-bold text-blue-600 text-base">{project.aggregated_metrics?.total_cameras || 0}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Storage (TB)</div>
              <div className="font-bold text-slate-800 text-base">{project.aggregated_metrics?.total_storage_tb || 0} TB</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Cabling (Meters)</div>
              <div className="font-bold text-slate-800 text-base">{project.aggregated_metrics?.total_cable_meters || 0} m</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-[10px] text-emerald-600 uppercase font-bold">Total Project Value</div>
              <div className="font-bold text-emerald-700 text-base">৳{Number(project.aggregated_metrics?.total_project_value || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Multi-Site Locations List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Project Sites & Branches ({project.sites?.length || 0})</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.sites?.map((site) => (
              <div key={site.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{site.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {site.address}, {site.district}</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                    {site.site_type}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-700">Buildings ({site.buildings?.length || 0}):</div>
                  {site.buildings?.length === 0 ? (
                    <div className="text-[11px] text-slate-400">No multi-building structure defined.</div>
                  ) : (
                    site.buildings.map((b) => (
                      <div key={b.id} className="text-[11px] text-slate-600 font-mono">
                        • {b.name} ({b.floors_count} Floors)
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Link
                    href={`/cctv-estimator`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    <span>Configure Site CCTV</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Change Requests */}
        {project.changeRequests?.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Project Change Requests</h2>
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

        {/* Add Site Modal */}
        {showSiteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Add Site to Project</h3>
                <button type="button" onClick={() => setShowSiteModal(false)} className="text-slate-400 font-bold">✕</button>
              </div>
              <form onSubmit={handleAddSite} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site / Branch Name</label>
                  <input
                    type="text"
                    required
                    value={siteData.name}
                    onChange={(e) => setSiteData({ ...siteData, name: e.target.value })}
                    placeholder="e.g. Gazipur Factory Unit 2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site Address</label>
                  <input
                    type="text"
                    required
                    value={siteData.address}
                    onChange={(e) => setSiteData({ ...siteData, address: e.target.value })}
                    placeholder="Plot / Road, Area"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      required
                      value={siteData.district}
                      onChange={(e) => setSiteData({ ...siteData, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Site Type</label>
                    <select
                      value={siteData.site_type}
                      onChange={(e) => setSiteData({ ...siteData, site_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <option value="head_office">Head Office</option>
                      <option value="branch">Branch</option>
                      <option value="factory">Factory</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="retail">Retail Outlet</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowSiteModal(false)} className="px-4 py-1.5 rounded-xl bg-slate-100 font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-1.5 rounded-xl bg-blue-600 text-white font-bold">Add Site</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Request Modal */}
        {showCrModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Submit Scope Change Request</h3>
                <button type="button" onClick={() => setShowCrModal(false)} className="text-slate-400 font-bold">✕</button>
              </div>
              <form onSubmit={handleSubmitCr} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Change Title</label>
                  <input
                    type="text"
                    required
                    value={crData.title}
                    onChange={(e) => setCrData({ ...crData, title: e.target.value })}
                    placeholder="e.g. Add 12 Cameras in Loading Bay"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scope Description & Reason</label>
                  <textarea
                    rows={3}
                    required
                    value={crData.description}
                    onChange={(e) => setCrData({ ...crData, description: e.target.value })}
                    placeholder="Describe extra camera points, expanded recording days, or new cable routes"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCrModal(false)} className="px-4 py-1.5 rounded-xl bg-slate-100 font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-1.5 rounded-xl bg-blue-600 text-white font-bold">Submit Request</button>
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
