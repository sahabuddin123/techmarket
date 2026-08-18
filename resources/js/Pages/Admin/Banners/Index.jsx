import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Plus, Edit2, Trash2, Image } from 'lucide-react';

export default function AdminBanners({ banners }) {
  const handleDelete = (bannerId) => {
    if (confirm('Are you sure you want to delete this homepage banner?')) {
      router.delete(`/admin/banners/${bannerId}`);
    }
  };

  return (
    <AdminLayout title="Manage Hero Banners">
      <Head title="Homepage Hero Banners - Admin" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Image className="w-6 h-6 text-amber-500" />
              <span>HOMEPAGE HERO BANNERS & SLIDERS</span>
            </h1>
            <p className="text-xs text-slate-400">Manage promotional slides, text headlines, and CTA links on the storefront homepage.</p>
          </div>

          <Link
            href="/admin/banners/create"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW HERO BANNER</span>
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Banner Image</th>
                  <th className="p-3.5">Badge & Headline</th>
                  <th className="p-3.5">Button & Link</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {banners && banners.length > 0 ? (
                  banners.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <img src={b.image} alt={b.title} className="w-20 h-12 object-cover rounded bg-slate-950 border border-slate-800" />
                      </td>
                      <td className="p-3.5">
                        <div className="text-amber-400 font-bold text-[10px] uppercase">{b.badge}</div>
                        <div className="font-bold text-white text-sm leading-tight">{b.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{b.subtitle}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-200">{b.button_text}</div>
                        <div className="text-[11px] text-slate-500">{b.button_url}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {b.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/admin/banners/${b.id}/edit`}
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
                    <td colSpan={5} className="p-8 text-center text-slate-500">No homepage hero banners created yet.</td>
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
