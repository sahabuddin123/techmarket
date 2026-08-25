import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { 
  Mail, Send, CheckCircle2, AlertTriangle, Clock, MousePointer, 
  Eye, Activity, Server, Radio, ArrowUpRight, FileText, Sliders 
} from 'lucide-react';

export default function EmailDashboard({
  metrics = {},
  dailyVolume = [],
  eventStats = [],
  gateways = [],
  recentLogs = [],
}) {
  const logList = Array.isArray(recentLogs) ? recentLogs : [];

  const logColumns = [
    {
      header: 'Recipient',
      accessor: 'recipient',
      render: (l) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
            {l.to_email || l.recipient || 'N/A'}
          </div>
          <div className="text-[10.5px] text-slate-400">
            {l.template || l.subject || 'Transactional Dispatch'}
          </div>
        </div>
      ),
    },
    {
      header: 'Subject & Event',
      accessor: 'subject',
      render: (l) => (
        <span className="text-slate-700 dark:text-slate-300 font-medium text-xs truncate max-w-xs block">
          {l.subject || l.event || 'System Notification'}
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
      header: 'Gateway',
      accessor: 'gateway',
      render: (l) => (
        <span className="font-mono text-slate-500 text-xs uppercase">
          {l.gateway || 'SMTP'}
        </span>
      ),
    },
    {
      header: 'Dispatched At',
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
    <AdminShell title="Email Dispatch Intelligence">
      <Head title="Email Communication Dashboard - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Email Dispatch & Relay Intelligence"
          subtitle="SMTP gateway telemetry, transactional open tracking, bounce analysis, and delivery velocity."
          badge="Live SMTP"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/settings/email"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>SMTP Settings</span>
              </Link>
            </div>
          }
        />

        {/* Financial / Volume KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <AdminKpiCard
            title="Today's Volume"
            value={metrics.today_sent || 0}
            icon={Send}
            color="indigo"
            description={`${metrics.month_sent || 0} this month`}
          />
          <AdminKpiCard
            title="Delivered"
            value={metrics.delivered || 0}
            icon={CheckCircle2}
            color="emerald"
            description={`${metrics.delivery_rate || 100}% delivery rate`}
          />
          <AdminKpiCard
            title="Queued"
            value={metrics.queued || 0}
            icon={Clock}
            color="blue"
            description="Active queue worker"
          />
          <AdminKpiCard
            title="Bounced / Failed"
            value={metrics.failed || 0}
            icon={AlertTriangle}
            color="rose"
            description="Auto fallback ready"
          />
          <AdminKpiCard
            title="Open Rate"
            value={`${metrics.open_rate || 0}%`}
            icon={Eye}
            color="purple"
            description="Customer opens"
          />
          <AdminKpiCard
            title="Click Rate"
            value={`${metrics.click_rate || 0}%`}
            icon={MousePointer}
            color="amber"
            description="Link clicks"
          />
        </div>

        {/* Gateways & Event Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active Gateways */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Configured SMTP Gateway Nodes
              </h3>
            </div>

            <div className="space-y-2.5">
              {gateways.length > 0 ? (
                gateways.map((gw, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 uppercase">{gw.name || gw.provider}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">Host: {gw.host || 'smtp.provider.net'}</div>
                    </div>
                    <AdminStatusBadge
                      status={gw.is_active ? 'active' : 'draft'}
                      label={gw.is_active ? 'Online' : 'Standby'}
                      size="xs"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">Primary SMTP server connected.</div>
              )}
            </div>
          </div>

          {/* Event Trigger Stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
                Top Dispatch Events
              </h3>
            </div>

            <div className="space-y-2.5">
              {eventStats.length > 0 ? (
                eventStats.map((ev, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 capitalize">{ev.event?.replace(/_/g, ' ')}</div>
                      <div className="text-[10.5px] text-slate-400 font-mono">{ev.success_rate || 100}% success rate</div>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                      {ev.count || 0} sent
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No event history recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Live Logs Table */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
              Recent Email Dispatch Activity Logs
            </h3>
          </div>

          <AdminTable
            columns={logColumns}
            data={logList}
            emptyTitle="No email activity"
            emptyDescription="Dispatched customer order receipts and verification emails will stream here."
          />
        </div>
      </div>
    </AdminShell>
  );
}
