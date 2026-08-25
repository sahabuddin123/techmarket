<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Services\Accounting\AccountingService;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SuppliersController extends Controller
{
    /**
     * Search suppliers for async popover / dropdown selector.
     */
    public function search(Request $request): JsonResponse
    {
        $search = trim($request->query('query', $request->query('search', '')));
        $limit = max(1, min((int)$request->query('limit', 20), 50));

        $query = Supplier::query()->where('status', 'active');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('supplier_code', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('company_name')
            ->take($limit)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'company_name' => $s->company_name,
                    'contact_person' => $s->contact_person,
                    'phone' => $s->phone,
                    'email' => $s->email,
                    'supplier_code' => $s->supplier_code ?: ('SUP-' . str_pad($s->id, 5, '0', STR_PAD_LEFT)),
                    'current_balance' => (float)($s->current_balance ?? 0),
                    'credit_limit' => (float)($s->credit_limit ?? 0),
                    'payment_terms' => $s->payment_terms ?? 'due_on_receipt',
                    'city' => $s->city,
                    'status' => $s->status ?? 'active',
                ];
            });

        return response()->json([
            'success' => true,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Display supplier directory.
     */
    public function index(Request $request): Response
    {
        $query = Supplier::withCount('purchases');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('supplier_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $suppliers = $query->orderBy('company_name')->paginate(15)->withQueryString();

        $totalPayable = Supplier::sum('current_balance');
        $activeCount = Supplier::where('status', 'active')->count();

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'metrics' => [
                'total_suppliers' => $suppliers->total(),
                'active_suppliers' => $activeCount,
                'total_payable' => (float)$totalPayable,
            ],
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Store new supplier.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:190',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'supplier_code' => 'nullable|string|max:50|unique:suppliers,supplier_code',
            'tax_number' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:190',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'credit_limit' => 'nullable|numeric|min:0',
            'opening_balance' => 'nullable|numeric|min:0',
            'opening_balance_type' => 'nullable|in:payable,advance,neutral',
            'payment_terms' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive',
            'notes' => 'nullable|string|max:1000',
        ]);

        $openingBalance = max(0.00, (float)($validated['opening_balance'] ?? 0.00));
        $openingBalanceType = $validated['opening_balance_type'] ?? ($openingBalance > 0 ? 'payable' : 'neutral');
        
        $currentBalance = ($openingBalanceType === 'payable') 
            ? $openingBalance 
            : ($openingBalanceType === 'advance' ? -$openingBalance : 0.00);

        if (empty($validated['supplier_code'])) {
            $validated['supplier_code'] = 'SUP-' . strtoupper(substr(uniqid(), -6));
        }

        $validated['current_balance'] = $currentBalance;
        $validated['opening_balance'] = $openingBalance;
        $validated['opening_balance_type'] = $openingBalanceType;
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['country'] = $validated['country'] ?? 'Bangladesh';

        $supplier = Supplier::create($validated);

        if ($openingBalance > 0 && $openingBalanceType !== 'neutral') {
            AccountingService::recordSupplierOpeningBalance($supplier, $openingBalance, $openingBalanceType, auth()->id() ?? 1);
        }

        AuditLogger::log('suppliers.created', $supplier, null, ['company' => $supplier->company_name]);

        if ($request->wantsJson() || $request->ajax() || $request->is('admin/suppliers*') && $request->isJson()) {
            return response()->json([
                'success' => true,
                'message' => "Supplier '{$supplier->company_name}' registered successfully.",
                'supplier' => [
                    'id' => $supplier->id,
                    'company_name' => $supplier->company_name,
                    'contact_person' => $supplier->contact_person,
                    'phone' => $supplier->phone,
                    'email' => $supplier->email,
                    'supplier_code' => $supplier->supplier_code,
                    'current_balance' => (float)$supplier->current_balance,
                    'credit_limit' => (float)$supplier->credit_limit,
                    'payment_terms' => $supplier->payment_terms,
                    'city' => $supplier->city,
                    'status' => $supplier->status,
                ],
            ], 201);
        }

        return back()->with('success', "Supplier '{$supplier->company_name}' registered successfully.");
    }

    /**
     * Update supplier details.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:190',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'supplier_code' => 'nullable|string|max:50|unique:suppliers,supplier_code,' . $supplier->id,
            'tax_number' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:190',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string|max:1000',
        ]);

        $supplier->update($validated);
        AuditLogger::log('suppliers.updated', $supplier, null, ['company' => $supplier->company_name]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Supplier updated successfully.",
                'supplier' => $supplier,
            ]);
        }

        return back()->with('success', "Supplier updated successfully.");
    }

    /**
     * Delete supplier.
     */
    public function destroy(Supplier $supplier)
    {
        if ($supplier->purchases()->exists()) {
            return back()->with('error', 'Cannot delete supplier with linked purchase orders. Set status to Inactive instead.');
        }

        $supplier->delete();
        AuditLogger::log('suppliers.deleted', null, ['company' => $supplier->company_name]);

        return back()->with('success', 'Supplier deleted successfully.');
    }
}

