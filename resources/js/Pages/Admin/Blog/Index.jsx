import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { BookOpen, Plus, Edit, Trash2, Calendar, Star, Eye } from 'lucide-react';

export default function BlogIndex({ posts }) {
  const handleDelete = (id, title) => {
    if (confirm(`Are you sure you want to delete blog article: "${title}"?`)) {
      router.delete(`/admin/blog/${id}`);
    }
  };

  return (
    <AdminLayout>
      <Head title="Blog & News Manager - TechMarket BD Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>Hardware Blog & Tech News Management</span>
            </h1>
            <p className="text-xs text-slate-400">Publish GPU benchmarks, PC building tutorials, and buying guides.</p>
          </div>

          <Link
            href="/admin/blog/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </Link>
        </div>

        {/* Articles Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Category</th>
                <th className="p-4">Author</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {!posts?.data || posts.data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No blog articles created yet. Click "Write New Article" to publish your first post.
                  </td>
                </tr>
              ) : (
                posts.data.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {post.image ? (
                          <img src={post.image} alt={post.title} className="w-12 h-9 rounded object-cover border border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-12 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div className="space-y-0.5 max-w-sm">
                          <div className="font-bold text-white text-xs line-clamp-1">{post.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{post.excerpt || post.content}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase font-mono">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {post.author?.name || 'TechMarket BD'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          post.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </span>
                        {post.is_featured && (
                          <span className="p-1 rounded bg-amber-500/10 text-amber-400" title="Featured Post">
                            <Star className="w-3 h-3 fill-current" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded inline-block transition-colors"
                        title="View Public Post"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded inline-block transition-colors"
                        title="Edit Article"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded inline-block transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {posts?.links && posts.links.length > 3 && (
            <div className="p-4 border-t border-slate-800 flex justify-center space-x-1">
              {posts.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || '#'}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    link.active
                      ? 'bg-blue-600 text-white font-black'
                      : link.url
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
