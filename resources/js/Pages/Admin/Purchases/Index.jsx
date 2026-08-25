import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminModal from '../../../Components/Admin/AdminModal';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import CreatePurchaseModal from './Components/CreatePurchaseModal';
import {
  PackagePlus, Plus, Eye, Truck, CreditCard, CheckCircle2,
  AlertCircle, Calendar, Clock, DollarSign, RefreshCw, Trash2
} from 'lucide-react';

export default function AdminPurchasesIndex({
  purchases = { data: [] },
  suppliers = [],
  warehouses = [],
  products = [],
  financialAccounts = [],
  metrics = {},
  filters = {}
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [density, setDensity] = useState('comfortable');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);

  const purchaseList = Array.isArray(purchases?.data) ? purchases.data : [];

  // Receive Items Form
  const { data: receiveData, setData: setReceiveData, post: postReceive, processing: receiveProcessing } = useForm({
    received: {}, // [item_id: qty]
  });

  // Payment Form
  const { data: payData, setData: setPayData, post: postPay, processing: payProcessing } = useForm({
    amount: 0,
    payment_method: 'cash',
    financial_account_id: financialAccounts[0]?.id || '',
    notes: '',
  });

  const handleCreatePurchaseSubmit = (purchasePayload) => {
    setIsCreatingPurchase(true);
    router.post('/admin/purchases', purchasePayload, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
      onFinish: () => {
        setIsCreatingPurchase(false);
      }
    });
  };

  const openReceiveModal = (purchase) => {
    setSelectedPurchase(purchase);
    const initialReceived = {};
    (purchase.items || []).forEach(item => {
      const remaining = Math.max(0, item.quantity_ordered - item.quantity_received);
      initialReceived[item.id] = remaining;
    });
    setReceiveData('received', initialReceived);
    setIsReceiveModalOpen(true);
  };

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    postReceive(`/admin/purchases/${selectedPurchase.id}/receive`, {
      onSuccess: () => {
        setIsReceiveModalOpen(false);
      }
    });
  };

  const openPaymentModal = (purchase) => {
    setSelectedPurchase(purchase);
    setPayData({
      amount: purchase.due_amount,
      payment_method: 'cash',
      financial_account_id: financialAccounts[0]?.id || '',
      notes: `Supplier bill payment for PO #${purchase.purchase_number}`,
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    postPay(`/admin/purchases/${selectedPurchase.id}/payment`, {
      onSuccess: () => {
        setIsPaymentModalOpen(false);
      }
    });
  };

  const tableColumns = [
    {
      header: 'Purchase # & Date',
      accessor: 'purchase_number',
      sortable: true,
      render: (p) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
            {p.purchase_number}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {new Date(p.purchase_date).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {p.supplier?.company_name || 'Vendor'}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {p.supplier?.phone || ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      accessor: 'warehouse',
      render: (p) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {p.warehouse?.name || 'Central WH'}
        </span>
      ),
    },
    {
      header: 'Receiving Status',
      accessor: 'status',
      render: (p) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          p.status === 'received'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200'
            : p.status === 'partially_received'
              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 border border-sky-200'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200'
        }`}>
          {p.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Bill Status',
      accessor: 'payment_status',
      render: (p) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          p.payment_status === 'paid'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
            : p.payment_status === 'partially_paid'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
        }`}>
          {p.payment_status.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Total Bill (BDT)',
      accessor: 'total',
      align: 'right',
      sortable: true,
      render: (p) => (
        <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
          ৳ {Number(p.total).toLocaleString()}
          {Number(p.due_amount) > 0 && (
            <div className="text-[10px] text-rose-500 font-normal">
              Due: ৳{Number(p.due_amount).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          {p.status !== 'received' && (
            <button
              type="button"
              onClick={() => openReceiveModal(p)}
              className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Receive</span>
            </button>
          )}

          {Number(p.due_amount) > 0 && (
            <button
              type="button"
              onClick={() => openPaymentModal(p)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Purchases & Vendor Orders">
      <Head title="Purchases - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Purchases & Inbound Logistics"
          subtitle="Issue purchase orders, track partial goods receipts, restock warehouses, and manage supplier debts."
          badge={`${metrics.total_orders || 0} Purchase Orders`}
          actions={
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          }
        />

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminKpiCard
            title="Total Purchases Value"
            value={`৳ ${(metrics.total_purchases || 0).toLocaleString()}`}
            icon="DollarSign"
            variant="indigo"
          />
          <AdminKpiCard
            title="Paid to Suppliers"
            value={`৳ ${(metrics.total_paid || 0).toLocaleString()}`}
            icon="CheckCircle2"
            variant="emerald"
          />
          <AdminKpiCard
            title="Outstanding Dues"
            value={`৳ ${(metrics.total_due || 0).toLocaleString()}`}
            icon="AlertCircle"
            variant="amber"
          />
        </div>

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            router.get('/admin/purchases', { search: val || undefined }, { preserveState: true, replace: true });
          }}
          searchPlaceholder="Search PO #, supplier name..."
          onRefresh={() => router.get('/admin/purchases')}
        />

        {/* Table */}
        <AdminTable
          columns={tableColumns}
          data={purchaseList}
          pagination={purchases}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Purchase Orders"
          emptyDescription="Issue a purchase order to suppliers to restock warehouse inventory."
        />
      </div>

      {/* COMPACT ENTERPRISE CREATE PURCHASE ORDER MODAL */}
      <CreatePurchaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        suppliers={suppliers}
        warehouses={warehouses}
        products={products}
        onSubmitPurchase={handleCreatePurchaseSubmit}
        processing={isCreatingPurchase}
      />

      {/* RECEIVE GOODS MODAL */}
      <AdminModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        title={`Receive Goods: PO #${selectedPurchase?.purchase_number}`}
        subtitle={`Warehouse destination: ${selectedPurchase?.warehouse?.name || 'Central WH'}`}
        icon={Truck}
        size="lg"
      >
        {selectedPurchase && (
          <form onSubmit={handleReceiveSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 font-medium">
              Enter incoming quantities to receive into <strong>{selectedPurchase.warehouse?.name}</strong>. Stock will be atomically increased.
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              {(selectedPurchase.items || []).map(item => {
                const remaining = Math.max(0, item.quantity_ordered - item.quantity_received);
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.product?.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ordered: {item.quantity_ordered} • Received: {item.quantity_received} • Remaining: {remaining}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-500">Incoming:</label>
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={receiveData.received[item.id] ?? 0}
                        onChange={(e) => {
                          const val = Math.min(remaining, Math.max(0, Number(e.target.value)));
                          setReceiveData('received', {
                            ...receiveData.received,
                            [item.id]: val
                          });
                        }}
                        className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={receiveProcessing}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Confirm Goods Inbound</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* RECORD PAYMENT MODAL */}
      <AdminModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Supplier Payment: PO #${selectedPurchase?.purchase_number}`}
        subtitle={`Supplier: ${selectedPurchase?.supplier?.company_name || 'Vendor'}`}
        icon={CreditCard}
        size="md"
      >
        {selectedPurchase && (
          <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-slate-500 font-medium">Supplier: {selectedPurchase.supplier?.company_name}</div>
              <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                Outstanding Due: ৳{Number(selectedPurchase.due_amount).toLocaleString()}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Payment Amount (BDT) *</label>
              <input
                type="number"
                min="1"
                max={selectedPurchase.due_amount}
                value={payData.amount}
                onChange={(e) => setPayData('amount', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Payment Method</label>
              <select
                value={payData.payment_method}
                onChange={(e) => setPayData('payment_method', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden cursor-pointer"
              >
                <option value="cash">Cash Register</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="bkash">bKash Merchant</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payProcessing}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Submit Supplier Payment</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </AdminShell>
  );
}
