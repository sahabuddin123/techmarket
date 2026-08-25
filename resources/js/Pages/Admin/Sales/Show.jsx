import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminModal from '../../../Components/Admin/AdminModal';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import InvoicePrintTemplate from '../../../Components/Admin/InvoicePrintTemplate';
import {
  ArrowLeft, Printer, RotateCcw, User, Building,
  CreditCard, Calendar, CheckCircle2, AlertTriangle, Package,
  DollarSign, FileText, Clock
} from 'lucide-react';

export default function AdminSaleShow({ sale = {} }) {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    items: (sale.items || []).map(item => ({
      product_id: item.product_id,
      product_title: item.product_title,
      quantity_returned: 1,
      max_qty: item.quantity,
      unit_price: item.unit_price,
    })),
    refund_amount: sale.grand_total,
    payment_method: 'cash',
    reason: 'Customer return / warranty',
  });

  const handleRefundSubmit = (e) => {
    e.preventDefault();
    post(`/admin/sales/${sale.id}/refund`, {
      onSuccess: () => {
        setIsRefundModalOpen(false);
        reset();
      }
    });
  };

  return (
    <AdminShell title={`Sale #${sale.sale_number}`}>
      <Head title={`Sale #${sale.sale_number} - TechMarket Admin`} />

      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Page Header */}
        <AdminPageHeader
          title={`Sale #${sale.sale_number}`}
          subtitle={`Channel: ${sale.sales_channel?.toUpperCase()} • Created on ${new Date(sale.created_at).toLocaleString()}`}
          badge={sale.status?.toUpperCase()}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/sales"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sales</span>
              </Link>

              {sale.status !== 'refunded' && (
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Process Refund</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          }
        />

        {/* Invoice Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Customer Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Customer Information
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {sale.customer_name}
            </div>
            <div className="text-slate-500 font-mono">
              Phone: {sale.customer_phone || 'N/A'}
            </div>
            {sale.customer_email && (
              <div className="text-slate-500">
                Email: {sale.customer_email}
              </div>
            )}
          </div>

          {/* Warehouse & Salesperson */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              Fulfillment Location
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {sale.warehouse?.name || 'Central Distribution Warehouse'}
            </div>
            <div className="text-slate-500">
              Salesperson: <span className="font-semibold text-slate-700 dark:text-slate-300">{sale.salesperson?.name || 'Cashier Desk'}</span>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              Payment Status
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                sale.payment_status === 'paid'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200'
              }`}>
                {sale.payment_status}
              </span>
            </div>
            <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
              Paid: ৳{Number(sale.paid_amount || 0).toLocaleString()} / ৳{Number(sale.grand_total || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Items List Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-500">
            Order Items ({sale.items?.length || 0})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Product Title & SKU</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Unit Price</th>
                  <th className="p-3.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(sale.items || []).map((item) => (
                  <tr key={item.id}>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.product_title}</div>
                      <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku || 'N/A'}</div>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="p-3.5 text-right font-mono">৳{Number(item.unit_price).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono font-bold">৳{Number(item.line_total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Section */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">৳{Number(sale.subtotal).toLocaleString()}</span>
              </div>
              {Number(sale.discount_amount) > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Discount:</span>
                  <span className="font-mono">-৳{Number(sale.discount_amount).toLocaleString()}</span>
                </div>
              )}
              {Number(sale.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span>Tax / VAT:</span>
                  <span className="font-mono">৳{Number(sale.tax_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">৳{Number(sale.grand_total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Payment Records
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {(sale.payments || []).map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {pay.payment_method}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Ref: {pay.reference_number || 'Cash Register'} • {new Date(pay.paid_at).toLocaleString()}
                  </div>
                </div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ৳{Number(pay.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REFUND MODAL */}
      <AdminModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Process Sale Refund & Return"
        subtitle={`Transaction #${sale.sale_number} • Max refundable: ৳${Number(sale.grand_total).toLocaleString()}`}
        icon={RotateCcw}
        size="md"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Refund Amount (BDT) *</label>
            <input
              type="number"
              min="1"
              max={sale.grand_total}
              value={data.refund_amount}
              onChange={(e) => setData('refund_amount', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Refund Payment Method</label>
            <select
              value={data.payment_method}
              onChange={(e) => setData('payment_method', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden cursor-pointer"
            >
              <option value="cash">Cash from Register</option>
              <option value="bkash">bKash Refund</option>
              <option value="nagad">Nagad Refund</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Return Reason / Notes</label>
            <textarea
              rows="3"
              value={data.reason}
              onChange={(e) => setData('reason', e.target.value)}
              placeholder="e.g. Defective hardware / customer return within 7 days"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRefundModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {processing ? 'Processing...' : 'Authorize Refund & Restock'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* DUAL FORMAT INVOICE PRINT MODAL */}
      <AdminModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`Invoice #${sale.sale_number} — Print Preview`}
        subtitle="View thermal receipt and full A4 invoice formats"
        icon={Printer}
        size="xl"
      >
        <InvoicePrintTemplate
          sale={sale}
          initialFormat="a4"
          showFormatSelector={true}
          onClose={() => setIsPrintModalOpen(false)}
        />
      </AdminModal>
    </AdminShell>
  );
}
