import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Landmark, Plus, Edit, Trash2, Save, CheckCircle2 } from 'lucide-react';

export default function EmiPartnersIndex({ partners = [] }) {
  const [editingPartner, setEditingPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, put, reset, errors, processing } = useForm({
    bank_name: '',
    logo: '',
    min_amount: 5000,
    available_tenures: ['3', '6', '9', '12'],
    interest_rate_note: '0% Interest on selected credit cards',
    terms: '',
    sort_order: 0,
    is_active: true,
  });

  const openCreateModal = () => {
    setEditingPartner(null);
    reset({
      bank_name: '',
      logo: '',
      min_amount: 5000,
      available_tenures: ['3', '6', '9', '12'],
      interest_rate_note: '0% Interest on selected credit cards',
      terms: '',
      sort_order: 0,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setData({
      bank_name: partner.bank_name,
      logo: partner.logo || '',
      min_amount: partner.min_amount,
      available_tenures: Array.isArray(partner.available_tenures) ? partner.available_tenures : ['3', '6', '9', '12'],
      interest_rate_note: partner.interest_rate_note || '',
      terms: partner.terms || '',
      sort_order: partner.sort_order || 0,
      is_active: Boolean(partner.is_active),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPartner) {
      put(`/admin/emi-partners/${editingPartner.id}`, {
        onSuccess: () => setIsModalOpen(false),
      });
    } else {
      post('/admin/emi-partners', {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleDelete = (id, name) => {
    if (confirm(`Remove EMI partner bank: "${name}"?`)) {
      router.delete(`/admin/emi-partners/${id}`);
    }
  };

  const toggleTenure = (tenure) => {
    const current = [...data.available_tenures];
    const index = current.indexOf(tenure);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(tenure);
    }
    setData('available_tenures', current);
  };

  return (
    <AdminLayout>
      <Head title="EMI Partner Banks - TechMarket BD Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center space-x-2">
              <Landmark className="w-5 h-5 text-blue-500" />
              <span>EMI Bank Partners & Tenures</span>
            </h1>
            <p className="text-xs text-slate-400">Configure bank financing terms, tenures, and zero-cost 0% EMI options.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Partner</span>
          </button>
        </div>

        {/* Partners Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="p-4">Bank Partner</th>
                <th className="p-4">Min. Amount</th>
                <th className="p-4">Available Tenures</th>
                <th className="p-4">Interest Terms</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No EMI partner banks configured. Click "Add Bank Partner" to create one.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-white text-xs">{partner.bank_name}</div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      ৳{Number(partner.min_amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(partner.available_tenures) ? (
                          partner.available_tenures.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[10px]">
                              {t}M
                            </span>
                          ))
                        ) : (
                          <span>{partner.available_tenures}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 text-xs">
                      {partner.interest_rate_note}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        partner.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {partner.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(partner)}
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded inline-block transition-colors"
                        title="Edit Bank"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id, partner.bank_name)}
                        className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded inline-block transition-colors"
                        title="Delete Bank"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-sm text-white">
                  {editingPartner ? 'Edit EMI Partner Bank' : 'Add New EMI Partner Bank'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={data.bank_name}
                    onChange={(e) => setData('bank_name', e.target.value)}
                    placeholder="e.g. City Bank (Amex)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  {errors.bank_name && <div className="text-[10px] text-red-500">{errors.bank_name}</div>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">Min. Order (BDT) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={data.min_amount}
                      onChange={(e) => setData('min_amount', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">Sort Order</label>
                    <input
                      type="number"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Interest Note / Promotion *</label>
                  <input
                    type="text"
                    required
                    value={data.interest_rate_note}
                    onChange={(e) => setData('interest_rate_note', e.target.value)}
                    placeholder="e.g. 0% Interest up to 12 months"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Available Tenures Selector */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Available Tenures</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['3', '6', '9', '12', '18', '24', '36'].map((t) => {
                      const isSelected = data.available_tenures.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTenure(t)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white font-black'
                              : 'bg-slate-950 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {t} Months
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <label className="flex items-center space-x-2 font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span>Active Bank Partner</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md disabled:opacity-50"
                  >
                    {editingPartner ? 'Update Partner' : 'Create Partner'}
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
