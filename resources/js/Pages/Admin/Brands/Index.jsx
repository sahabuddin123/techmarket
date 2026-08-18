import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

export default function AdminBrands({ brands }) {
  const handleDelete = (brandId) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      router.delete(`/admin/brands/${brandId}`);
    }
  };

  return (
    <AdminLayout title="Manage Brands">
      <Head title="Authorized Brands - Admin" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Tag className="w-6 h-6 text-amber-500" />
              <span>AUTHORIZED TECH BRANDS</span>
            </h1>
            <p className="text-xs text-slate-400">Manage manufacturers (ASUS, MSI, Gigabyte, Intel, AMD, Corsair, etc.).</p>
          </div>

          <Link
            href="/admin/brands/create"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW BRAND</span>
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Brand Logo / Name</th>
                  <th className="p-3.5">Slug</th>
                  <th className="p-3.5">Total Products</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {brands && brands.length > 0 ? (
                  brands.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                          {b.name.substring(0, 2)}
                        </div>
                        <span>{b.name}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{b.slug}</td>
                      <td className="p-3.5 font-bold text-emerald-400">{b.products_count} Items</td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/admin/brands/${b.id}/edit`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded inline-block"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded inline-block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No brands found.</td>
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
