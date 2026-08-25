<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\FinancialAccount;
use App\Services\Purchases\PurchaseService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchasesController extends Controller
{
    /**
     * Display purchases listing.
     */
    public function index(Request $request): Response
    {
        $query = Purchase::with(['supplier:id,company_name,phone', 'warehouse:id,name', 'creator:id,name', 'items.product']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('purchase_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->query('payment_status'));
        }

        $purchases = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $suppliers = Supplier::where('status', 'active')
            ->select('id', 'company_name', 'contact_person', 'phone', 'email', 'supplier_code', 'current_balance', 'credit_limit')
            ->orderBy('company_name')
            ->get();
        $warehouses = Warehouse::where('is_active', true)->select('id', 'name')->get();
        $products = Product::select('id', 'title', 'sku', 'price', 'regular_price', 'cost_price', 'stock')->orderBy('title')->get();
        $financialAccounts = FinancialAccount::where('is_active', true)->get();

        $totalPurchases = Purchase::where('status', '!=', 'cancelled')->sum('total');
        $totalPaid = Purchase::where('status', '!=', 'cancelled')->sum('paid_amount');
        $totalDue = Purchase::where('status', '!=', 'cancelled')->sum('due_amount');

        return Inertia::render('Admin/Purchases/Index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'warehouses' => $warehouses,
            'products' => $products,
            'financialAccounts' => $financialAccounts,
            'metrics' => [
                'total_purchases' => (float)$totalPurchases,
                'total_paid' => (float)$totalPaid,
                'total_due' => (float)$totalDue,
                'total_orders' => $purchases->total(),
            ],
            'filters' => $request->only(['search', 'status', 'payment_status']),
        ]);
    }

    /**
     * Store new purchase order.
     */
    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'purchase_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity_ordered' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            $purchase = PurchaseService::createPurchase(
                data: $request->all(),
                items: $request->input('items'),
                userId: auth()->id()
            );

            return back()->with('success', "Purchase Order #{$purchase->purchase_number} created successfully.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Receive items for purchase order (partial or full).
     */
    public function receive(Request $request, Purchase $purchase)
    {
        $request->validate([
            'received' => 'required|array', // [item_id => quantity]
        ]);

        try {
            $updated = PurchaseService::receiveItems(
                purchaseId: $purchase->id,
                receivedQuantities: $request->input('received'),
                userId: auth()->id()
            );

            return back()->with('success', "Goods receipt recorded for Purchase #{$updated->purchase_number}. Status: {$updated->status}");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Record payment to supplier.
     */
    public function addPayment(Request $request, Purchase $purchase)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'financial_account_id' => 'nullable|exists:financial_accounts,id',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            PurchaseService::recordPayment(
                purchaseId: $purchase->id,
                amount: (float)$request->input('amount'),
                paymentMethod: $request->input('payment_method'),
                financialAccountId: $request->input('financial_account_id'),
                notes: $request->input('notes'),
                userId: auth()->id()
            );

            return back()->with('success', "Payment recorded successfully for Purchase #{$purchase->purchase_number}.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
