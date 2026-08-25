import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Search, Filter, ArrowUpRight, Clock, AlertOctagon, User, Phone, Edit 
} from 'lucide-react';

export default function FraudReviews({ fraudChecks = { data: [] }, filters = {}, metrics = {} }) {
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [search, setSearch] = useState(filters.search || '');
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [action, setAction] = useState('approve');
  const [overrideScore, setOverrideScore] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [density, setDensity] = useState('comfortable');

  const checkList = Array.isArray(fraudChecks?.data) ? fraudChecks.data : [];

  const handleFilter = (st) => {
    setStatusFilter(st);
    router.get('/admin/customers/fraud-reviews', { 
      status: st !== 'all' ? st : undefined, 
      search: search || undefined 
    }, { preserveState: true, replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.get('/admin/customers/fraud-reviews', { 
      status: statusFilter !== 'all' ? statusFilter : undefined, 
      search: search || undefined 
    }, { preserveState: true, replace: true });
  };

  const handleOpenReviewModal = (check) => {
    setSelectedCheck(check);
    setAction(check.status === 'on_hold' ? 'approve' : 'hold');
    setOverrideScore(check.risk_score || 0);
    setNotes('');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedCheck?.order_id) return;
    if (!notes.trim()) return;

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

  const columns = [
    {
      header: 'Order # & Customer',
      accessor: 'order_number',
      render: (c) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {c.order?.order_number || `Order #${c.order_id}`}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            {c.order?.customer_name || 'Guest'} • {c.order?.customer_phone || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Order Amount',
      accessor: 'order_amount',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
          ৳{Number(c.order?.total || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Risk Score & Level',
      accessor: 'risk_score',
      render: (c) => (
        <AdminStatusBadge
          status={c.risk_level === 'critical' ? 'danger' : c.risk_level === 'high' ? 'warning' : 'draft'}
          label={`${c.risk_level?.toUpperCase()} (${c.risk_score}/100)`}
          size="xs"
        />
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (c) => (
        <AdminStatusBadge
          status={c.status === 'approved' ? 'active' : c.status === 'on_hold' ? 'pending' : 'danger'}
          label={c.status ? c.status.replace('_', ' ') : 'Pending'}
          size="xs"
        />
      ),
    },
    {
      header: 'Audit Date',
      accessor: 'created_at',
      render: (c) => (
        <span className="font-mono text-slate-400 text-xs">
          {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      align: 'right',
      render: (c) => (
        <button
          type="button"
          onClick={() => handleOpenReviewModal(c)}
          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Audit Review</span>
        </button>
      ),
    },
  ];

  return (
    <AdminShell title="Fraud Review Queue">
      <Head title="Fraud Review Queue - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Anti-Fraud Manual Review Queue"
          subtitle="Audit high-risk customer checkout orders placed on hold before warehouse dispatch."
          badge={`${fraudChecks.total || checkList.length} Orders in Queue`}
          actions={
            <Link
              href="/admin/customers/fraud-checker"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Customer Lookup</span>
            </Link>
          }
        />

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Pending Audit"
            value={metrics.pending_reviews || 0}
            icon={Clock}
            color="amber"
          />
          <AdminKpiCard
            title="Critical Risk"
            value={metrics.critical_count || 0}
            icon={ShieldAlert}
            color="rose"
          />
          <AdminKpiCard
            title="Approved (Manual)"
            value={metrics.approved_count || 0}
            icon={ShieldCheck}
            color="emerald"
          />
          <AdminKpiCard
            title="Blocked / Cancelled"
            value={metrics.cancelled_count || 0}
            icon={XCircle}
            color="purple"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {['all', 'on_hold', 'flagged', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone or order #..."
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={checkList}
          pagination={fraudChecks}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="Fraud queue clear"
          emptyDescription="No flagged orders are pending manual audit verification."
        />
      </div>

      {/* Audit Modal */}
      {selectedCheck && (
        <AdminModal
          isOpen={Boolean(selectedCheck)}
          onClose={() => setSelectedCheck(null)}
          title={`Manual Audit: Order #${selectedCheck.order?.order_number || selectedCheck.order_id}`}
          subtitle={`Risk Score: ${selectedCheck.risk_score}/100 • Customer: ${selectedCheck.order?.customer_name || 'Guest'}`}
          icon={ShieldAlert}
          size="md"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedCheck(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmitting || !notes.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Submit Audit Decision'}
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Decision Action *</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              >
                <option value="approve">Approve & Release to Warehouse Fulfillment</option>
                <option value="hold">Keep On Hold (Requires Follow-up Call)</option>
                <option value="reject">Cancel Order & Block Customer Phone</option>
                <option value="override">Override AI Score Manually</option>
              </select>
            </div>

            {action === 'override' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">New Risk Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Audit Log Reason / Notes *</label>
              <textarea
                rows={3}
                required
                placeholder="Document verification phone call, customer address confirmation, or rationale..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
          </div>
        </AdminModal>
      )}
    </AdminShell>
  );
}
