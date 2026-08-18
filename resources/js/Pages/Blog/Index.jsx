import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { 
  BookOpen, Calendar, ArrowRight, Clock, User, 
  Search, ChevronRight, Sparkles 
} from 'lucide-react';

export default function BlogIndex({ posts, featuredPosts = [], categories = [], filters = {} }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const selectedCategory = filters.category || 'all';

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/blog', { search: searchTerm, category: selectedCategory !== 'all' ? selectedCategory : undefined }, { preserveState: true });
  };

  const handleCategorySelect = (cat) => {
    router.get('/blog', { search: searchTerm || undefined, category: cat !== 'all' ? cat : undefined }, { preserveState: true });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Head title="Tech News, PC Guides & Hardware Reviews - TechMarket BD Blog" />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 text-xs py-2.5">
        <div className="max-w-[1440px] mx-auto px-4 flex items-center space-x-2 text-slate-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">Tech Blog & Articles</span>
        </div>
      </div>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8 space-y-8">
        {/* Blog Header & Search */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start space-x-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>TechMarket BD News & Guides</span>
            </h1>
            <p className="text-xs text-slate-500">
              In-depth GPU benchmarks, PC building tutorials, laptop buying guides, and tech analysis in Bangladesh.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tech articles..."
              className="w-full pl-9 pr-20 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-black shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-black shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Posts Banner */}
        {featuredPosts.length > 0 && selectedCategory === 'all' && !searchTerm && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-black text-slate-900 uppercase tracking-tight">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Editor's Top Picks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col group"
                >
                  <div className="w-full h-48 bg-slate-900 overflow-hidden relative">
                    <img
                      src={post.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {post.excerpt || post.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="font-bold text-blue-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>Read More</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Articles Grid */}
        <div className="space-y-4">
          <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
            Latest Tech Articles
          </div>

          {!posts.data || posts.data.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-800">No articles found</div>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.data.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col justify-between group"
                >
                  <div className="w-full h-44 bg-slate-100 overflow-hidden relative">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded backdrop-blur">
                      {p.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3">
                        {p.excerpt || p.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      </span>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {posts.links && posts.links.length > 3 && (
            <div className="mt-8 flex justify-center space-x-1">
              {posts.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || '#'}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    link.active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : link.url
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
