import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import StatCard from '../../../Components/Admin/StatCard';
import SectionCard from '../../../Components/Admin/SectionCard';
import StatusBadge from '../../../Components/Admin/StatusBadge';
import EmptyState from '../../../Components/Admin/EmptyState';
import { 
  MessageSquare, Send, CheckCircle2, AlertTriangle, Clock, 
  TrendingUp, Radio, Sliders, ExternalLink, RefreshCw, 
  ShieldAlert, DollarSign, Activity, FileText, ArrowRight, Zap
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
  const maxDaily = Math.max(...dailyVolume.map(d => d.sent + d.failed), 1);

  return (
    <AdminLayout title="SMS Gateway & Communication Dashboard">
      <Head title="SMS Analytics Dashboard - TechMarket Admin" />

      <div className="space-y-7">
        {/* Header Ribbon */}
        <PageHeader
          title="SMS Communication Center"
          subtitle="Real-time SMS traffic, provider delivery telemetry, balance monitoring, and automated event notifications."
          badge="Live Gateway Engine"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/communication/send-sms"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer uppercase"
              >
                <Send className="w-4 h-4" />
                <span>Send SMS</span>
              </Link>
              <Link
                href="/admin/settings/sms-gateways"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs inline-flex items-center space-x-1.5 transition-all"
              >
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Gateways</span>
              </Link>
            </div>
          }
        />

        {/* PRIMARY KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="SMS Sent Today"
            value={(metrics.today_sent || 0).toLocaleString()}
            change={null}
            isPositive={true}
            icon={Send}
            badge="Today"
          />

          <StatCard
            title="Monthly Volume"
            value={(metrics.month_sent || 0).toLocaleString()}
            change={null}
            isPositive={true}
            icon={MessageSquare}
            badge="This Month"
          />

          <StatCard
            title="Delivery Success Rate"
            value={`${metrics.success_rate || 100}%`}
            change={null}
            isPositive={metrics.success_rate >= 90}
            icon={CheckCircle2}
            badge="Confirmed Sent"
          />

          <StatCard
            title="Failed / Rejected"
            value={(metrics.failed || 0).toLocaleString()}
            change={null}
            isPositive={metrics.failed === 0}
            icon={AlertTriangle}
            badge="Errors"
          />
        </div>

        {/* 14-DAY VOLUME CHART & ACTIVE GATEWAYS STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Traffic Chart */}
          <SectionCard
            title="14-Day SMS Volume Trend"
            subtitle="Daily SMS messages dispatched vs failures across all integrated gateways"
            icon={TrendingUp}
            className="lg:col-span-2"
            actions={
              <Link href="/admin/communication/sms-logs" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1">
                <span>View Full Log</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            <div className="pt-2">
              <div className="h-44 flex items-end justify-between gap-1.5 px-2">
                {dailyVolume.map((d, idx) => {
                  const sentHeight = (d.sent / maxDaily) * 100;
                  const failedHeight = (d.failed / maxDaily) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 border border-slate-700 text-slate-100 text-[10px] px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap z-20 font-mono">
                        <span className="text-amber-400 font-bold">{d.sent} sent</span> / <span className="text-rose-400 font-bold">{d.failed} failed</span>
                        <div className="text-slate-400">{d.date}</div>
                      </div>

                      <div className="w-full max-w-[20px] flex flex-col justify-end h-32 rounded-t overflow-hidden bg-slate-800/40">
                        {d.failed > 0 && (
                          <div 
                            style={{ height: `${Math.max(failedHeight, 4)}%` }} 
                            className="bg-rose-500 w-full transition-all" 
                            title={`${d.failed} failed`} 
                          />
                        )}
                        <div 
                          style={{ height: `${Math.max(sentHeight, d.sent > 0 ? 6 : 0)}%` }} 
                          className="bg-amber-500 group-hover:bg-amber-400 w-full transition-all" 
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                        {d.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center space-x-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span>Successful Dispatches</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                  <span>Failed API Attempts</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Gateway Status & Balance Panel */}
          <SectionCard
            title="Gateway Health & Balances"
            subtitle="Configured SMS provider drivers"
            icon={Radio}
            actions={
              <Link href="/admin/settings/sms-gateways" className="text-xs font-bold text-amber-400 hover:text-amber-300">
                Configure
              </Link>
            }
          >
            <div className="space-y-3 pt-1">
              {gateways.map((gw) => (
                <div key={gw.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${gw.is_active ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'}`} />
                      <span className="font-bold text-xs text-white">{gw.name}</span>
                      {gw.is_default && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Default
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${gw.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {gw.is_active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                    <span>Balance:</span>
                    <span className="font-bold text-slate-200">
                      {gw.balance !== null ? `৳ ${gw.balance.toLocaleString()}` : (gw.is_active ? 'API Connected' : 'Not Configured')}
                    </span>
                  </div>

                  {gw.last_tested_at && (
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Tested:</span>
                      <span>{gw.last_tested_at}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* BREAKDOWNS: BY EVENT KEY & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Event Breakdown */}
          <SectionCard
            title="Traffic by Event Type"
            subtitle="Distribution of transactional order updates & alerts"
            icon={Zap}
          >
            <div className="space-y-2.5 pt-1">
              {eventStats.length > 0 ? (
                eventStats.map((ev, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-[180px]">
                      {ev.event}
                    </span>
                    <span className="font-mono font-black text-amber-400">
                      {ev.count.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">No SMS traffic recorded yet.</div>
              )}
            </div>
          </SectionCard>

          {/* Recent SMS Activity Stream */}
          <SectionCard
            title="Live SMS Activity Stream"
            subtitle="Most recent messages dispatched through the queue"
            icon={Activity}
            className="lg:col-span-2"
            actions={
              <Link href="/admin/communication/sms-logs" className="text-xs font-bold text-amber-400 hover:text-amber-300">
                All Logs
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Recipient</th>
                    <th className="pb-2">Event</th>
                    <th className="pb-2">Message</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logsList.length > 0 ? (
                    logsList.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-slate-200">
                          {log.phone}
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {log.event_key || 'direct'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400 truncate max-w-[220px]" title={log.message}>
                          {log.message}
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            log.status === 'sent' || log.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : log.status === 'failed'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">No recent SMS logs.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </AdminLayout>
  );
}
