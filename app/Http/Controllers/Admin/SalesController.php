<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Sales\SalesService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    /**
     * Display sales list and metrics.
     */
    public function index(Request $request): Response
    {
        $query = Sale::with(['customer:id,name,email,phone', 'salesperson:id,name', 'items.product', 'payments']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('sale_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->query('payment_status'));
        }

        if ($request->filled('sales_channel')) {
            $query->where('sales_channel', $request->query('sales_channel'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        $sales = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate KPI Metrics
        $totalSalesCount = Sale::where('status', '!=', 'cancelled')->count();
        $totalRevenue = Sale::where('status', '!=', 'cancelled')->sum('grand_total');
        $totalCollected = Sale::where('status', '!=', 'cancelled')->sum('paid_amount');
        $totalDue = Sale::where('status', '!=', 'cancelled')->sum('due_amount');
        $todayRevenue = Sale::whereDate('created_at', now()->toDateString())->where('status', '!=', 'cancelled')->sum('grand_total');

        return Inertia::render('Admin/Sales/Index', [
            'sales' => $sales,
            'metrics' => [
                'total_sales_count' => $totalSalesCount,
                'total_revenue' => (float)$totalRevenue,
                'total_collected' => (float)$totalCollected,
                'total_due' => (float)$totalDue,
                'today_revenue' => (float)$todayRevenue,
            ],
            'filters' => $request->only(['search', 'status', 'payment_status', 'sales_channel', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show detailed sale invoice and audit log.
     */
    public function show(Sale $sale): Response
    {
        $sale->load(['customer', 'salesperson', 'warehouse', 'items.product', 'payments.financialAccount', 'returns.items.product']);

        return Inertia::render('Admin/Sales/Show', [
            'sale' => $sale,
        ]);
    }

    /**
     * Process refund for a sale.
     */
    public function refund(Request $request, Sale $sale)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity_returned' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'refund_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $saleReturn = SalesService::refundSale(
                saleId: $sale->id,
                items: $request->input('items'),
                refundAmount: (float)$request->input('refund_amount'),
                paymentMethod: $request->input('payment_method'),
                reason: $request->input('reason'),
                userId: auth()->id()
            );

            return back()->with('success', "Refund #{$saleReturn->return_number} processed successfully.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
