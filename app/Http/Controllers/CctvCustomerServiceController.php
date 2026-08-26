<?php

namespace App\Http\Controllers;

use App\Models\Cctv\CctvDiagnosticQuestion;
use App\Models\Cctv\CctvInstalledEquipment;
use App\Models\Cctv\CctvServiceRequest;
use App\Models\Cctv\CctvWarranty;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CctvCustomerServiceController extends Controller
{
    /**
     * View customer's installed CCTV hardware & warranty status.
     */
    public function equipment(Request $request): Response
    {
        $userId = $request->user()->id;
        $equipment = CctvInstalledEquipment::with(['warranty', 'order'])
            ->where('user_id', $userId)
            ->latest()
            ->get();

        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $versionKey = $activeVersion ? $activeVersion->key : Setting::get('storefront_version', 'v1');

        return Inertia::render('Account/CctvEquipment', [
            'storefront_version' => $versionKey,
            'equipment' => $equipment,
        ]);
    }

    /**
     * View customer's CCTV service tickets.
     */
    public function serviceRequests(Request $request): Response
    {
        $userId = $request->user()->id;
        $requests = CctvServiceRequest::with(['equipment', 'warranty', 'visits', 'technician'])
            ->where('user_id', $userId)
            ->latest()
            ->get();

        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $versionKey = $activeVersion ? $activeVersion->key : Setting::get('storefront_version', 'v1');

        return Inertia::render('Account/CctvServiceRequests', [
            'storefront_version' => $versionKey,
            'requests' => $requests,
        ]);
    }

    /**
     * New Service Request Form.
     */
    public function createServiceRequest(Request $request): Response
    {
        $userId = $request->user()->id;
        $equipment = CctvInstalledEquipment::with('warranty')
            ->where('user_id', $userId)
            ->where('status', 'operational')
            ->get();

        $diagnosticQuestions = CctvDiagnosticQuestion::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $versionKey = $activeVersion ? $activeVersion->key : Setting::get('storefront_version', 'v1');

        return Inertia::render('Account/CctvCreateServiceRequest', [
            'storefront_version' => $versionKey,
            'equipment' => $equipment,
            'diagnosticQuestions' => $diagnosticQuestions,
        ]);
    }

    /**
     * Submit New CCTV Service Request.
     */
    public function storeServiceRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'installed_equipment_id' => 'nullable|exists:cctv_installed_equipment,id',
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|max:50',
            'customer_address' => 'required|string|max:500',
            'problem_category' => 'required|string|max:50',
            'problem_description' => 'required|string|max:1500',
            'priority' => 'required|string|in:low,normal,high,urgent',
            'preferred_visit_date' => 'nullable|date|after_or_equal:today',
            'preferred_time' => 'nullable|string|max:50',
            'diagnostic_answers' => 'nullable|array',
        ]);

        $warrantyId = null;
        $warrantyCovered = false;

        // Authoritative Server-side Warranty Validation
        if (!empty($validated['installed_equipment_id'])) {
            $warranty = CctvWarranty::where('installed_equipment_id', $validated['installed_equipment_id'])
                ->where('status', 'active')
                ->where('warranty_end', '>=', now())
                ->first();

            if ($warranty) {
                $warrantyId = $warranty->id;
                $warrantyCovered = true;
            }
        }

        $serviceRequest = CctvServiceRequest::create([
            'user_id' => $request->user()->id,
            'installed_equipment_id' => $validated['installed_equipment_id'] ?? null,
            'warranty_id' => $warrantyId,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
            'problem_category' => $validated['problem_category'],
            'problem_description' => $validated['problem_description'],
            'priority' => $validated['priority'],
            'status' => 'submitted',
            'preferred_visit_date' => $validated['preferred_visit_date'] ?? null,
            'preferred_time' => $validated['preferred_time'] ?? null,
            'diagnostic_answers' => $validated['diagnostic_answers'] ?? null,
            'warranty_covered_amount' => $warrantyCovered ? 500.00 : 0.00,
            'customer_payable_amount' => $warrantyCovered ? 0.00 : 500.00,
        ]);

        AuditLogger::log('cctv.service_request_created', $serviceRequest, null, [
            'ticket' => $serviceRequest->ticket_number,
            'warranty_covered' => $warrantyCovered,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Service request submitted successfully. Ticket #' . $serviceRequest->ticket_number,
            'data' => [
                'ticket_number' => $serviceRequest->ticket_number,
                'warranty_covered' => $warrantyCovered,
                'status' => $serviceRequest->status,
            ],
        ]);
    }
}
