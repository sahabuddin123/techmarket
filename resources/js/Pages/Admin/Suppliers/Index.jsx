import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminModal from '../../../Components/Admin/AdminModal';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import {
  Building2, Plus, Edit2, Trash2, Phone, Mail, MapPin,
  CreditCard, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function AdminSuppliersIndex({
  suppliers = { data: [] },
  metrics = {},
  filters = {}
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const supplierList = Array.isArray(suppliers?.data) ? suppliers.data : [];

  const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    tax_number: '',
    opening_balance: 0,
    status: 'active',
    notes: '',
  });

  const openCreateModal = () => {
    setEditingSupplier(null);
    reset();
    setModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setData({
      company_name: supplier.company_name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      tax_number: supplier.tax_number || '',
      opening_balance: Number(supplier.opening_balance || 0),
      status: supplier.status || 'active',
      notes: supplier.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSupplier) {
      put(`/admin/suppliers/${editingSupplier.id}`, {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        }
      });
    } else {
      post('/admin/suppliers', {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        }
      });
    }
  };

  const handleDelete = (supplier) => {
    if (confirm(`Delete supplier "${supplier.company_name}"?`)) {
      destroy(`/admin/suppliers/${supplier.id}`);
    }
  };

  const tableColumns = [
    {
      header: 'Supplier & Company',
      accessor: 'company_name',
      sortable: true,
      render: (sup) => (
        <div className="space-y-0.5">
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 font-heading">
            {sup.company_name}
          </div>
          <div className="text-[10.5px] text-slate-400">
            Contact: {sup.contact_person || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: 'phone',
      render: (sup) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-mono text-slate-700 dark:text-slate-300">{sup.phone || 'N/A'}</div>
          <div className="text-[10.5px] text-slate-400">{sup.email || ''}</div>
        </div>
      ),
    },
    {
      header: 'Purchases',
      accessor: 'purchases_count',
      render: (sup) => (
        <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
          {sup.purchases_count || 0} Orders
        </span>
      ),
    },
    {
      header: 'Payable Due (BDT)',
      accessor: 'current_balance',
      align: 'right',
      render: (sup) => (
        <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
          ৳ {Number(sup.current_balance || 0).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (sup) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          sup.status === 'active'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
        }`}>
          {sup.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (sup) => (
        <div className="flex items-center justify-end space-x-1.5">
          <button
            type="button"
            onClick={() => openEditModal(sup)}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition"
            title="Edit Supplier"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(sup)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition"
            title="Delete Supplier"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Suppliers Directory">
      <Head title="Suppliers Directory - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Suppliers & Vendors"
          subtitle="Manage hardware manufacturers, distributors, payable obligations, and purchase contacts."
          badge={`${metrics.total_suppliers || 0} Vendors`}
          actions={
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Supplier</span>
            </button>
          }
        />

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminKpiCard
            title="Total Registered Vendors"
            value={metrics.total_suppliers || 0}
            icon="Building2"
            variant="indigo"
          />
          <AdminKpiCard
            title="Active Suppliers"
            value={metrics.active_suppliers || 0}
            icon="CheckCircle2"
            variant="emerald"
          />
          <AdminKpiCard
            title="Total Outstanding Payables"
            value={`৳ ${(metrics.total_payable || 0).toLocaleString()}`}
            icon="CreditCard"
            variant="amber"
          />
        </div>

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            router.get('/admin/suppliers', { search: val || undefined }, { preserveState: true, replace: true });
          }}
          searchPlaceholder="Search vendor company name, contact, phone..."
          onRefresh={() => router.get('/admin/suppliers')}
        />

        {/* Table */}
        <AdminTable
          columns={tableColumns}
          data={supplierList}
          pagination={suppliers}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Suppliers Registered"
          emptyDescription="Add authorized distributors to begin issuing purchase orders."
        />
      </div>

      {/* ADD / EDIT SUPPLIER MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.company_name}` : 'Register New Supplier'}
        subtitle={editingSupplier ? 'Update vendor details, contact info and tax profile' : 'Create an authorized vendor profile for procurement'}
        icon={Building2}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Company / Vendor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.company_name}
                onChange={(e) => setData('company_name', e.target.value)}
                placeholder="e.g. ASUS Bangladesh Distribution Ltd"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100 font-medium text-xs"
                required
              />
              {errors.company_name && <div className="text-[10.5px] text-rose-500 font-medium">{errors.company_name}</div>}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Contact Person</label>
              <input
                type="text"
                value={data.contact_person}
                onChange={(e) => setData('contact_person', e.target.value)}
                placeholder="Account Manager"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                placeholder="+88017..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="vendor@domain.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Tax / BIN Number</label>
              <input
                type="text"
                value={data.tax_number}
                onChange={(e) => setData('tax_number', e.target.value)}
                placeholder="BIN-992019"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Office / Warehouse Address</label>
              <textarea
                rows="2"
                value={data.address}
                onChange={(e) => setData('address', e.target.value)}
                placeholder="Full street address and city..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-[var(--admin-primary,#4f46e5)] hover:bg-[var(--admin-primary-hover,#4338ca)] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {processing ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Register Supplier'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
