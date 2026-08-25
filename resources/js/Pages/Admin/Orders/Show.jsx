import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import { 
  Package, User, MapPin, CreditCard, Truck, History, CheckCircle, 
  Clock, ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, XCircle, 
  Send, ExternalLink, ArrowUpRight, DollarSign, Boxes, FileText
} from 'lucide-react';
import axios from 'axios';

export default function AdminOrderShow({ 
  order = {}, 
  histories = [], 
  payments = [], 
  refunds = [], 
  shipments = [], 
  fraudCheck = {}, 
  availableCouriers = [], 
  pathaoStores = [], 
  pathaoCities = [] 
}) {
  const [orderStatus, setOrderStatus] = useState(order.status || 'Pending');
  const [statusNotes, setStatusNotes] = useState('');

  // Courier Booking State
  const [selectedCourier, setSelectedCourier] = useState(
    availableCouriers?.find(c => c.enabled)?.identifier || 'steadfast'
  );
  const [parcelWeight, setParcelWeight] = useState('0.5');
  const [codAmount, setCodAmount] = useState(
    order.payment_method === 'cod' ? String(order.total || 0) : '0'
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
    <AdminShell title={`Order #${order.order_number || order.id}`} breadcrumbs={[
      { label: 'Orders', href: '/admin/orders' },
      { label: `#${order.order_number || order.id}` }
    ]}>
      <Head title={`Order #${order.order_number || order.id} - TechMarket Admin`} />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title={`Order #${order.order_number || order.id}`}
          subtitle={`Placed on ${order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}`}
          badge={order.status || 'Pending'}
          backUrl="/admin/orders"
          actions={
            <div className="flex items-center space-x-2">
              <a
                href={`/invoice/${order.order_number || order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </a>
              <AdminStatusBadge status={order.status} size="md" />
            </div>
          }
        />

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Grand Total"
            value={`৳ ${Number(order.total || 0).toLocaleString()}`}
            description={`Subtotal: ৳ ${Number(order.subtotal || 0).toLocaleString()}`}
            icon={DollarSign}
            color="indigo"
          />

          <AdminKpiCard
            title="Payment Method"
            value={order.payment_method_label || order.payment_method || 'COD'}
            description={`Status: ${order.payment_status || 'Pending'}`}
            icon={CreditCard}
            color="emerald"
          />

          <AdminKpiCard
            title="Total Order Items"
            value={`${(order.items || []).length} Items`}
            description={`Shipping: ${order.district || 'Dhaka'}`}
            icon={Boxes}
            color="blue"
          />

          <AdminKpiCard
            title="Fraud Score"
            value={`${fraudCheck?.risk_score || 0} / 100`}
            description={`Risk: ${fraudCheck?.risk_level || 'Low'}`}
            icon={ShieldCheck}
            color={fraudCheck?.risk_score >= 50 ? 'rose' : 'purple'}
          />
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Order Items, Courier Dispatch & Fraud Intelligence */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. ORDER ITEMS SNAPSHOT TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Order Items Snapshot</span>
                <span className="text-xs font-mono font-normal text-slate-400">{(order.items || []).length} Line Items</span>
              </h3>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 dark:border-slate-800 font-mono">
                      <th className="p-3">Product Name & Specs</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {(order.items || []).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100 max-w-xs">{item.product_name}</td>
                        <td className="p-3 font-mono text-slate-400">{item.sku_snapshot || item.product?.sku || 'N/A'}</td>
                        <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-200">৳ {Number(item.price).toLocaleString()}</td>
                        <td className="p-3 text-center font-bold font-mono text-indigo-600 dark:text-indigo-400">{item.quantity}</td>
                        <td className="p-3 text-right font-black font-mono text-slate-900 dark:text-slate-100">৳ {Number(item.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Totals Summary */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-right font-medium text-xs">
                <div className="text-slate-500">Subtotal: <span className="text-slate-900 dark:text-slate-100 font-bold font-mono">৳ {Number(order.subtotal || 0).toLocaleString()}</span></div>
                <div className="text-slate-500">Shipping ({order.district || 'Standard'}): <span className="text-slate-900 dark:text-slate-100 font-bold font-mono">৳ {Number(order.shipping_cost || 0).toLocaleString()}</span></div>
                {Number(order.discount || 0) > 0 && <div className="text-rose-500">Discount: <span className="font-mono font-bold">-৳ {Number(order.discount).toLocaleString()}</span></div>}
                <div className="text-sm font-black text-slate-900 dark:text-slate-100 border-t border-slate-100 dark:border-slate-800 pt-2 font-mono">Grand Total: ৳ {Number(order.total || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* 2. COURIER LOGISTICS & DISPATCH CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Courier Delivery & Consignment</h3>
                </div>

                {latestShipment && (
                  <AdminStatusBadge status={latestShipment.internal_status || latestShipment.courier_status} size="xs" />
                )}
              </div>

              {latestShipment ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono">
                          {latestShipment.courier_provider}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {latestShipment.tracking_code || latestShipment.consignment_id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Booked on {new Date(latestShipment.booked_at || latestShipment.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleTrackSync(latestShipment.id)}
                        disabled={trackingLoading}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${trackingLoading ? 'animate-spin' : ''}`} />
                        <span>Sync Tracking</span>
                      </button>

                      {latestShipment.internal_status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleCancelShipment(latestShipment.id)}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl font-bold text-xs transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold">Consignment ID</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{latestShipment.consignment_id || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold">COD Amount</div>
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">৳ {Number(latestShipment.cod_amount).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold">Parcel Weight</div>
                      <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{latestShipment.parcel_weight} kg</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold">Delivery State</div>
                      <div className="font-bold text-emerald-600 uppercase">{latestShipment.courier_status}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookCourier} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Courier Provider *</label>
                      <select
                        value={selectedCourier}
                        onChange={(e) => setSelectedCourier(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
                      >
                        <option value="steadfast">Steadfast Courier</option>
                        <option value="pathao">Pathao Courier</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Parcel Weight (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={parcelWeight}
                        onChange={(e) => setParcelWeight(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">COD Amount (৳)</label>
                      <input
                        type="number"
                        value={codAmount}
                        onChange={(e) => setCodAmount(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Delivery Notes</label>
                      <input
                        type="text"
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                        placeholder="e.g. Fragile hardware"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isBooking}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isBooking ? 'Booking Consignment...' : 'Book Parcel Consignment'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 3. LIFECYCLE STATUS TRANSITION */}
            <form onSubmit={handleStatusUpdate} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading border-b border-slate-100 dark:border-slate-800 pb-3">
                Update Fulfillment Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Status *</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
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
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Transition Audit Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched to courier hub"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Status Transition
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Customer Profile, Payment & Timeline */}
          <div className="space-y-6">
            {/* Customer Profile Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Customer Profile</span>
                </span>
                <Link
                  href={`/admin/customers/fraud-checker?phone=${order.customer_phone || ''}`}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-0.5"
                >
                  <span>Risk Intel</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm font-heading">{order.customer_name}</div>
                <div className="text-slate-500">{order.customer_email}</div>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{order.customer_phone}</div>
                <div className="text-slate-600 dark:text-slate-300 font-medium pt-1">{order.district} District</div>
                <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mt-2 leading-relaxed">
                  {order.shipping_address}
                </div>
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Payment Information</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Method:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{order.payment_method_label || order.payment_method || 'COD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payment State:</span>
                  <AdminStatusBadge status={order.payment_status === 'Paid' ? 'paid' : 'pending'} size="xs" />
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{order.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center space-x-1.5">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Order Timeline</span>
              </h3>
              <div className="space-y-3">
                {histories && histories.length > 0 ? (
                  histories.map(h => (
                    <div key={h.id} className="border-l-2 border-indigo-600 dark:border-indigo-400 pl-3 py-1 space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs font-mono">{h.status}</div>
                      <div className="text-[11px] text-slate-500">{h.notes}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{new Date(h.created_at).toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">No status timeline recorded yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Review Override Modal */}
      <AdminModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Fraud Review Override"
        subtitle={`Order #${order.order_number || order.id}`}
        icon={ShieldCheck}
        size="md"
        footer={
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitFraudReview}
              disabled={reviewSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {reviewSubmitting ? 'Saving...' : 'Save Decision'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Decision *</label>
            <select
              value={fraudAction}
              onChange={(e) => setFraudAction(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            >
              <option value="approve">Approve Order (Clear for fulfillment)</option>
              <option value="hold">Keep On Hold (Require customer verification)</option>
              <option value="reject">Reject & Cancel Order</option>
              <option value="override">Override Score Manually</option>
            </select>
          </div>

          {fraudAction === 'override' && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">New Risk Score (0–100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold focus:outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Audit Reason / Evidence *</label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Explain reason for decision (e.g. Verified customer identity via phone call)..."
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
            />
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
