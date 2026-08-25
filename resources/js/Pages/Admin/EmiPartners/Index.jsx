import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { Landmark, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';

export default function EmiPartnersIndex({ partners = [] }) {
  const [editingPartner, setEditingPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const partnerList = Array.isArray(partners) ? partners : [];

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

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/emi-partners/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
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

  const columns = [
    {
      header: 'Banking Partner',
      accessor: 'bank_name',
      sortable: true,
      render: (p) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-1 flex items-center justify-center shrink-0">
            {p.logo ? (
              <img src={p.logo} alt={p.bank_name} className="max-h-full max-w-full object-contain" />
            ) : (
              <Landmark className="w-5 h-5 text-indigo-500" />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
              {p.bank_name}
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono">
              Min. Order: ৳{Number(p.min_amount || 0).toLocaleString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Supported Tenures',
      accessor: 'available_tenures',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(p.available_tenures) && p.available_tenures.map(t => (
            <span key={t} className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
              {t} Months
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Financing Rate Terms',
      accessor: 'interest_rate_note',
      render: (p) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {p.interest_rate_note || '0% Interest EMI'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (p) => (
        <AdminStatusBadge
          status={p.is_active ? 'active' : 'draft'}
          label={p.is_active ? 'Active' : 'Disabled'}
          size="xs"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => openEditModal(p)}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
            title="Edit EMI Terms"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(p)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Bank"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="EMI Partners">
      <Head title="EMI Financing Partners - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Bank EMI Financing Partners"
          subtitle="Configure partner bank tenures (3, 6, 9, 12, 24, 36 months), minimum basket values, and 0% interest terms."
          badge={`${partnerList.length} Banks`}
          actions={
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Partner Bank</span>
            </button>
          }
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={partnerList}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No EMI bank partners configured"
          emptyDescription="Add financial institution partners to enable credit card installment checkout calculations."
          emptyAction={
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bank</span>
            </button>
          }
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AdminModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPartner ? 'Edit EMI Partner Bank' : 'Add EMI Partner Bank'}
          subtitle="Define financing tenures and interest rates"
          icon={Landmark}
          size="lg"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {processing ? 'Saving...' : editingPartner ? 'Update Partner' : 'Save Partner'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Bank Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. City Bank / BRAC Bank / Eastern Bank"
                value={data.bank_name}
                onChange={(e) => setData('bank_name', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Bank Logo URL</label>
                <input
                  type="text"
                  placeholder="https://.../bank-logo.png"
                  value={data.logo}
                  onChange={(e) => setData('logo', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Min Order Amount (BDT) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={data.min_amount}
                  onChange={(e) => setData('min_amount', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Supported Tenures (Months)</label>
              <div className="flex flex-wrap gap-2">
                {['3', '6', '9', '12', '18', '24', '36'].map((tenure) => {
                  const isSelected = data.available_tenures.includes(tenure);
                  return (
                    <button
                      key={tenure}
                      type="button"
                      onClick={() => toggleTenure(tenure)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tenure}M
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Interest Note / Promo Copy</label>
              <input
                type="text"
                placeholder="0% Interest for 3 to 12 months"
                value={data.interest_rate_note}
                onChange={(e) => setData('interest_rate_note', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
          </form>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Bank"
        message={`Are you sure you want to remove bank partner "${deleteTarget?.bank_name}"?`}
        confirmText="Remove Bank"
        isDestructive
      />
    </AdminShell>
  );
}
