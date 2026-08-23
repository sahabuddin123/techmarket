import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Layers,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  User,
  Plus
} from 'lucide-react';

export default function Projects({ projects = { data: [] }, projectManagers = [], filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/cctv/projects', { search }, { preserveState: true });
  };

  return (
    <AdminLayout>
      <Head title="Enterprise CCTV Projects Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              Enterprise CCTV Projects
            </h1>
            <p className="text-xs text-slate-500">
              Multi-site commercial deployments, factories, garments, hospital campuses, and nationwide CCTV infrastructure.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by project name, number, or organization..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Project #</th>
                  <th className="py-3.5 px-4">Project & Organization</th>
                  <th className="py-3.5 px-4">Type & Industry</th>
                  <th className="py-3.5 px-4">Sites</th>
                  <th className="py-3.5 px-4">Budget</th>
                  <th className="py-3.5 px-4">Project Manager</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {projects.data?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-400">
                      No enterprise projects found.
                    </td>
                  </tr>
                ) : (
                  projects.data?.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {p.project_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{p.organization_name || 'Client Direct'}</div>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-bold text-[10px] text-slate-600">
                        {p.project_type}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {p.sites?.length || 0} Sites
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ৳{Number(p.budget).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.project_manager?.name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {p.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/cctv/projects/${p.id}`}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
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
