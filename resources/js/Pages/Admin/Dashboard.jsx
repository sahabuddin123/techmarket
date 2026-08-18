import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from './AdminLayout';
import PageHeader from '../../Components/Admin/PageHeader';
import StatCard from '../../Components/Admin/StatCard';
import SectionCard from '../../Components/Admin/SectionCard';
import StatusBadge from '../../Components/Admin/StatusBadge';
import EmptyState from '../../Components/Admin/EmptyState';
import { 
  DollarSign, Package, ShoppingBag, AlertTriangle, ArrowRight, 
  TrendingUp, TrendingDown, CheckCircle, RotateCcw, BarChart3, 
  Boxes, Users, Calendar, ArrowUpRight, Sparkles, RefreshCw,
  Search, ShieldCheck, Globe, Clock, Layers, ChevronRight
} from 'lucide-react';

export default function AdminDashboard({ metrics = {}, analytics = {}, recentOrders = [] }) {
  const { props } = usePage();
  const auth = props?.auth;
  const kpis = analytics?.kpis || {};
  const currentPeriod = analytics?.range?.period || 'last_30_days';

  const handlePeriodChange = (period) => {
    router.get('/admin', { period }, { preserveState: true, replace: true });
  };

  const ordersList = Array.isArray(recentOrders) ? recentOrders : [];

  const topProducts = [
    { title: 'Intel Core i9 14900K Flagship Processor', sku: 'CPU-INTEL-14900K', revenue: '৳ 396,000', sold: 6, stock: 14, status: 'in_stock' },
    { title: 'ASUS ROG Strix GeForce RTX 4090 OC 24GB', sku: 'GPU-ASUS-4090', revenue: '৳ 680,000', sold: 2, stock: 3, status: 'low_stock' },
    { title: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz', sku: 'RAM-COR-DDR5-32', revenue: '৳ 144,000', sold: 9, stock: 22, status: 'in_stock' },
    { title: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD', sku: 'SSD-SAM-990P-2TB', revenue: '৳ 176,000', sold: 8, stock: 18, status: 'in_stock' },
  ];

  return (
    <AdminLayout title="Executive Analytics & Operations">
      <Head title="Executive Dashboard - TechMarket BD" />

      <div className="space-y-7">
        {/* Top Page Header */}
        <PageHeader
          title="Executive Commerce OS"
          subtitle={`Welcome back, ${auth?.user?.name || 'Administrator'}. Real-time analytics, inventory ledger, and order fulfillment status.`}
          badge="Live Telemetry"
          actions={
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-xs">
              {[
                { id: 'today', label: 'Today' },
                { id: 'last_7_days', label: '7 Days' },
                { id: 'last_30_days', label: '30 Days' },
                { id: 'this_month', label: 'Month' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPeriod === p.id 
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        />

        {/* PRIMARY KPIS WITH PERIOD COMPARISONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Revenue"
            value={`৳ ${(kpis.gross_revenue?.current ?? metrics.total_sales ?? 0).toLocaleString()}`}
            change={kpis.gross_revenue?.change}
            isPositive={kpis.gross_revenue?.change >= 0}
            icon={DollarSign}
            badge="Non-cancelled"
          />

          <StatCard
            title="Net Realized Revenue"
            value={`৳ ${(kpis.net_revenue?.current ?? 0).toLocaleString()}`}
            change={kpis.net_revenue?.change}
            isPositive={kpis.net_revenue?.change >= 0}
            icon={CheckCircle}
            badge="Net of Refunds"
          />

          <StatCard
            title="Total Placed Orders"
            value={(kpis.total_orders?.current ?? metrics.total_orders ?? 0).toLocaleString()}
            change={kpis.total_orders?.change}
            isPositive={kpis.total_orders?.change >= 0}
            icon={ShoppingBag}
            badge="Orders"
          />

          <StatCard
            title="Average Order Value"
            value={`৳ ${(kpis.average_order_value?.current ?? 0).toLocaleString()}`}
            change={kpis.average_order_value?.change}
            isPositive={kpis.average_order_value?.change >= 0}
            icon={TrendingUp}
            badge="AOV"
          />
        </div>

        {/* 7-DAY SALES REVENUE VELOCITY & ACTION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Velocity Breakdown */}
          <SectionCard
            title="Revenue Velocity & Trend"
            subtitle="Daily gross revenue realized over the active reporting window"
            icon={TrendingUp}
            className="lg:col-span-2"
            actions={
              <Link
                href="/admin/reports/sales"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <span>Full Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {analytics?.trend && analytics.trend.length > 0 ? (
              <div className="space-y-3.5 pt-1">
                {(() => {
                  const maxRevenue = Math.max(...analytics.trend.map(t => t.revenue), 1);
                  return analytics.trend.map((t, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300 font-bold">{t.day_name} <span className="text-slate-500 font-normal">({t.date})</span></span>
                        <span className="font-mono font-black text-amber-400">৳ {t.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/80">
                        <div
                          className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, (t.revenue / maxRevenue) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <EmptyState
                title="No sales in selected period"
                description="Orders and transactional volume will populate this telemetry chart automatically."
              />
            )}
          </SectionCard>

          {/* Quick Intelligence Hub Navigation */}
          <SectionCard
            title="Intelligence Hub"
            subtitle="Executive reports & telemetry monitors"
            icon={Boxes}
          >
            <div className="space-y-2.5">
              <Link
                href="/admin/reports/sales"
                className="p-3 bg-slate-950/80 hover:bg-slate-800/70 border border-slate-800 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Sales & Revenue</div>
                    <div className="text-[10px] text-slate-400">Status, volume & payments</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </Link>

              <Link
                href="/admin/reports/inventory"
                className="p-3 bg-slate-950/80 hover:bg-slate-800/70 border border-slate-800 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Inventory Ledger</div>
                    <div className="text-[10px] text-slate-400">Valuation & low stock</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </Link>

              <Link
                href="/admin/settings/analytics"
                className="p-3 bg-slate-950/80 hover:bg-slate-800/70 border border-slate-800 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Tracking & Feeds</div>
                    <div className="text-[10px] text-slate-400">GA4, Pixel & Meta CAPI</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </Link>

              <Link
                href="/admin/system-health"
                className="p-3 bg-slate-950/80 hover:bg-slate-800/70 border border-slate-800 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">System Telemetry</div>
                    <div className="text-[10px] text-slate-400">Database & queues</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </Link>
            </div>
          </SectionCard>

        </div>

        {/* RECENT ORDERS QUEUE & TOP HARDWARE MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Orders Queue */}
          <SectionCard
            title="Live Order Activity"
            subtitle="Latest storefront customer orders"
            icon={ShoppingBag}
            className="lg:col-span-2"
            noPadding
            actions={
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {ordersList.length > 0 ? (
              <div className="overflow-x-auto admin-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Amount</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {ordersList.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          #{order.order_number || order.id}
                        </td>
                        <td className="p-3.5 font-bold text-white truncate max-w-[140px]">
                          {order.user?.name || order.shipping_name || 'Walk-in Customer'}
                        </td>
                        <td className="p-3.5 text-slate-300 font-mono capitalize">
                          {order.payment_method || 'COD'}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-white">
                          ৳ {(order.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No recent orders"
                  description="New customer checkouts will appear here instantly."
                />
              </div>
            )}
          </SectionCard>

          {/* Top Hardware Matrix */}
          <SectionCard
            title="Top Hardware Catalog"
            subtitle="High sales velocity products"
            icon={Package}
            noPadding
          >
            <div className="divide-y divide-slate-800/60">
              {topProducts.map((prod, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="space-y-0.5 max-w-[180px]">
                    <div className="text-xs font-bold text-white truncate font-heading">{prod.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{prod.sku}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-xs font-black text-amber-400 font-mono">{prod.revenue}</div>
                    <StatusBadge status={prod.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

        </div>
      </div>
    </AdminLayout>
  );
}
