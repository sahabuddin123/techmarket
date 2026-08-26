<?php

namespace App\Http\Controllers;

use App\Models\Cctv\CctvProject;
use App\Models\Cctv\CctvProjectBuilding;
use App\Models\Cctv\CctvProjectChangeRequest;
use App\Models\Cctv\CctvProjectSite;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CctvEnterpriseProjectController extends Controller
{
    /**
     * Customer Enterprise Projects Dashboard.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $projects = CctvProject::with(['sites.buildings', 'estimates.items'])
            ->where('user_id', $userId)
            ->latest()
            ->get()
            ->map(function ($project) {
                return array_merge($project->toArray(), [
                    'aggregated_metrics' => $project->aggregated_metrics,
                ]);
            });

        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $versionKey = $activeVersion ? $activeVersion->key : Setting::get('storefront_version', 'v1');

        return Inertia::render('Account/CctvProjects', [
            'storefront_version' => $versionKey,
            'projects' => $projects,
        ]);
    }

    /**
     * Customer Enterprise Project Detailed Portal.
     */
    public function show(Request $request, $id): Response
    {
        $userId = $request->user()->id;
        $project = CctvProject::with([
            'sites.buildings.floors.zones',
            'estimates.items',
            'installedEquipment',
            'changeRequests',
            'handover',
        ])
            ->where('user_id', $userId)
            ->where('id', $id)
            ->firstOrFail();

        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $versionKey = $activeVersion ? $activeVersion->key : Setting::get('storefront_version', 'v1');

        return Inertia::render('Account/CctvProjectShow', [
            'storefront_version' => $versionKey,
            'project' => array_merge($project->toArray(), [
                'aggregated_metrics' => $project->aggregated_metrics,
            ]),
        ]);
    }

    /**
     * Store a new Enterprise Project.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'organization_name' => 'nullable|string|max:150',
            'project_type' => 'required|string|max:50',
            'industry' => 'nullable|string|max:100',
            'priority' => 'required|string|in:low,normal,high,urgent,critical',
            'budget' => 'nullable|numeric|min:0',
            'expected_completion_date' => 'nullable|date|after_or_equal:today',
            'notes' => 'nullable|string|max:1000',
            'sites' => 'nullable|array',
        ]);

        $project = CctvProject::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'organization_name' => $validated['organization_name'] ?? null,
            'project_type' => $validated['project_type'],
            'industry' => $validated['industry'] ?? null,
            'priority' => $validated['priority'],
            'budget' => $validated['budget'] ?? 0.00,
            'start_date' => now(),
            'expected_completion_date' => $validated['expected_completion_date'] ?? now()->addMonths(3),
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Auto-create initial site if provided
        if (!empty($validated['sites'])) {
            foreach ($validated['sites'] as $siteData) {
                CctvProjectSite::create([
                    'project_id' => $project->id,
                    'name' => $siteData['name'] ?? 'Main Campus / Site',
                    'address' => $siteData['address'] ?? 'Dhaka',
                    'district' => $siteData['district'] ?? 'Dhaka',
                    'site_type' => $siteData['site_type'] ?? 'head_office',
                ]);
            }
        } else {
            CctvProjectSite::create([
                'project_id' => $project->id,
                'name' => 'Main Head Office Site',
                'address' => 'Dhaka Premises',
                'district' => 'Dhaka',
                'site_type' => 'head_office',
            ]);
        }

        AuditLogger::log('cctv.project_created', $project, null, [
            'project_number' => $project->project_number,
            'budget' => $project->budget,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Enterprise CCTV Project created successfully.',
            'data' => [
                'project_id' => $project->id,
                'project_number' => $project->project_number,
            ],
        ]);
    }

    /**
     * Add a new Site to an existing Project.
     */
    public function storeSite(Request $request, $projectId): JsonResponse
    {
        $userId = $request->user()->id;
        $project = CctvProject::where('user_id', $userId)->where('id', $projectId)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'address' => 'required|string|max:500',
            'district' => 'required|string|max:100',
            'site_type' => 'required|string|in:head_office,branch,factory,warehouse,retail',
            'contact_person' => 'nullable|string|max:150',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        $site = CctvProjectSite::create(array_merge($validated, ['project_id' => $project->id]));

        AuditLogger::log('cctv.project_site_added', $site, null, [
            'project' => $project->project_number,
            'site' => $site->name,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Site '{$site->name}' added to project.",
            'data' => $site,
        ]);
    }

    /**
     * Submit a Project Change Request.
     */
    public function storeChangeRequest(Request $request, $projectId): JsonResponse
    {
        $userId = $request->user()->id;
        $project = CctvProject::where('user_id', $userId)->where('id', $projectId)->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'required|string|max:1500',
            'cost_impact' => 'nullable|numeric',
            'scope_changes' => 'nullable|array',
        ]);

        $cr = CctvProjectChangeRequest::create([
            'project_id' => $project->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'cost_impact' => $validated['cost_impact'] ?? 0.00,
            'scope_changes' => $validated['scope_changes'] ?? null,
            'status' => 'requested',
            'requested_by_user_id' => $userId,
        ]);

        AuditLogger::log('cctv.change_request_submitted', $cr, null, [
            'project' => $project->project_number,
            'cr' => $cr->change_number,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Change Request #{$cr->change_number} submitted for technical review.",
            'data' => $cr,
        ]);
    }
}
