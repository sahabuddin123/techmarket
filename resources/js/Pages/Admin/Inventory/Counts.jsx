import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminModal from '../../../Components/Admin/AdminModal';
import {
  ClipboardCheck, Plus, ArrowLeft, CheckCircle2, AlertTriangle,
  Clock, Trash2, ShieldCheck
} from 'lucide-react';

export default function AdminInventoryCounts({
  counts = { data: [] },
  warehouses = [],
  products = []
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [density, setDensity] = useState('comfortable');

  const countList = Array.isArray(counts?.data) ? counts.data : [];

  const { data, setData, post, processing, reset } = useForm({
    warehouse_id: warehouses[0]?.id || '',
    notes: '',
    items: [
      { product_id: products[0]?.id || '', physical_quantity: 0 }
    ],
  });

  const handleAddItemRow = () => {
    setData('items', [
      ...data.items,
      { product_id: products[0]?.id || '', physical_quantity: 0 }
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
    post('/admin/inventory/counts', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const handleApprove = (count) => {
    if (confirm(`Approve count #${count.count_number} and reconcile all system inventory variances?`)) {
      post(`/admin/inventory/counts/${count.id}/approve`);
    }
  };

  const tableColumns = [
    {
      header: 'Count # & Date',
      accessor: 'count_number',
      sortable: true,
      render: (c) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
            {c.count_number}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {new Date(c.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      accessor: 'warehouse',
      render: (c) => (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {c.warehouse?.name || 'Warehouse'}
        </span>
      ),
    },
    {
      header: 'Items Counted',
      accessor: 'items_count',
      render: (c) => (
        <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
          {c.items?.length || 0} SKUs
        </span>
      ),
    },
    {
      header: 'Variance Summary',
      accessor: 'variance',
      render: (c) => {
        const netVariance = (c.items || []).reduce((acc, item) => acc + item.variance_quantity, 0);
        return (
          <span className={`font-mono font-bold text-xs ${
            netVariance === 0 ? 'text-emerald-600' : netVariance > 0 ? 'text-sky-600' : 'text-rose-600'
          }`}>
            {netVariance > 0 ? `+${netVariance}` : netVariance} Net Variance
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (c) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          c.status === 'approved'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200'
        }`}>
          {c.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          {c.status !== 'approved' && (
            <button
              type="button"
              onClick={() => handleApprove(c)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approve Reconciliation</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Stock Cycle Counts">
      <Head title="Stock Counts - TechMarket Admin" />

      <div className="space-y-5">
        <AdminPageHeader
          title="Physical Stock Counts & Cycle Audits"
          subtitle="Audit warehouse shelves, compare physical counts against system records, and approve variance adjustments."
          badge={`${countList.length} Audit Sheets`}
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
                <span>Start Stock Count</span>
              </button>
            </div>
          }
        />

        <AdminTable
          columns={tableColumns}
          data={countList}
          pagination={counts}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Physical Counts"
          emptyDescription="Start a cycle count sheet to verify physical shelf inventory."
        />
      </div>

      {/* START COUNT MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Physical Inventory Count Audit Sheet"
        subtitle="Perform shelf verification and stock variance reconciliation"
        icon={ClipboardCheck}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Audited Warehouse *</label>
            <select
              value={data.warehouse_id}
              onChange={(e) => setData('warehouse_id', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
              required
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
              <span>Counted Hardware Items</span>
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
                        <option key={p.id} value={p.id}>{p.title} (System: {p.stock})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Physical Qty"
                      value={row.physical_quantity}
                      onChange={(e) => handleItemChange(idx, 'physical_quantity', e.target.value)}
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
            <label className="font-bold text-slate-700 dark:text-slate-300">Auditor Notes</label>
            <textarea
              rows="2"
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              placeholder="e.g. End of month physical verification audit"
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
              {processing ? 'Submitting...' : 'Submit Physical Audit'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
