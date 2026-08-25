import React, { useState } from 'react';
import {
  Printer, FileText, CheckCircle2, Building,
  User, Phone, Mail, MapPin, Calendar, Clock, DollarSign,
  QrCode, ShieldCheck
} from 'lucide-react';

export default function InvoicePrintTemplate({
  sale = {},
  initialFormat = '58mm', // '58mm' | 'a4'
  showFormatSelector = true,
  onClose = null,
}) {
  const [format, setFormat] = useState(initialFormat);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert numbers to words (Bengali/English currency format)
  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if ((n = n.toString()).length > 9) return 'overflow';
      const nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!nArray) return '';
      let str = '';
      str += (Number(nArray[1]) !== 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
      str += (Number(nArray[2]) !== 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
      str += (Number(nArray[3]) !== 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
      str += (Number(nArray[4]) !== 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
      str += (Number(nArray[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) + 'Taka Only' : 'Taka Only';
      return str;
    };

    return inWords(Math.floor(Number(num || 0)));
  };

  return (
    <div className="space-y-4">
      {/* Format Switcher & Print Control Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl print:hidden">
        {showFormatSelector ? (
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setFormat('58mm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                format === '58mm'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>58mm POS Receipt</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('a4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                format === 'a4'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Standard Invoice</span>
            </button>
          </div>
        ) : <div />}

        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition"
            >
              Close
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print {format === '58mm' ? '58mm Thermal' : 'A4 Invoice'}</span>
          </button>
        </div>
      </div>

      {/* PRINT CONTAINER WITH ISOLATED STYLES */}
      <div className="flex justify-center overflow-x-auto bg-slate-200/60 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* ========================================================================= */}
        {/* FORMAT 1: 58MM THERMAL POS PAPER FORMAT                                   */}
        {/* ========================================================================= */}
        {format === '58mm' && (
          <div
            id="printable-58mm-receipt"
            className="w-[58mm] min-w-[58mm] max-w-[58mm] bg-white text-slate-950 font-mono text-[10px] leading-tight p-2.5 shadow-xl rounded-md print:shadow-none print:m-0 print:p-1"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
              <div className="font-black text-sm uppercase tracking-wider font-sans">TECHMARKET BD</div>
              <div className="text-[9px]">Hardware & Computing Hub</div>
              <div className="text-[8.5px]">Multiplan Center, Dhaka</div>
              <div className="text-[8.5px]">Tel: +880 9612-000000</div>
              <div className="text-[8.5px]">BIN: 002910491-0101</div>
              <div className="pt-1 text-[9px] font-bold">
                INVOICE: #{sale.sale_number}
              </div>
              <div className="text-[8px] text-slate-600">
                {sale.created_at ? new Date(sale.created_at).toLocaleString('en-BD') : new Date().toLocaleString()}
              </div>
            </div>

            {/* Customer & Cashier Details */}
            <div className="py-1.5 border-b border-dashed border-slate-400 space-y-0.5 text-[8.5px]">
              <div><strong>Customer:</strong> {sale.customer_name || 'Walk-in Customer'}</div>
              {sale.customer_phone && <div><strong>Phone:</strong> {sale.customer_phone}</div>}
              <div><strong>Terminal:</strong> {sale.warehouse?.name || 'Main POS'}</div>
              {sale.salesperson && <div><strong>Cashier:</strong> {sale.salesperson?.name}</div>}
            </div>

            {/* Line Items Table */}
            <div className="py-1.5 border-b border-dashed border-slate-400 space-y-1.5">
              <div className="flex justify-between font-bold text-[9px] pb-0.5 border-b border-slate-300">
                <span className="w-7/12 truncate">ITEM</span>
                <span className="w-2/12 text-center">QTY</span>
                <span className="w-3/12 text-right">TOTAL</span>
              </div>

              {(sale.items || []).map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-[8.5px]">
                  <div className="font-bold truncate">{item.product_title || item.product?.title}</div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-[8px]">{item.quantity} x ৳{Number(item.unit_price).toLocaleString()}</span>
                    <span className="font-bold">৳{Number(item.line_total).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Totals */}
            <div className="py-1.5 border-b border-dashed border-slate-400 space-y-1 text-[9px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{Number(sale.subtotal).toLocaleString()}</span>
              </div>

              {Number(sale.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-৳{Number(sale.discount_amount).toLocaleString()}</span>
                </div>
              )}

              {Number(sale.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span>VAT / Tax:</span>
                  <span>৳{Number(sale.tax_amount).toLocaleString()}</span>
                </div>
              )}

              {Number(sale.shipping_charge) > 0 && (
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>৳{Number(sale.shipping_charge).toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-[11px] pt-1 border-t border-slate-950">
                <span>NET TOTAL:</span>
                <span>৳{Number(sale.grand_total).toLocaleString()}</span>
              </div>

              <div className="flex justify-between font-bold text-slate-800">
                <span>PAID:</span>
                <span>৳{Number(sale.paid_amount || sale.grand_total).toLocaleString()}</span>
              </div>

              {Number(sale.change_amount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>CHANGE:</span>
                  <span>৳{Number(sale.change_amount).toLocaleString()}</span>
                </div>
              )}

              {Number(sale.due_amount) > 0 && (
                <div className="flex justify-between font-bold text-red-600">
                  <span>DUE:</span>
                  <span>৳{Number(sale.due_amount).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Payment Method Breakdown */}
            {sale.payments && sale.payments.length > 0 && (
              <div className="py-1 border-b border-dashed border-slate-400 text-[8px] space-y-0.5">
                <div className="font-bold uppercase">Payment Breakdown:</div>
                {sale.payments.map((p, pIdx) => (
                  <div key={pIdx} className="flex justify-between">
                    <span className="capitalize">{p.payment_method} {p.reference_number ? `(${p.reference_number})` : ''}:</span>
                    <span>৳{Number(p.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Return Policy & Barcode Footer */}
            <div className="text-center pt-2 space-y-1 text-[8px] text-slate-600">
              <div>*** THANK YOU FOR SHOPPING ***</div>
              <div>Warranty & return within 7 days with original invoice & packaging.</div>
              <div className="pt-1 text-[7.5px] font-mono tracking-widest text-slate-400">
                *{sale.sale_number}*
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORMAT 2: A4 STANDARD CORPORATE INVOICE                                   */}
        {/* ========================================================================= */}
        {format === 'a4' && (
          <div
            id="printable-a4-invoice"
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 shadow-2xl rounded-xl space-y-6 text-xs print:shadow-none print:m-0 print:p-6 print:rounded-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Top Official Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-base">
                    TM
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">TECHMARKET BD</h1>
                </div>
                <p className="text-xs text-slate-500 font-medium">Enterprise Hardware & Commercial Computing Solutions</p>
                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                  <div>Corporate HQ: Level 8, Multiplan Center, New Elephant Road, Dhaka-1205</div>
                  <div>Phone: +880 9612-000000 • Email: billing@techmarket.com.bd</div>
                  <div>BIN / Tax Registration: 002910491-0101 • Web: https://techmarket.com.bd</div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-black text-sm uppercase tracking-wider">
                  TAX INVOICE
                </div>
                <div className="font-mono font-bold text-sm text-slate-900">
                  Invoice #: {sale.sale_number}
                </div>
                <div className="text-xs text-slate-600">
                  Date: {sale.created_at ? new Date(sale.created_at).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString()}
                </div>
                <div className="text-xs text-slate-600">
                  Channel: <span className="font-bold uppercase">{sale.sales_channel || 'POS Terminal'}</span>
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    sale.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Payment: {sale.payment_status?.replace('_', ' ') || 'PAID'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill To & Fulfillment Info Grid */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                  BILL TO / CUSTOMER DETAILS
                </div>
                <div className="font-bold text-sm text-slate-950">
                  {sale.customer_name || 'Walk-in Customer'}
                </div>
                {sale.customer_phone && (
                  <div className="text-slate-600 font-mono">
                    Phone: {sale.customer_phone}
                  </div>
                )}
                {sale.customer_email && (
                  <div className="text-slate-600">
                    Email: {sale.customer_email}
                  </div>
                )}
                {sale.customer?.address && (
                  <div className="text-slate-600">
                    Address: {sale.customer.address}
                  </div>
                )}
              </div>

              <div className="space-y-1 text-right sm:text-left">
                <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                  FULFILLMENT & DISPATCH
                </div>
                <div className="font-bold text-sm text-slate-950">
                  {sale.warehouse?.name || 'Central Dhaka Distribution Hub'}
                </div>
                <div className="text-slate-600">
                  Served By: <span className="font-semibold">{sale.salesperson?.name || 'POS Cashier Desk'}</span>
                </div>
                {sale.notes && (
                  <div className="text-slate-600 text-[11px]">
                    Notes: {sale.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-center w-12">#</th>
                    <th className="p-3">Product Description & SKU</th>
                    <th className="p-3 text-center w-20">Qty</th>
                    <th className="p-3 text-right w-28">Unit Price</th>
                    <th className="p-3 text-right w-24">Discount</th>
                    <th className="p-3 text-right w-32">Total (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(sale.items || []).map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-950">{item.product_title || item.product?.title}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          SKU: {item.sku || item.product?.sku || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">৳{formatCurrency(item.unit_price)}</td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {Number(item.line_discount) > 0 ? `৳${formatCurrency(item.line_discount)}` : '—'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-950">
                        ৳{formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pricing Breakdown & Amount in Words */}
            <div className="grid grid-cols-12 gap-6 pt-2">
              <div className="col-span-7 space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
                    Amount in Words:
                  </div>
                  <div className="font-serif italic font-semibold text-slate-800 text-xs">
                    {numberToWords(sale.grand_total)}
                  </div>
                </div>

                {/* Payment History Sub-box */}
                {sale.payments && sale.payments.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
                      Payment Transaction Details
                    </div>
                    <div className="divide-y divide-slate-200">
                      {sale.payments.map((p, idx) => (
                        <div key={idx} className="py-1 flex justify-between">
                          <span className="font-medium text-slate-700 capitalize">
                            {p.payment_method} {p.reference_number ? `• TrxID: ${p.reference_number}` : ''}
                          </span>
                          <span className="font-mono font-bold text-emerald-700">
                            ৳{formatCurrency(p.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-5 space-y-2">
                <div className="space-y-1.5 text-xs text-slate-700 font-medium p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span>Subtotal Amount:</span>
                    <span className="font-mono font-bold">৳{formatCurrency(sale.subtotal)}</span>
                  </div>

                  {Number(sale.discount_amount) > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Promotional Discount:</span>
                      <span className="font-mono font-bold">-৳{formatCurrency(sale.discount_amount)}</span>
                    </div>
                  )}

                  {Number(sale.tax_amount) > 0 && (
                    <div className="flex justify-between">
                      <span>VAT / Tax (Included):</span>
                      <span className="font-mono">৳{formatCurrency(sale.tax_amount)}</span>
                    </div>
                  )}

                  {Number(sale.shipping_charge) > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery & Handling:</span>
                      <span className="font-mono">৳{formatCurrency(sale.shipping_charge)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-black text-sm text-slate-950 pt-2 border-t-2 border-slate-300">
                    <span>Grand Total:</span>
                    <span className="font-mono text-indigo-700">৳{formatCurrency(sale.grand_total)}</span>
                  </div>

                  <div className="flex justify-between font-bold text-emerald-700 pt-1">
                    <span>Total Paid:</span>
                    <span className="font-mono">৳{formatCurrency(sale.paid_amount || sale.grand_total)}</span>
                  </div>

                  {Number(sale.due_amount) > 0 && (
                    <div className="flex justify-between font-bold text-rose-600">
                      <span>Due Balance:</span>
                      <span className="font-mono">৳{formatCurrency(sale.due_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-200 text-[10.5px] text-slate-600">
              <div className="space-y-1">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Terms & Conditions:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-500">
                  <li>Goods once sold can be exchanged within 7 days with original tax invoice and unbroken serial seals.</li>
                  <li>Manufacturer warranty claims are handled per official service center SLA timelines.</li>
                  <li>Physical damages, burnt components, or liquid ingress void standard warranty coverage.</li>
                </ol>
              </div>

              <div className="flex flex-col justify-end items-end text-center space-y-1 pr-4">
                <div className="w-44 border-b border-slate-800 pb-1" />
                <div className="font-bold text-slate-900 text-xs">Authorized Signature</div>
                <div className="text-[10px] text-slate-400">TechMarket BD Finance & Accounts</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Embedded Print CSS for exact 58mm vs A4 rendering */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-58mm-receipt, #printable-58mm-receipt * {
            visibility: visible;
          }
          #printable-a4-invoice, #printable-a4-invoice * {
            visibility: visible;
          }
          #printable-58mm-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm !important;
            margin: 0 !important;
            padding: 2mm !important;
          }
          #printable-a4-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
          }
          @page {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
