import React, { useState, useRef } from 'react';
import {
  Printer, FileText, CheckCircle2, Building,
  User, Phone, Mail, MapPin, Calendar, Clock, DollarSign,
  ShieldCheck, Layers
} from 'lucide-react';

export default function InvoicePrintTemplate({
  sale = {},
  initialFormat = '80mm', // '80mm' | '58mm' | 'a4'
  showFormatSelector = true,
  onClose = null,
}) {
  const [format, setFormat] = useState(initialFormat === '58mm' ? '58mm' : (initialFormat === 'a4' ? 'a4' : '80mm'));
  const printableAreaRef = useRef(null);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

  /**
   * Ultra-robust isolated Iframe Printing Method:
   * Completely eliminates modal backdrop, fixed body scrolling, or parent layout bounding bugs in Chrome/Edge/Firefox.
   */
  const handlePrint = () => {
    const element = printableAreaRef.current;
    if (!element) {
      window.print();
      return;
    }

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();

    const isThermal = format === '80mm' || format === '58mm';
    const paperWidth = format === '58mm' ? '58mm' : (format === '80mm' ? '80mm' : '210mm');
    const contentWidth = format === '58mm' ? '48mm' : (format === '80mm' ? '72mm' : '100%');

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${sale.sale_number || 'TechMarket'}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: ${isThermal ? `${paperWidth} auto` : 'A4 portrait'};
              margin: ${isThermal ? '2mm 3mm' : '10mm 12mm'};
            }
            *, *:before, *:after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: ${isThermal ? "'Courier New', Courier, monospace" : "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"};
              color: #000;
              background: #fff;
              width: ${contentWidth};
              margin: 0 auto;
              padding: ${isThermal ? '2mm 0' : '0'};
              font-size: ${format === '58mm' ? '10px' : (format === '80mm' ? '12px' : '13px')};
              line-height: ${isThermal ? '1.25' : '1.4'};
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: ${isThermal ? '3px 0' : '8px 10px'};
              vertical-align: top;
            }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #444; }
            .border-b-solid { border-bottom: 1px solid #222; }
            .border-t-solid { border-top: 1px solid #222; }
            .border-t-double { border-top: 3px double #000; }
            .border-box { border: 1px solid #cbd5e1; }
            .bg-gray { background-color: #f8fafc; }
            .uppercase { text-transform: uppercase; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .my-1 { margin-top: 4px; margin-bottom: 4px; }
            .my-2 { margin-top: 8px; margin-bottom: 8px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            
            /* A4 specific elegance */
            ${!isThermal ? `
              .a4-header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; }
              .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
              .badge-paid { background: #dcfce7; color: #166534; }
              .badge-due { background: #fee2e2; color: #991b1b; }
              .badge-partial { background: #fef3c7; color: #92400e; }
              th { background: #f1f5f9; font-weight: 700; color: #1e293b; border-bottom: 2px solid #cbd5e1; }
              td { border-bottom: 1px solid #e2e8f0; }
            ` : ''}
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);

    doc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 2000);
    }, 250);
  };

  return (
    <div className="space-y-4">
      {/* Format Switcher & Print Control Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl print:hidden">
        {showFormatSelector ? (
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setFormat('80mm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                format === '80mm'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>80mm Thermal (Standard)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('58mm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                format === '58mm'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>58mm Mini</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('a4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                format === 'a4'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Tax Invoice</span>
            </button>
          </div>
        ) : <div />}

        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print {format === 'a4' ? 'A4 Invoice' : `${format} Slip`}</span>
          </button>
        </div>
      </div>

      {/* PRINT PREVIEW STAGE */}
      <div className="flex justify-center overflow-x-auto bg-slate-200/70 dark:bg-slate-950/70 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[70vh] overflow-y-auto">
        <div ref={printableAreaRef} className="w-full flex justify-center">
          
          {/* ========================================================================= */}
          {/* FORMAT 1: 80MM / 58MM POS THERMAL PAPER FORMAT                            */}
          {/* ========================================================================= */}
          {(format === '80mm' || format === '58mm') && (
            <div
              className={`bg-white text-slate-950 font-mono ${
                format === '58mm' ? 'w-[58mm] text-[10px]' : 'w-[80mm] text-[11.5px]'
              } leading-tight p-3 sm:p-4 shadow-xl rounded-sm border border-slate-300 mx-auto`}
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              {/* Header */}
              <div className="text-center pb-2.5 border-b border-dashed border-slate-500 space-y-1">
                <div className="font-black text-sm uppercase tracking-wider font-sans">TECHMARKET BD</div>
                <div className="text-[10px] font-bold">Hardware & Computing Hub</div>
                <div className="text-[9.5px]">Multiplan Center, Dhaka-1205</div>
                <div className="text-[9.5px]">Tel: +880 9612-000000</div>
                <div className="text-[9.5px]">BIN: 002910491-0101</div>
                
                <div className="pt-1.5 pb-0.5 border-t border-dotted border-slate-400">
                  <div className="text-[10.5px] font-black">INVOICE: #{sale.sale_number}</div>
                  <div className="text-[9px] text-slate-600">
                    {sale.created_at ? new Date(sale.created_at).toLocaleString('en-BD') : new Date().toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Customer & Cashier Details */}
              <div className="py-2 border-b border-dashed border-slate-500 space-y-0.5 text-[9.5px]">
                <div className="flex justify-between">
                  <span className="font-bold">Customer:</span>
                  <span className="font-semibold truncate max-w-[150px]">{sale.customer_name || 'Walk-in Customer'}</span>
                </div>
                {sale.customer_phone && (
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{sale.customer_phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Terminal:</span>
                  <span>{sale.warehouse?.name || 'Main POS Counter'}</span>
                </div>
                {sale.salesperson && (
                  <div className="flex justify-between">
                    <span>Served By:</span>
                    <span>{sale.salesperson?.name}</span>
                  </div>
                )}
              </div>

              {/* Line Items Table */}
              <div className="py-2 border-b border-dashed border-slate-500 space-y-1.5">
                <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-slate-400">
                  <span className="w-7/12 truncate">ITEM</span>
                  <span className="w-2/12 text-center">QTY</span>
                  <span className="w-3/12 text-right">TOTAL</span>
                </div>

                {(sale.items || []).map((item, idx) => (
                  <div key={idx} className="space-y-0.5 text-[9.5px]">
                    <div className="font-bold leading-tight">{item.product_title || item.product?.title}</div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-[8.5px]">{item.quantity} x ৳{Number(item.unit_price).toLocaleString()}</span>
                      <span className="font-bold text-slate-950">৳{Number(item.line_total).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations & Totals */}
              <div className="py-2 border-b border-dashed border-slate-500 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">৳{Number(sale.subtotal).toLocaleString()}</span>
                </div>

                {Number(sale.discount_amount) > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Discount:</span>
                    <span>-৳{Number(sale.discount_amount).toLocaleString()}</span>
                  </div>
                )}

                {Number(sale.tax_amount) > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>VAT / Tax:</span>
                    <span>৳{Number(sale.tax_amount).toLocaleString()}</span>
                  </div>
                )}

                {Number(sale.shipping_charge) > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Delivery:</span>
                    <span>৳{Number(sale.shipping_charge).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-[12px] pt-1.5 border-t border-slate-950">
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
                  <div className="flex justify-between font-black text-red-600">
                    <span>DUE:</span>
                    <span>৳{Number(sale.due_amount).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Payment Method Breakdown */}
              {sale.payments && sale.payments.length > 0 && (
                <div className="py-1.5 border-b border-dashed border-slate-500 text-[9px] space-y-0.5">
                  <div className="font-bold uppercase">Payment Breakdown:</div>
                  {sale.payments.map((p, pIdx) => (
                    <div key={pIdx} className="flex justify-between">
                      <span className="capitalize">{p.payment_method} {p.reference_number ? `(${p.reference_number})` : ''}:</span>
                      <span className="font-semibold">৳{Number(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Return Policy & Barcode Footer */}
              <div className="text-center pt-2.5 space-y-1 text-[8.5px] text-slate-600">
                <div className="font-bold">*** THANK YOU FOR SHOPPING ***</div>
                <div>Warranty & return within 7 days with original invoice & intact packaging.</div>
                <div className="pt-1.5 text-[8.5px] font-mono tracking-widest text-slate-400">
                  *{sale.sale_number}*
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMAT 2: A4 STANDARD CORPORATE TAX INVOICE                               */}
          {/* ========================================================================= */}
          {format === 'a4' && (
            <div
              className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl rounded-xl space-y-6 text-xs border border-slate-200"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Top Official Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
                      TM
                    </div>
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-slate-950">TECHMARKET BD</h1>
                      <p className="text-xs text-slate-500 font-semibold">Enterprise Hardware & Commercial Computing Solutions</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                    <div>Corporate HQ: Level 8, Multiplan Center, New Elephant Road, Dhaka-1205</div>
                    <div>Phone: +880 9612-000000 • Email: billing@techmarket.com.bd</div>
                    <div>BIN / Tax Registration: 002910491-0101 • Web: https://techmarket.com.bd</div>
                  </div>
                </div>

                <div className="text-right space-y-1.5">
                  <div className="inline-block px-3.5 py-1 rounded bg-slate-900 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                    TAX INVOICE
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-950">
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
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : (sale.payment_status === 'partial' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-100 text-rose-800 border border-rose-300')
                    }`}>
                      Payment: {sale.payment_status?.replace('_', ' ') || 'PAID'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill To & Fulfillment Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
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

                <div className="space-y-1 sm:text-right">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    FULFILLMENT & DISPATCH
                  </div>
                  <div className="font-bold text-sm text-slate-950">
                    {sale.warehouse?.name || 'Central Dhaka Distribution Hub'}
                  </div>
                  <div className="text-slate-600">
                    Served By: <span className="font-semibold">{sale.salesperson?.name || 'POS Cashier Desk'}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Authorized Delivery Slip
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">Product Description & Serial</th>
                      <th className="p-3 w-24 text-center">Warranty</th>
                      <th className="p-3 w-20 text-center">Qty</th>
                      <th className="p-3 w-28 text-right">Unit Price</th>
                      <th className="p-3 w-28 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(sale.items || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-950">{item.product_title || item.product?.title}</div>
                          {item.product?.sku && (
                            <div className="text-[10px] font-mono text-slate-500">SKU: {item.product.sku}</div>
                          )}
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-600">
                          {item.product?.warranty || 'N/A'}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                        <td className="p-3 text-right font-mono text-slate-800">৳{Number(item.unit_price).toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-950">৳{Number(item.line_total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary Block */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                <div className="sm:col-span-7 space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Amount In Words:</div>
                    <div className="font-semibold text-slate-700 italic text-xs">
                      {numberToWords(sale.grand_total)}
                    </div>
                  </div>

                  {sale.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Order / Delivery Notes:</div>
                      <div className="text-slate-600 text-xs">{sale.notes}</div>
                    </div>
                  )}

                  {/* Payment Breakdown */}
                  {sale.payments && sale.payments.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Payment Transaction Details:</div>
                      <div className="space-y-1">
                        {sale.payments.map((p, pIdx) => (
                          <div key={pIdx} className="flex justify-between text-xs text-slate-700">
                            <span className="capitalize font-medium">{p.payment_method} {p.reference_number ? `(Ref: ${p.reference_number})` : ''}</span>
                            <span className="font-mono font-bold">৳{Number(p.amount).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal Amount:</span>
                    <span className="font-mono font-semibold">৳{formatCurrency(sale.subtotal)}</span>
                  </div>

                  {Number(sale.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount Applied:</span>
                      <span className="font-mono font-semibold">-৳{formatCurrency(sale.discount_amount)}</span>
                    </div>
                  )}

                  {Number(sale.tax_amount) > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>VAT / Tax ({sale.tax_percent || 0}%):</span>
                      <span className="font-mono font-semibold">৳{formatCurrency(sale.tax_amount)}</span>
                    </div>
                  )}

                  {Number(sale.shipping_charge) > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Shipping / Delivery:</span>
                      <span className="font-mono font-semibold">৳{formatCurrency(sale.shipping_charge)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-black text-sm pt-2 border-t-2 border-slate-900 text-slate-950">
                    <span>Grand Total:</span>
                    <span className="font-mono text-indigo-700">৳{formatCurrency(sale.grand_total)}</span>
                  </div>

                  <div className="flex justify-between text-slate-800 font-bold pt-1">
                    <span>Total Paid:</span>
                    <span className="font-mono text-emerald-700">৳{formatCurrency(sale.paid_amount || sale.grand_total)}</span>
                  </div>

                  {Number(sale.change_amount) > 0 && (
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Change Returned:</span>
                      <span className="font-mono">৳{formatCurrency(sale.change_amount)}</span>
                    </div>
                  )}

                  {Number(sale.due_amount) > 0 && (
                    <div className="flex justify-between text-rose-700 font-black pt-1 border-t border-dashed border-slate-300">
                      <span>Outstanding Due:</span>
                      <span className="font-mono">৳{formatCurrency(sale.due_amount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Official Terms & Authorized Signature */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Terms & Conditions:</div>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-500 text-[11px]">
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
      </div>
    </div>
  );
}
