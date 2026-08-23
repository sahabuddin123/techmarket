import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  Package,
  Wrench,
  ShieldCheck
} from 'lucide-react';

export default function AlertCenter({ alerts = [] }) {
  return (
    <AdminLayout>
      <Head title="CCTV Operational Alert Center" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              CCTV Operational Alert Center
            </h1>
            <p className="text-xs text-slate-500">
              Live operational anomalies, critical support tickets, expiring hardware warranties, and unassigned work orders.
            </p>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-800 text-sm">All Operational Systems Normal</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active anomalies, unassigned installation jobs, or overdue service tickets detected.
              </p>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  alert.priority === 'critical'
                    ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                    : alert.priority === 'warning'
                    ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                    : 'bg-blue-50/50 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-2xl ${
                    alert.priority === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{alert.title}</h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
                  </div>
                </div>

                {alert.action_url && (
                  <Link
                    href={alert.action_url}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
