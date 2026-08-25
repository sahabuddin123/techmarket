import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import { 
  Rss, Copy, Check, ExternalLink, Save, CheckCircle2, 
  AlertTriangle, Package, RefreshCw, Layers, ShieldCheck, Sliders 
} from 'lucide-react';

export default function ProductFeeds({ stats = {}, settings = {}, feeds = {} }) {
  const { data, setData, post, processing, recentlySuccessful } = useForm({
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
    post('/admin/marketing/feeds', { preserveScroll: true });
  };

  const feedList = [
    {
      key: 'meta_xml',
      title: 'Meta Commerce Manager (Facebook / Instagram Catalog)',
      description: 'Standard RSS 2.0 XML dynamic product catalog feed with Google Product Taxonomy.',
      format: 'XML',
      url: feeds.meta_xml || `${window.location.origin}/feeds/facebook.xml`,
    },
    {
      key: 'google_merchant',
      title: 'Google Merchant Center (Shopping & Free Listings)',
      description: 'Google Shopping formatted XML data feed for automated product discovery.',
      format: 'XML',
      url: feeds.google_xml || `${window.location.origin}/feeds/google.xml`,
    },
    {
      key: 'csv_feed',
      title: 'Universal CSV Product Feed',
      description: 'Structured CSV export suitable for bulk partner catalogs and affiliate networks.',
      format: 'CSV',
      url: feeds.csv || `${window.location.origin}/feeds/products.csv`,
    },
  ];

  return (
    <AdminShell title="Product Feeds & Catalogs">
      <Head title="Product Feeds & Meta Catalog - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Product Feeds & Dynamic Catalogs"
          subtitle="Automated RSS 2.0 XML and CSV product feeds for Meta Commerce Manager & Google Merchant Center."
          badge="Live Catalog Feeds"
          actions={
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/settings/analytics"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Pixel & CAPI Settings</span>
              </Link>
            </div>
          }
        />

        {/* Catalog Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Total Catalog"
            value={stats.total_products || 0}
            icon={Package}
            color="indigo"
            description="Published database items"
          />
          <AdminKpiCard
            title="In Stock SKUs"
            value={stats.in_stock_products || 0}
            icon={CheckCircle2}
            color="emerald"
            description="Ready for ad campaigns"
          />
          <AdminKpiCard
            title="Out of Stock"
            value={stats.out_of_stock_products || 0}
            icon={AlertTriangle}
            color="amber"
            description="Included with badge"
          />
          <AdminKpiCard
            title="Feed Format"
            value="RSS 2.0 XML"
            icon={Rss}
            color="purple"
            description="Meta / Google compliant"
          />
        </div>

        {/* Live Feed URLs Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Rss className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
              Active Dynamic Catalog Endpoints
            </h3>
          </div>

          <div className="space-y-4">
            {feedList.map((feed) => (
              <div key={feed.key} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">{feed.title}</span>
                    <p className="text-[11px] text-slate-500">{feed.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
                    {feed.format}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={feed.url}
                    className="flex-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(feed.key, feed.url)}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copiedKey === feed.key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === feed.key ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a
                    href={feed.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
                    title="Open Feed"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
              Feed Generation Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Default Fallback Brand</label>
              <input
                type="text"
                value={data.feed_default_brand}
                onChange={(e) => setData('feed_default_brand', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Feed Currency Code</label>
              <input
                type="text"
                value={data.feed_currency}
                onChange={(e) => setData('feed_currency', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={data.meta_feed_enabled}
                onChange={(e) => setData('meta_feed_enabled', e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Enable dynamic product feeds for Meta Catalog</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={data.feed_include_out_of_stock}
                onChange={(e) => setData('feed_include_out_of_stock', e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Include out-of-stock items (marked as 'out of stock' in XML)</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            {recentlySuccessful ? (
              <span className="text-emerald-600 text-xs font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Feed settings saved</span>
              </span>
            ) : <div />}

            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving...' : 'Save Feed Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
