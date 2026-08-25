<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\User;
use App\Services\Pos\PosService;
use App\Services\Pos\PosCustomerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Display the POS terminal interface.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $categoryId = $request->query('category_id') ? (int)$request->query('category_id') : null;
        $brandId = $request->query('brand_id') ? (int)$request->query('brand_id') : null;
        $warehouseId = $request->query('warehouse_id') ? (int)$request->query('warehouse_id') : null;

        $posData = PosService::getPosCatalog($search, $categoryId, $brandId, $warehouseId);
        $heldSales = PosService::getHeldSales();
        $defaultCustomer = PosCustomerService::formatCustomerSummary(PosCustomerService::getCanonicalWalkInCustomer());
        $initialCustomers = PosCustomerService::searchCustomers('', 30);

        return Inertia::render('Admin/Pos/Index', [
            'products' => $posData['products'],
            'categories' => $posData['categories'],
            'brands' => $posData['brands'],
            'warehouse' => $posData['warehouse'],
            'financialAccounts' => $posData['financial_accounts'],
            'heldSales' => $heldSales,
            'defaultCustomer' => $defaultCustomer,
            'customers' => $initialCustomers,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'brand_id' => $brandId,
            ],
        ]);
    }

    /**
     * Search customers for POS terminal popover.
     */
    public function searchCustomers(Request $request)
    {
        $query = $request->query('q', '');
        $customers = PosCustomerService::searchCustomers($query, 30);

        return response()->json([
            'success' => true,
            'customers' => $customers,
        ]);
    }

    /**
     * Get detailed customer financials and recent sales.
     */
    public function getCustomer(User $customer)
    {
        $details = PosCustomerService::getCustomerDetails($customer);

        return response()->json([
            'success' => true,
            'customer' => $details,
        ]);
    }

    /**
     * Create a new customer directly from POS terminal.
     */
    public function createCustomer(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:50|unique:users,phone',
            'email' => 'nullable|string|email|max:150|unique:users,email',
            'credit_limit' => 'nullable|numeric|min:0',
            'opening_balance' => 'nullable|numeric|min:0',
            'opening_balance_type' => 'nullable|in:receivable,payable,neutral',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'tax_number' => 'nullable|string|max:50',
            'customer_code' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        try {
            $customer = PosCustomerService::createCustomerFromPos($request->all(), auth()->id() ?? 1);

            return response()->json([
                'success' => true,
                'message' => "Customer '{$customer['name']}' created and selected successfully!",
                'customer' => $customer,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update customer directly from POS terminal.
     */
    public function updateCustomer(Request $request, User $customer)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:50|unique:users,phone,' . $customer->id,
            'email' => 'nullable|string|email|max:150|unique:users,email,' . $customer->id,
            'credit_limit' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'tax_number' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        try {
            $updated = PosCustomerService::updateCustomerFromPos($customer, $request->all(), auth()->id() ?? 1);

            return response()->json([
                'success' => true,
                'message' => "Customer '{$updated['name']}' updated successfully!",
                'customer' => $updated,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Return canonical default Walk-in customer.
     */
    public function getDefaultWalkIn()
    {
        $walkIn = PosCustomerService::getCanonicalWalkInCustomer();

        return response()->json([
            'success' => true,
            'customer' => PosCustomerService::formatCustomerSummary($walkIn),
        ]);
    }

    /**
     * Process and complete a POS checkout.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payments' => 'nullable|array',
            'customer_id' => 'nullable|exists:users,id',
            'customer_name' => 'nullable|string|max:150',
            'customer_phone' => 'nullable|string|max:50',
        ]);

        try {
            $sale = PosService::completeSale($request->all(), auth()->id() ?? 1);

            return response()->json([
                'success' => true,
                'message' => "Sale #{$sale->sale_number} completed successfully!",
                'sale' => $sale,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Hold a POS cart.
     */
    public function hold(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            $sale = PosService::holdCart($request->all(), auth()->id() ?? 1);

            return response()->json([
                'success' => true,
                'message' => "Cart held successfully as #{$sale->sale_number}",
                'sale' => $sale,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete or void a held cart.
     */
    public function deleteHeld(Sale $sale)
    {
        if ($sale->is_held && $sale->status === 'draft') {
            $sale->items()->delete();
            $sale->delete();
            return back()->with('success', 'Held cart cleared.');
        }

        return back()->with('error', 'Cannot delete this sale record.');
    }
}

