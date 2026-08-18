<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'district' => 'required|string',
            'is_default' => 'boolean',
        ]);

        $userId = auth()->id();

        if (!empty($validated['is_default'])) {
            Address::where('user_id', $userId)->update(['is_default' => false]);
        }

        $validated['user_id'] = $userId;
        Address::create($validated);

        return back()->with('success', 'Address added successfully.');
    }

    public function destroy(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $address->delete();
        return back()->with('success', 'Address deleted.');
    }
}
