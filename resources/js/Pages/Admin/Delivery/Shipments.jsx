import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Truck, Package, Search, Filter, RefreshCw, XCircle, 
  ExternalLink, CheckCircle2, Clock, AlertTriangle, ArrowUpRight,
  TrendingUp, Building2
} from 'lucide-react';

export default function Shipments({ shipments, filters, metrics, providers }) {
  const [provider, setProvider] = useState(filters.provider || '');
  const [status, setStatus] = useState(filters.status || '');
  const [search, setSearch] = useState(filters.search || '');
  const [syncingId, setSyncingId] = useState(null);

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/admin/shipments', { provider, status, search }, { preserveState: true, replace: true });
  };

  const handleTrackSync = (shipmentId) => {
    setSyncingId(shipmentId);
    router.post(`/admin/shipments/${shipmentId}/track`, {}, {
      preserveScroll: true,
      onFinish: () => setSyncingId(null)
    });
  };

  const handleCancelShipment = (shipmentId) => {
    if (confirm('Are you sure you want to cancel this courier parcel consignment?')) {
      router.post(`/admin/shipments/${shipmentId}/cancel`, {}, { preserveScroll: true });
    }
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    if (s.includes('deliver') || s === 'completed') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Delivered</span>;
    }
    if (s.includes('transit') || s.includes('dispatch') || s.includes('pickup')) {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">In Transit</span>;
    }
    if (s.includes('return')) {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">Returned</span>;
    }
    if (s.includes('cancel')) {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">Cancelled</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">{st || 'Booked'}</span>;
  };

  return (
    <AdminLayout title="Shipments & Courier Logistics">
      <Head title="Shipments Management - Admin" />

      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2.5">
              <Truck className="w-7 h-7 text-amber-500" />
              <span>Shipments & Courier Consignments</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Real-time courier dispatch ledger, live parcel tracking, and fulfillment operations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/settings/courier"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Courier API Settings</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Shipments</div>
            <div className="text-2xl font-black text-white font-mono">{metrics?.total || 0}</div>
            <div className="text-[10px] text-slate-500">All registered parcels</div>
          </div>

          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-amber-400 uppercase">In Transit</div>
            <div className="text-2xl font-black text-amber-400 font-mono">{metrics?.in_transit || 0}</div>
            <div className="text-[10px] text-slate-500">Out for delivery / Hub</div>
          </div>

          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-emerald-400 uppercase">Delivered</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{metrics?.delivered || 0}</div>
            <div className="text-[10px] text-slate-500">Successfully completed</div>
          </div>

          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-rose-400 uppercase">Returned / Cancelled</div>
            <div className="text-2xl font-black text-rose-400 font-mono">{(metrics?.returned || 0) + (metrics?.cancelled || 0)}</div>
            <div className="text-[10px] text-slate-500">Return & cancellation issues</div>
          </div>

          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-lg col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-blue-400 uppercase">Steadfast / Pathao Rate</div>
            <div className="text-lg font-black text-white font-mono flex items-center space-x-2">
              <span className="text-emerald-400">{metrics?.steadfast_rate}%</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400">{metrics?.pathao_rate}%</span>
            </div>
            <div className="text-[10px] text-slate-500">Fulfillment Success Rate</div>
          </div>
        </div>

        {/* Filters & Search */}
        <form onSubmit={handleFilter} className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tracking Code, Consignment ID, Recipient Name or Phone..."
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 focus:border-amber-500 text-xs"
            />
          </div>

          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-200 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold"
          >
            <option value="">All Providers</option>
            <option value="steadfast">Steadfast Courier</option>
            <option value="pathao">Pathao Courier</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-200 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold"
          >
            <option value="">All Statuses</option>
            <option value="booked">Booked</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Filter
          </button>
        </form>

        {/* Shipments Table */}
        <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase text-[10px] font-black border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="p-4">Consignment Info</th>
                  <th className="p-4">Order Reference</th>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">COD / Charge</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Booked Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shipments?.data && shipments.data.length > 0 ? (
                  shipments.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      {/* Consignment Info */}
                      <td className="p-4 space-y-1">
                        <div className="font-mono font-bold text-white flex items-center space-x-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.tracking_code || item.consignment_id || 'N/A'}</span>
                        </div>
                        {item.consignment_id && item.consignment_id !== item.tracking_code && (
                          <div className="font-mono text-[10px] text-slate-400">CID: {item.consignment_id}</div>
                        )}
                      </td>

                      {/* Order Reference */}
                      <td className="p-4">
                        {item.order ? (
                          <Link
                            href={`/admin/orders/${item.order_id}`}
                            className="font-bold text-amber-400 hover:underline flex items-center space-x-1"
                          >
                            <span>#{item.order.order_number}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-500 font-mono">Order #{item.order_id}</span>
                        )}
                      </td>

                      {/* Recipient */}
                      <td className="p-4 space-y-0.5">
                        <div className="font-bold text-white">{item.recipient_name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{item.recipient_phone}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{item.recipient_address}</div>
                      </td>

                      {/* Provider Badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                          item.courier_provider === 'steadfast'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.courier_provider === 'pathao'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          {item.courier_provider}
                        </span>
                      </td>

                      {/* COD / Charge */}
                      <td className="p-4 space-y-0.5">
                        <div className="font-bold text-white font-mono">৳{Number(item.cod_amount).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Fee: ৳{Number(item.delivery_charge).toLocaleString()} ({item.parcel_weight}kg)</div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {getStatusBadge(item.internal_status || item.courier_status)}
                      </td>

                      {/* Booked Date */}
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {new Date(item.booked_at || item.created_at).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleTrackSync(item.id)}
                          disabled={syncingId === item.id}
                          className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-800 text-amber-400 border border-slate-200/80 dark:border-slate-800/80 rounded-lg transition disabled:opacity-50 inline-flex items-center"
                          title="Refresh Tracking"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === item.id ? 'animate-spin' : ''}`} />
                        </button>

                        {item.internal_status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleCancelShipment(item.id)}
                            className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-rose-500/10 text-rose-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-500/30 rounded-lg transition inline-flex items-center"
                            title="Cancel Parcel"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500 font-semibold">
                      No courier shipments found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
