<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(Request $request): Response
    {
        $units = Unit::with('baseUnit')
            ->withCount('products')
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('short_code', 'like', "%{$search}%")
                        ->orWhere('symbol', 'like', "%{$search}%");
                });
            })
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $baseUnits = Unit::whereNull('base_unit_id')->orderBy('name')->get(['id', 'name', 'short_code']);

        return Inertia::render('Admin/Units/Index', [
            'units' => $units,
            'baseUnits' => $baseUnits,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_code' => 'required|string|max:50|unique:units,short_code',
            'symbol' => 'nullable|string|max:20',
            'type' => 'required|string|in:quantity,length,weight,volume,other',
            'base_unit_id' => 'nullable|exists:units,id',
            'conversion_factor' => 'nullable|numeric|min:0.0001',
            'is_active' => 'boolean',
        ]);

        $validated['conversion_factor'] = $validated['conversion_factor'] ?? 1.0;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $unit = Unit::create($validated);

        AuditLogger::log('unit.created', $unit, null, $validated);

        return back()->with('success', "Measurement Unit '{$unit->name}' created successfully.");
    }

    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_code' => "required|string|max:50|unique:units,short_code,{$unit->id}",
            'symbol' => 'nullable|string|max:20',
            'type' => 'required|string|in:quantity,length,weight,volume,other',
            'base_unit_id' => 'nullable|exists:units,id|not_in:' . $unit->id,
            'conversion_factor' => 'nullable|numeric|min:0.0001',
            'is_active' => 'boolean',
        ]);

        $old = $unit->toArray();
        $unit->update($validated);

        AuditLogger::log('unit.updated', $unit, $old, $validated);

        return back()->with('success', "Measurement Unit '{$unit->name}' updated successfully.");
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->products()->exists()) {
            return back()->with('error', "Cannot delete Unit '{$unit->name}' because it is assigned to {$unit->products()->count()} product(s).");
        }

        $name = $unit->name;
        $unit->delete();

        AuditLogger::log('unit.deleted', null, ['name' => $name, 'id' => $unit->id], null);

        return back()->with('success', "Measurement Unit '{$name}' deleted successfully.");
    }
}
