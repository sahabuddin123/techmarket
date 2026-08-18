import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Search, Filter, ArrowUpRight, Clock, AlertOctagon, User, Phone, X
} from 'lucide-react';

export default function FraudReviews({ fraudChecks, filters, metrics }) {
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [search, setSearch] = useState(filters.search || '');

  // Review Action Modal State
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [action, setAction] = useState('approve');
  const [overrideScore, setOverrideScore] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/admin/customers/fraud-reviews', { status: statusFilter, search }, { preserveState: true, replace: true });
  };

  const handleOpenReviewModal = (check) => {
    setSelectedCheck(check);
    setAction(check.status === 'on_hold' ? 'approve' : 'hold');
    setOverrideScore(check.risk_score);
    setNotes('');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedCheck?.order_id) return;
    if (!notes.trim()) {
      alert('Please enter a review audit note explaining your decision.');
      return;
    }

    setIsSubmitting(true);
    router.post(`/admin/orders/${selectedCheck.order_id}/fraud-review`, {
      action,
      override_score: action === 'override' ? parseInt(overrideScore) : null,
      notes: notes.trim(),
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedCheck(null);
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  const getRiskBadge = (level, score) => {
    switch (level) {
      case 'critical':
        return <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-lg font-black text-[11px] uppercase tracking-wider">CRITICAL ({score}/100)</span>;
      case 'high':
        return <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-lg font-black text-[11px] uppercase tracking-wider">HIGH ({score}/100)</span>;
      case 'medium':
        return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg font-black text-[11px] uppercase tracking-wider">MEDIUM ({score}/100)</span>;
      default:
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg font-black text-[11px] uppercase tracking-wider">LOW ({score}/100)</span>;
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'on_hold':
        return <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold text-[10px] uppercase">ON HOLD</span>;
      case 'review_required':
        return <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full font-bold text-[10px] uppercase">REVIEW NEEDED</span>;
      case 'approved':
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[10px] uppercase">APPROVED</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full font-bold text-[10px] uppercase">REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full font-bold text-[10px] uppercase">{st}</span>;
    }
  };

  return (
    <AdminLayout title="Fraud Review & Hold Queue">
      <Head title="Fraud Review Queue - Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2.5">
              <ShieldAlert className="w-7 h-7 text-rose-500" />
              <span>Fraud Risk & Hold Review Queue</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Review flagged customer orders, inspect duplicate order warnings, approve valid orders or hold suspicious high-risk transactions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/customers/fraud-checker"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Customer Fraud Lookup</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Total Scanned</div>
            <div className="text-xl font-black text-white font-mono">{metrics?.total_analyzed || 0}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[10px] font-bold text-rose-400 uppercase">On Hold</div>
            <div className="text-xl font-black text-rose-400 font-mono">{metrics?.on_hold || 0}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[10px] font-bold text-orange-400 uppercase">Review Required</div>
            <div className="text-xl font-black text-orange-400 font-mono">{metrics?.review_required || 0}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[10px] font-bold text-rose-500 uppercase">Critical Risk</div>
            <div className="text-xl font-black text-rose-500 font-mono">{metrics?.critical || 0}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[10px] font-bold text-amber-400 uppercase">Medium / High</div>
            <div className="text-xl font-black text-amber-400 font-mono">{(metrics?.high || 0) + (metrics?.medium || 0)}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[10px] font-bold text-emerald-400 uppercase">Clean (Low Risk)</div>
            <div className="text-xl font-black text-emerald-400 font-mono">{metrics?.low || 0}</div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <form onSubmit={handleFilter} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'on_hold', label: 'On Hold', count: metrics?.on_hold },
              { id: 'review_required', label: 'Review Required', count: metrics?.review_required },
              { id: 'high_critical', label: 'High & Critical Risk' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setStatusFilter(tab.id); router.get('/admin/customers/fraud-reviews', { status: tab.id, search }, { preserveState: true }); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phone, customer, email..."
                className="w-full bg-slate-950 text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-800 text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Review Queue Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                  <th className="p-4">Order / Customer</th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4">Risk Reasons & Signals</th>
                  <th className="p-4">Duplicate Check</th>
                  <th className="p-4">Amount & Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fraudChecks?.data && fraudChecks.data.length > 0 ? (
                  fraudChecks.data.map((check) => (
                    <tr key={check.id} className="hover:bg-slate-800/40 transition">
                      {/* Order / Customer */}
                      <td className="p-4 space-y-1">
                        {check.order ? (
                          <Link href={`/admin/orders/${check.order_id}`} className="font-mono font-bold text-amber-400 hover:underline flex items-center space-x-1">
                            <span>#{check.order.order_number}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="font-mono text-slate-400">Order #{check.order_id}</span>
                        )}
                        <div className="font-bold text-white">{check.customer_name || 'Guest Customer'}</div>
                        <div className="font-mono text-[11px] text-slate-400 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{check.customer_phone}</span>
                        </div>
                      </td>

                      {/* Risk Level */}
                      <td className="p-4">
                        {getRiskBadge(check.risk_level, check.risk_score)}
                      </td>

                      {/* Risk Reasons & Signals */}
                      <td className="p-4 max-w-sm">
                        {check.reasons && check.reasons.length > 0 ? (
                          <div className="space-y-1">
                            {check.reasons.map((r, i) => (
                              <div key={i} className="text-[11px] text-rose-300 line-clamp-1 font-semibold">
                                {r}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-semibold text-[11px]">✓ No suspicious risk penalties</span>
                        )}
                      </td>

                      {/* Duplicate Check */}
                      <td className="p-4">
                        {check.is_duplicate ? (
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[10px] font-black uppercase flex items-center space-x-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            <span>DUPLICATE ORDER</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unique</span>
                        )}
                      </td>

                      {/* Amount & Payment */}
                      <td className="p-4 space-y-0.5">
                        <div className="font-mono font-bold text-white">
                          ৳{Number(check.order?.total || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          {check.order?.payment_method_label || check.order?.payment_method || 'COD'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {getStatusBadge(check.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(check)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-xs transition"
                        >
                          Review & Action
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 font-semibold">
                      No orders found in the review queue for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REVIEW MODAL / DRAWER */}
        {selectedCheck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-white text-base uppercase">Fraud Review Decision</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCheck(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary of Order Under Review */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order:</span>
                  <span className="font-bold text-white font-mono">#{selectedCheck.order?.order_number || selectedCheck.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-bold text-white">{selectedCheck.customer_name} ({selectedCheck.customer_phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Risk Score:</span>
                  <span className="font-black font-mono text-amber-400">{selectedCheck.risk_score} / 100 ({selectedCheck.risk_level})</span>
                </div>
              </div>

              {/* Decision Action Form */}
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Select Action *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAction('approve')}
                      className={`p-3 rounded-xl border font-bold text-left transition ${
                        action === 'approve'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Approve Order</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Mark safe for dispatch</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAction('hold')}
                      className={`p-3 rounded-xl border font-bold text-left transition ${
                        action === 'hold'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Keep On Hold</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Wait for verification</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAction('reject')}
                      className={`p-3 rounded-xl border font-bold text-left transition ${
                        action === 'reject'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Reject & Block</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Cancel suspicious order</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAction('override')}
                      className={`p-3 rounded-xl border font-bold text-left transition ${
                        action === 'override'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span>Override Score</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Manual score adjustment</div>
                    </button>
                  </div>
                </div>

                {action === 'override' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">New Risk Score (0 - 100)</label>
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
                  <label className="block text-slate-300 font-bold mb-1.5">Admin Review Audit Note *</label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter reason for this fraud action (e.g. 'Customer called and verified address', 'Confirmed phone unreachable')..."
                    className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800 focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCheck(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Confirm Decision'}
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
