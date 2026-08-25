import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminModal from '../../../Components/Admin/AdminModal';
import {
  ArrowLeftRight, Plus, ArrowLeft, Warehouse, CheckCircle2,
  Clock, Trash2, Package
} from 'lucide-react';

export default function AdminInventoryTransfers({
  transfers = { data: [] },
  warehouses = [],
  products = []
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [density, setDensity] = useState('comfortable');

  const transferList = Array.isArray(transfers?.data) ? transfers.data : [];

  const { data, setData, post, processing, reset, errors } = useForm({
    from_warehouse_id: warehouses[0]?.id || '',
    to_warehouse_id: warehouses[1]?.id || '',
    notes: '',
    items: [
      { product_id: products[0]?.id || '', quantity: 1 }
    ],
  });

  const handleAddItemRow = () => {
    setData('items', [
      ...data.items,
      { product_id: products[0]?.id || '', quantity: 1 }
    ]);
  };

  const handleRemoveItemRow = (idx) => {
    setData('items', data.items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, val) => {
    const updated = [...data.items];
    updated[idx][field] = val;
    setData('items', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/inventory/transfers', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const tableColumns = [
    {
      header: 'Transfer # & Date',
      accessor: 'transfer_number',
      sortable: true,
      render: (t) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
            {t.transfer_number}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      header: 'Source & Destination Hubs',
      accessor: 'route',
      render: (t) => (
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-800 dark:text-slate-200">{t.from_warehouse?.name || 'WH A'}</span>
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="text-indigo-600 dark:text-indigo-400">{t.to_warehouse?.name || 'WH B'}</span>
        </div>
      ),
    },
    {
      header: 'Items Transferred',
      accessor: 'items_count',
      render: (t) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
            {t.items?.length || 0} Products
          </span>
          <div className="text-[10.5px] text-slate-400">
            Total Qty: {t.items?.reduce((a, c) => a + c.quantity_transferred, 0) || 0} Units
          </div>
        </div>
      ),
    },
    {
      header: 'Initiated By',
      accessor: 'initiator',
      render: (t) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {t.initiator?.name || 'Inventory Officer'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (t) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200">
          {t.status}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Stock Transfers">
      <Head title="Stock Transfers - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="Inter-Warehouse Transfers"
          subtitle="Dispatch and track stock shipments between central distribution hubs and local branch warehouses."
          badge={`${transferList.length} Transfers`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/inventory"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Stock</span>
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Stock Transfer</span>
              </button>
            </div>
          }
        />

        <AdminTable
          columns={tableColumns}
          data={transferList}
          pagination={transfers}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Stock Transfers Recorded"
          emptyDescription="Initiate an inter-warehouse transfer to balance inventory across locations."
        />
      </div>

      {/* NEW TRANSFER MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Dispatch Inter-Warehouse Stock Transfer"
        subtitle="Transfer hardware inventory between distribution centers"
        icon={ArrowLeftRight}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">From Warehouse (Source) *</label>
              <select
                value={data.from_warehouse_id}
                onChange={(e) => setData('from_warehouse_id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                required
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">To Warehouse (Destination) *</label>
              <select
                value={data.to_warehouse_id}
                onChange={(e) => setData('to_warehouse_id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                required
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
              <span>Transfer Hardware Items</span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {data.items.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-8">
                    <select
                      value={row.product_id}
                      onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (Stock: {p.stock})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-center text-xs"
                      required
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    {data.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Transfer Notes / Waybill #</label>
            <textarea
              rows="2"
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              placeholder="e.g. Courier dispatch via internal transport vehicle"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {processing ? 'Dispatching...' : 'Dispatch Transfer'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
