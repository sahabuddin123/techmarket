import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { UserCheck, Shield } from 'lucide-react';

export default function AdminUsers({ users, roles }) {
  const handleRoleChange = (userId, roleId) => {
    router.post(`/admin/users/${userId}/role`, { role_id: roleId }, { preserveScroll: true });
  };

  return (
    <AdminLayout title="Admin Users & Role Assignments">
      <Head title="Admin Users & RBAC - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-amber-500" />
            <span>ADMINISTRATIVE USERS & RBAC ROLES WORKSPACE</span>
          </h1>
          <p className="text-xs text-slate-400">Assign role-based access control permissions to administrative users.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">User Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Assigned RBAC Role</th>
                  <th className="p-3.5 text-right">Assign Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.data && users.data.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">{u.email}</td>
                    <td className="p-3.5">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {u.roles && u.roles.length > 0 ? u.roles[0].name : u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        defaultValue={u.roles && u.roles.length > 0 ? u.roles[0].id : ''}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-950 text-slate-100 border border-slate-800 rounded px-2.5 py-1 text-xs focus:border-amber-500 font-semibold"
                      >
                        <option value="" disabled>Select Role...</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
