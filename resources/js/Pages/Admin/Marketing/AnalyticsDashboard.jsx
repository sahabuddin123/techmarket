import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  BarChart3, DollarSign, ShoppingCart, TrendingUp, Eye, 
  ArrowRight, ShieldCheck, ExternalLink, HelpCircle, AlertCircle, 
  Layers, Package, CheckCircle2 
} from 'lucide-react';

export default function AnalyticsDashboard({
  period = 'last_30_days',
  storePerformance = {},
  funnel = {},
  topPurchased = [],
  topViewed = [],
  integrations = {},
}) {
  const handlePeriodChange = (newPeriod) => {
    router.get('/admin/analytics', { period: newPeriod }, { preserveState: true, replace: true });
  };

  return (
    <AdminShell title="Marketing Analytics">
      <Head title="Marketing Analytics Dashboard - TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none pb-12">
        {/* Header & Date Range */}
        <AdminPageHeader
          title="Marketing & Conversion Intelligence"
          subtitle="Real-time funnel conversion metrics aggregated from authoritative database transactions and event streams."
          badge="Conversion Funnel"
          actions={
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-1 rounded-xl shadow-2xs">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'last_7_days', label: '7 Days' },
                  { id: 'last_30_days', label: '30 Days' },
                  { id: 'this_month', label: 'This Month' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePeriodChange(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      period === p.id 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <Link
                href="/admin/analytics/debug"
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                Event Diagnostics
              </Link>
            </div>
          }
        />

        {/* 1. STORE PERFORMANCE METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="uppercase font-bold tracking-wider text-[11px]">Gross Revenue (BDT)</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl"><DollarSign className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
              ৳{(storePerformance.revenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Realized non-cancelled orders</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="uppercase font-bold tracking-wider text-[11px]">Total Orders</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl"><ShoppingCart className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
              {(storePerformance.orders || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Completed purchases</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="uppercase font-bold tracking-wider text-[11px]">Average Order Value (AOV)</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
              ৳{(storePerformance.aov || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Per paying transaction</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="uppercase font-bold tracking-wider text-[11px]">Store Conversion Rate</span>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl"><Layers className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-heading">
              {storePerformance.conversion_rate || 0}%
            </div>
            <div className="text-[11px] text-slate-400">Visitors to completed buyers</div>
          </div>
        </div>

        {/* 2. ECOMMERCE CONVERSION FUNNEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading">
                Ecommerce Conversion Funnel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Drop-off analysis from product impressions to successful checkout.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
              Live Event Aggregation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Step 1: Product Views */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">1. Product Views</span>
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">{funnel.views || 0}</div>
              <div className="text-[10px] text-slate-400">ViewContent events</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full w-full"></div>
              </div>
            </div>

            {/* Step 2: Add to Cart */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">2. Add to Cart</span>
                <ShoppingCart className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">{funnel.add_to_cart || 0}</div>
              <div className="text-[10px] text-slate-400">{funnel.view_to_cart_rate || 0}% from views</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, funnel.view_to_cart_rate || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Step 3: Checkout Started */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">3. Checkout Started</span>
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">{funnel.checkout_started || 0}</div>
              <div className="text-[10px] text-slate-400">{funnel.cart_to_checkout_rate || 0}% from cart</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, funnel.cart_to_checkout_rate || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Step 4: Purchase Completed */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">4. Purchases</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading">{funnel.purchases || 0}</div>
              <div className="text-[10px] text-slate-400">{funnel.checkout_to_purchase_rate || 0}% from checkout</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, funnel.checkout_to_purchase_rate || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TOP PERFORMING PRODUCTS & VIEWED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Purchased */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Top Selling Products
            </h2>
            <div className="space-y-2.5">
              {topPurchased.length > 0 ? (
                topPurchased.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 max-w-[65%]">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate font-heading">{item.product_name}</div>
                      <div className="text-[10px] text-slate-400">{item.units_sold} units ordered</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">৳{Number(item.revenue_generated || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Revenue</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">No purchase records in selected period.</div>
              )}
            </div>
          </div>

          {/* Top Viewed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Most Viewed Products
            </h2>
            <div className="space-y-2.5">
              {topViewed.length > 0 ? (
                topViewed.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 max-w-[70%]">
                      {item.product?.image && (
                        <img src={item.product.image} alt="" className="w-9 h-9 object-contain bg-white rounded-lg p-1 border border-slate-200 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate font-heading">{item.product?.title || `Product #${item.product_id}`}</div>
                        <div className="text-[10px] text-slate-500">৳{Number(item.product?.price || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{item.views_count}</div>
                      <div className="text-[10px] text-slate-400">Views</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">No view events logged in selected period.</div>
              )}
            </div>
          </div>
        </div>

        {/* 4. THIRD-PARTY MARKETING CHANNELS STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GA4 Integration Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-heading">Google Analytics 4 Status</h2>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                integrations.ga4?.configured 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {integrations.ga4?.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200">Direct Web Tagging:</p>
              <p className="text-slate-500">
                {integrations.ga4?.configured 
                  ? `Active with Measurement ID ${integrations.ga4.measurement_id}. Direct client-side events are streaming.`
                  : 'Google Analytics is currently not configured. Set your GA4 Measurement ID in Settings to start tracking web sessions.'}
              </p>
              <div className="pt-2">
                <Link href="/admin/settings/analytics" className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center space-x-1">
                  <span>Manage GA4 Configuration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Meta Ads & CAPI Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-heading">Meta Marketing & CAPI</h2>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                integrations.meta_pixel?.configured 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {integrations.meta_pixel?.configured ? 'Pixel Active' : 'Unconfigured'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200">Server-Side Deduplication:</p>
              <p className="text-slate-500">
                {integrations.meta_capi?.configured
                  ? 'Meta Conversions API is active. Server purchase and checkout events are deduplicated with browser Pixel.'
                  : 'Conversions API is inactive. Configure your Meta Access Token to enable server-to-server CAPI delivery.'}
              </p>
              <div className="pt-2">
                <Link href="/admin/settings/analytics" className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center space-x-1">
                  <span>Manage Meta Settings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
