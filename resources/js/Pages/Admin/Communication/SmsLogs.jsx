import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import FilterBar from '../../../Components/Admin/FilterBar';
import StatusBadge from '../../../Components/Admin/StatusBadge';
import EmptyState from '../../../Components/Admin/EmptyState';
import { 
  MessageSquare, Search, RefreshCw, Download, Eye, 
  CheckCircle2, AlertTriangle, Clock, RotateCcw, ExternalLink,
  Phone, User, X
} from 'lucide-react';

export default function SmsLogs({
  logs = { data: [], links: [] },
  filters = {},
  gateways = {},
  eventKeys = {}
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [gateway, setGateway] = useState(filters.gateway || '');
  const [eventKey, setEventKey] = useState(filters.event_key || '');
  const [selectedLog, setSelectedLog] = useState(null);

  const logsList = Array.isArray(logs?.data) ? logs.data : [];

  const handleFilterSubmit = () => {
    router.get('/admin/communication/sms-logs', {
      search: search || undefined,
      status: status || undefined,
      gateway: gateway || undefined,
      event_key: eventKey || undefined,
    }, { preserveState: true });
  };

  const handleRetry = (logId) => {
    router.post(`/admin/communication/sms-logs/${logId}/retry`, {}, {
      preserveScroll: true,
    });
  };

  return (
    <AdminLayout title="SMS Delivery Logs & Telemetry Explorer">
      <Head title="SMS Logs - Admin Back-Office" />

      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="SMS Delivery Logs"
          subtitle="Real-time ledger of dispatched, queued, delivered, and failed SMS communications."
          badge="Audit Ledger"
          actions={
            <div className="flex items-center space-x-2">
              <a
                href={`/admin/communication/sms-logs/export?status=${status}&gateway=${gateway}&event_key=${eventKey}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs inline-flex items-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
              <Link
                href="/admin/communication/send-sms"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center space-x-1.5 shadow-md uppercase"
              >
                <span>Compose SMS</span>
              </Link>
            </div>
          }
        />

        {/* Filter Toolbar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleFilterSubmit}
          searchPlaceholder="Search by phone, text content, or provider message ID..."
          filters={[
            {
              value: status,
              onChange: (val) => {
                setStatus(val);
                router.get('/admin/communication/sms-logs', {
                  search: search || undefined,
                  status: val || undefined,
                  gateway: gateway || undefined,
                  event_key: eventKey || undefined,
                }, { preserveState: true });
              },
              options: [
                { value: '', label: 'All Statuses' },
                { value: 'queued', label: 'Queued' },
                { value: 'processing', label: 'Processing' },
                { value: 'sent', label: 'Sent' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'failed', label: 'Failed' },
              ]
            },
            {
              value: gateway,
              onChange: (val) => {
                setGateway(val);
                router.get('/admin/communication/sms-logs', {
                  search: search || undefined,
                  status: status || undefined,
                  gateway: val || undefined,
                  event_key: eventKey || undefined,
                }, { preserveState: true });
              },
              options: [
                { value: '', label: 'All Gateways' },
                ...Object.entries(gateways).map(([k, v]) => ({ value: k, label: v }))
              ]
            },
            {
              value: eventKey,
              onChange: (val) => {
                setEventKey(val);
                router.get('/admin/communication/sms-logs', {
                  search: search || undefined,
                  status: status || undefined,
                  gateway: gateway || undefined,
                  event_key: val || undefined,
                }, { preserveState: true });
              },
              options: [
                { value: '', label: 'All Events' },
                ...Object.entries(eventKeys).map(([k, v]) => ({ value: k, label: `${v} (${k})` }))
              ]
            }
          ]}
          onReset={() => {
            setSearch('');
            setStatus('');
            setGateway('');
            setEventKey('');
            router.get('/admin/communication/sms-logs');
          }}
        />

        {/* LOGS TABLE */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800 font-mono">
                  <th className="p-3.5">Log ID / Date</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Event Key</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Message Content</th>
                  <th className="p-3.5">Parts / Enc</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logsList.length > 0 ? (
                  logsList.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">
                        <div className="font-bold text-slate-200">#{log.id}</div>
                        <div className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString()}</div>
                      </td>
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-white flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-amber-500" />
                          <span>{log.phone}</span>
                        </div>
                        {log.user && (
                          <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <User className="w-2.5 h-2.5" />
                            <span>{log.user.name}</span>
                          </div>
                        )}
                        {log.order_id && (
                          <div className="text-[10px] text-amber-400/80">
                            Order #{log.order?.order_number || log.order_id}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {log.event_key || 'manual.direct'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {log.gateway_slug || 'Default'}
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-[280px]">
                        <p className="line-clamp-2" title={log.message}>
                          {log.message}
                        </p>
                        {log.error_message && (
                          <p className="text-[10px] text-rose-400 font-mono mt-0.5 line-clamp-1">
                            Err: {log.error_message}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                        <div>{log.parts} SMS</div>
                        <div className="text-[10px] text-slate-500">{log.encoding} ({log.character_count}c)</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase ${
                          log.status === 'sent' || log.status === 'delivered'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Inspect Payloads"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {log.status === 'failed' && (
                          <button
                            type="button"
                            onClick={() => handleRetry(log.id)}
                            className="p-1.5 bg-slate-800 hover:bg-amber-900/40 text-amber-400 rounded-lg transition-colors cursor-pointer"
                            title="Retry Sending"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <EmptyState
                        title="No SMS logs found"
                        description="Adjust your search filters or send an SMS from the composer."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {logs?.links && logs.links.length > 3 && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1 font-medium">
            <div>
              Showing <span className="font-bold text-white font-mono">{logs.from || 0}</span> to <span className="font-bold text-white font-mono">{logs.to || 0}</span> of <span className="font-bold text-white font-mono">{logs.total || 0}</span> logs
            </div>

            <div className="flex items-center space-x-1 font-mono">
              {logs.links.map((link, idx) => (
                <button
                  key={idx}
                  disabled={!link.url || link.active}
                  onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    link.active
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : link.url
                      ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 cursor-pointer'
                      : 'bg-slate-950 text-slate-700 opacity-40 cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white font-mono flex items-center space-x-2">
                <span>SMS Log Details #{selectedLog.id}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Recipient Phone</span>
                <span className="text-white font-bold">{selectedLog.phone}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Event Key</span>
                <span className="text-amber-400 font-bold">{selectedLog.event_key || 'direct'}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Provider Message ID</span>
                <span className="text-slate-200 font-bold">{selectedLog.provider_message_id || 'None'}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Status / Parts</span>
                <span className="text-emerald-400 font-bold">{selectedLog.status?.toUpperCase()} ({selectedLog.parts} SMS)</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-1">Message Text:</span>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-sans text-slate-200 leading-relaxed">
                {selectedLog.message}
              </div>
            </div>

            {selectedLog.error_message && (
              <div>
                <span className="text-rose-400 font-bold block mb-1">Error Message:</span>
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 font-mono text-[11px]">
                  {selectedLog.error_message}
                </div>
              </div>
            )}

            {selectedLog.response_payload && (
              <div>
                <span className="text-slate-400 font-bold block mb-1 font-mono">Provider Response Payload:</span>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog.response_payload, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
