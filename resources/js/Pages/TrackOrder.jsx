import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  Search, Package, Phone, CheckCircle2, Clock, Truck, 
  MapPin, CreditCard, ChevronRight, ShieldCheck, HelpCircle,
  AlertCircle, ShoppingBag, ArrowRight, Printer
} from 'lucide-react';

export default function TrackOrder(props) {
  const { settings = {} } = usePage().props;
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(props.queryOrder || '');
  const [phone, setPhone] = useState(props.queryPhone || '');
  const [loading, setLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(props.trackedOrder || null);
  const [error, setError] = useState(props.initialError || null);

  useEffect(() => {
    if (props.trackedOrder) {
      setTrackedOrder(props.trackedOrder);
      setError(null);
    } else if (props.initialError) {
      setError(props.initialError);
      setTrackedOrder(null);
    }
  }, [props.trackedOrder, props.initialError]);

  const handleTrack = async (e) => {
    e.preventDefault();
    const cleanNum = orderNumber.trim();
    if (!cleanNum) return;

    setLoading(true);
    setError(null);

    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(`/api/orders/track?order_number=${encodeURIComponent(cleanNum)}&phone=${encodeURIComponent(phone.trim())}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': token
        }
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setTrackedOrder(data.order);
        setError(null);
      } else {
        setError(data.message || `Order "${cleanNum}" not found in our records. Please verify your invoice number.`);
        setTrackedOrder(null);
      }
    } catch (err) {
      console.error('Order tracking fetch error:', err);
      setError('Unable to retrieve tracking information at the moment. Please check your internet connection or try again.');
      setTrackedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepIndex) => {
    if (!trackedOrder) return 'pending';
    const currentStep = trackedOrder.status_step || 1;
    if (currentStep === -1) return 'cancelled';
    if (currentStep > stepIndex) return 'completed';
    if (currentStep === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="storefront-v3 min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col selection:bg-[#0153FD] selection:text-white">
      <Head title={`Track Your Order - ${settings.site_name || 'TechMarket BD'}`} />

      {/* Navbar & Cart Drawer */}
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Breadcrumb Header */}
      <div className="w-full bg-white border-b border-slate-100 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#0153FD] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate">Track Order</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-bold text-[#0153FD]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Live Tracking</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Page Title / Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0153FD] text-xs font-black uppercase tracking-wider shadow-2xs">
            <Package className="w-4 h-4" />
            <span>LIVE ORDER TRACKING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Track Your Order Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Enter your order invoice number and phone number below to get live real-time shipment updates.
          </p>
        </div>

        {/* Tracking Form Card */}
        <div className="bg-white border border-[#8BB1FF]/70 rounded-[24px] p-6 sm:p-8 shadow-[0_0_20px_rgba(202,224,255,0.6)]">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Order Invoice Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TMB-20260829-112837"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0153FD] focus:ring-2 focus:ring-[#0153FD]/20 font-mono text-xs sm:text-sm uppercase font-bold transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 01700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0153FD] focus:ring-2 focus:ring-[#0153FD]/20 text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0153FD] hover:bg-[#0042cf] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-full flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'TRACKING SHIPMENT...' : 'TRACK ORDER STATUS'}</span>
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Tracking Result View */}
        {trackedOrder && (
          <div className="bg-white border border-[#8BB1FF]/70 rounded-[24px] p-6 sm:p-8 shadow-[0_0_20px_rgba(202,224,255,0.6)] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header / Order Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                    Order #{trackedOrder.order_number}
                  </h3>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-extrabold"
                    style={{
                      backgroundColor: `${trackedOrder.status_color || '#3b82f6'}20`,
                      color: trackedOrder.status_color || '#3b82f6',
                      borderColor: `${trackedOrder.status_color || '#3b82f6'}40`,
                      borderWidth: '1px',
                    }}
                  >
                    {trackedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Placed on <strong className="text-slate-800">{trackedOrder.date_full || trackedOrder.date}</strong> · Courier: <strong className="text-slate-800">{trackedOrder.courier || 'Pending'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {trackedOrder.tracking_code && (
                  <div className="bg-[#F8FAFC] border border-slate-200 px-3.5 py-2 rounded-xl text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tracking ID</span>
                    <span className="font-mono font-black text-xs sm:text-sm text-[#0153FD]">{trackedOrder.tracking_code}</span>
                  </div>
                )}
                <a
                  href={`/invoice/${trackedOrder.order_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </a>
              </div>
            </div>

            {/* Stepper Timeline Tracker */}
            <div className="py-4">
              <div className="grid grid-cols-4 gap-2 text-center relative">
                
                {/* Step 1: Placed */}
                {(() => {
                  const state = getStepStatus(1);
                  const isDone = state === 'completed' || state === 'active';
                  return (
                    <div className="flex flex-col items-center space-y-2 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold text-xs ${
                        isDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-black text-xs ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>Order Placed</p>
                        <p className="text-[10px] text-slate-400">Confirmed</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 2: Processing */}
                {(() => {
                  const state = getStepStatus(2);
                  const isDone = state === 'completed' || state === 'active';
                  const isActive = state === 'active';
                  return (
                    <div className="flex flex-col items-center space-y-2 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold text-xs ${
                        isDone ? (isActive ? 'bg-[#0153FD] text-white shadow-blue-500/30 animate-pulse' : 'bg-emerald-500 text-white') : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {isDone && !isActive ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`font-black text-xs ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>Processing</p>
                        <p className="text-[10px] text-slate-400">Quality Checked</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 3: Shipped / In Transit */}
                {(() => {
                  const state = getStepStatus(3);
                  const isDone = state === 'completed' || state === 'active';
                  const isActive = state === 'active';
                  return (
                    <div className="flex flex-col items-center space-y-2 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold text-xs ${
                        isDone ? (isActive ? 'bg-[#0153FD] text-white shadow-blue-500/30 animate-pulse' : 'bg-emerald-500 text-white') : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-black text-xs ${isDone ? 'text-[#0153FD]' : 'text-slate-400'}`}>In Transit</p>
                        <p className="text-[10px] text-slate-400">Handed to Courier</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 4: Delivered */}
                {(() => {
                  const state = getStepStatus(4);
                  const isDone = state === 'completed' || state === 'active';
                  return (
                    <div className="flex flex-col items-center space-y-2 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        isDone ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${isDone ? 'text-slate-900 font-black' : 'text-slate-400'}`}>Delivered</p>
                        <p className="text-[10px] text-slate-400">{isDone ? 'Completed' : 'Pending'}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#F8FAFC] border border-slate-200/80 p-4 rounded-xl space-y-2 text-xs">
                <h4 className="font-black text-slate-900 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0153FD]" />
                  <span>Delivery Address</span>
                </h4>
                <p className="font-bold text-slate-800">{trackedOrder.customer_name || 'Customer'}</p>
                <p className="text-slate-600">{trackedOrder.phone}</p>
                <p className="text-slate-600">{trackedOrder.address ? `${trackedOrder.address}, ${trackedOrder.district}` : trackedOrder.district}</p>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/80 p-4 rounded-xl space-y-2 text-xs">
                <h4 className="font-black text-slate-900 flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#0153FD]" />
                  <span>Payment & Amount</span>
                </h4>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Method:</span>
                  <span className="font-bold text-slate-800">{trackedOrder.payment_method || 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Payment Status:</span>
                  <span className="font-bold text-slate-800">{trackedOrder.payment_status}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
                  <span className="font-bold">Total Bill:</span>
                  <span className="font-black text-base text-[#0153FD]">৳{Number(trackedOrder.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            {Array.isArray(trackedOrder.items) && trackedOrder.items.length > 0 && (
              <div className="pt-2 space-y-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#0153FD]" />
                  <span>Order Items ({trackedOrder.items.length})</span>
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0" 
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                          <p className="text-slate-400 text-[11px]">Qty: {item.quantity} × ৳{Number(item.price).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 shrink-0">
                        ৳{Number(item.total || (item.price * item.quantity)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Note */}
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-700 font-medium">
                <HelpCircle className="w-4 h-4 text-[#0153FD] shrink-0" />
                <span>Need assistance with your delivery?</span>
              </div>
              <a 
                href={`tel:${(settings.hotline || settings.support_phone || '01700000000').replace(/[^0-9+]/g, '')}`}
                className="font-extrabold text-[#0153FD] hover:underline"
              >
                Call Hotline
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
