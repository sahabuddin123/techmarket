import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Activity, Search, Filter, Download, RefreshCw, Eye, 
  CheckCircle2, AlertTriangle, Clock, X, ChevronRight, Server
} from 'lucide-react';

export default function EmailLogs({
  logs = { data: [] },
  filters = {},
  gateways = {},
  eventKeys = {},
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [gatewayFilter, setGatewayFilter] = useState(filters.gateway_id || '');
  const [eventFilter, setEventFilter] = useState(filters.event_key || '');

  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/communication/email-logs', {
      search: searchTerm,
      status: statusFilter,
      gateway_id: gatewayFilter,
      event_key: eventFilter,
    }, { preserveState: true });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setGatewayFilter('');
    setEventFilter('');
    router.get('/admin/communication/email-logs', {}, { preserveState: true });
  };

  const handleRetry = (log) => {
    router.post(`/admin/communication/email-logs/${log.id}/retry`, {}, { preserveScroll: true });
  };

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  return (
    <AdminLayout title="Email Delivery Logs">
      <Head title="Email Outbound Delivery Logs — TechMarket BD" />

      <div className="space-y-6 font-['Hind_Siliguri',sans-serif]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-amber-400" />
              <span>Email Delivery Logs</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit trail of transactional emails, campaign broadcasts, delivery status, and errors
            </p>
          </div>

          <a
            href={`/admin/communication/email-logs/export?status=${statusFilter}&gateway_id=${gatewayFilter}&event_key=${eventFilter}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </a>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearch} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search email, subject, provider ID..."
                className="w-full bg-slate-900 text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent / Delivered</option>
                <option value="queued">Queued</option>
                <option value="sending">Sending</option>
                <option value="failed">Failed</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>

            {/* Gateway Filter */}
            <div>
              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="">All Gateways</option>
                {Object.entries(gateways).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="">All Events</option>
                {Object.entries(eventKeys).map(([slug, name]) => (
                  <option key={slug} value={slug}>{name}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
            >
              Apply Filter
            </button>
          </div>
        </form>

        {/* Logs Table */}
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white dark:bg-slate-900 text-slate-400 font-mono text-[10.5px] uppercase border-b border-slate-200/80 dark:border-slate-800/80">
                <tr>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Attempts</th>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {(!logs.data || logs.data.length === 0) ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500 text-xs">
                      No matching email delivery logs found.
                    </td>
                  </tr>
                ) : (
                  logs.data.map((log) => {
                    const isSent = log.status === 'sent' || log.status === 'delivered';
                    const isFailed = log.status === 'failed';

                    return (
                      <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white font-mono">{log.recipient_email}</div>
                          {log.recipient_name && <div className="text-[10px] text-slate-400">{log.recipient_name}</div>}
                        </td>
                        <td className="p-3.5 text-slate-200 font-medium max-w-xs truncate">{log.subject}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-300 font-mono text-[10px]">
                            {log.event_key || 'Direct'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">{log.gateway?.name || 'Default'}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isSent ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            isFailed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-center">{log.attempts}</td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isFailed && (
                              <button
                                type="button"
                                onClick={() => handleRetry(log)}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 transition-colors cursor-pointer"
                                title="Retry Send"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(log)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Inspect Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Inspector Modal */}
        {isDetailModalOpen && selectedLog && (
          <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Email Log Details #{selectedLog.id}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 uppercase block text-[9.5px]">Recipient</span>
                    <strong className="text-white">{selectedLog.recipient_email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[9.5px]">Status</span>
                    <strong className="text-amber-400 uppercase">{selectedLog.status}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[9.5px]">Provider Msg ID</span>
                    <span className="text-slate-300 truncate block">{selectedLog.provider_message_id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[9.5px]">Attempts</span>
                    <span className="text-slate-300">{selectedLog.attempts}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-1">Subject</span>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-white font-medium">
                    {selectedLog.subject}
                  </div>
                </div>

                {selectedLog.error_message && (
                  <div>
                    <span className="text-rose-400 font-bold block mb-1">Error Diagnostic</span>
                    <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/30 text-rose-300 font-mono text-[11px]">
                      {selectedLog.error_message}
                    </div>
                  </div>
                )}

                {selectedLog.response_data && (
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Provider Raw Response</span>
                    <pre className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono text-[10.5px] max-h-36 overflow-y-auto custom-scrollbar">
                      {JSON.stringify(selectedLog.response_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
