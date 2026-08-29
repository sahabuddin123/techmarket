import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, CheckCircle, ArrowLeft, Phone, MapPin } from 'lucide-react';
import { trackPurchase } from '@/lib/tracking';

export default function Invoice({ order }) {
  useEffect(() => {
    if (order) {
      trackPurchase(order);
    }
  }, [order?.order_number]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans py-8 px-4 sm:px-6 selection:bg-[#0084ff] selection:text-white">
      <Head title={`Invoice #${order.order_number} - TechMarket BD`} />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Actions */}
        <div className="flex items-center justify-between no-print border-b border-slate-100 pb-4">
          <Link
            href="/"
            className="text-xs font-bold text-[#0084ff] hover:underline flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>

          <button
            onClick={handlePrint}
            className="bg-[#0084ff] hover:bg-[#0070d6] text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT OFFICIAL INVOICE</span>
          </button>
        </div>

        {/* INVOICE CARD */}
        <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-12 shadow-xs space-y-8 border border-slate-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-[#0084ff] text-white font-black flex items-center justify-center text-sm">TM</div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">TECHMARKET <span className="text-[#0084ff]">BD</span></span>
              </div>
              <p className="text-xs text-slate-500">Multiplan Center, Level-6, Elephant Road, Dhaka-1205</p>
              <p className="text-xs text-slate-500">Hotline: 09613562601 | Trade Lic: TRAD/DNCC/012948</p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">OFFICIAL INVOICE</div>
              <div className="text-xl font-black text-slate-900 tracking-tight">{order.order_number}</div>
              <div className="text-xs text-slate-500">Date: {new Date(order.created_at).toLocaleDateString()}</div>
              <div className="inline-block mt-1 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] px-2.5 py-0.5 rounded uppercase">
                Status: {order.status}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-slate-50/70 p-5 rounded-lg border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5">CUSTOMER DETAILS:</h4>
              <div className="font-bold text-slate-900 text-sm">{order.customer_name}</div>
              <div className="text-slate-600 mt-0.5">Phone: {order.customer_phone}</div>
              <div className="text-slate-600">Email: {order.customer_email}</div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5">SHIPPING & PAYMENT:</h4>
              <div className="text-slate-800 font-medium leading-relaxed">{order.shipping_address}, {order.district}</div>
              <div className="text-slate-600 mt-1.5">
                Payment Method: <strong className="text-slate-900">{order.payment_method_label || (
                  order.payment_method?.toLowerCase() === 'cod' ? 'Cash on Delivery' :
                  order.payment_method?.toLowerCase() === 'bkash' ? 'bKash' :
                  order.payment_method?.toLowerCase() === 'nagad' ? 'Nagad' :
                  order.payment_method
                )}</strong> ({order.payment_status})
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#1c2434] text-white font-bold uppercase text-[11px]">
                  <th className="p-3.5 rounded-l">ITEM DESCRIPTION</th>
                  <th className="p-3.5 text-center">UNIT PRICE</th>
                  <th className="p-3.5 text-center">QTY</th>
                  <th className="p-3.5 text-right rounded-r">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {order.items && order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-900">{item.product_name}</td>
                    <td className="p-3.5 text-center font-mono text-slate-700">৳{Number(item.price).toLocaleString()}</td>
                    <td className="p-3.5 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="p-3.5 text-right font-black text-slate-900">৳{Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">৳{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping ({order.district}):</span>
                <span className="font-bold text-slate-900">৳{Number(order.shipping_cost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                <span>Total Amount:</span>
                <span className="text-[#ea580c]">৳{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-slate-500 pt-6 border-t border-slate-200">
            <p className="font-bold text-slate-900">Thank you for shopping with TechMarket BD!</p>
            <p className="text-[11px] mt-1 text-slate-500">For warranty inquiries or technical support, please present this invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
