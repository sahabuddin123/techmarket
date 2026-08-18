import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../AdminLayout';
import { 
  BarChart3, DollarSign, ShoppingCart, TrendingUp, Eye, 
  ArrowRight, ShieldCheck, ExternalLink, HelpCircle, AlertCircle, 
  Layers, Package, CheckCircle2, Filter, Calendar, Users, Target
} from 'lucide-react';

export default function LandingPageAnalytics({
  selectedPage = null,
  allPages = [],
  period = 'last_30_days',
  funnel = {},
  utmBreakdown = [],
  recentOrders = []
}) {
  const handlePeriodChange = (newPeriod) => {
    router.get(
      selectedPage ? `/admin/marketing/landing-pages/analytics/${selectedPage.id}` : '/admin/marketing/landing-pages/analytics',
      { period: newPeriod },
      { preserveState: true, replace: true }
    );
  };

  const handlePageSelect = (pageId) => {
    if (!pageId || pageId === 'all') {
      router.get('/admin/marketing/landing-pages/analytics', { period }, { preserveState: true });
    } else {
      router.get(`/admin/marketing/landing-pages/analytics/${pageId}`, { period }, { preserveState: true });
    }
  };

  const funnelSteps = [
    {
      step: '1. Ad Visitors',
      name: 'Page Views',
      count: funnel.page_views || 0,
      percent: '100%',
      drop: null,
      color: 'bg-blue-500',
    },
    {
      step: '2. Product Exploration',
      name: 'Product Views',
      count: funnel.view_content || 0,
      percent: funnel.page_views > 0 ? `${Math.round(((funnel.view_content || 0) / funnel.page_views) * 100)}%` : '0%',
      drop: funnel.page_views > 0 ? `${Math.max(0, 100 - Math.round(((funnel.view_content || 0) / funnel.page_views) * 100))}% drop` : null,
      color: 'bg-indigo-500',
    },
    {
      step: '3. Intent to Buy',
      name: 'Order Form Opens',
      count: funnel.initiate_checkout || 0,
      percent: funnel.page_views > 0 ? `${Math.round(((funnel.initiate_checkout || 0) / funnel.page_views) * 100)}%` : '0%',
      drop: funnel.view_content > 0 ? `${Math.max(0, 100 - Math.round(((funnel.initiate_checkout || 0) / funnel.view_content) * 100))}% drop` : null,
      color: 'bg-amber-500',
    },
    {
      step: '4. Conversion',
      name: 'Confirmed Orders',
      count: funnel.purchases || 0,
      percent: funnel.page_views > 0 ? `${funnel.conversion_rate || 0}%` : '0%',
      drop: funnel.initiate_checkout > 0 ? `${Math.max(0, 100 - Math.round(((funnel.purchases || 0) / funnel.initiate_checkout) * 100))}% drop` : null,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <AdminLayout title="Landing Page Analytics & Funnel">
      <Head title="Landing Page Analytics & Funnel — TechMarket BD" />

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider">
                Funnel Attribution
              </span>
              <span className="text-xs text-slate-400">Meta & Google Ads Performance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
              {selectedPage ? selectedPage.name : 'All Landing Pages Overview'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live funnel stages, drop-off rates, UTM campaign attribution, and order revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Page Filter Selector */}
            <select
              value={selectedPage ? selectedPage.id : 'all'}
              onChange={(e) => handlePageSelect(e.target.value)}
              className="bg-slate-950 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="all">📊 All Landing Pages</option>
              {allPages.map(p => (
                <option key={p.id} value={p.id}>{p.name} (/l/{p.slug})</option>
              ))}
            </select>

            {/* Date Period Filter */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'last_7_days', label: '7 Days' },
                { id: 'last_30_days', label: '30 Days' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    period === p.id ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Visitors</p>
              <p className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">
                {(funnel.page_views || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Orders Generated</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                {funnel.purchases || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Conversion Rate</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                {funnel.conversion_rate || 0}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                ৳{Number(funnel.revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Visual Conversion Funnel Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-white text-sm">Customer Conversion Funnel</h2>
              <p className="text-xs text-slate-400">Tracking audience progression from Meta ad click to completed purchase</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">AOV: ৳{Number(funnel.aov || 0).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden">
                <div className={`h-1 absolute top-0 left-0 right-0 ${step.color}`}></div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 font-bold">{step.step}</span>
                  {step.drop && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                      {step.drop}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{step.count.toLocaleString()}</h3>
                  <p className="text-xs text-slate-400">{step.name}</p>
                </div>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Step Share:</span>
                  <span className="text-amber-400 font-bold">{step.percent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Details: UTM Attribution & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* UTM Attribution Breakdown (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-bold text-white text-sm">Campaign & UTM Attribution</h2>
              <p className="text-xs text-slate-400">Order revenue performance by ad source</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Source / Campaign</th>
                    <th className="p-2.5 text-center">Orders</th>
                    <th className="p-2.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {utmBreakdown && utmBreakdown.length > 0 ? (
                    utmBreakdown.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="p-2.5">
                          <p className="font-bold text-white">{row.utm_source || 'Direct / Organic'}</p>
                          <p className="text-[10px] text-slate-400">{row.utm_campaign || 'None'}</p>
                        </td>
                        <td className="p-2.5 text-center font-bold text-emerald-400">
                          {row.orders_count}
                        </td>
                        <td className="p-2.5 text-right font-bold text-amber-300">
                          ৳{Number(row.revenue_sum).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-6 text-slate-500">
                        No UTM campaign data recorded for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Attributed Orders (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-sm">Recent Landing Page Orders</h2>
                <p className="text-xs text-slate-400">Real-time orders generated through 1-click quick checkout</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Order #</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Payment</th>
                    <th className="p-2.5">Fraud Risk</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentOrders && recentOrders.length > 0 ? (
                    recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/20">
                        <td className="p-2.5 font-mono font-bold text-white">
                          <Link href={`/admin/orders/${ord.id}`} className="hover:text-amber-400">
                            {ord.order_number}
                          </Link>
                        </td>
                        <td className="p-2.5">
                          <p className="font-semibold text-slate-200">{ord.customer_name}</p>
                          <p className="text-[10px] text-slate-400">{ord.customer_phone}</p>
                        </td>
                        <td className="p-2.5 capitalize text-slate-300">
                          {ord.payment_method}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.fraud_risk_level === 'HIGH' || ord.fraud_risk_level === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {ord.fraud_risk_level || 'LOW'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-black text-amber-300">
                          ৳{Number(ord.total).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-500">
                        No orders recorded for this period yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
