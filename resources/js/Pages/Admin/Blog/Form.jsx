import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Save, ArrowLeft, BookOpen, Star } from 'lucide-react';

export default function BlogForm({ post }) {
  const isEditing = !!post;

  const { data, setData, post: submitPost, put, processing, errors } = useForm({
    title: post?.title || '',
    category: post?.category || 'Hardware Guides',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    image: post?.image || '',
    read_time: post?.read_time || '5 min read',
    is_published: post ? Boolean(post.is_published) : true,
    is_featured: post ? Boolean(post.is_featured) : false,
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      put(`/admin/blog/${post.id}`);
    } else {
      submitPost('/admin/blog');
    }
  };

  return (
    <AdminLayout>
      <Head title={`${isEditing ? 'Edit Article' : 'Write New Article'} - TechMarket BD Admin`} />

      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/blog"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">
                {isEditing ? 'Edit Blog Article' : 'Publish New Blog Article'}
              </h1>
              <p className="text-xs text-slate-400">Share benchmarks, buying guides, and technical insights.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400">Article Headline Title *</label>
              <input
                type="text"
                required
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="e.g. Best Budget Graphics Cards for 1080p Gaming in Bangladesh (2026)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
              {errors.title && <div className="text-[10px] text-red-500">{errors.title}</div>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Category *</label>
                <select
                  value={data.category}
                  onChange={(e) => setData('category', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Hardware Guides">Hardware Guides</option>
                  <option value="GPU & Graphics">GPU & Graphics</option>
                  <option value="Laptop Reviews">Laptop Reviews</option>
                  <option value="PC Building Tips">PC Building Tips</option>
                  <option value="Networking & Security">Networking & Security</option>
                  <option value="Industry News">Industry News</option>
                </select>
                {errors.category && <div className="text-[10px] text-red-500">{errors.category}</div>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Estimated Read Time</label>
                <input
                  type="text"
                  value={data.read_time}
                  onChange={(e) => setData('read_time', e.target.value)}
                  placeholder="e.g. 6 min read"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Featured Image URL */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400">Featured Image URL</label>
              <input
                type="url"
                value={data.image}
                onChange={(e) => setData('image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Short Excerpt */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400">Short Summary / Excerpt</label>
              <textarea
                rows={2}
                value={data.excerpt}
                onChange={(e) => setData('excerpt', e.target.value)}
                placeholder="Brief 1-2 sentence teaser for article cards..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Main Content Body */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400">Article Content *</label>
              <textarea
                required
                rows={12}
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                placeholder="Write full article body text (supports multi-line paragraphs)..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              />
              {errors.content && <div className="text-[10px] text-red-500">{errors.content}</div>}
            </div>

            {/* Checkboxes */}
            <div className="flex items-center space-x-6 pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_published}
                  onChange={(e) => setData('is_published', e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Published (Visible on public blog)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_featured}
                  onChange={(e) => setData('is_featured', e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Featured Post (Display in top banner)</span>
                </span>
              </label>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">SEO Metadata</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Meta Title</label>
                <input
                  type="text"
                  value={data.meta_title}
                  onChange={(e) => setData('meta_title', e.target.value)}
                  placeholder="Custom browser title tag"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Meta Description</label>
                <textarea
                  rows={2}
                  value={data.meta_description}
                  onChange={(e) => setData('meta_description', e.target.value)}
                  placeholder="Search engine summary snippet"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
