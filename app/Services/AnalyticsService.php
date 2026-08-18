<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderHistory;
use App\Models\Product;
use App\Models\User;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Category;
use App\Models\Brand;
use App\Models\InventoryMovement;
use App\Models\LoyaltyTransaction;
use App\Models\Referral;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Resolve date range into start, end, previous start, previous end, and label.
     */
    public static function resolveDateRange(string $period = 'last_30_days', ?string $startDate = null, ?string $endDate = null): array
    {
        $now = Carbon::now();

        switch ($period) {
            case 'today':
                $start = Carbon::today()->startOfDay();
                $end = Carbon::today()->endOfDay();
                $prevStart = Carbon::yesterday()->startOfDay();
                $prevEnd = Carbon::yesterday()->endOfDay();
                $label = 'Today';
                break;

            case 'yesterday':
                $start = Carbon::yesterday()->startOfDay();
                $end = Carbon::yesterday()->endOfDay();
                $prevStart = Carbon::yesterday()->subDay()->startOfDay();
                $prevEnd = Carbon::yesterday()->subDay()->endOfDay();
                $label = 'Yesterday';
                break;

            case 'last_7_days':
                $start = Carbon::now()->subDays(6)->startOfDay();
                $end = Carbon::now()->endOfDay();
                $prevStart = Carbon::now()->subDays(13)->startOfDay();
                $prevEnd = Carbon::now()->subDays(7)->endOfDay();
                $label = 'Last 7 Days';
                break;

            case 'this_month':
                $start = Carbon::now()->startOfMonth()->startOfDay();
                $end = Carbon::now()->endOfDay();
                $prevStart = Carbon::now()->subMonth()->startOfMonth()->startOfDay();
                $prevEnd = Carbon::now()->subMonth()->endOfMonth()->endOfDay();
                $label = 'This Month';
                break;

            case 'last_month':
                $start = Carbon::now()->subMonth()->startOfMonth()->startOfDay();
                $end = Carbon::now()->subMonth()->endOfMonth()->endOfDay();
                $prevStart = Carbon::now()->subMonths(2)->startOfMonth()->startOfDay();
                $prevEnd = Carbon::now()->subMonths(2)->endOfMonth()->endOfDay();
                $label = 'Last Month';
                break;

            case 'custom':
                if ($startDate && $endDate) {
                    $start = Carbon::parse($startDate)->startOfDay();
                    $end = Carbon::parse($endDate)->endOfDay();
                } elseif ($startDate) {
                    $start = Carbon::parse($startDate)->startOfDay();
                    $end = Carbon::now()->endOfDay();
                } else {
                    $start = Carbon::now()->subDays(29)->startOfDay();
                    $end = Carbon::now()->endOfDay();
                }

                $diffDays = max(1, $start->diffInDays($end) + 1);
                $prevStart = (clone $start)->subDays($diffDays)->startOfDay();
                $prevEnd = (clone $start)->subSecond();
                $label = $start->format('M d, Y') . ' - ' . $end->format('M d, Y');
                break;

            case 'last_30_days':
            default:
                $period = 'last_30_days';
                $start = Carbon::now()->subDays(29)->startOfDay();
                $end = Carbon::now()->endOfDay();
                $prevStart = Carbon::now()->subDays(59)->startOfDay();
                $prevEnd = Carbon::now()->subDays(30)->endOfDay();
                $label = 'Last 30 Days';
                break;
        }

        return [
            'period' => $period,
            'label' => $label,
            'start' => $start,
            'end' => $end,
            'prev_start' => $prevStart,
            'prev_end' => $prevEnd,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
        ];
    }

    /**
     * Calculate percentage change safely without divide-by-zero.
     */
    public static function calculatePercentageChange(float $current, float $previous): float
    {
        if ($previous == 0.0) {
            if ($current > 0.0) {
                return 100.0;
            } elseif ($current < 0.0) {
                return -100.0;
            }
            return 0.0;
        }

        return round((($current - $previous) / abs($previous)) * 100, 2);
    }

    /**
     * Cross-database driver date grouping expression.
     */
    public static function dateFormatExpression(string $column, string $format = 'day'): string
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            return match ($format) {
                'month' => "strftime('%Y-%m', {$column})",
                'year' => "strftime('%Y', {$column})",
                'day' => "strftime('%Y-%m-%d', {$column})",
                default => "strftime('%Y-%m-%d', {$column})",
            };
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            return match ($format) {
                'month' => "DATE_FORMAT({$column}, '%Y-%m')",
                'year' => "DATE_FORMAT({$column}, '%Y')",
                'day' => "DATE_FORMAT({$column}, '%Y-%m-%d')",
                default => "DATE_FORMAT({$column}, '%Y-%m-%d')",
            };
        }

        if ($driver === 'pgsql') {
            return match ($format) {
                'month' => "to_char({$column}, 'YYYY-MM')",
                'year' => "to_char({$column}, 'YYYY')",
                'day' => "to_char({$column}, 'YYYY-MM-DD')",
                default => "to_char({$column}, 'YYYY-MM-DD')",
            };
        }

        return "DATE({$column})";
    }

    /**
     * Main Admin Dashboard KPIs with period comparisons.
     */
    public static function getDashboardMetrics(string $period = 'last_30_days', ?string $startDate = null, ?string $endDate = null): array
    {
        return AnalyticsCacheService::remember('dashboard', compact('period', 'startDate', 'endDate'), function () use ($period, $startDate, $endDate) {
            $range = self::resolveDateRange($period, $startDate, $endDate);
            $start = $range['start'];
            $end = $range['end'];
            $prevStart = $range['prev_start'];
            $prevEnd = $range['prev_end'];

            // Current Period
            $grossRevenue = (float) Order::where('status', '!=', 'Cancelled')
                ->whereBetween('created_at', [$start, $end])
                ->sum('total');

            $refundedAmount = (float) Refund::whereIn('status', ['approved', 'completed'])
                ->whereBetween('created_at', [$start, $end])
                ->sum('amount');

            $netRevenue = max(0.0, $grossRevenue - $refundedAmount);

            $totalOrders = Order::whereBetween('created_at', [$start, $end])->count();
            $completedOrders = Order::where('status', 'Delivered')->whereBetween('created_at', [$start, $end])->count();
            $cancelledOrders = Order::where('status', 'Cancelled')->whereBetween('created_at', [$start, $end])->count();
            $nonCancelledOrders = Order::where('status', '!=', 'Cancelled')->whereBetween('created_at', [$start, $end])->count();

            $aov = $nonCancelledOrders > 0 ? round($grossRevenue / $nonCancelledOrders, 2) : 0.0;

            $totalItemsSold = (int) OrderItem::whereHas('order', function ($q) use ($start, $end) {
                $q->where('status', '!=', 'Cancelled')->whereBetween('created_at', [$start, $end]);
            })->sum('quantity');

            // Previous Period
            $prevGrossRevenue = (float) Order::where('status', '!=', 'Cancelled')
                ->whereBetween('created_at', [$prevStart, $prevEnd])
                ->sum('total');

            $prevRefundedAmount = (float) Refund::whereIn('status', ['approved', 'completed'])
                ->whereBetween('created_at', [$prevStart, $prevEnd])
                ->sum('amount');

            $prevNetRevenue = max(0.0, $prevGrossRevenue - $prevRefundedAmount);

            $prevTotalOrders = Order::whereBetween('created_at', [$prevStart, $prevEnd])->count();
            $prevCompletedOrders = Order::where('status', 'Delivered')->whereBetween('created_at', [$prevStart, $prevEnd])->count();
            $prevNonCancelledOrders = Order::where('status', '!=', 'Cancelled')->whereBetween('created_at', [$prevStart, $prevEnd])->count();
            $prevAov = $prevNonCancelledOrders > 0 ? round($prevGrossRevenue / $prevNonCancelledOrders, 2) : 0.0;

            $prevItemsSold = (int) OrderItem::whereHas('order', function ($q) use ($prevStart, $prevEnd) {
                $q->where('status', '!=', 'Cancelled')->whereBetween('created_at', [$prevStart, $prevEnd]);
            })->sum('quantity');

            // Catalog Snapshot
            $totalProducts = Product::count();
            $lowStockCount = Product::where('stock', '<=', 5)->where('stock', '>', 0)->count();
            $outOfStockCount = Product::where('stock', '<=', 0)->count();
            $totalCustomers = User::where('role', '!=', 'admin')->count();

            // Recent Orders
            $recentOrders = Order::with('user')->latest()->take(6)->get();

            // 7-day revenue trend
            $trendDays = [];
            $trendStart = Carbon::now()->subDays(6)->startOfDay();
            $trendEnd = Carbon::now()->endOfDay();
            $dateExpr = self::dateFormatExpression('created_at', 'day');

            $dailySales = Order::select(
                DB::raw("{$dateExpr} as order_date"),
                DB::raw('SUM(total) as daily_revenue'),
                DB::raw('COUNT(id) as daily_orders')
            )
            ->where('status', '!=', 'Cancelled')
            ->whereBetween('created_at', [$trendStart, $trendEnd])
            ->groupBy('order_date')
            ->pluck('daily_revenue', 'order_date')
            ->toArray();

            for ($i = 6; $i >= 0; $i--) {
                $d = Carbon::now()->subDays($i)->toDateString();
                $trendDays[] = [
                    'date' => $d,
                    'day_name' => Carbon::parse($d)->format('D'),
                    'revenue' => (float) ($dailySales[$d] ?? 0.0),
                ];
            }

            return [
                'range' => $range,
                'kpis' => [
                    'gross_revenue' => [
                        'current' => $grossRevenue,
                        'previous' => $prevGrossRevenue,
                        'change' => self::calculatePercentageChange($grossRevenue, $prevGrossRevenue),
                    ],
                    'net_revenue' => [
                        'current' => $netRevenue,
                        'previous' => $prevNetRevenue,
                        'change' => self::calculatePercentageChange($netRevenue, $prevNetRevenue),
                    ],
                    'total_orders' => [
                        'current' => $totalOrders,
                        'previous' => $prevTotalOrders,
                        'change' => self::calculatePercentageChange($totalOrders, $prevTotalOrders),
                    ],
                    'completed_orders' => [
                        'current' => $completedOrders,
                        'previous' => $prevCompletedOrders,
                        'change' => self::calculatePercentageChange($completedOrders, $prevCompletedOrders),
                    ],
                    'cancelled_orders' => [
                        'current' => $cancelledOrders,
                    ],
                    'refunded_amount' => [
                        'current' => $refundedAmount,
                        'previous' => $prevRefundedAmount,
                        'change' => self::calculatePercentageChange($refundedAmount, $prevRefundedAmount),
                    ],
                    'average_order_value' => [
                        'current' => $aov,
                        'previous' => $prevAov,
                        'change' => self::calculatePercentageChange($aov, $prevAov),
                    ],
                    'total_items_sold' => [
                        'current' => $totalItemsSold,
                        'previous' => $prevItemsSold,
                        'change' => self::calculatePercentageChange($totalItemsSold, $prevItemsSold),
                    ],
                ],
                'catalog' => [
                    'total_products' => $totalProducts,
                    'low_stock' => $lowStockCount,
                    'out_of_stock' => $outOfStockCount,
                    'total_customers' => $totalCustomers,
                ],
                'trend' => $trendDays,
                'recent_orders' => $recentOrders,
            ];
        });
    }

    /**
     * Sales Analytics Module (/admin/reports/sales).
     */
    public static function getSalesAnalytics(string $period = 'last_30_days', ?string $startDate = null, ?string $endDate = null): array
    {
        return AnalyticsCacheService::remember('sales', compact('period', 'startDate', 'endDate'), function () use ($period, $startDate, $endDate) {
            $range = self::resolveDateRange($period, $startDate, $endDate);
            $start = $range['start'];
            $end = $range['end'];
            $prevStart = $range['prev_start'];
            $prevEnd = $range['prev_end'];

            // Financial Summary
            $grossRevenue = (float) Order::where('status', '!=', 'Cancelled')
                ->whereBetween('created_at', [$start, $end])
                ->sum('total');

            $refundedAmount = (float) Refund::whereIn('status', ['approved', 'completed'])
                ->whereBetween('created_at', [$start, $end])
                ->sum('amount');

            $netRevenue = max(0.0, $grossRevenue - $refundedAmount);
            $totalOrders = Order::whereBetween('created_at', [$start, $end])->count();
            $nonCancelledOrders = Order::where('status', '!=', 'Cancelled')->whereBetween('created_at', [$start, $end])->count();
            $aov = $nonCancelledOrders > 0 ? round($grossRevenue / $nonCancelledOrders, 2) : 0.0;
            $totalDiscount = (float) Order::where('status', '!=', 'Cancelled')->whereBetween('created_at', [$start, $end])->sum('discount');
            $discountedOrdersCount = Order::where('status', '!=', 'Cancelled')->whereBetween('created_at', [$start, $end])->where('discount', '>', 0)->count();

            // Time series grouping by Day
            $dateExpr = self::dateFormatExpression('created_at', 'day');
            $dailyRows = Order::select(
                DB::raw("{$dateExpr} as period_date"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(id) as orders_count'),
                DB::raw('SUM(discount) as total_discount'),
                DB::raw('SUM(shipping_cost) as total_shipping')
            )
            ->where('status', '!=', 'Cancelled')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('period_date')
            ->orderBy('period_date', 'asc')
            ->get()
            ->keyBy('period_date');

            // Fill all dates in range for continuous timeline chart
            $timeline = [];
            $periodIterator = CarbonPeriod::create($start->copy()->startOfDay(), $end->copy()->startOfDay());
            foreach ($periodIterator as $date) {
                $dStr = $date->format('Y-m-d');
                $row = $dailyRows->get($dStr);

                $timeline[] = [
                    'date' => $dStr,
                    'formatted_date' => $date->format('M d'),
                    'revenue' => $row ? (float) $row->revenue : 0.0,
                    'orders_count' => $row ? (int) $row->orders_count : 0,
                    'discount' => $row ? (float) $row->total_discount : 0.0,
                    'shipping' => $row ? (float) $row->total_shipping : 0.0,
                ];
            }

            // Monthly breakdown (last 12 months)
            $monthExpr = self::dateFormatExpression('created_at', 'month');
            $monthlySales = Order::select(
                DB::raw("{$monthExpr} as month"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(id) as order_count'),
                DB::raw('SUM(discount) as discount')
            )
            ->where('status', '!=', 'Cancelled')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->take(12)
            ->get()
            ->map(fn($m) => [
                'month' => $m->month,
                'revenue' => (float) $m->revenue,
                'order_count' => (int) $m->order_count,
                'discount' => (float) $m->discount,
            ]);

            // Payment Method Distribution
            $paymentMethods = Order::select(
                'payment_method',
                DB::raw('COUNT(id) as order_count'),
                DB::raw('SUM(total) as revenue')
            )
            ->where('status', '!=', 'Cancelled')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('payment_method')
            ->orderBy('revenue', 'desc')
            ->get()
            ->map(function ($pm) use ($grossRevenue) {
                $rev = (float) $pm->revenue;
                return [
                    'method' => $pm->payment_method ?: 'Unknown',
                    'order_count' => (int) $pm->order_count,
                    'revenue' => $rev,
                    'percentage' => $grossRevenue > 0 ? round(($rev / $grossRevenue) * 100, 1) : 0.0,
                ];
            });

            // Order Status Distribution
            $orderStatuses = Order::select(
                'status',
                DB::raw('COUNT(id) as count'),
                DB::raw('SUM(total) as total_amount')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('status')
            ->get()
            ->map(function ($os) use ($totalOrders) {
                $cnt = (int) $os->count;
                return [
                    'status' => $os->status,
                    'count' => $cnt,
                    'total_amount' => (float) $os->total_amount,
                    'percentage' => $totalOrders > 0 ? round(($cnt / $totalOrders) * 100, 1) : 0.0,
                ];
            });

            return [
                'range' => $range,
                'summary' => [
                    'gross_revenue' => $grossRevenue,
                    'net_revenue' => $netRevenue,
                    'refunded_amount' => $refundedAmount,
                    'total_orders' => $totalOrders,
                    'non_cancelled_orders' => $nonCancelledOrders,
                    'aov' => $aov,
                    'total_discount' => $totalDiscount,
                    'discounted_orders_count' => $discountedOrdersCount,
                ],
                'timeline' => $timeline,
                'monthly_sales' => $monthlySales,
                'payment_methods' => $paymentMethods,
                'order_statuses' => $orderStatuses,
            ];
        });
    }

    /**
     * Product Performance Intelligence (/admin/reports/products).
     */
    public static function getProductIntelligence(string $period = 'last_30_days', ?string $startDate = null, ?string $endDate = null): array
    {
        return AnalyticsCacheService::remember('products', compact('period', 'startDate', 'endDate'), function () use ($period, $startDate, $endDate) {
            $range = self::resolveDateRange($period, $startDate, $endDate);
            $start = $range['start'];
            $end = $range['end'];

            // Best Selling & Highest Revenue Products
            $productSales = OrderItem::select(
                'order_items.product_id',
                'order_items.product_name',
                'order_items.sku_snapshot',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.total) as total_revenue'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as order_count')
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'Cancelled')
            ->whereBetween('orders.created_at', [$start, $end])
            ->groupBy('order_items.product_id', 'order_items.product_name', 'order_items.sku_snapshot')
            ->get();

            // Attach current stock
            $productIds = $productSales->pluck('product_id')->filter()->unique();
            $productsCurrent = Product::whereIn('id', $productIds)->get()->keyBy('id');

            $enriched = $productSales->map(function ($item) use ($productsCurrent) {
                $liveProduct = $item->product_id ? $productsCurrent->get($item->product_id) : null;
                return [
                    'product_id' => $item->product_id,
                    'title' => $liveProduct ? $liveProduct->title : $item->product_name,
                    'sku' => $item->sku_snapshot ?: ($liveProduct ? $liveProduct->sku : 'N/A'),
                    'units_sold' => (int) $item->units_sold,
                    'total_revenue' => (float) $item->total_revenue,
                    'order_count' => (int) $item->order_count,
                    'current_stock' => $liveProduct ? $liveProduct->stock : 0,
                    'price' => $liveProduct ? (float) $liveProduct->price : 0.0,
                ];
            });

            $bestSelling = $enriched->sortByDesc('units_sold')->values()->take(10);
            $highestRevenue = $enriched->sortByDesc('total_revenue')->values()->take(10);
            $lowestSelling = $enriched->where('units_sold', '>', 0)->sortBy('units_sold')->values()->take(10);

            // Zero sales products
            $soldProductIds = $productSales->pluck('product_id')->filter()->toArray();
            $zeroSalesProducts = Product::whereNotIn('id', $soldProductIds)
                ->select('id', 'title', 'sku', 'price', 'stock', 'created_at')
                ->latest()
                ->take(20)
                ->get();

            // Performance by Category
            $categoryPerformance = Category::with(['products' => function ($q) {
                $q->select('id', 'category_id', 'stock', 'price');
            }])->get()->map(function ($cat) use ($enriched) {
                $catProductIds = $cat->products->pluck('id')->toArray();
                $catSales = $enriched->whereIn('product_id', $catProductIds);

                $units = $catSales->sum('units_sold');
                $revenue = $catSales->sum('total_revenue');

                return [
                    'category_id' => $cat->id,
                    'category_name' => $cat->name,
                    'product_count' => $cat->products->count(),
                    'total_stock' => $cat->products->sum('stock'),
                    'units_sold' => $units,
                    'total_revenue' => $revenue,
                ];
            })->sortByDesc('total_revenue')->values();

            // Performance by Brand
            $brandPerformance = Brand::with(['products' => function ($q) {
                $q->select('id', 'brand_id', 'stock', 'price');
            }])->get()->map(function ($brand) use ($enriched) {
                $brandProductIds = $brand->products->pluck('id')->toArray();
                $brandSales = $enriched->whereIn('product_id', $brandProductIds);

                $units = $brandSales->sum('units_sold');
                $revenue = $brandSales->sum('total_revenue');

                return [
                    'brand_id' => $brand->id,
                    'brand_name' => $brand->name,
                    'product_count' => $brand->products->count(),
                    'units_sold' => $units,
                    'total_revenue' => $revenue,
                ];
            })->where('units_sold', '>', 0)->sortByDesc('total_revenue')->values();

            return [
                'range' => $range,
                'best_selling' => $bestSelling,
                'highest_revenue' => $highestRevenue,
                'lowest_selling' => $lowestSelling,
                'zero_sales_products' => $zeroSalesProducts,
                'category_performance' => $categoryPerformance,
                'brand_performance' => $brandPerformance,
            ];
        });
    }

    /**
     * Inventory Intelligence (/admin/reports/inventory).
     */
    public static function getInventoryIntelligence(): array
    {
        return AnalyticsCacheService::remember('inventory', [], function () {
            $totalProducts = Product::count();
            $totalStockUnits = (int) Product::sum('stock');

            // Inventory Retail Valuation: SUM(stock * price)
            $retailValuation = (float) (Product::selectRaw('SUM(stock * price) as val')->value('val') ?? 0.0);

            // Inventory Cost Valuation: SUM(stock * COALESCE(cost_price, price * 0.8))
            $costValuation = (float) (Product::selectRaw('SUM(stock * COALESCE(cost_price, price * 0.8)) as val')->value('val') ?? 0.0);

            // Movements by type
            $movementsByType = InventoryMovement::select(
                'type',
                DB::raw('COUNT(id) as movement_count'),
                DB::raw('SUM(ABS(quantity)) as total_units')
            )
            ->groupBy('type')
            ->get()
            ->keyBy('type');

            $types = ['purchase', 'adjustment', 'sale', 'return', 'cancelled_order', 'damaged', 'reserved', 'released'];
            $movementSummary = [];
            foreach ($types as $t) {
                $row = $movementsByType->get($t);
                $movementSummary[$t] = [
                    'type' => $t,
                    'count' => $row ? (int) $row->movement_count : 0,
                    'units' => $row ? (int) $row->total_units : 0,
                ];
            }

            // Low Stock (< 5 and > 0)
            $lowStockProducts = Product::with(['category', 'brand'])
                ->where('stock', '<=', 5)
                ->where('stock', '>', 0)
                ->orderBy('stock', 'asc')
                ->take(30)
                ->get();

            // Out of Stock (<= 0)
            $outOfStockProducts = Product::with(['category', 'brand'])
                ->where('stock', '<=', 0)
                ->latest()
                ->take(30)
                ->get();

            // Fast Moving Products (highest inventory outflow in last 30 days)
            $thirtyDaysAgo = Carbon::now()->subDays(30);
            $fastMoving = InventoryMovement::select(
                'product_id',
                DB::raw('SUM(ABS(quantity)) as outflow_units'),
                DB::raw('COUNT(id) as movement_count')
            )
            ->whereIn('type', ['sale', 'reserved'])
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('product_id')
            ->orderBy('outflow_units', 'desc')
            ->take(10)
            ->get();

            $fastProductIds = $fastMoving->pluck('product_id')->filter();
            $fastProducts = Product::whereIn('id', $fastProductIds)->get()->keyBy('id');

            $enrichedFastMoving = $fastMoving->map(function ($fm) use ($fastProducts) {
                $p = $fastProducts->get($fm->product_id);
                return [
                    'product_id' => $fm->product_id,
                    'title' => $p ? $p->title : 'Deleted Product',
                    'sku' => $p ? $p->sku : 'N/A',
                    'current_stock' => $p ? $p->stock : 0,
                    'outflow_units' => (int) $fm->outflow_units,
                    'movement_count' => (int) $fm->movement_count,
                ];
            });

            // Slow Moving Products (in-stock with zero outflow in last 30 days)
            $slowMoving = Product::where('stock', '>', 5)
                ->whereNotIn('id', $fastProductIds)
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($p) => [
                    'product_id' => $p->id,
                    'title' => $p->title,
                    'sku' => $p->sku,
                    'current_stock' => $p->stock,
                    'price' => (float) $p->price,
                ]);

            return [
                'catalog_summary' => [
                    'total_products' => $totalProducts,
                    'total_stock_units' => $totalStockUnits,
                    'retail_valuation' => $retailValuation,
                    'cost_valuation' => $costValuation,
                    'potential_margin' => max(0.0, $retailValuation - $costValuation),
                ],
                'movements_by_type' => $movementSummary,
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_products' => $outOfStockProducts,
                'fast_moving' => $enrichedFastMoving,
                'slow_moving' => $slowMoving,
            ];
        });
    }

    /**
     * Customer Intelligence (/admin/reports/customers).
     */
    public static function getCustomerIntelligence(string $period = 'last_30_days', ?string $startDate = null, ?string $endDate = null): array
    {
        return AnalyticsCacheService::remember('customers', compact('period', 'startDate', 'endDate'), function () use ($period, $startDate, $endDate) {
            $range = self::resolveDateRange($period, $startDate, $endDate);
            $start = $range['start'];
            $end = $range['end'];

            // Customer counts
            $totalCustomers = User::where('role', '!=', 'admin')->count();
            $newCustomers = User::where('role', '!=', 'admin')->whereBetween('created_at', [$start, $end])->count();

            // Customers who placed at least 1 non-cancelled order
            $customerOrderStats = Order::select(
                'user_id',
                'customer_name',
                'customer_email',
                'customer_phone',
                DB::raw('COUNT(id) as order_count'),
                DB::raw('SUM(total) as total_spent'),
                DB::raw('MAX(created_at) as last_order_at')
            )
            ->where('status', '!=', 'Cancelled')
            ->groupBy('user_id', 'customer_name', 'customer_email', 'customer_phone')
            ->get();

            $totalPurchasingCustomers = $customerOrderStats->count();
            $returningCustomers = $customerOrderStats->where('order_count', '>=', 2)->count();

            $repeatPurchaseRate = $totalPurchasingCustomers > 0
                ? round(($returningCustomers / $totalPurchasingCustomers) * 100, 2)
                : 0.0;

            $totalCustomerSpend = $customerOrderStats->sum('total_spent');
            $avgLifetimeSpend = $totalPurchasingCustomers > 0
                ? round($totalCustomerSpend / $totalPurchasingCustomers, 2)
                : 0.0;

            // Customers with no purchases
            $purchasedUserIds = $customerOrderStats->pluck('user_id')->filter()->toArray();
            $zeroPurchaseCustomers = User::where('role', '!=', 'admin')
                ->whereNotIn('id', $purchasedUserIds)
                ->count();

            // Top Customers by Revenue
            $topSpenders = $customerOrderStats->sortByDesc('total_spent')->values()->take(10)->map(fn($c) => [
                'user_id' => $c->user_id,
                'name' => $c->customer_name ?: 'Guest User',
                'email' => $c->customer_email ?: 'N/A',
                'phone' => $c->customer_phone ?: 'N/A',
                'order_count' => (int) $c->order_count,
                'total_spent' => (float) $c->total_spent,
                'last_order_at' => $c->last_order_at,
            ]);

            // Top Customers by Order Count
            $topFrequent = $customerOrderStats->sortByDesc('order_count')->values()->take(10)->map(fn($c) => [
                'user_id' => $c->user_id,
                'name' => $c->customer_name ?: 'Guest User',
                'email' => $c->customer_email ?: 'N/A',
                'phone' => $c->customer_phone ?: 'N/A',
                'order_count' => (int) $c->order_count,
                'total_spent' => (float) $c->total_spent,
            ]);

            // Referral & Loyalty Summary
            $referralStats = [
                'total_referrals' => Referral::count(),
                'qualified_referrals' => Referral::where('status', 'qualified')->count(),
                'rewarded_referrals' => Referral::where('status', 'rewarded')->count(),
                'reward_points_issued' => (int) Referral::sum('reward_points'),
            ];

            $loyaltyStats = [
                'points_earned' => (int) LoyaltyTransaction::where('type', 'earned')->sum('points'),
                'points_redeemed' => (int) LoyaltyTransaction::where('type', 'redeemed')->sum('points'),
                'points_reversed' => (int) LoyaltyTransaction::where('type', 'reversed')->sum('points'),
                'net_active_points' => (int) (
                    LoyaltyTransaction::whereIn('type', ['earned', 'adjusted'])->sum('points') -
                    LoyaltyTransaction::whereIn('type', ['redeemed', 'reversed'])->sum('points')
                ),
            ];

            return [
                'range' => $range,
                'overview' => [
                    'total_customers' => $totalCustomers,
                    'new_customers' => $newCustomers,
                    'purchasing_customers' => $totalPurchasingCustomers,
                    'returning_customers' => $returningCustomers,
                    'repeat_purchase_rate' => $repeatPurchaseRate,
                    'avg_lifetime_spend' => $avgLifetimeSpend,
                    'zero_purchase_customers' => $zeroPurchaseCustomers,
                ],
                'top_spenders' => $topSpenders,
                'top_frequent' => $topFrequent,
                'referral_stats' => $referralStats,
                'loyalty_stats' => $loyaltyStats,
            ];
        });
    }

    /**
     * Operational Intelligence (/admin/reports/operations).
     */
    public static function getOperationalIntelligence(string $period = 'last_30_days', ?string $startDate = null, ?string $endDate = null): array
    {
        return AnalyticsCacheService::remember('operations', compact('period', 'startDate', 'endDate'), function () use ($period, $startDate, $endDate) {
            $range = self::resolveDateRange($period, $startDate, $endDate);
            $start = $range['start'];
            $end = $range['end'];

            // Order Pipeline Statuses
            $pipelineCounts = Order::select('status', DB::raw('COUNT(id) as count'))
                ->whereBetween('created_at', [$start, $end])
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $statuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
            $pipeline = [];
            $totalInPeriod = Order::whereBetween('created_at', [$start, $end])->count();

            foreach ($statuses as $st) {
                $c = $pipelineCounts[$st] ?? 0;
                $pipeline[$st] = [
                    'status' => $st,
                    'count' => $c,
                    'percentage' => $totalInPeriod > 0 ? round(($c / $totalInPeriod) * 100, 1) : 0.0,
                ];
            }

            // Average Fulfillment Duration (Hours from Order Creation to Delivered in OrderHistory)
            $completedHistory = OrderHistory::where('status', 'Delivered')
                ->with('order')
                ->whereBetween('created_at', [$start, $end])
                ->get();

            $totalHours = 0;
            $sampleCount = 0;
            foreach ($completedHistory as $h) {
                if ($h->order && $h->order->created_at) {
                    $diffHours = $h->order->created_at->diffInMinutes($h->created_at) / 60.0;
                    if ($diffHours >= 0) {
                        $totalHours += $diffHours;
                        $sampleCount++;
                    }
                }
            }

            $avgProcessingHours = $sampleCount > 0 ? round($totalHours / $sampleCount, 1) : 0.0;
            $avgProcessingDays = round($avgProcessingHours / 24.0, 1);

            $deliveredCount = $pipelineCounts['Delivered'] ?? 0;
            $cancelledCount = $pipelineCounts['Cancelled'] ?? 0;
            $concludedCount = $deliveredCount + $cancelledCount;
            $deliveryCompletionRate = $concludedCount > 0 ? round(($deliveredCount / $concludedCount) * 100, 1) : 0.0;

            // Courier Provider Performance
            $couriers = ['Steadfast', 'Pathao'];
            $courierStats = [];

            foreach ($couriers as $provider) {
                $providerOrders = Order::where('courier_provider', $provider)
                    ->whereBetween('created_at', [$start, $end]);

                $total = (clone $providerOrders)->count();
                $delivered = (clone $providerOrders)->where(function ($q) {
                    $q->whereIn('courier_status', ['delivered', 'Delivered'])
                      ->orWhere('status', 'Delivered');
                })->count();

                $failed = (clone $providerOrders)->where(function ($q) {
                    $q->whereIn('courier_status', ['failed', 'cancelled', 'returned'])
                      ->orWhere('status', 'Cancelled');
                })->count();

                $pending = max(0, $total - ($delivered + $failed));

                $successRate = $total > 0 ? round(($delivered / $total) * 100, 1) : 0.0;

                $courierStats[] = [
                    'provider' => $provider,
                    'total_consignments' => $total,
                    'delivered' => $delivered,
                    'failed_returned' => $failed,
                    'pending_in_transit' => $pending,
                    'success_rate' => $successRate,
                ];
            }

            return [
                'range' => $range,
                'pipeline' => $pipeline,
                'fulfillment' => [
                    'avg_processing_hours' => $avgProcessingHours,
                    'avg_processing_days' => $avgProcessingDays,
                    'delivery_completion_rate' => $deliveryCompletionRate,
                    'delivered_count' => $deliveredCount,
                    'cancelled_count' => $cancelledCount,
                ],
                'courier_performance' => $courierStats,
            ];
        });
    }
}
