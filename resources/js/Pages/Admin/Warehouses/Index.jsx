import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminModal from '../../../Components/Admin/AdminModal';
import {
  Warehouse, Plus, Edit2, MapPin, Phone, Mail, User, CheckCircle2
} from 'lucide-react';

export default function AdminWarehousesIndex({
  warehouses = { data: [] }
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const warehouseList = Array.isArray(warehouses?.data) ? warehouses.data : [];

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: '',
    code: '',
    address: '',
    manager_name: '',
    phone: '',
    email: '',
    is_default: false,
    is_active: true,
  });

  const openCreateModal = () => {
    setEditingWarehouse(null);
    reset();
    setModalOpen(true);
  };

  const openEditModal = (wh) => {
    setEditingWarehouse(wh);
    setData({
      name: wh.name,
      code: wh.code,
      address: wh.address || '',
      manager_name: wh.manager_name || '',
      phone: wh.phone || '',
      email: wh.email || '',
      is_default: wh.is_default || false,
      is_active: wh.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingWarehouse) {
      put(`/admin/warehouses/${editingWarehouse.id}`, {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        }
      });
    } else {
      post('/admin/warehouses', {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        }
      });
    }
  };

  const tableColumns = [
    {
      header: 'Warehouse Name & Code',
      accessor: 'name',
      sortable: true,
      render: (wh) => (
        <div className="space-y-0.5">
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>{wh.name}</span>
            {wh.is_default && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-800">
                Primary Hub
              </span>
            )}
          </div>
          <div className="text-[10.5px] font-mono text-slate-400">Code: {wh.code}</div>
        </div>
      ),
    },
    {
      header: 'Manager & Contact',
      accessor: 'manager_name',
      render: (wh) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200">{wh.manager_name || 'Unassigned'}</div>
          <div className="text-[10.5px] text-slate-400 font-mono">{wh.phone || ''}</div>
        </div>
      ),
    },
    {
      header: 'Address / Location',
      accessor: 'address',
      render: (wh) => (
        <div className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
          {wh.address || 'Dhaka, Bangladesh'}
        </div>
      ),
    },
    {
      header: 'Stock Rows',
      accessor: 'stocks_count',
      render: (wh) => (
        <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
          {wh.stocks_count || 0} SKUs
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (wh) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          wh.is_active
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
        }`}>
          {wh.is_active ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (wh) => (
        <button
          type="button"
          onClick={() => openEditModal(wh)}
          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <AdminShell title="Warehouses & Hubs">
      <Head title="Warehouses - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="Warehouse Facilities"
          subtitle="Manage multi-location inventory centers, distribution hubs, managers, and rack zones."
          badge={`${warehouseList.length} Hubs`}
          actions={
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Warehouse</span>
            </button>
          }
        />

        <AdminTable
          columns={tableColumns}
          data={warehouseList}
          pagination={warehouses}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Warehouses Found"
          emptyDescription="Create your first distribution center to manage multi-location stocks."
        />
      </div>

      {/* CREATE / EDIT MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWarehouse ? `Edit Warehouse: ${editingWarehouse.name}` : 'Create Warehouse Location'}
        subtitle="Manage storage hubs, retail stores, and fulfillment centers"
        icon={Warehouse}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Warehouse Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Uttara Distribution Center"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs"
                required
              />
              {errors.name && <div className="text-[10.5px] text-rose-500">{errors.name}</div>}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Location Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.code}
                onChange={(e) => setData('code', e.target.value)}
                placeholder="WH-DHK-02"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Hub Manager</label>
              <input
                type="text"
                value={data.manager_name}
                onChange={(e) => setData('manager_name', e.target.value)}
                placeholder="Manager Name"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Phone</label>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                placeholder="+88017..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="hub@domain.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Address / Location</label>
              <textarea
                rows="2"
                value={data.address}
                onChange={(e) => setData('address', e.target.value)}
                placeholder="Full address of the facility..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_default"
              checked={data.is_default}
              onChange={(e) => setData('is_default', e.target.checked)}
              className="rounded-sm border-slate-300 text-[var(--admin-primary,#4f46e5)] focus:ring-indigo-500"
            />
            <label htmlFor="is_default" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Set as Default Primary Warehouse
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-[var(--admin-primary,#4f46e5)] hover:bg-[var(--admin-primary-hover,#4338ca)] text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {processing ? 'Saving...' : editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
