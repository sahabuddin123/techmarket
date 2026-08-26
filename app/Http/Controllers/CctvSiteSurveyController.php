<?php

namespace App\Http\Controllers;

use App\Models\Cctv\CctvSiteSurvey;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CctvSiteSurveyController extends Controller
{
    /**
     * Customer-facing Site Survey Request Form.
     */
    public function create(Request $request): Response
    {
        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $versionKey = $activeVersion ? $activeVersion->key : Setting::get('storefront_version', 'v1');

        return Inertia::render('CctvSiteSurveyRequest', [
            'storefront_version' => $versionKey,
            'defaultDistrict' => 'Dhaka',
            'user' => $request->user(),
        ]);
    }

    /**
     * Store a Site Survey Request.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'nullable|email|max:150',
            'project_name' => 'nullable|string|max:150',
            'project_address' => 'required|string|max:500',
            'district' => 'required|string|max:100',
            'upazila_area' => 'nullable|string|max:100',
            'preferred_date' => 'nullable|date|after_or_equal:today',
            'preferred_time' => 'nullable|string|max:50',
            'floors_count' => 'nullable|integer|min:1|max:50',
            'project_type' => 'nullable|string|max:50',
            'estimated_camera_count' => 'nullable|integer|min:1|max:128',
            'notes' => 'nullable|string|max:1000',
        ]);

        $survey = CctvSiteSurvey::create([
            'user_id' => $request->user()?->id,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'] ?? null,
            'project_name' => $validated['project_name'] ?? 'Premises Surveillance Assessment',
            'project_address' => $validated['project_address'],
            'district' => $validated['district'],
            'upazila_area' => $validated['upazila_area'] ?? null,
            'preferred_date' => $validated['preferred_date'] ?? null,
            'preferred_time' => $validated['preferred_time'] ?? 'Morning (10:00 AM - 1:00 PM)',
            'floors_count' => $validated['floors_count'] ?? 1,
            'project_type' => $validated['project_type'] ?? 'commercial_office',
            'estimated_camera_count' => $validated['estimated_camera_count'] ?? 4,
            'status' => 'requested',
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLogger::log('cctv.site_survey_requested', $survey, null, [
            'survey_number' => $survey->survey_number,
            'customer' => $survey->customer_name,
            'phone' => $survey->customer_phone,
            'district' => $survey->district,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Your site survey request has been submitted successfully. A specialist will contact you shortly to confirm the appointment.',
            'data' => [
                'survey_number' => $survey->survey_number,
                'status' => $survey->status,
                'scheduled_date' => $survey->preferred_date?->format('d M, Y'),
            ],
        ]);
    }

    /**
     * Customer view of specific site survey.
     */
    public function show(string $surveyNumber, Request $request): Response
    {
        $survey = CctvSiteSurvey::with(['report', 'technician'])
            ->where('survey_number', $surveyNumber)
            ->firstOrFail();

        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $versionKey = $activeVersion ? $activeVersion->key : Setting::get('storefront_version', 'v1');

        return Inertia::render('CctvSiteSurveyShow', [
            'storefront_version' => $versionKey,
            'survey' => $survey,
        ]);
    }
}
