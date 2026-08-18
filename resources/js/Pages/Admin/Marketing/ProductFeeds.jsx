import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Rss, Copy, Check, ExternalLink, Save, CheckCircle2, 
  AlertTriangle, Package, RefreshCw, Layers, ShieldCheck 
} from 'lucide-react';

export default function ProductFeeds({ stats = {}, settings = {}, feeds = {} }) {
  const { data, setData, post, processing } = useForm({
    meta_feed_enabled: Boolean(settings.meta_feed_enabled ?? true),
    feed_include_out_of_stock: Boolean(settings.feed_include_out_of_stock ?? true),
    feed_default_brand: settings.feed_default_brand || 'TechMarket',
    feed_currency: settings.feed_currency || 'BDT',
  });

  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (key, url) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/marketing/feeds');
  };

  return (
    <AdminLayout title="Product Feeds & Meta Catalog">
      <Head title="Product Feeds & Meta Catalog - TechMarket Admin" />

      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Rss className="w-6 h-6 text-purple-400" />
              <span>PRODUCT FEEDS & DYNAMIC CATALOGS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Automated RSS 2.0 XML and CSV product feeds for Meta Commerce Manager & Google Merchant Center.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/settings/analytics"
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Tracking Settings
            </Link>
          </div>
        </div>

        {/* FEED HEALTH & CATALOG METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Catalog</div>
            <div className="text-2xl font-black text-white">{stats.total || 0}</div>
            <div className="text-[10px] text-slate-500">Database products</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-emerald-400 uppercase">Active / Published</div>
            <div className="text-2xl font-black text-emerald-400">{stats.active || 0}</div>
            <div className="text-[10px] text-slate-500">Included in feed</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-amber-400 uppercase">In Stock</div>
            <div className="text-2xl font-black text-amber-400">{stats.in_stock || 0}</div>
            <div className="text-[10px] text-slate-500">Immediate dispatch</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Out of Stock</div>
            <div className="text-2xl font-black text-slate-300">{stats.out_of_stock || 0}</div>
            <div className="text-[10px] text-slate-500">Availability: out of stock</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="text-[11px] font-bold text-rose-400 uppercase">Missing Images</div>
            <div className="text-2xl font-black text-rose-400">{stats.missing_image || 0}</div>
            <div className="text-[10px] text-slate-500">Requires product image</div>
          </div>
        </div>

        {/* FEED URLS SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Public Feed Endpoints</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit these URLs to Meta Commerce Manager and Google Merchant Center for automated catalog synchronization.
            </p>
          </div>

          <div className="space-y-4">
            {/* Meta XML Feed */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Meta Catalog XML Feed (Recommended)</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  RSS 2.0 / g:Namespace
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={feeds.meta_xml || ''}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy('meta_xml', feeds.meta_xml)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
                >
                  {copiedKey === 'meta_xml' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'meta_xml' ? 'COPIED' : 'COPY'}</span>
                </button>
                <a
                  href={feeds.meta_xml}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Meta CSV Feed */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  <span>Meta Catalog CSV Feed</span>
                </span>
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                  Direct CSV Export
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={feeds.meta_csv || ''}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-blue-400 font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy('meta_csv', feeds.meta_csv)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
                >
                  {copiedKey === 'meta_csv' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'meta_csv' ? 'COPIED' : 'COPY'}</span>
                </button>
                <a
                  href={feeds.meta_csv}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Google Merchant XML Feed */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  <span>Google Merchant Center Feed</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                  Google Shopping RSS 2.0
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={feeds.google_xml || ''}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy('google_xml', feeds.google_xml)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
                >
                  {copiedKey === 'google_xml' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'google_xml' ? 'COPIED' : 'COPY'}</span>
                </button>
                <a
                  href={feeds.google_xml}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FEED CONFIGURATION FORM */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Feed Configuration</h2>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'SAVING...' : 'SAVE FEED SETTINGS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Default Brand Fallback
              </label>
              <input
                type="text"
                value={data.feed_default_brand}
                onChange={(e) => setData('feed_default_brand', e.target.value)}
                placeholder="TechMarket"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Used when a product has no specific brand assigned.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Feed Currency
              </label>
              <input
                type="text"
                value={data.feed_currency}
                onChange={(e) => setData('feed_currency', e.target.value)}
                placeholder="BDT"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">Standard 3-letter currency code (e.g. BDT).</p>
            </div>

            <div className="sm:col-span-2 space-y-3 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={data.meta_feed_enabled}
                  onChange={(e) => setData('meta_feed_enabled', e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span>Enable Public Product Feed Generation</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={data.feed_include_out_of_stock}
                  onChange={(e) => setData('feed_include_out_of_stock', e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span>Include Out-of-Stock Products in Feed (With <code className="text-amber-400">g:availability=out of stock</code>)</span>
              </label>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
