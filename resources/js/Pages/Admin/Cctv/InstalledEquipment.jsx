import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  ShieldCheck,
  Video,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench
} from 'lucide-react';

export default function InstalledEquipment({ equipment = { data: [] }, filters = {} }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_name_snapshot: '',
    serial_number: '',
    device_type: 'camera',
    camera_name: '',
    location_floor: '',
    location_room: '',
    ip_address: '',
    warranty_months: 12,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post('/admin/cctv/installed-equipment', formData, {
      onSuccess: () => {
        setShowModal(false);
        setFormData({
          product_name_snapshot: '',
          serial_number: '',
          device_type: 'camera',
          camera_name: '',
          location_floor: '',
          location_room: '',
          ip_address: '',
          warranty_months: 12,
        });
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="CCTV Installed Equipment & Serial Registry" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              Installed Equipment & Serial Register
            </h1>
            <p className="text-xs text-slate-500">
              Auditable inventory of physical cameras, recording units, storage drives, and their active hardware warranties.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Equipment</span>
          </button>
        </div>

        {/* Equipment Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Device & Name</th>
                  <th className="py-3.5 px-4">Serial Number</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Warranty</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {equipment.data?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400">
                      No installed equipment registered in system.
                    </td>
                  </tr>
                ) : (
                  equipment.data?.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{eq.camera_name || eq.product_name_snapshot}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{eq.ip_address || 'DHCP'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {eq.serial_number}
                      </td>
                      <td className="py-3.5 px-4 uppercase font-bold text-[10px] text-slate-600">
                        {eq.device_type}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{eq.location_floor || 'Main Building'}</div>
                        <div className="text-[10px] text-slate-400">{eq.location_room || 'General Area'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {eq.warranty ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Expires {new Date(eq.warranty.warranty_end).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">No Warranty</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          eq.status === 'operational' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {eq.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Register Equipment Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Register Installed Equipment
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name / Model</label>
                  <input
                    type="text"
                    required
                    value={formData.product_name_snapshot}
                    onChange={(e) => setFormData({ ...formData, product_name_snapshot: e.target.value })}
                    placeholder="e.g. Hikvision 4MP Smart IP Dome Camera"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Serial Number (S/N)</label>
                    <input
                      type="text"
                      required
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      placeholder="e.g. HIK-2026-X992"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Device Type</label>
                    <select
                      value={formData.device_type}
                      onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    >
                      <option value="camera">Camera</option>
                      <option value="recorder">NVR / DVR Recorder</option>
                      <option value="storage">Storage HDD</option>
                      <option value="switch">PoE Switch</option>
                      <option value="psu">Power Supply / UPS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Camera / Point Name</label>
                    <input
                      type="text"
                      value={formData.camera_name}
                      onChange={(e) => setFormData({ ...formData, camera_name: e.target.value })}
                      placeholder="e.g. Front Gate East View"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location / Floor</label>
                    <input
                      type="text"
                      value={formData.location_floor}
                      onChange={(e) => setFormData({ ...formData, location_floor: e.target.value })}
                      placeholder="e.g. 2nd Floor Corridor"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Static IP Address</label>
                    <input
                      type="text"
                      value={formData.ip_address}
                      onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                      placeholder="e.g. 192.168.1.65"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Warranty Period (Months)</label>
                    <input
                      type="number"
                      value={formData.warranty_months}
                      onChange={(e) => setFormData({ ...formData, warranty_months: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                    />
                  </div>
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
                    Register & Activate Warranty
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
