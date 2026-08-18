import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
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
    <AdminLayout title="Marketing & Ecommerce Analytics">
      <Head title="Marketing Analytics Dashboard - TechMarket Admin" />

      <div className="space-y-8 max-w-7xl">
        {/* Header & Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-amber-500" />
              <span>MARKETING & CONVERSION INTELLIGENCE</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time funnel conversion metrics aggregated from authoritative database transactions and event streams.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              {[
                { id: 'today', label: 'Today' },
                { id: 'last_7_days', label: '7 Days' },
                { id: 'last_30_days', label: '30 Days' },
                { id: 'this_month', label: 'This Month' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    period === p.id 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Link
              href="/admin/analytics/debug"
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Event Diagnostics
            </Link>
          </div>
        </div>

        {/* 1. STORE PERFORMANCE METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase font-bold tracking-wider">Gross Revenue (BDT)</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><DollarSign className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ৳{(storePerformance.revenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Realized non-cancelled orders</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase font-bold tracking-wider">Total Orders</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><ShoppingCart className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {(storePerformance.orders || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Completed purchases</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase font-bold tracking-wider">Average Order Value (AOV)</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ৳{(storePerformance.aov || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Per paying transaction</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase font-bold tracking-wider">Store Conversion Rate</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl"><Layers className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">
              {storePerformance.conversion_rate || 0}%
            </div>
            <div className="text-[11px] text-slate-500">Visitors to completed buyers</div>
          </div>
        </div>

        {/* 2. ECOMMERCE CONVERSION FUNNEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                Ecommerce Conversion Funnel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Drop-off analysis from product impressions to successful checkout checkout.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              Live Event Aggregation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Step 1: Product Views */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">1. Product Views</span>
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{funnel.views || 0}</div>
              <div className="text-[10px] text-slate-500">ViewContent events</div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full w-full"></div>
              </div>
            </div>

            {/* Step 2: Add to Cart */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">2. Add to Cart</span>
                <ShoppingCart className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">{funnel.add_to_cart || 0}</div>
              <div className="text-[10px] text-slate-500">{funnel.view_to_cart_rate || 0}% from views</div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, funnel.view_to_cart_rate || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Step 3: Checkout Started */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">3. Checkout Started</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-400 font-mono">{funnel.checkout_started || 0}</div>
              <div className="text-[10px] text-slate-500">{funnel.cart_to_checkout_rate || 0}% from cart</div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, funnel.cart_to_checkout_rate || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Step 4: Purchase Completed */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">4. Purchases</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{funnel.purchases || 0}</div>
              <div className="text-[10px] text-slate-500">{funnel.checkout_to_purchase_rate || 0}% from checkout</div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Top Selling Hardware
            </h2>
            <div className="space-y-3">
              {topPurchased.length > 0 ? (
                topPurchased.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 max-w-[65%]">
                      <div className="font-bold text-white truncate">{item.product_name}</div>
                      <div className="text-[10px] text-slate-400">{item.units_sold} units ordered</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-amber-400 font-mono">৳{Number(item.revenue_generated || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">Revenue</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">No purchase records in selected period.</div>
              )}
            </div>
          </div>

          {/* Top Viewed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Most Viewed Products
            </h2>
            <div className="space-y-3">
              {topViewed.length > 0 ? (
                topViewed.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 max-w-[70%]">
                      {item.product?.image && (
                        <img src={item.product.image} alt="" className="w-9 h-9 object-contain bg-slate-900 rounded-lg p-1 border border-slate-800 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="font-bold text-white truncate">{item.product?.title || `Product #${item.product_id}`}</div>
                        <div className="text-[10px] text-slate-400">৳{Number(item.product?.price || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-blue-400 font-mono">{item.views_count}</div>
                      <div className="text-[10px] text-slate-500">Views</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">No view events logged in selected period.</div>
              )}
            </div>
          </div>
        </div>

        {/* 4. THIRD-PARTY MARKETING CHANNELS STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GA4 Integration Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                <h2 className="text-sm font-bold text-white uppercase">Google Analytics 4 Status</h2>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                integrations.ga4?.configured 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {integrations.ga4?.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-white">Direct Web Tagging:</p>
              <p className="text-slate-400">
                {integrations.ga4?.configured 
                  ? `Active with Measurement ID ${integrations.ga4.measurement_id}. Direct client-side events are streaming.`
                  : 'Google Analytics is currently not configured. Set your GA4 Measurement ID in Settings to start tracking web sessions.'}
              </p>
              <div className="pt-2">
                <Link href="/admin/settings/analytics" className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center space-x-1">
                  <span>Manage GA4 Configuration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Meta Ads & CAPI Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <h2 className="text-sm font-bold text-white uppercase">Meta Marketing & CAPI</h2>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                integrations.meta_pixel?.configured 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {integrations.meta_pixel?.configured ? 'Pixel Active' : 'Unconfigured'}
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-white">Server-Side Deduplication:</p>
              <p className="text-slate-400">
                {integrations.meta_capi?.configured
                  ? 'Meta Conversions API is active. Server purchase and checkout events are deduplicated with browser Pixel.'
                  : 'Conversions API is inactive. Configure your Meta Access Token to enable server-to-server CAPI delivery.'}
              </p>
              <div className="pt-2">
                <Link href="/admin/settings/analytics" className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center space-x-1">
                  <span>Manage Meta Settings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
