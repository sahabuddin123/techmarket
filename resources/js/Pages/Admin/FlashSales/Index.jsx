import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { Flame, Plus, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminFlashSales({ flashSales = [], products = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState('comfortable');

  const flashSaleList = Array.isArray(flashSales) ? flashSales : [];
  const productList = Array.isArray(products) ? products : [];

  const { data, setData, post, processing, reset } = useForm({
    title: '',
    start_time: '',
    end_time: '',
    is_active: true,
    items: [{ product_id: '', flash_price: '' }],
  });

  const addItemRow = () => {
    setData('items', [...data.items, { product_id: '', flash_price: '' }]);
  };

  const removeItemRow = (idx) => {
    const next = [...data.items];
    next.splice(idx, 1);
    setData('items', next);
  };

  const handleToggle = (id) => {
    router.post(`/admin/flash-sales/${id}/toggle`, {}, { preserveScroll: true });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/flash-sales/${deleteTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteTarget(null),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/flash-sales', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const filteredSales = flashSaleList.filter(fs =>
    !search || fs.title?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Campaign Title',
      accessor: 'title',
      sortable: true,
      render: (fs) => (
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {fs.title}
          </span>
        </div>
      ),
    },
    {
      header: 'Schedule Timeline',
      accessor: 'start_time',
      render: (fs) => (
        <div className="text-[11px] font-mono text-slate-500">
          <div>Start: {fs.start_time ? new Date(fs.start_time).toLocaleString() : 'N/A'}</div>
          <div>End: {fs.end_time ? new Date(fs.end_time).toLocaleString() : 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Products Enrolled',
      accessor: 'items',
      render: (fs) => (
        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-xs">
          {fs.items ? fs.items.length : 0} Products
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (fs) => (
        <AdminStatusBadge
          status={fs.is_active ? 'active' : 'draft'}
          label={fs.is_active ? 'Active' : 'Disabled'}
          size="xs"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (fs) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => handleToggle(fs.id)}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              fs.is_active
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
            title={fs.is_active ? 'Disable Flash Sale' : 'Activate Flash Sale'}
          >
            {fs.is_active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(fs)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Flash Sale"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Flash Sales">
      <Head title="Flash Sales & Lightning Deals - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Flash Sales & Lightning Deals"
          subtitle="Manage time-delimited flash sale countdown banners, special hardware pricing, and stock quotas."
          badge={`${flashSaleList.length} Campaigns`}
          actions={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Flash Sale</span>
            </button>
          }
        />

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search flash sales by campaign title..."
          onRefresh={() => router.get('/admin/flash-sales')}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredSales}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No flash sales scheduled"
          emptyDescription="Launch flash deals with countdown timers to create purchase urgency on the storefront."
          emptyAction={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flash Sale</span>
            </button>
          }
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <AdminModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Schedule New Flash Sale"
          subtitle="Configure campaign duration and discounted hardware products"
          icon={Flame}
          size="lg"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                {processing ? 'Publishing...' : 'Publish Flash Sale'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Campaign Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Midnight GPU Flash Rush"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={data.start_time}
                  onChange={(e) => setData('start_time', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={data.end_time}
                  onChange={(e) => setData('end_time', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 dark:border-slate-700/80 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Enrolled Products</span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold cursor-pointer"
                >
                  + Add Product
                </button>
              </div>

              {data.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    required
                    value={item.product_id}
                    onChange={(e) => {
                      const next = [...data.items];
                      next[idx].product_id = e.target.value;
                      setData('items', next);
                    }}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="">Select Hardware Product...</option>
                    {productList.map(p => (
                      <option key={p.id} value={p.id}>{p.title} (৳{Number(p.price).toLocaleString()})</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    required
                    placeholder="Flash Price ৳"
                    value={item.flash_price}
                    onChange={(e) => {
                      const next = [...data.items];
                      next[idx].flash_price = e.target.value;
                      setData('items', next);
                    }}
                    className="w-32 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                  />

                  {data.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </form>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Flash Sale"
        message={`Are you sure you want to delete flash sale campaign "${deleteTarget?.title}"?`}
        confirmText="Delete Flash Sale"
        isDestructive
      />
    </AdminShell>
  );
}
