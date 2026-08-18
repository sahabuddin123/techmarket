import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { ShieldAlert, Search, Eye } from 'lucide-react';

export default function AdminAuditLogs({ logs, filters }) {
  const [actionSearch, setActionSearch] = useState(filters.action || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/audit-logs', { action: actionSearch }, { preserveState: true });
  };

  return (
    <AdminLayout title="Security Audit Logs Explorer">
      <Head title="Audit Logs - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span>SECURITY & COMPLIANCE AUDIT LOGS</span>
          </h1>
          <p className="text-xs text-slate-400">Read-only audit history of administrative operations, stock changes, and security events.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search by Action Key (e.g. order.created, product.updated)..."
              value={actionSearch}
              onChange={(e) => setActionSearch(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded p-2.5 pr-8 border border-slate-800 focus:border-amber-500"
            />
            <button type="submit" className="absolute right-2 top-2.5 text-slate-400 hover:text-amber-400">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* LOGS TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action Key</th>
                  <th className="p-3.5">Target Entity</th>
                  <th className="p-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {logs.data && logs.data.length > 0 ? (
                  logs.data.map(l => (
                    <tr key={l.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="p-3.5 font-sans font-bold text-white">{l.user ? l.user.name : 'System / Guest'}</td>
                      <td className="p-3.5 font-bold text-amber-400">{l.action}</td>
                      <td className="p-3.5 text-slate-300">
                        {l.entity_type ? `${l.entity_type.split('\\').pop()} #${l.entity_id}` : '—'}
                      </td>
                      <td className="p-3.5 text-slate-400">{l.ip_address || '127.0.0.1'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No audit logs recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
