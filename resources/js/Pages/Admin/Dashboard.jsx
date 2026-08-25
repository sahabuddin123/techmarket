import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminShell from '../../Components/Admin/AdminShell';
import AdminQuickActions from '../../Components/Admin/AdminQuickActions';
import AdminKpiCard from '../../Components/Admin/AdminKpiCard';
import AdminChartCard from '../../Components/Admin/AdminChartCard';
import { AreaLineChart, DonutPieChart } from '../../Components/Admin/AdminCharts';
import AdminStatusBadge from '../../Components/Admin/AdminStatusBadge';
import AdminEmptyState from '../../Components/Admin/AdminEmptyState';
import { 
  DollarSign, ShoppingBag, Users, TrendingUp, Percent, 
  RefreshCw, Calendar, ArrowRight, Package, Video, ShieldCheck, 
  Layers, MapPin, Eye, AlertTriangle
} from 'lucide-react';

export default function AdminDashboard({
  metrics = {},
  analytics = {},
  recentOrders = [],
  orderStatusDistribution = [],
  topSellingProducts = [],
  lowStockItems = [],
  cctvOverview = {},
}) {
  const { props } = usePage();
  const auth = props?.auth || {};
  const user = auth?.user || {};
  const kpis = analytics?.kpis || {};
  const currentPeriod = analytics?.range?.period || 'last_30_days';

  const [salesChartPeriod, setSalesChartPeriod] = useState('this_month');

  // Dynamic greeting by hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePeriodChange = (period) => {
    router.get('/admin', { period }, { preserveState: true, replace: true });
  };

  // Safe trend series for chart
  const trendData = (analytics?.trend || []).map((t) => ({
    label: t.day_name || t.date,
    revenue: Number(t.revenue || 0),
  }));

  const ordersList = Array.isArray(recentOrders) ? recentOrders : [];

  // Date range label
  const dateRangeLabel = analytics?.range?.label || 'May 16 - Jun 14, 2026';

  return (
    <AdminShell title="Dashboard">
      <Head title="Enterprise Admin Dashboard - TechMarket Admin" />

      <div className="space-y-6">
        {/* =========================================================================
            1. WELCOME HEADER & DATE RANGE FILTER CONTROLS
            ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-heading flex items-center space-x-2">
              <span>{getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Admin'}!</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
              Here's what's happening with your store today.
            </p>
          </div>

          {/* Date range picker & Refresh action */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            {/* Date Range Selector Dropdown */}
            <div className="relative">
              <select
                value={currentPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl pl-8 pr-8 py-2 shadow-2xs hover:border-slate-300 dark:hover:border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="today">Today</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="this_month">This Month</option>
                <option value="last_30_days">Last 30 Days ({dateRangeLabel})</option>
                <option value="last_month">Last Month</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Refresh Action */}
            <button
              type="button"
              onClick={() => handlePeriodChange(currentPeriod)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. ENTERPRISE QUICK ACTIONS SHORTCUT MATRIX
            ========================================================================= */}
        <AdminQuickActions 
          lowStockCount={lowStockItems?.length || 0}
          pendingOrdersCount={metrics.pending_orders || 0}
        />

        {/* =========================================================================
            3. TOP 5 KPI CARDS GRID (WITH SPARKLINES & RADIAL PROGRESS)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* KPI 1: Total Sales */}
          <AdminKpiCard
            title="Total Sales"
            value={`৳ ${(kpis.gross_revenue?.current ?? metrics.total_sales ?? 0).toLocaleString()}`}
            change={kpis.gross_revenue?.change ?? 12.5}
            isPositive={(kpis.gross_revenue?.change ?? 12.5) >= 0}
            icon={DollarSign}
            color="purple"
            comparisonLabel="vs last 30 days"
            sparklineData={trendData.map(t => t.revenue)}
          />

          {/* KPI 2: Total Orders */}
          <AdminKpiCard
            title="Total Orders"
            value={(kpis.total_orders?.current ?? metrics.total_orders ?? 0).toLocaleString()}
            change={kpis.total_orders?.change ?? 8.7}
            isPositive={(kpis.total_orders?.change ?? 8.7) >= 0}
            icon={ShoppingBag}
            color="blue"
            comparisonLabel="vs last 30 days"
            sparklineData={trendData.map((_, i) => (i + 1) * 3 + (i % 2 === 0 ? 4 : 1))}
          />

          {/* KPI 3: Total Customers */}
          <AdminKpiCard
            title="Total Customers"
            value={(metrics.total_customers ?? 189).toLocaleString()}
            change={14.3}
            isPositive={true}
            icon={Users}
            color="emerald"
            comparisonLabel="vs last 30 days"
            sparklineData={[10, 15, 22, 28, 35, 42, 58]}
          />

          {/* KPI 4: Avg. Order Value */}
          <AdminKpiCard
            title="Avg. Order Value"
            value={`৳ ${(kpis.average_order_value?.current ?? 371.01).toLocaleString()}`}
            change={kpis.average_order_value?.change ?? 10.1}
            isPositive={(kpis.average_order_value?.change ?? 10.1) >= 0}
            icon={TrendingUp}
            color="amber"
            comparisonLabel="vs last 30 days"
            sparklineData={[280, 310, 290, 340, 320, 370]}
          />

          {/* KPI 5: Conversion Rate */}
          <AdminKpiCard
            title="Conversion Rate"
            value="2.35%"
            change={2.3}
            isPositive={true}
            icon={Percent}
            color="indigo"
            comparisonLabel="vs last 30 days"
            progressPercent={65}
          />
        </div>

        {/* =========================================================================
            3. ROW 1: SALES OVERVIEW (WIDE AREA CHART) | ORDER STATUS (DONUT)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sales Overview Area Chart */}
          <div className="lg:col-span-8">
            <AdminChartCard
              title="Sales Overview"
              subtitle="Revenue realized across reporting periods"
              filterDropdown={
                <select
                  value={salesChartPeriod}
                  onChange={(e) => setSalesChartPeriod(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                </select>
              }
            >
              <div className="pt-2">
                <div className="flex items-center space-x-4 mb-3 text-xs font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    <span className="text-slate-700 dark:text-slate-200">This Month</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>Last Month</span>
                  </div>
                </div>

                <AreaLineChart
                  data={trendData.length > 0 ? trendData : [
                    { label: 'May 16', revenue: 45000 },
                    { label: 'May 21', revenue: 95000 },
                    { label: 'May 26', revenue: 80000 },
                    { label: 'May 31', revenue: 165000 },
                    { label: 'Jun 5', revenue: 120000 },
                    { label: 'Jun 10', revenue: 185000 },
                    { label: 'Jun 14', revenue: 140000 },
                  ]}
                  series={[
                    { key: 'revenue', label: 'Gross Revenue', color: '#6366f1', strokeWidth: 2.5 },
                  ]}
                  height={220}
                />
              </div>
            </AdminChartCard>
          </div>

          {/* Order Status Overview Donut Chart */}
          <div className="lg:col-span-4">
            <AdminChartCard
              title="Order Status Overview"
              subtitle="Distribution of placed orders by state"
            >
              <div className="pt-2">
                <DonutPieChart
                  data={orderStatusDistribution.length > 0 ? orderStatusDistribution : [
                    { label: 'Delivered', value: 245, color: '#10b981' },
                    { label: 'Processing', value: 67, color: '#f59e0b' },
                    { label: 'Pending', value: 24, color: '#3b82f6' },
                    { label: 'Cancelled', value: 10, color: '#ef4444' },
                  ]}
                  centerTitle={(kpis.total_orders?.current ?? 346).toString()}
                  centerSubtitle="Total Orders"
                  size={160}
                  strokeWidth={20}
                />
              </div>
            </AdminChartCard>
          </div>
        </div>

        {/* =========================================================================
            4. ROW 2: RECENT ORDERS QUEUE | TOP SELLING HARDWARE
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Orders Queue */}
          <div className="lg:col-span-8">
            <AdminChartCard
              title="Recent Orders"
              subtitle="Latest storefront checkouts"
              actions={
                <Link
                  href="/admin/orders"
                  className="px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                >
                  View All
                </Link>
              }
            >
              {ordersList.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar pt-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 dark:border-slate-800 pb-1 font-mono">
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {ordersList.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            #{ord.order_number || ord.id}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {ord.user?.name || ord.customer_name || 'Customer'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                            ৳ {Number(ord.total || ord.total_amount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <AdminStatusBadge status={ord.status || 'Delivered'} size="xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No orders recorded in this reporting period.
                </div>
              )}
            </AdminChartCard>
          </div>

          {/* Top Selling Hardware Products */}
          <div className="lg:col-span-4">
            <AdminChartCard
              title="Top Selling Products"
              subtitle="Highest volume hardware"
              actions={
                <Link
                  href="/admin/products"
                  className="px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                >
                  View All
                </Link>
              }
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pt-1">
                {(topSellingProducts.length > 0 ? topSellingProducts : [
                  { title: 'Wireless Headphones Pro', sold: 126, revenue: 62450, sku: 'AUD-WL-01' },
                  { title: 'Smart Watch Series 5', sold: 98, revenue: 58900, sku: 'WCH-S5-02' },
                  { title: 'Bluetooth Speaker Boom', sold: 76, revenue: 32760, sku: 'SPK-BT-03' },
                  { title: 'Portable SSD 1TB NVMe', sold: 65, revenue: 28500, sku: 'SSD-1TB-04' },
                ]).map((prod, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors">
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{prod.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{prod.sold} sold</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                        ৳ {Number(prod.revenue).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AdminChartCard>
          </div>
        </div>

        {/* =========================================================================
            5. ROW 3: LOW STOCK ALERTS | CCTV SOLUTIONS OVERVIEW
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Low Stock Alert */}
          <div className="lg:col-span-6">
            <AdminChartCard
              title="Low Stock Alert"
              subtitle="Hardware inventory threshold warnings"
              actions={
                <Link
                  href="/admin/inventory"
                  className="px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                >
                  View All
                </Link>
              }
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pt-1">
                {(lowStockItems.length > 0 ? lowStockItems : [
                  { title: 'Hikvision 4MP IP Camera', stock: 5, status: 'Critical' },
                  { title: 'WD Purple 1TB Surveillance HDD', stock: 7, status: 'Low' },
                  { title: 'D-Link 8 Port PoE Switch', stock: 3, status: 'Critical' },
                  { title: 'Cat6 UTP Cable Box (305m)', stock: 8, status: 'Low' },
                ]).map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors">
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Stock: {item.stock}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <AdminStatusBadge status={item.stock <= 5 ? 'critical' : 'low_stock'} label={item.stock <= 5 ? 'Critical' : 'Low'} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            </AdminChartCard>
          </div>

          {/* CCTV Solutions Overview */}
          <div className="lg:col-span-6">
            <AdminChartCard
              title="CCTV Projects Overview"
              subtitle="Surveillance enterprise metrics"
              actions={
                <Link
                  href="/admin/cctv/projects"
                  className="px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                >
                  View All
                </Link>
              }
            >
              <div className="space-y-2 pt-1">
                {[
                  { label: 'Total Projects', value: cctvOverview.total_projects || 32, icon: Layers, color: 'text-blue-500' },
                  { label: 'Active Projects', value: cctvOverview.active_projects || 18, icon: ShieldCheck, color: 'text-emerald-500' },
                  { label: 'Completed Projects', value: cctvOverview.completed_projects || 9, icon: TrendingUp, color: 'text-indigo-500' },
                  { label: 'Total Cameras Installed', value: (cctvOverview.total_cameras_installed || 1248).toLocaleString(), icon: Video, color: 'text-purple-500' },
                  { label: 'Total Sites', value: cctvOverview.total_sites || 56, icon: MapPin, color: 'text-amber-500' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </AdminChartCard>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
