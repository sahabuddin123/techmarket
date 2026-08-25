<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount('orders');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
        }

        $customers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only('search'),
        ]);
    }

    public function show(User $customer)
    {
        $customer->load(['addresses']);
        $orders = $customer->orders()->with('items')->latest()->paginate(10);
        $totalSpent = $customer->orders()->where('status', '!=', 'Cancelled')->sum('total');
        
        $cctvProjects = class_exists(\App\Models\Cctv\CctvProject::class) 
            ? \App\Models\Cctv\CctvProject::where('user_id', $customer->id)->latest()->get() 
            : [];
            
        $serviceRequests = class_exists(\App\Models\Cctv\CctvServiceRequest::class)
            ? \App\Models\Cctv\CctvServiceRequest::where('user_id', $customer->id)->latest()->get()
            : [];

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer,
            'orders' => $orders,
            'totalSpent' => (float) $totalSpent,
            'cctvProjects' => $cctvProjects,
            'serviceRequests' => $serviceRequests,
        ]);
    }
}
