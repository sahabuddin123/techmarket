import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { UserCheck, Shield, Users } from 'lucide-react';

export default function AdminUsers({ users = { data: [] }, roles = [] }) {
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState('comfortable');

  const userList = Array.isArray(users?.data) ? users.data : [];

  const filteredUsers = userList.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId, roleId) => {
    router.post(`/admin/users/${userId}/role`, { role_id: roleId }, { preserveScroll: true });
  };

  const columns = [
    {
      header: 'Admin User',
      accessor: 'name',
      sortable: true,
      render: (u) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 font-heading">
            {u.name ? u.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">{u.name}</div>
            <div className="text-[10.5px] text-slate-400 font-mono">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      render: (u) => {
        const roleName = u.roles && u.roles.length > 0 ? u.roles[0].name : (u.role || 'staff');
        return (
          <AdminStatusBadge
            status={roleName === 'admin' || roleName === 'super-admin' ? 'active' : 'staff'}
            label={roleName}
            size="xs"
          />
        );
      },
    },
    {
      header: 'Change Role Assignment',
      accessor: 'actions',
      align: 'right',
      render: (u) => (
        <select
          defaultValue={u.roles && u.roles.length > 0 ? u.roles[0].id : ''}
          onChange={(e) => handleRoleChange(u.id, e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-hidden"
        >
          <option value="" disabled>Select Role...</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <AdminShell title="Admin Users">
      <Head title="Admin Users & Roles - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Administrative Users & RBAC Permissions"
          subtitle="Manage administrative staff accounts, assign granular role-based privileges, and audit user access."
          badge={`${users.total || userList.length} Accounts`}
        />

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search staff by name or email..."
          onRefresh={() => router.get('/admin/users')}
        />

        {/* Users Table */}
        <AdminTable
          columns={columns}
          data={filteredUsers}
          pagination={users}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No admin users found"
          emptyDescription="Administrative staff members with backend dashboard access will appear here."
        />
      </div>
    </AdminShell>
  );
}
