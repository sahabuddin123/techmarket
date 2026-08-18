import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { 
  Calendar, Clock, User, ArrowLeft, ChevronRight, 
  Share2, Tag, BookOpen, ArrowRight 
} from 'lucide-react';

export default function BlogShow({ post, relatedPosts = [], prevPost, nextPost }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Head title={post.meta_title || `${post.title} - TechMarket BD Blog`} />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 text-xs py-2.5">
        <div className="max-w-[1440px] mx-auto px-4 flex items-center space-x-2 text-slate-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold line-clamp-1">{post.title}</span>
        </div>
      </div>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article Body (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-6">
              {/* Category & Title */}
              <div className="space-y-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-bold uppercase inline-block">
                  {post.category}
                </span>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                  {post.title}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
                  <span className="flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">{post.author?.name || 'TechMarket BD Editorial'}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{post.read_time || '5 min read'}</span>
                  </span>
                </div>
              </div>

              {/* Featured Image */}
              {post.image && (
                <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100 max-h-[450px]">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-slate max-w-none text-slate-700 text-sm md:text-base leading-relaxed space-y-4">
                {post.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Social Share & Navigation */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Share Article:</span>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-[#1877F2] text-white rounded text-[11px] font-bold hover:opacity-90"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-[#1DA1F2] text-white rounded text-[11px] font-bold hover:opacity-90"
                  >
                    Twitter / X
                  </a>
                </div>

                <Link
                  href="/blog"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to all articles</span>
                </Link>
              </div>
            </div>

            {/* Prev / Next Posts Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 transition-colors space-y-1 block"
                >
                  <div className="text-[10px] font-bold uppercase text-slate-400">Previous Article</div>
                  <div className="font-bold text-xs text-slate-800 line-clamp-1">{prevPost.title}</div>
                </Link>
              ) : <div />}

              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 transition-colors space-y-1 text-right block"
                >
                  <div className="text-[10px] font-bold uppercase text-slate-400">Next Article</div>
                  <div className="font-bold text-xs text-slate-800 line-clamp-1">{nextPost.title}</div>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar (1 column) */}
          <div className="space-y-6">
            {/* Related Articles Widget */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Related Articles</span>
                </h3>

                <div className="space-y-3">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug}`}
                      className="flex items-start space-x-3 group"
                    >
                      <div className="w-16 h-12 rounded bg-slate-100 overflow-hidden shrink-0">
                        <img
                          src={rel.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop'}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rel.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* PC Builder Promo Card */}
            <div className="bg-slate-900 rounded-xl p-6 text-white space-y-3 shadow-md">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">Custom PC Builder</span>
              <h4 className="font-bold text-base">Build Your Dream Rig Today</h4>
              <p className="text-xs text-slate-400">Select compatible CPU, GPU, motherboard, and RAM with live price calculation.</p>
              <Link
                href="/pc-builder"
                className="inline-block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Launch PC Builder
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
