import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Video,
  HardDrive,
  Cable,
  Layers,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Cpu,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';

export default function ProductProfiles({ profiles = {}, availableProducts = [], filters = {} }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [selectedSystemType, setSelectedSystemType] = useState(filters.system_type || '');

  const { data, setData, post, processing, reset, errors } = useForm({
    product_id: '',
    product_type: 'camera',
    system_type: 'ip',
    resolution_mp: '2.0',
    camera_form_factor: 'dome',
    lens_mm: '2.8',
    ir_distance_meters: '30',
    low_light_tech: 'ColorVu / Full-Color',
    audio_type: 'built_in_mic',
    ai_features: ['human_detection', 'vehicle_detection'],
    ip_rating: 'IP67',
    environment: 'both',
    power_source: 'poe',
    power_consumption_watts: '7.0',
    is_active: true,
    // Device specific
    channel_count: '4',
    max_camera_resolution_mp: '8.0',
    hdd_bay_count: '1',
    poe_port_count: '4',
    // Storage specific
    capacity_tb: '2.0',
    rpm: '5400',
    // Cable specific
    cable_type: 'cat6',
    meters_per_unit: '305',
  });

  const handleFilter = () => {
    router.get('/admin/cctv/profiles', {
      search: searchTerm,
      type: selectedType,
      system_type: selectedSystemType,
    }, { preserveState: true, replace: true });
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedSystemType('');
    router.get('/admin/cctv/profiles', {}, { replace: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/cctv/profiles', {
      onSuccess: () => {
        setIsCreateOpen(false);
        reset();
      },
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this CCTV Profile? The underlying product in catalog will not be deleted.')) {
      router.delete(`/admin/cctv/profiles/${id}`);
    }
  };

  return (
    <AdminLayout title="CCTV Product Technical Profiles" breadcrumbs={[{ label: 'CCTV Estimator', href: '/admin/cctv' }, { label: 'Product Profiles' }]}>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white font-heading">
              CCTV Hardware Profiles
            </h1>
            <p className="text-xs text-slate-400">
              Attach technical surveillance parameters (MP, channels, bays, wattage, cable specs) to products.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Attach Profile to Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search product title or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Hardware Types</option>
            <option value="camera">Camera</option>
            <option value="dvr">DVR</option>
            <option value="nvr">NVR</option>
            <option value="xvr">XVR</option>
            <option value="storage">Storage HDD</option>
            <option value="cable">Cable</option>
            <option value="poe_switch">PoE Switch</option>
            <option value="power_supply">Power Supply</option>
            <option value="junction_box">Junction Box</option>
            <option value="connector">Connector</option>
            <option value="bracket">Bracket</option>
            <option value="service">Installation Service</option>
          </select>

          <select
            value={selectedSystemType}
            onChange={(e) => setSelectedSystemType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All System Types</option>
            <option value="ip">IP System</option>
            <option value="analog">Analog System</option>
            <option value="hybrid">Hybrid System</option>
            <option value="wifi">Wi-Fi System</option>
          </select>

          <button
            type="button"
            onClick={handleFilter}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Filter
          </button>

          {(searchTerm || selectedType || selectedSystemType) && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Profiles Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Hardware Product</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">System</th>
                  <th className="py-3 px-4">Key Technical Specs</th>
                  <th className="py-3 px-4">Price (BDT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {(!profiles.data || profiles.data.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No CCTV Product Profiles found matching current filters.
                    </td>
                  </tr>
                ) : (
                  profiles.data.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white truncate max-w-[280px]">
                          {profile.product?.title || 'Unknown Product'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          SKU: {profile.product?.sku || 'N/A'} • {profile.product?.brand?.name || 'Generic'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] uppercase font-bold">
                          {profile.product_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                          {profile.system_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          {profile.product_type === 'camera' && (
                            <span>
                              {profile.resolution_mp} MP • {profile.camera_form_factor} • {profile.lens_mm}mm • {profile.environment}
                            </span>
                          )}
                          {['dvr', 'nvr', 'xvr'].includes(profile.product_type) && profile.device_profile && (
                            <span>
                              {profile.device_profile.channel_count} Ch • Max {profile.device_profile.max_camera_resolution_mp}MP • {profile.device_profile.hdd_bay_count} Bay(s)
                            </span>
                          )}
                          {profile.product_type === 'storage' && profile.storage_profile && (
                            <span>
                              {profile.storage_profile.capacity_tb} TB • {profile.storage_profile.rpm} RPM Surveillance Grade
                            </span>
                          )}
                          {profile.product_type === 'cable' && profile.cable_profile && (
                            <span>
                              {profile.cable_profile.cable_type} • {profile.cable_profile.meters_per_unit}m Roll
                            </span>
                          )}
                          {!['camera', 'dvr', 'nvr', 'xvr', 'storage', 'cable'].includes(profile.product_type) && (
                            <span className="text-slate-500">Standard Accessory</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ৳{Number(profile.product?.price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {profile.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                            <XCircle className="w-3 h-3" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(profile.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove CCTV Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Attach Profile */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Attach CCTV Technical Profile</h2>
                    <p className="text-xs text-slate-400">Link technical specifications to a catalog product.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Catalog Product <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={data.product_id}
                    onChange={(e) => setData('product_id', e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Existing Ecommerce Product --</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (SKU: {p.sku} | ৳{p.price})
                      </option>
                    ))}
                  </select>
                  {errors.product_id && <p className="text-[10px] text-rose-400 mt-1">{errors.product_id}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hardware Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Product Type</label>
                    <select
                      value={data.product_type}
                      onChange={(e) => setData('product_type', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="camera">Security Camera</option>
                      <option value="nvr">Network Video Recorder (NVR)</option>
                      <option value="dvr">Digital Video Recorder (DVR)</option>
                      <option value="xvr">Hybrid Recorder (XVR)</option>
                      <option value="storage">Surveillance Storage HDD</option>
                      <option value="cable">Transmission Cable</option>
                      <option value="poe_switch">PoE Network Switch</option>
                      <option value="power_supply">Central Power Supply (SMPS)</option>
                      <option value="junction_box">Waterproof Junction Box</option>
                      <option value="connector">Connector Terminals</option>
                      <option value="bracket">Mounting Bracket</option>
                      <option value="service">Installation Service</option>
                    </select>
                  </div>

                  {/* System Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">System Architecture</label>
                    <select
                      value={data.system_type}
                      onChange={(e) => setData('system_type', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ip">IP Network System</option>
                      <option value="analog">Analog / HD-TVI / AHD System</option>
                      <option value="hybrid">Hybrid System</option>
                      <option value="wifi">Wi-Fi Wireless System</option>
                      <option value="all">Universal / All Systems</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Specs: Camera */}
                {data.product_type === 'camera' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Camera Specifications</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Resolution (MP)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={data.resolution_mp}
                          onChange={(e) => setData('resolution_mp', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Form Factor</label>
                        <select
                          value={data.camera_form_factor}
                          onChange={(e) => setData('camera_form_factor', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          <option value="dome">Dome</option>
                          <option value="bullet">Bullet</option>
                          <option value="turret">Turret / Eyeball</option>
                          <option value="ptz">PTZ Speed Dome</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Lens (mm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={data.lens_mm}
                          onChange={(e) => setData('lens_mm', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Environment</label>
                        <select
                          value={data.environment}
                          onChange={(e) => setData('environment', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          <option value="both">Indoor & Outdoor</option>
                          <option value="indoor">Indoor Only</option>
                          <option value="outdoor">Outdoor Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Power Draw (Watts)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={data.power_consumption_watts}
                          onChange={(e) => setData('power_consumption_watts', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Audio</label>
                        <select
                          value={data.audio_type}
                          onChange={(e) => setData('audio_type', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          <option value="none">No Audio</option>
                          <option value="built_in_mic">Built-in Mic</option>
                          <option value="two_way_audio">Two-Way Audio</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Specs: Recorder */}
                {['dvr', 'nvr', 'xvr'].includes(data.product_type) && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Recorder Specifications</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Channel Count</label>
                        <input
                          type="number"
                          value={data.channel_count}
                          onChange={(e) => setData('channel_count', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Max Res (MP)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={data.max_camera_resolution_mp}
                          onChange={(e) => setData('max_camera_resolution_mp', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">HDD Bays</label>
                        <input
                          type="number"
                          value={data.hdd_bay_count}
                          onChange={(e) => setData('hdd_bay_count', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">PoE Ports</label>
                        <input
                          type="number"
                          value={data.poe_port_count}
                          onChange={(e) => setData('poe_port_count', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Specs: Storage */}
                {data.product_type === 'storage' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Storage HDD Specifications</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Capacity (TB)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={data.capacity_tb}
                          onChange={(e) => setData('capacity_tb', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Rotational Speed (RPM)</label>
                        <select
                          value={data.rpm}
                          onChange={(e) => setData('rpm', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          <option value="5400">5400 RPM (Quiet & Cool)</option>
                          <option value="7200">7200 RPM (High Performance)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Specs: Cable */}
                {data.product_type === 'cable' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Cable Specifications</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Cable Type</label>
                        <select
                          value={data.cable_type}
                          onChange={(e) => setData('cable_type', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          <option value="cat6">Cat6 UTP Solid Copper</option>
                          <option value="cat5e">Cat5e UTP</option>
                          <option value="coaxial_rg59">RG59 Coaxial</option>
                          <option value="coaxial_siamese_3c2v">3C-2V Siamese Video+Power</option>
                          <option value="outdoor_shielded_cat6">Outdoor Shielded FTP Cat6</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Pack Length (Meters)</label>
                        <input
                          type="number"
                          value={data.meters_per_unit}
                          onChange={(e) => setData('meters_per_unit', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {processing ? 'Saving...' : 'Save CCTV Profile'}
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
