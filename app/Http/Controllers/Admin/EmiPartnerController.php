<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmiPartner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmiPartnerController extends Controller
{
    public function index()
    {
        $partners = EmiPartner::orderBy('sort_order')->get();

        return Inertia::render('Admin/EmiPartners/Index', [
            'partners' => $partners,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'min_amount' => 'required|numeric|min:0',
            'available_tenures' => 'required|array',
            'interest_rate_note' => 'required|string|max:255',
            'terms' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        EmiPartner::create($validated);

        return back()->with('success', 'EMI partner bank added successfully!');
    }

    public function update(Request $request, EmiPartner $emiPartner)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'min_amount' => 'required|numeric|min:0',
            'available_tenures' => 'required|array',
            'interest_rate_note' => 'required|string|max:255',
            'terms' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $emiPartner->update($validated);

        return back()->with('success', 'EMI partner bank updated successfully!');
    }

    public function destroy(EmiPartner $emiPartner)
    {
        $emiPartner->delete();

        return back()->with('success', 'EMI partner bank removed.');
    }
}
