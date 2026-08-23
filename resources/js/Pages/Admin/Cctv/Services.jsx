import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Wrench,
  DollarSign,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Services({ services = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    pricing_type: 'per_camera',
    base_rate: 0,
    unit_rate: 500,
    is_active: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post('/admin/cctv/services', formData, {
      onSuccess: () => {
        setShowModal(false);
        setFormData({
          name: '',
          code: '',
          description: '',
          pricing_type: 'per_camera',
          base_rate: 0,
          unit_rate: 500,
          is_active: true,
        });
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="CCTV Service Types & Installation Rates" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              CCTV Dynamic Service Types & Rates
            </h1>
            <p className="text-xs text-slate-500">
              Configure dynamic service rates, per-camera installation fees, survey charges, and maintenance pricing models.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Type</span>
          </button>
        </div>

        {/* Service Types Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Service Name</th>
                  <th className="py-3.5 px-4">System Code</th>
                  <th className="py-3.5 px-4">Pricing Model</th>
                  <th className="py-3.5 px-4 text-right">Base Fee</th>
                  <th className="py-3.5 px-4 text-right">Unit Rate</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-slate-400">
                      No service types configured. Click 'Add Service Type' to create one.
                    </td>
                  </tr>
                ) : (
                  services.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{srv.name}</div>
                        <div className="text-[10px] text-slate-400">{srv.description}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-600 font-semibold">
                        {srv.code}
                      </td>
                      <td className="py-3.5 px-4 uppercase font-bold text-[10px] text-slate-600">
                        {srv.pricing_type?.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        ৳{Number(srv.base_rate).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        ৳{Number(srv.unit_rate).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          srv.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {srv.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              name: srv.name,
                              code: srv.code,
                              description: srv.description || '',
                              pricing_type: srv.pricing_type,
                              base_rate: srv.base_rate,
                              unit_rate: srv.unit_rate,
                              is_active: srv.is_active,
                            });
                            setShowModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Type Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Configure CCTV Service Type
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
                  <label className="block font-bold text-slate-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Standard Camera Installation & Alignment"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unique Code</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="e.g. installation_standard"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pricing Model</label>
                    <select
                      value={formData.pricing_type}
                      onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    >
                      <option value="fixed">Fixed Rate</option>
                      <option value="per_camera">Per Camera</option>
                      <option value="per_floor">Per Floor</option>
                      <option value="per_meter">Per Meter (Cabling)</option>
                      <option value="rule_based">Rule Based</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Base Rate (৳)</label>
                    <input
                      type="number"
                      required
                      value={formData.base_rate}
                      onChange={(e) => setFormData({ ...formData, base_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit Rate (৳)</label>
                    <input
                      type="number"
                      required
                      value={formData.unit_rate}
                      onChange={(e) => setFormData({ ...formData, unit_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Includes wall mounting, drill hole, RJ45 crimping, alignment, and testing."
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
                    Save Service Type
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
