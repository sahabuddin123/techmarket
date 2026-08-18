import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Mail, Send, CheckCircle2, AlertTriangle, Clock, MousePointer, 
  Eye, Activity, Server, Radio, ArrowUpRight, RefreshCw, FileText
} from 'lucide-react';

export default function EmailDashboard({
  metrics = {},
  dailyVolume = [],
  eventStats = [],
  gateways = [],
  recentLogs = [],
}) {
  const statCards = [
    {
      label: "Today's Volume",
      value: metrics.today_sent || 0,
      subValue: `${metrics.month_sent || 0} this month`,
      icon: Send,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      label: 'Delivered',
      value: metrics.delivered || 0,
      subValue: `${metrics.delivery_rate || 100}% delivery rate`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      label: 'Queued / Processing',
      value: metrics.queued || 0,
      subValue: 'Real-time worker pool',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      label: 'Failed / Bounced',
      value: metrics.failed || 0,
      subValue: 'Automatic fallback ready',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      label: 'Open Rate',
      value: `${metrics.open_rate || 0}%`,
      subValue: 'Estimated customer opens',
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
    },
    {
      label: 'Click Rate',
      value: `${metrics.click_rate || 0}%`,
      subValue: 'Campaign link engagement',
      icon: MousePointer,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/30',
    },
  ];

  const maxDaily = Math.max(...dailyVolume.map(d => d.sent + d.failed), 10);

  return (
    <AdminLayout title="Email Dashboard">
      <Head title="Email Analytics & Operations Dashboard — TechMarket BD" />

      <div className="space-y-6 font-['Hind_Siliguri',sans-serif]">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-amber-400" />
              <span>Email Communication Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Transactional deliveries, marketing campaigns, gateway health, and engagement analytics
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/communication/email-campaigns"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>New Campaign</span>
            </Link>

            <Link
              href="/admin/communication/email-templates"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Email Builder</span>
            </Link>

            <Link
              href="/admin/settings/email"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Gateways</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border ${stat.bgColor} backdrop-blur-xs flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stat.subValue}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 14-Day Activity Chart & Gateway Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 14-Day Activity Bar Chart */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>14-Day Email Dispatch Volume</span>
                </h2>
                <p className="text-xs text-slate-400">Daily sent and failed transactions</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Sent
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Failed
                </span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-2 pt-4">
              {dailyVolume.map((item, idx) => {
                const total = item.sent + item.failed;
                const heightPercent = Math.max(Math.round((total / maxDaily) * 100), 6);
                const sentPercent = total > 0 ? (item.sent / total) * 100 : 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full max-w-[28px] rounded-t-lg overflow-hidden flex flex-col justify-end bg-slate-900 transition-all group-hover:opacity-80" style={{ height: `${heightPercent}%` }}>
                      <div className="bg-rose-500 w-full" style={{ height: `${100 - sentPercent}%` }}></div>
                      <div className="bg-emerald-500 w-full" style={{ height: `${sentPercent}%` }}></div>
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-400 truncate group-hover:text-amber-400">{item.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gateway Status Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Gateway Connectivity</span>
              </h2>
              <Link href="/admin/settings/email" className="text-[11px] text-amber-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3 my-3">
              {gateways.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">No email gateways configured.</div>
              ) : (
                gateways.map((gw) => (
                  <div key={gw.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${gw.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                        {gw.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {gw.is_default && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                            PRIMARY
                          </span>
                        )}
                        {gw.is_fallback && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold">
                            FALLBACK
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[10.5px] text-slate-400 font-mono flex items-center justify-between pt-1">
                      <span>Driver: <strong className="text-slate-300 uppercase">{gw.driver}</strong></span>
                      <span>Tested: <strong className="text-slate-300">{gw.last_tested_at}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/admin/settings/email"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-center text-xs font-bold text-slate-300 transition-all block"
            >
              Test Gateways & Failover
            </Link>
          </div>
        </div>

        {/* Recent Delivery Activity Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-black text-white text-sm">Recent Outbound Activity</h2>
              <p className="text-[11px] text-slate-400">Live feed of transactional and alert emails</p>
            </div>
            <Link
              href="/admin/communication/email-logs"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <span>View Full Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/50 text-slate-400 font-mono text-[10.5px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                      No recent emails logged.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => {
                    const isSent = log.status === 'sent' || log.status === 'delivered';
                    const isFailed = log.status === 'failed';

                    return (
                      <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-3.5 font-bold text-white font-mono">
                          {log.recipient_email}
                          {log.recipient_name && <span className="block text-[10px] text-slate-400 font-sans font-normal">{log.recipient_name}</span>}
                        </td>
                        <td className="p-3.5 text-slate-200 font-medium max-w-xs truncate">{log.subject}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">
                            {log.event_key || 'Direct'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">{log.gateway?.name || 'Default SMTP'}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isSent ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            isFailed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-400 text-[10.5px]">
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Just now'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
