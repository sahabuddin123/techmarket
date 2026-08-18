<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceRequest::with('user')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $requests = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/ServiceRequests/Index', [
            'serviceRequests' => $requests,
            'filters' => $request->only(['status']),
        ]);
    }

    public function updateStatus(Request $request, ServiceRequest $serviceRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,contacted,scheduled,in_progress,completed,cancelled',
            'assigned_technician' => 'nullable|string|max:255',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $serviceRequest->update($validated);

        return back()->with('success', "Service request #{$serviceRequest->tracking_code} updated to status '{$validated['status']}'!");
    }
}
