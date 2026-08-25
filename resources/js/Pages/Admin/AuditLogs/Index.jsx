import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { ShieldCheck, Lock, Activity } from 'lucide-react';

export default function AdminAuditLogs({ logs = { data: [] }, filters = {} }) {
  const [actionSearch, setActionSearch] = useState(filters.action || '');
  const [density, setDensity] = useState('compact');

  const logList = Array.isArray(logs?.data) ? logs.data : [];

  const handleSearchSubmit = (val) => {
    setActionSearch(val);
    router.get('/admin/audit-logs', { action: val || undefined }, { preserveState: true, replace: true });
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (l) => (
        <span className="font-mono text-slate-500 text-xs">
          {l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actor / User',
      accessor: 'user',
      render: (l) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
          {l.user ? l.user.name : 'System Automation'}
        </span>
      ),
    },
    {
      header: 'Action Key',
      accessor: 'action',
      render: (l) => (
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
          {l.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: 'entity_type',
      render: (l) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">
          {l.entity_type ? `${l.entity_type.split('\\').pop()} #${l.entity_id}` : '—'}
        </span>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      render: (l) => (
        <span className="font-mono text-slate-400 text-xs">
          {l.ip_address || '127.0.0.1'}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Audit Logs">
      <Head title="Security Audit Logs - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Security & Compliance Audit Trail"
          subtitle="Immutable, read-only audit logs of administrative actions, user permissions, order lifecycle events, and inventory changes."
          badge={`${logs.total || logList.length} Events`}
        />

        {/* Toolbar */}
        <AdminPageToolbar
          search={actionSearch}
          onSearchChange={handleSearchSubmit}
          searchPlaceholder="Search by action key (e.g. order.created, product.updated)..."
          onRefresh={() => router.get('/admin/audit-logs')}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={logList}
          pagination={logs}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No audit logs recorded"
          emptyDescription="Administrative operations and security actions will be recorded here automatically."
        />
      </div>
    </AdminShell>
  );
}
