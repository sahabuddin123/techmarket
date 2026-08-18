import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';

export default function AdminCategories({ categories }) {
  const handleDelete = (catId) => {
    if (confirm('Are you sure you want to delete this category?')) {
      router.delete(`/admin/categories/${catId}`);
    }
  };

  return (
    <AdminLayout title="Manage Categories">
      <Head title="Hardware Categories - Admin" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <FolderTree className="w-6 h-6 text-amber-500" />
              <span>HARDWARE CATEGORIES MANAGEMENT</span>
            </h1>
            <p className="text-xs text-slate-400">Manage categories, subcategories, and navigation icons.</p>
          </div>

          <Link
            href="/admin/categories/create"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW CATEGORY</span>
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Slug</th>
                  <th className="p-3.5">Parent Category</th>
                  <th className="p-3.5">Products</th>
                  <th className="p-3.5">SEO & Content</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categories && categories.length > 0 ? (
                  categories.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{c.name}</span>
                          {c.is_featured && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 font-extrabold uppercase">Featured</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{c.slug}</td>
                      <td className="p-3.5 text-slate-300">{c.parent ? c.parent.name : '— Root —'}</td>
                      <td className="p-3.5 text-slate-300 font-semibold">{c.products_count ?? 0}</td>
                      <td className="p-3.5 text-slate-400">
                        <span className="text-[11px]">
                          {c.content_sections_count ?? 0} sections • {c.price_tables_count ?? 0} table rows • {c.faqs_count ?? 0} FAQs
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <a
                          href={`/category/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded inline-block"
                          title="Preview Shop Page"
                        >
                          <FolderTree className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/admin/categories/${c.id}/edit`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded inline-block"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded inline-block"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No categories found.</td>
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
