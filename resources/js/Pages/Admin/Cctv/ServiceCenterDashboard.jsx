import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Wrench,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  ArrowUpRight,
  FileText,
  User
} from 'lucide-react';

export default function ServiceCenterDashboard({ kpis = {}, recentTickets = [] }) {
  return (
    <AdminLayout>
      <Head title="CCTV Service Center Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              CCTV Service Center & After-Sales Hub
            </h1>
            <p className="text-xs text-slate-500">
              Live telemetry for troubleshooting tickets, warranty repairs, technician dispatches, and registered equipment.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/cctv/service-requests"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              <span>Manage Service Tickets</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Open Tickets</div>
            <div className="text-2xl font-black text-slate-900 font-mono">{kpis.open_tickets || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-rose-500 uppercase">Urgent Priority</div>
            <div className="text-2xl font-black text-rose-600 font-mono">{kpis.urgent_tickets || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-amber-500 uppercase">Scheduled Visits</div>
            <div className="text-2xl font-black text-amber-600 font-mono">{kpis.scheduled_visits || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-indigo-500 uppercase">Warranty Claims</div>
            <div className="text-2xl font-black text-indigo-600 font-mono">{kpis.warranty_claims || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-emerald-500 uppercase">Active Warranties</div>
            <div className="text-2xl font-black text-emerald-600 font-mono">{kpis.active_warranties || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Installed Devices</div>
            <div className="text-2xl font-black text-slate-900 font-mono">{kpis.installed_equipment_count || 0}</div>
          </div>
        </div>

        {/* Recent Service Tickets */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-sm font-heading">Recent Service & Troubleshooting Tickets</h2>
            <Link href="/admin/cctv/service-requests" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              <span>View All Tickets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Problem Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      No service tickets recorded in system.
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {t.ticket_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.customer_phone}</div>
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-[10px] text-slate-600">
                        {t.problem_category}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.priority === 'urgent' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {t.technician?.name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
