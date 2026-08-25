import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import {
  Boxes, Warehouse, Plus, ArrowLeftRight, ClipboardCheck,
  TrendingUp, AlertTriangle, Package, History, CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function AdminInventoryIndex({
  products = { data: [] },
  warehouses = [],
  valuation = {},
  movements = [],
  filters = {}
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [density, setDensity] = useState('comfortable');

  const productList = Array.isArray(products?.data) ? products.data : [];

  const { data, setData, post, processing, reset, errors } = useForm({
    product_id: '',
    warehouse_id: warehouses[0]?.id || '',
    quantity: 1,
    type: 'adjustment',
    notes: '',
  });

  const openAdjustmentModal = (product) => {
    setSelectedProduct(product);
    setData({
      product_id: product.id,
      warehouse_id: warehouses[0]?.id || '',
      quantity: 1,
      type: 'adjustment',
      notes: `Manual stock adjustment for ${product.sku}`,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/inventory/adjust', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const tableColumns = [
    {
      header: 'Product Title & SKU',
      accessor: 'title',
      sortable: true,
      render: (p) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-slate-100 font-heading text-xs">
            {p.title}
          </div>
          <div className="text-[10.5px] font-mono text-slate-400">SKU: {p.sku}</div>
        </div>
      ),
    },
    {
      header: 'Category & Brand',
      accessor: 'category',
      render: (p) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">{p.category?.name || 'General'}</div>
          <div className="text-[10.5px] text-slate-400">{p.brand?.name || 'Unbranded'}</div>
        </div>
      ),
    },
    {
      header: 'Available Stock',
      accessor: 'stock',
      sortable: true,
      render: (p) => (
        <AdminStatusBadge
          status={p.stock <= 0 ? 'out_of_stock' : p.stock <= 5 ? 'low_stock' : 'in_stock'}
          label={`${p.stock} Units`}
          size="xs"
        />
      ),
    },
    {
      header: 'Retail Price (BDT)',
      accessor: 'price',
      align: 'right',
      render: (p) => (
        <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
          ৳ {Number(p.price || 0).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Total Value',
      accessor: 'total_value',
      align: 'right',
      render: (p) => (
        <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
          ৳ {(Number(p.price || 0) * (p.stock || 0)).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={() => openAdjustmentModal(p)}
          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg transition cursor-pointer flex items-center space-x-1 ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adjust Stock</span>
        </button>
      ),
    },
  ];

  return (
    <AdminShell title="Inventory & Stock Workspace">
      <Head title="Inventory Workspace - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Inventory Management"
          subtitle="Real-time multi-location inventory levels, valuation metrics, reason-based stock adjustments, and movements."
          badge={`${valuation.total_units || 0} Total Units`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/inventory/transfers"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transfers</span>
              </Link>
              <Link
                href="/admin/inventory/counts"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Stock Counts</span>
              </Link>
              <Link
                href="/admin/warehouses"
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition"
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>Warehouses</span>
              </Link>
            </div>
          }
        />

        {/* Valuation KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Total Stock Valuation (Cost)"
            value={`৳ ${(valuation.total_cost || 0).toLocaleString()}`}
            icon="Boxes"
            variant="indigo"
          />
          <AdminKpiCard
            title="Potential Retail Value"
            value={`৳ ${(valuation.potential_retail_value || 0).toLocaleString()}`}
            icon="DollarSign"
            variant="emerald"
          />
          <AdminKpiCard
            title="Estimated Gross Margin"
            value={`${valuation.estimated_gross_margin_percent || 0}%`}
            icon="TrendingUp"
            variant="sky"
          />
          <AdminKpiCard
            title="Low & Out of Stock"
            value={`${(valuation.low_stock_count || 0) + (valuation.out_of_stock_count || 0)} SKUs`}
            icon="AlertTriangle"
            variant="amber"
          />
        </div>

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            router.get('/admin/inventory', { search: val || undefined }, { preserveState: true, replace: true });
          }}
          searchPlaceholder="Search product name, SKU..."
          onRefresh={() => router.get('/admin/inventory')}
        />

        {/* Stock Table */}
        <AdminTable
          columns={tableColumns}
          data={productList}
          pagination={products}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Inventory Records"
          emptyDescription="Add products to your catalog to view stock levels."
        />

        {/* Recent Inventory Movements Audit Trail */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              Recent Inventory Ledger Movements
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {movements.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {m.product?.title}
                  </div>
                  <div className="text-[10.5px] text-slate-400 font-mono">
                    SKU: {m.product?.sku} • {m.warehouse?.name || 'Central WH'} • By: {m.user?.name || 'System'}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-bold ${
                    m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity} Units
                  </span>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {m.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* REASON ADJUSTMENT MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.title}`}
        subtitle="Atomic warehouse inventory correction & audit ledger"
        icon={Package}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="text-slate-500 font-medium">SKU: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedProduct?.sku}</span></div>
            <div className="text-slate-500 font-medium">Current Stock: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedProduct?.stock} Units</span></div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Adjustment Type / Reason *</label>
            <select
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden cursor-pointer"
            >
              <option value="purchase">Stock Addition (Purchase / Inbound)</option>
              <option value="adjustment">Manual Correction</option>
              <option value="damaged">Damaged / Defective (-)</option>
              <option value="lost">Lost / Misplaced (-)</option>
              <option value="found">Found / Audit Correction (+)</option>
              <option value="expired">Expired / Scrapped (-)</option>
              <option value="return">Customer Return (+)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Warehouse Location</label>
              <select
                value={data.warehouse_id}
                onChange={(e) => setData('warehouse_id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden cursor-pointer"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Quantity (+ or -) *</label>
              <input
                type="number"
                value={data.quantity}
                onChange={(e) => setData('quantity', e.target.value)}
                placeholder="e.g. 5 or -2"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Reason / Reference Notes</label>
            <textarea
              rows="2"
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              placeholder="e.g. Physical inventory count correction #901"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
            />
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
              {processing ? 'Adjusting...' : 'Save Stock Adjustment'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminShell>
  );
}
