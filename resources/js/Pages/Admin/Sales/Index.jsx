import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import {
  FileText, ShoppingBag, DollarSign, Calendar, User, Eye,
  ArrowDownLeft, Clock, CheckCircle2, RotateCcw, Plus, Filter,
  Building, CreditCard
} from 'lucide-react';

export default function AdminSalesIndex({
  sales = { data: [] },
  metrics = {},
  filters = {}
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');
  const [salesChannel, setSalesChannel] = useState(filters.sales_channel || '');
  const [density, setDensity] = useState('comfortable');

  const saleList = Array.isArray(sales?.data) ? sales.data : [];

  const handleFilterSubmit = (newFilters = {}) => {
    router.get('/admin/sales', {
      search: search || undefined,
      status: status || undefined,
      payment_status: paymentStatus || undefined,
      sales_channel: salesChannel || undefined,
      ...newFilters
    }, { preserveState: true, replace: true });
  };

  const tableColumns = [
    {
      header: 'Sale Number & Date',
      accessor: 'sale_number',
      sortable: true,
      render: (sale) => (
        <div className="space-y-0.5">
          <Link
            href={`/admin/sales/${sale.id}`}
            className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:underline block"
          >
            {sale.sale_number}
          </Link>
          <div className="text-[10.5px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            <span>{new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Customer Details',
      accessor: 'customer_name',
      render: (sale) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {sale.customer_name}
          </div>
          <div className="text-[10.5px] font-mono text-slate-400">
            {sale.customer_phone || (sale.customer?.email ?? 'Direct Sale')}
          </div>
        </div>
      ),
    },
    {
      header: 'Channel',
      accessor: 'sales_channel',
      render: (sale) => (
        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {sale.sales_channel}
        </span>
      ),
    },
    {
      header: 'Items',
      accessor: 'items_count',
      render: (sale) => (
        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
          {sale.items?.length || 0} Units
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (sale) => (
        <AdminStatusBadge
          status={sale.status}
          size="xs"
        />
      ),
    },
    {
      header: 'Payment Status',
      accessor: 'payment_status',
      render: (sale) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          sale.payment_status === 'paid'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : sale.payment_status === 'partially_paid'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
        }`}>
          {sale.payment_status.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Grand Total (BDT)',
      accessor: 'grand_total',
      align: 'right',
      sortable: true,
      render: (sale) => (
        <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
          ৳ {Number(sale.grand_total).toLocaleString()}
          {Number(sale.due_amount) > 0 && (
            <div className="text-[10px] text-rose-500 font-normal">
              Due: ৳{Number(sale.due_amount).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (sale) => (
        <Link
          href={`/admin/sales/${sale.id}`}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 text-xs font-bold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </Link>
      ),
    },
  ];

  return (
    <AdminShell title="Sales Operations">
      <Head title="Sales Orders - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Sales Management"
          subtitle="Commercial sales orders, POS receipts, credit balances, and customer returns."
          badge={`${metrics.total_sales_count || 0} Orders`}
          actions={
            <Link
              href="/admin/pos"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Launch POS Terminal</span>
            </Link>
          }
        />

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Total Revenue"
            value={`৳ ${(metrics.total_revenue || 0).toLocaleString()}`}
            icon="DollarSign"
            variant="indigo"
          />
          <AdminKpiCard
            title="Today's Sales"
            value={`৳ ${(metrics.today_revenue || 0).toLocaleString()}`}
            icon="TrendingUp"
            variant="emerald"
          />
          <AdminKpiCard
            title="Collected Cash"
            value={`৳ ${(metrics.total_collected || 0).toLocaleString()}`}
            icon="CheckCircle2"
            variant="sky"
          />
          <AdminKpiCard
            title="Receivables / Due"
            value={`৳ ${(metrics.total_due || 0).toLocaleString()}`}
            icon="AlertCircle"
            variant="amber"
          />
        </div>

        {/* Toolbar & Filters */}
        <AdminPageToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            handleFilterSubmit({ search: val || undefined });
          }}
          searchPlaceholder="Search sale #, customer name, phone..."
          onRefresh={() => router.get('/admin/sales')}
        >
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilterSubmit({ status: e.target.value || undefined });
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={salesChannel}
              onChange={(e) => {
                setSalesChannel(e.target.value);
                handleFilterSubmit({ sales_channel: e.target.value || undefined });
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="">All Channels</option>
              <option value="pos">POS</option>
              <option value="web">Web Storefront</option>
              <option value="walk_in">Walk-in</option>
              <option value="corporate_quote">Corporate</option>
            </select>
          </div>
        </AdminPageToolbar>

        {/* Sales Data Table */}
        <AdminTable
          columns={tableColumns}
          data={saleList}
          pagination={sales}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No Sales Found"
          emptyDescription="Sales generated via POS or ecommerce will appear here."
        />
      </div>
    </AdminShell>
  );
}
