<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehousesController extends Controller
{
    /**
     * Display warehouse listing.
     */
    public function index(Request $request): Response
    {
        $warehouses = Warehouse::withCount('stocks')
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Admin/Warehouses/Index', [
            'warehouses' => $warehouses,
        ]);
    }

    /**
     * Store new warehouse.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:50|unique:warehouses,code',
            'address' => 'nullable|string|max:500',
            'manager_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            Warehouse::where('is_default', true)->update(['is_default' => false]);
        }

        $warehouse = Warehouse::create($validated);
        AuditLogger::log('warehouses.created', $warehouse, null, ['code' => $warehouse->code]);

        return back()->with('success', "Warehouse '{$warehouse->name}' registered successfully.");
    }

    /**
     * Update warehouse.
     */
    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:50|unique:warehouses,code,' . $warehouse->id,
            'address' => 'nullable|string|max:500',
            'manager_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            Warehouse::where('id', '!=', $warehouse->id)->update(['is_default' => false]);
        }

        $warehouse->update($validated);
        AuditLogger::log('warehouses.updated', $warehouse, null, ['code' => $warehouse->code]);

        return back()->with('success', "Warehouse updated successfully.");
    }
}
