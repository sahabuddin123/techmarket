import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  ShieldAlert, Search, CheckCircle2, AlertTriangle, AlertCircle, 
  History, Truck, Package, User, ArrowUpRight, Phone, Mail, Award, XCircle
} from 'lucide-react';

export default function FraudChecker({ searchQuery, searchPhone, matchedOrder, customerProfile, recentChecks }) {
  const [query, setQuery] = useState(searchQuery || searchPhone || '');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.get('/admin/customers/fraud-checker', { search: query.trim() }, { preserveState: true });
  };

  const getRiskBadge = (level, score) => {
    switch (level) {
      case 'critical':
        return <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full font-black text-xs uppercase tracking-wider">CRITICAL RISK ({score}/100)</span>;
      case 'high':
        return <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full font-black text-xs uppercase tracking-wider">HIGH RISK ({score}/100)</span>;
      case 'medium':
        return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full font-black text-xs uppercase tracking-wider">MEDIUM RISK ({score}/100)</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-black text-xs uppercase tracking-wider">LOW RISK ({score}/100)</span>;
    }
  };

  return (
    <AdminLayout title="Customer Fraud Intelligence & Profile Lookup">
      <Head title="Fraud Checker - Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2.5">
              <ShieldAlert className="w-7 h-7 text-rose-500" />
              <span>Customer Fraud Intelligence Lookup</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Search by customer phone number, order number, or customer name to calculate risk scores, courier delivery history, and fraud signals.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/customers/fraud-reviews"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Pending Reviews Queue</span>
            </Link>
            <Link
              href="/admin/settings/fraud"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2"
            >
              <span>Rule Weights & Settings</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer phone (e.g. 017...), order # (e.g. TMB-...), or customer name..."
              className="w-full bg-slate-950 text-slate-100 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:border-rose-500 font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Check Fraud Profile</span>
          </button>
        </form>

        {/* Matched Order Alert Banner if search was by order */}
        {matchedOrder && (
          <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 text-indigo-300">
              <Package className="w-4 h-4 text-indigo-400" />
              <span>Matching Order: <strong className="text-white font-mono">{matchedOrder.order_number}</strong> (Status: {matchedOrder.status}, Total: ৳{Number(matchedOrder.total).toLocaleString()})</span>
            </div>
            <Link
              href={`/admin/orders/${matchedOrder.id}`}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-xs"
            >
              Open Order Workspace →
            </Link>
          </div>
        )}

        {/* Profile Results */}
        {customerProfile ? (
          <div className="space-y-6">
            {/* Top Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-black text-white font-mono">{customerProfile.phone}</h2>
                    {getRiskBadge(customerProfile.risk_level, customerProfile.risk_score)}
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                    <span className="font-semibold text-slate-200">Customer: {customerProfile.customer_name}</span>
                    {customerProfile.customer_email && <span>Email: {customerProfile.customer_email}</span>}
                    {customerProfile.user && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-bold">
                        Registered User #{customerProfile.user.id}
                      </span>
                    )}
                  </div>
                  {customerProfile.recommended_action && (
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center space-x-2">
                      <strong className="text-amber-400 uppercase font-black tracking-wider text-[10px]">Recommendation:</strong>
                      <span>{customerProfile.recommended_action}</span>
                    </div>
                  )}
                </div>

                {/* Score Dial / Bar */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Risk Score</div>
                    <div className="text-2xl font-black font-mono text-white">{customerProfile.risk_score} <span className="text-xs text-slate-500">/ 100</span></div>
                  </div>
                  <div className="w-24 bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        customerProfile.risk_score >= 75 ? 'bg-rose-500' :
                        customerProfile.risk_score >= 50 ? 'bg-orange-500' :
                        customerProfile.risk_score >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${customerProfile.risk_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Total Orders</div>
                  <div className="text-xl font-black text-white font-mono mt-1">{customerProfile.total_orders}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="text-emerald-400 font-bold uppercase text-[10px]">Delivered & Completed</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-1">{customerProfile.delivered_orders} ({customerProfile.success_rate}%)</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="text-rose-400 font-bold uppercase text-[10px]">Returned Shipments</div>
                  <div className="text-xl font-black text-rose-400 font-mono mt-1">{customerProfile.returned_shipments} ({customerProfile.return_rate}%)</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="text-amber-400 font-bold uppercase text-[10px]">Cancelled Orders</div>
                  <div className="text-xl font-black text-amber-400 font-mono mt-1">{customerProfile.cancelled_orders} ({customerProfile.cancel_rate}%)</div>
                </div>
              </div>
            </div>

            {/* Signals Grid: Positive vs Negative */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Warnings & Risk Signals */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <h3 className="text-sm font-black text-rose-400 uppercase flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Risk Warnings & Penalty Factors</span>
                </h3>
                {customerProfile.reasons && customerProfile.reasons.length > 0 ? (
                  <div className="space-y-2">
                    {customerProfile.reasons.map((r, i) => (
                      <div key={i} className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold">
                        {r}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl text-slate-500 text-xs text-center">
                    ✓ No negative risk flags detected for this customer.
                  </div>
                )}
              </div>

              {/* Trust Signals */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <h3 className="text-sm font-black text-emerald-400 uppercase flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>Positive Trust Factors</span>
                </h3>
                {customerProfile.positive_signals && customerProfile.positive_signals.length > 0 ? (
                  <div className="space-y-2">
                    {customerProfile.positive_signals.map((p, i) => (
                      <div key={i} className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold">
                        {p}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl text-slate-500 text-xs text-center">
                    New customer (no historical delivery trust factors yet).
                  </div>
                )}
              </div>
            </div>

            {/* Order History Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-500" />
                <span>Order History ({customerProfile.orders?.length || 0})</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                      <th className="p-3">Order #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Courier</th>
                      <th className="p-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {customerProfile.orders && customerProfile.orders.length > 0 ? (
                      customerProfile.orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-bold text-white">#{ord.order_number}</td>
                          <td className="p-3 text-slate-400">{new Date(ord.created_at).toLocaleDateString()}</td>
                          <td className="p-3 font-bold text-slate-300">{ord.payment_method_label || ord.payment_method}</td>
                          <td className="p-3 font-mono font-bold text-white">৳{Number(ord.total).toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                              ord.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{ord.courier_provider || 'N/A'}</td>
                          <td className="p-3 text-right">
                            <Link href={`/admin/orders/${ord.id}`} className="text-amber-400 hover:underline font-bold inline-flex items-center space-x-1">
                              <span>Open</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-slate-500">No previous orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : searchPhone ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <User className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">No Customer Records Found</h3>
            <p className="text-xs max-w-sm mx-auto">No previous orders or account profiles were found for phone number {searchPhone}.</p>
          </div>
        ) : (
          /* Recent Fraud Checks Overview */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase flex items-center space-x-2">
              <History className="w-4 h-4 text-amber-500" />
              <span>Recent System Fraud Scans</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                    <th className="p-3">Customer Phone</th>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Risk Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Scanned At</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentChecks && recentChecks.length > 0 ? (
                    recentChecks.map((chk) => (
                      <tr key={chk.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-white">{chk.customer_phone}</td>
                        <td className="p-3">
                          {chk.order ? (
                            <Link href={`/admin/orders/${chk.order_id}`} className="text-amber-400 hover:underline font-bold">
                              #{chk.order.order_number}
                            </Link>
                          ) : 'Lookup'}
                        </td>
                        <td className="p-3">
                          {getRiskBadge(chk.risk_level, chk.risk_score)}
                        </td>
                        <td className="p-3 font-bold uppercase text-[11px] text-slate-300">
                          {chk.status}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px] font-mono">
                          {new Date(chk.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => { setPhone(chk.customer_phone); router.get('/admin/customers/fraud-checker', { phone: chk.customer_phone }); }}
                            className="text-amber-400 hover:underline font-bold"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-500">No fraud checks recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
