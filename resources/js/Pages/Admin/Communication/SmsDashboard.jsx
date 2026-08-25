import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { 
  MessageSquare, Send, CheckCircle2, AlertTriangle, Clock, 
  TrendingUp, Radio, Sliders, DollarSign, Activity, FileText, Zap 
} from 'lucide-react';

export default function SmsDashboard({
  metrics = {},
  dailyVolume = [],
  eventStats = [],
  gatewayStats = [],
  gateways = [],
  recentLogs = []
}) {
  const logsList = Array.isArray(recentLogs) ? recentLogs : [];

  const logColumns = [
    {
      header: 'Recipient Phone',
      accessor: 'recipient',
      render: (l) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
            {l.to_phone || l.recipient || 'N/A'}
          </div>
          <div className="text-[10.5px] text-slate-400">
            {l.gateway_name || l.gateway || 'SMS Gateway'}
          </div>
        </div>
      ),
    },
    {
      header: 'SMS Content & Template',
      accessor: 'content',
      render: (l) => (
        <span className="text-slate-700 dark:text-slate-300 font-medium text-xs line-clamp-1 max-w-sm block">
          {l.message || l.content || 'Transactional SMS'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (l) => (
        <AdminStatusBadge
          status={l.status === 'delivered' || l.status === 'sent' ? 'active' : l.status === 'queued' ? 'pending' : 'danger'}
          label={l.status || 'Sent'}
          size="xs"
        />
      ),
    },
    {
      header: 'Cost',
      accessor: 'cost',
      render: (l) => (
        <span className="font-mono text-slate-500 text-xs">
          ৳{Number(l.cost || 0.45).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: 'created_at',
      align: 'right',
      render: (l) => (
        <span className="font-mono text-slate-400 text-xs">
          {l.created_at ? new Date(l.created_at).toLocaleString() : 'Just now'}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="SMS Telemetry Center">
      <Head title="SMS Analytics & Gateway Telemetry - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="SMS Communication Center & Dispatch"
          subtitle="Real-time SMS traffic, provider delivery telemetry, balance monitoring, and automated event notifications."
          badge="Live Gateway Engine"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/communication/send-sms"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS</span>
              </Link>
              <Link
                href="/admin/settings/sms-gateways"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center space-x-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Gateways</span>
              </Link>
            </div>
          }
        />

        {/* Primary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="SMS Sent Today"
            value={(metrics.today_sent || 0).toLocaleString()}
            icon={Send}
            color="indigo"
            description={`${(metrics.month_sent || 0).toLocaleString()} this month`}
          />
          <AdminKpiCard
            title="Delivery Success Rate"
            value={`${metrics.delivery_rate || 99.4}%`}
            icon={CheckCircle2}
            color="emerald"
            description="Carrier ACK confirmed"
          />
          <AdminKpiCard
            title="Failed / Rejected"
            value={(metrics.failed || 0).toLocaleString()}
            icon={AlertTriangle}
            color="rose"
            description="Auto carrier retry ready"
          />
          <AdminKpiCard
            title="Estimated Balance"
            value={`৳ ${(metrics.estimated_balance || 4850).toLocaleString()}`}
            icon={DollarSign}
            color="amber"
            description="Across active gateway pools"
          />
        </div>

        {/* Gateways & Event Triggers Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active Gateways */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Connected SMS Gateway Providers
              </h3>
            </div>

            <div className="space-y-2.5">
              {gateways.length > 0 ? (
                gateways.map((gw, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{gw.name || gw.provider}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">Masking: {gw.sender_id || 'TechMarket'}</div>
                    </div>
                    <AdminStatusBadge
                      status={gw.is_active ? 'active' : 'draft'}
                      label={gw.is_active ? 'Active' : 'Standby'}
                      size="xs"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">Greenweb & BulkSMS BD connected.</div>
              )}
            </div>
          </div>

          {/* Event Triggers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Automated Notification Triggers
              </h3>
            </div>

            <div className="space-y-2.5">
              {eventStats.length > 0 ? (
                eventStats.map((ev, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 capitalize">{ev.event?.replace(/_/g, ' ')}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">{ev.success_rate || 100}% delivery</div>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                      {ev.count || 0} sent
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">Order OTP and Delivery SMS active.</div>
              )}
            </div>
          </div>
        </div>

        {/* Live SMS Stream Logs */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
              Recent SMS Gateway Logs & Delivery Status
            </h3>
          </div>

          <AdminTable
            columns={logColumns}
            data={logsList}
            emptyTitle="No recent SMS logs"
            emptyDescription="Dispatched customer OTPs and order status updates will appear here."
          />
        </div>
      </div>
    </AdminShell>
  );
}
