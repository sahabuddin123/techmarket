import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { Search, Package, Phone, CheckCircle2, Clock, Truck } from 'lucide-react';

export default function TrackOrder() {
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [error, setError] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    // Simulated lookup logic or query backend
    if (orderNumber.toUpperCase().includes('TM') || orderNumber.toUpperCase().includes('TL')) {
      setTrackedOrder({
        order_number: orderNumber.toUpperCase(),
        date: new Date().toLocaleDateString(),
        status: 'Processing',
        customer_name: 'Customer',
        phone: phone || '01700000000',
        district: 'Dhaka',
        payment_method: 'Cash on Delivery',
        total: 42360,
      });
      setError(null);
    } else {
      setError('Order not found. Please check your order ID and phone number.');
      setTrackedOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Head title="Track Your Order - TechMarket BD" />

      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center justify-center space-x-2">
            <Package className="w-6 h-6 text-[#3b82f6]" />
            <span>TRACK YOUR HARDWARE ORDER</span>
          </h1>
          <p className="text-xs text-slate-400">Enter your Order Invoice Number and Phone Number to get live order fulfillment status.</p>
        </div>

        <form onSubmit={handleTrack} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Order Invoice Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. TM-8X92A1B"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-3 rounded-lg border border-slate-800 focus:border-[#3b82f6] uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Phone Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. 01700000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-3 rounded-lg border border-slate-800 focus:border-[#3b82f6]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1c4289] hover:bg-[#15326b] text-white font-black text-xs py-3.5 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg"
          >
            <Search className="w-4 h-4" />
            <span>TRACK ORDER STATUS</span>
          </button>
        </form>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {trackedOrder && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <div className="font-black text-white text-base">{trackedOrder.order_number}</div>
                <div className="text-slate-400">Placed on {trackedOrder.date}</div>
              </div>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-3 py-1 rounded text-xs uppercase">
                Status: {trackedOrder.status}
              </span>
            </div>

            {/* Tracking timeline */}
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className="p-3 bg-slate-950 border border-emerald-500/30 text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                <span>Confirmed</span>
              </div>
              <div className="p-3 bg-slate-950 border border-amber-500/30 text-amber-400 rounded-lg">
                <Clock className="w-4 h-4 mx-auto mb-1 animate-pulse" />
                <span>Processing</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 text-slate-500 rounded-lg">
                <Truck className="w-4 h-4 mx-auto mb-1" />
                <span>Shipped</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 text-slate-500 rounded-lg">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                <span>Delivered</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
