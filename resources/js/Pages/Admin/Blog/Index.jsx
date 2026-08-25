import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { BookOpen, Plus, Edit, Trash2, Eye, Star } from 'lucide-react';

export default function BlogIndex({ posts = { data: [] } }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const postList = Array.isArray(posts?.data) ? posts.data : [];

  const filteredPosts = postList.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/blog/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Article Title & Excerpt',
      accessor: 'title',
      sortable: true,
      render: (post) => (
        <div className="flex items-center space-x-3">
          <div className="w-14 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
            {post.image ? (
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="space-y-0.5 max-w-md">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading line-clamp-1">
                {post.title}
              </span>
              {post.is_featured && (
                <span className="p-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-500" title="Featured Article">
                  <Star className="w-3 h-3 fill-current" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{post.excerpt || post.content}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (post) => (
        <span className="font-mono text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
          {post.category || 'Tech'}
        </span>
      ),
    },
    {
      header: 'Author',
      accessor: 'author',
      render: (post) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
          {post.author?.name || 'TechMarket BD'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_published',
      render: (post) => (
        <AdminStatusBadge
          status={post.is_published ? 'published' : 'draft'}
          label={post.is_published ? 'Published' : 'Draft'}
          size="xs"
        />
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      render: (post) => (
        <span className="font-mono text-slate-400 text-xs">
          {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (post) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"
            title="Preview Article"
          >
            <Eye className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`/admin/blog/${post.id}/edit`}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
            title="Edit Article"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(post)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Article"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Blog Management">
      <Head title="Hardware Blog & Guides - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Hardware Blog & Tech Guides"
          subtitle="Publish PC build tutorials, GPU benchmark reviews, hardware buying guides, and technical news."
          badge={`${posts.total || postList.length} Posts`}
          actions={
            <Link
              href="/admin/blog/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Article</span>
            </Link>
          }
        />

        {/* Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search articles by title or category..."
          onRefresh={() => router.get('/admin/blog')}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredPosts}
          pagination={posts}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No blog articles published"
          emptyDescription="Create tech articles and PC hardware guides to enhance storefront SEO authority."
        />
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Article"
        message={`Are you sure you want to permanently delete article "${deleteTarget?.title}"?`}
        confirmText="Delete Article"
        isDestructive
      />
    </AdminShell>
  );
}
