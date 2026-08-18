import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Package, User, MapPin, CreditCard, Truck, History, CheckCircle, 
  Clock, ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, XCircle, 
  Send, ExternalLink, ArrowUpRight, Copy, Check, Info, Building2
} from 'lucide-react';
import axios from 'axios';

export default function AdminOrderShow({ 
  order, 
  histories, 
  payments, 
  refunds, 
  shipments, 
  fraudCheck, 
  availableCouriers, 
  pathaoStores, 
  pathaoCities 
}) {
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [statusNotes, setStatusNotes] = useState('');

  // Courier Booking State
  const [selectedCourier, setSelectedCourier] = useState(
    availableCouriers?.find(c => c.enabled)?.identifier || 'steadfast'
  );
  const [parcelWeight, setParcelWeight] = useState('0.5');
  const [codAmount, setCodAmount] = useState(
    order.payment_method === 'cod' ? String(order.total) : '0'
  );
  const [specialNotes, setSpecialNotes] = useState(order.notes || 'Handle with care - Computer Hardware');
  
  // Pathao Locations
  const [pathaoStoreId, setPathaoStoreId] = useState(pathaoStores?.[0]?.id || '1');
  const [pathaoCityId, setPathaoCityId] = useState(pathaoCities?.[0]?.city_id || 1);
  const [pathaoZones, setPathaoZones] = useState([]);
  const [pathaoZoneId, setPathaoZoneId] = useState('');
  const [pathaoAreas, setPathaoAreas] = useState([]);
  const [pathaoAreaId, setPathaoAreaId] = useState('');
  const [loadingZones, setLoadingZones] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Fraud Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [fraudAction, setFraudAction] = useState('approve');
  const [overrideScore, setOverrideScore] = useState(fraudCheck?.risk_score || 0);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Load Pathao Zones when city changes
  useEffect(() => {
    if (selectedCourier === 'pathao' && pathaoCityId) {
      setLoadingZones(true);
      axios.get(`/admin/courier/locations?type=zones&city_id=${pathaoCityId}`)
        .then(res => {
          const list = res.data || [];
          setPathaoZones(list);
          if (list.length > 0) {
            setPathaoZoneId(list[0].zone_id);
          }
        })
        .catch(() => setPathaoZones([]))
        .finally(() => setLoadingZones(false));
    }
  }, [selectedCourier, pathaoCityId]);

  // Load Pathao Areas when zone changes
  useEffect(() => {
    if (selectedCourier === 'pathao' && pathaoZoneId) {
      axios.get(`/admin/courier/locations?type=areas&zone_id=${pathaoZoneId}`)
        .then(res => {
          const list = res.data || [];
          setPathaoAreas(list);
          if (list.length > 0) {
            setPathaoAreaId(list[0].area_id);
          }
        })
        .catch(() => setPathaoAreas([]));
    }
  }, [selectedCourier, pathaoZoneId]);

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    router.post(`/admin/orders/${order.id}/status`, { 
      status: orderStatus, 
      notes: statusNotes 
    }, { preserveScroll: true });
  };

  const handleBookCourier = (e) => {
    e.preventDefault();
    setIsBooking(true);

    router.post(`/admin/orders/${order.id}/courier-book`, {
      provider: selectedCourier,
      parcel_weight: parseFloat(parcelWeight) || 0.5,
      cod_amount: parseFloat(codAmount) || 0,
      special_instructions: specialNotes,
      store_id: pathaoStoreId,
      recipient_city_id: pathaoCityId,
      recipient_zone_id: pathaoZoneId,
      recipient_area_id: pathaoAreaId,
    }, {
      preserveScroll: true,
      onFinish: () => setIsBooking(false)
    });
  };

  const handleTrackSync = (shipmentId) => {
    setTrackingLoading(true);
    router.post(`/admin/shipments/${shipmentId}/track`, {}, {
      preserveScroll: true,
      onFinish: () => setTrackingLoading(false)
    });
  };

  const handleCancelShipment = (shipmentId) => {
    if (confirm('Cancel this shipment with courier provider?')) {
      router.post(`/admin/shipments/${shipmentId}/cancel`, {}, { preserveScroll: true });
    }
  };

  const handleRunFraudScan = () => {
    router.post(`/admin/orders/${order.id}/fraud-check`, {}, { preserveScroll: true });
  };

  const handleSubmitFraudReview = (e) => {
    e.preventDefault();
    if (!reviewNotes.trim()) {
      alert('Please enter a review audit note explaining your decision.');
      return;
    }
    setReviewSubmitting(true);
    router.post(`/admin/orders/${order.id}/fraud-review`, {
      action: fraudAction,
      override_score: fraudAction === 'override' ? parseInt(overrideScore) : null,
      notes: reviewNotes.trim(),
    }, {
      preserveScroll: true,
      onSuccess: () => setShowReviewModal(false),
      onFinish: () => setReviewSubmitting(false),
    });
  };

  const latestShipment = shipments?.[0];

  return (
    <AdminLayout title={`Order Workspace #${order.order_number}`}>
      <Head title={`Order #${order.order_number} - Admin Workspace`} />

      <div className="space-y-6 text-xs">
        {/* TOP HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
                <Package className="w-6 h-6 text-amber-500" />
                <span>ORDER #{order.order_number}</span>
              </h1>
              {order.fraud_status === 'on_hold' && (
                <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full font-black text-xs uppercase animate-pulse">
                  ⚠ FRAUD HOLD
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/checkout/invoice/${order.order_number}`}
              target="_blank"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Invoice</span>
            </Link>

            <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase border ${
              order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              order.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* 2-COLUMN WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: ITEMS, COURIER DISPATCH, FRAUD REVIEW */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. FRAUD DETECTION RISK CARD */}
            <div className={`border rounded-2xl p-5 space-y-4 shadow-xl transition ${
              fraudCheck?.risk_score >= 75 ? 'bg-rose-950/20 border-rose-500/40' :
              fraudCheck?.risk_score >= 50 ? 'bg-orange-950/20 border-orange-500/40' :
              fraudCheck?.risk_score >= 25 ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className={`w-5 h-5 ${
                    fraudCheck?.risk_score >= 75 ? 'text-rose-500' :
                    fraudCheck?.risk_score >= 50 ? 'text-orange-500' : 'text-amber-500'
                  }`} />
                  <div>
                    <h3 className="font-black text-sm text-white uppercase tracking-tight">Fraud Risk Intelligence & Assessment</h3>
                    <div className="text-[11px] text-slate-400">Automated multi-factor risk score & duplicate order scanner</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleRunFraudScan}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg font-bold inline-flex items-center space-x-1"
                    title="Re-run Fraud Analysis"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Re-Scan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg uppercase text-[10px] tracking-wider transition"
                  >
                    Admin Review
                  </button>
                </div>
              </div>

              {/* Fraud Overview Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Risk Score</div>
                  <div className="text-xl font-black font-mono flex items-center space-x-2">
                    <span className={
                      fraudCheck?.risk_score >= 75 ? 'text-rose-400' :
                      fraudCheck?.risk_score >= 50 ? 'text-orange-400' :
                      fraudCheck?.risk_score >= 25 ? 'text-amber-400' : 'text-emerald-400'
                    }>
                      {fraudCheck?.risk_score || 0} / 100
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">({fraudCheck?.risk_level || 'low'})</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Review Status</div>
                  <div className="font-black uppercase text-xs">
                    {fraudCheck?.status === 'on_hold' ? <span className="text-rose-400">ON HOLD</span> :
                     fraudCheck?.status === 'review_required' ? <span className="text-orange-400">REVIEW REQUIRED</span> :
                     fraudCheck?.status === 'approved' ? <span className="text-emerald-400">APPROVED</span> :
                     fraudCheck?.status === 'rejected' ? <span className="text-slate-400">REJECTED</span> :
                     <span className="text-emerald-400">PASSED</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Duplicate Detection</div>
                  <div className="font-bold">
                    {fraudCheck?.is_duplicate ? (
                      <span className="text-rose-400 font-black flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Duplicate Order Found</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400">✓ Unique Transaction</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Signals breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk Reasons */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-rose-400 uppercase">Penalty Signals</div>
                  {fraudCheck?.reasons && fraudCheck.reasons.length > 0 ? (
                    <div className="space-y-1.5">
                      {fraudCheck.reasons.map((r, i) => (
                        <div key={i} className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl font-semibold text-[11px]">
                          {r}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic p-2 bg-slate-950 rounded-lg">No risk penalty signals flagged.</div>
                  )}
                </div>

                {/* Positive Trust Factors */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase">Positive Trust Factors</div>
                  {fraudCheck?.positive_signals && fraudCheck.positive_signals.length > 0 ? (
                    <div className="space-y-1.5">
                      {fraudCheck.positive_signals.map((p, i) => (
                        <div key={i} className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl font-semibold text-[11px]">
                          {p}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic p-2 bg-slate-950 rounded-lg">Standard guest/new customer profile.</div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. COURIER LOGISTICS & DISPATCH CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-sm text-white uppercase">Courier Booking & Delivery Dispatch</h3>
                </div>

                {latestShipment && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                    latestShipment.internal_status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    latestShipment.internal_status === 'in_transit' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    latestShipment.internal_status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {latestShipment.internal_status || latestShipment.courier_status}
                  </span>
                )}
              </div>

              {/* BOOKED SHIPMENT CARD IF EXISTS */}
              {latestShipment ? (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          latestShipment.courier_provider === 'steadfast' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {latestShipment.courier_provider}
                        </span>
                        <span className="font-mono font-black text-white text-sm">
                          {latestShipment.tracking_code || latestShipment.consignment_id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Booked on {new Date(latestShipment.booked_at || latestShipment.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleTrackSync(latestShipment.id)}
                        disabled={trackingLoading}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${trackingLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh Tracking</span>
                      </button>

                      {latestShipment.internal_status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleCancelShipment(latestShipment.id)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold transition flex items-center space-x-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Parcel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold">Consignment ID</div>
                      <div className="font-mono font-bold text-white">{latestShipment.consignment_id || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold">COD Amount</div>
                      <div className="font-mono font-bold text-amber-400">৳{Number(latestShipment.cod_amount).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold">Parcel Weight</div>
                      <div className="font-mono font-bold text-slate-200">{latestShipment.parcel_weight} kg</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold">Delivery Status</div>
                      <div className="font-bold text-emerald-400 uppercase">{latestShipment.courier_status}</div>
                    </div>
                  </div>

                  {/* Shipment Status History */}
                  {latestShipment.status_histories && latestShipment.status_histories.length > 0 && (
                    <div className="border-t border-slate-800/80 pt-3 space-y-2">
                      <div className="font-bold text-slate-400 text-[10px] uppercase">Courier Live Tracking Timeline</div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {latestShipment.status_histories.map((sh, idx) => (
                          <div key={idx} className="p-2 bg-slate-900 rounded-lg text-[11px] flex items-center justify-between">
                            <span className="text-slate-200 font-semibold">{sh.notes || sh.courier_status}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{new Date(sh.created_at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* COURIER BOOKING FORM */
                <form onSubmit={handleBookCourier} className="space-y-4">
                  {order.fraud_status === 'on_hold' && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 font-bold flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Warning: This order is currently ON HOLD for fraud review. Verify customer before booking courier.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Provider Selection */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">Courier Provider *</label>
                      <select
                        value={selectedCourier}
                        onChange={(e) => setSelectedCourier(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-bold"
                      >
                        <option value="steadfast">Steadfast Courier</option>
                        <option value="pathao">Pathao Courier</option>
                      </select>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">Parcel Weight (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={parcelWeight}
                        onChange={(e) => setParcelWeight(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-mono font-bold"
                      />
                    </div>

                    {/* COD Amount */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">COD Amount to Collect (৳)</label>
                      <input
                        type="number"
                        value={codAmount}
                        onChange={(e) => setCodAmount(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-mono font-bold"
                      />
                    </div>

                    {/* Special Notes */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">Delivery Instructions</label>
                      <input
                        type="text"
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800"
                        placeholder="e.g. Fragile computer parts"
                      />
                    </div>
                  </div>

                  {/* Pathao-specific dropdowns */}
                  {selectedCourier === 'pathao' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">City *</label>
                        <select
                          value={pathaoCityId}
                          onChange={(e) => setPathaoCityId(e.target.value)}
                          className="w-full bg-slate-900 text-slate-200 p-2 rounded-lg border border-slate-800 text-xs"
                        >
                          {pathaoCities?.map(c => (
                            <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Zone *</label>
                        <select
                          value={pathaoZoneId}
                          onChange={(e) => setPathaoZoneId(e.target.value)}
                          disabled={loadingZones}
                          className="w-full bg-slate-900 text-slate-200 p-2 rounded-lg border border-slate-800 text-xs"
                        >
                          {pathaoZones?.map(z => (
                            <option key={z.zone_id} value={z.zone_id}>{z.zone_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Pickup Store</label>
                        <select
                          value={pathaoStoreId}
                          onChange={(e) => setPathaoStoreId(e.target.value)}
                          className="w-full bg-slate-900 text-slate-200 p-2 rounded-lg border border-slate-800 text-xs"
                        >
                          {pathaoStores?.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isBooking}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider transition flex items-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isBooking ? 'Booking Consignment...' : 'Book Parcel Consignment'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 3. ORDER ITEMS SNAPSHOT TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-black text-sm text-white uppercase border-b border-slate-800 pb-2">Order Line Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {order.items && order.items.map(item => (
                      <tr key={item.id}>
                        <td className="p-3 font-bold text-white max-w-xs">{item.product_name}</td>
                        <td className="p-3 font-mono text-slate-400">{item.sku_snapshot || item.product?.sku || 'N/A'}</td>
                        <td className="p-3 font-bold text-slate-200">৳{Number(item.price).toLocaleString()}</td>
                        <td className="p-3 font-bold text-amber-400">{item.quantity}</td>
                        <td className="p-3 text-right font-black text-white">৳{Number(item.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1.5 text-right font-semibold">
                <div className="text-slate-400">Subtotal: <span className="text-white font-bold">৳{Number(order.subtotal).toLocaleString()}</span></div>
                <div className="text-slate-400">Shipping ({order.district}): <span className="text-white font-bold">৳{Number(order.shipping_cost).toLocaleString()}</span></div>
                {Number(order.discount) > 0 && <div className="text-rose-400">Discount: <span>-৳{Number(order.discount).toLocaleString()}</span></div>}
                <div className="text-base font-black text-amber-400 border-t border-slate-800 pt-2">Grand Total: ৳{Number(order.total).toLocaleString()}</div>
              </div>
            </div>

            {/* 4. UPDATE ORDER STATUS FORM */}
            <form onSubmit={handleStatusUpdate} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-black text-sm text-white uppercase border-b border-slate-800 pb-2">Status Lifecycle Transition</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Status *</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500 font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Transition Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Consignment booked with Steadfast"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-lg uppercase shadow hover:bg-amber-400">
                  Update Order Status
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: CUSTOMER, PAYMENT & STATUS TIMELINE */}
          <div className="space-y-6">
            {/* CUSTOMER INFO */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="font-black text-sm text-white uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>Customer Profile</span>
                </span>
                <Link
                  href={`/admin/customers/fraud-checker?phone=${order.customer_phone}`}
                  className="text-[10px] font-bold text-rose-400 hover:underline flex items-center space-x-0.5"
                >
                  <span>Fraud History</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </h3>

              <div className="space-y-1">
                <div className="font-bold text-white text-sm">{order.customer_name}</div>
                <div className="text-slate-400">{order.customer_email}</div>
                <div className="font-mono text-amber-400 font-bold">{order.customer_phone}</div>
                <div className="text-slate-300 font-semibold pt-1">{order.district} District</div>
                <div className="text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-2">{order.shipping_address}</div>
              </div>
            </div>

            {/* PAYMENT INFORMATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="font-black text-sm text-white uppercase border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span>Payment Details</span>
              </h3>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-bold text-white">{order.payment_method_label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className={`font-bold uppercase ${order.payment_status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {order.payment_status || 'Pending'}
                  </span>
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">TrxID:</span>
                    <span className="text-white font-bold">{order.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* STATUS TIMELINE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="font-black text-sm text-white uppercase border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                <History className="w-4 h-4 text-amber-500" />
                <span>Status Timeline</span>
              </h3>
              <div className="space-y-3">
                {histories && histories.length > 0 ? (
                  histories.map(h => (
                    <div key={h.id} className="border-l-2 border-amber-500 pl-3 py-1 space-y-0.5">
                      <div className="font-bold text-white uppercase">{h.status}</div>
                      <div className="text-[11px] text-slate-400">{h.notes}</div>
                      <div className="text-[10px] text-slate-500">{new Date(h.created_at).toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No status timeline recorded yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FRAUD REVIEW MODAL */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-white text-base uppercase">Fraud Review Override</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitFraudReview} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Action *</label>
                  <select
                    value={fraudAction}
                    onChange={(e) => setFraudAction(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-bold"
                  >
                    <option value="approve">Approve Order (Clear for fulfillment)</option>
                    <option value="hold">Keep On Hold (Require customer verification)</option>
                    <option value="reject">Reject & Cancel Order</option>
                    <option value="override">Override Score Manually</option>
                  </select>
                </div>

                {fraudAction === 'override' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">New Score (0–100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-mono font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Audit Reason *</label>
                  <textarea
                    rows="3"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter reason for decision (e.g. Phone confirmed with customer)..."
                    className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Save Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
