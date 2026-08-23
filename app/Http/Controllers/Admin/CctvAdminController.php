<?php

namespace App\Http\Controllers\Admin;

use App\DTOs\Cctv\CctvRequirementDTO;
use App\Enums\Cctv\CctvProductType;
use App\Enums\Cctv\CctvRuleType;
use App\Enums\Cctv\CctvSystemType;
use App\Http\Controllers\Controller;
use App\Models\Cctv\CctvCableProfile;
use App\Models\Cctv\CctvDeviceProfile;
use App\Models\Cctv\CctvEstimate;
use App\Models\Cctv\CctvProductProfile;
use App\Models\Cctv\CctvQuote;
use App\Models\Cctv\CctvRule;
use App\Models\Cctv\CctvStorageProfile;
use App\Models\Product;
use App\Models\Setting;
use App\Services\AuditLogger;
use App\Services\Contracts\Cctv\CctvEstimatorServiceInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CctvAdminController extends Controller
{
    public function __construct(
        private readonly CctvEstimatorServiceInterface $estimatorService
    ) {}

    /**
     * CCTV Admin Dashboard with real KPIs and metrics.
     */
    public function index(): Response
    {
        $kpis = [
            'total_profiles' => CctvProductProfile::count(),
            'camera_profiles' => CctvProductProfile::where('product_type', CctvProductType::CAMERA->value)->count(),
            'recorder_profiles' => CctvProductProfile::whereIn('product_type', ['dvr', 'nvr', 'xvr'])->count(),
            'storage_profiles' => CctvProductProfile::where('product_type', CctvProductType::STORAGE->value)->count(),
            'cable_profiles' => CctvProductProfile::where('product_type', CctvProductType::CABLE->value)->count(),
            'active_compatibility_rules' => CctvRule::where('rule_type', CctvRuleType::COMPATIBILITY->value)->where('is_active', true)->count(),
            'active_recommendation_rules' => CctvRule::where('rule_type', CctvRuleType::RECOMMENDATION->value)->where('is_active', true)->count(),
            'active_calculation_rules' => CctvRule::whereIn('rule_type', ['storage_calculation', 'cable_calculation'])->where('is_active', true)->count(),
            'total_estimates' => CctvEstimate::count(),
            'saved_estimates' => CctvEstimate::where('status', 'saved')->count(),
            'total_quotes' => CctvQuote::count(),
        ];

        $recentEstimates = CctvEstimate::with(['user', 'items.product'])
            ->latest()
            ->limit(6)
            ->get();

        $recentQuotes = CctvQuote::with(['estimate', 'user'])
            ->latest()
            ->limit(6)
            ->get();

        return Inertia::render('Admin/Cctv/Dashboard', [
            'kpis' => $kpis,
            'recentEstimates' => $recentEstimates,
            'recentQuotes' => $recentQuotes,
        ]);
    }

    /**
     * Product Profiles listing & management.
     */
    public function profiles(Request $request): Response
    {
        $query = CctvProductProfile::with(['product.brand', 'product.category', 'deviceProfile', 'storageProfile', 'cableProfile']);

        if ($request->filled('type')) {
            $query->where('product_type', $request->type);
        }

        if ($request->filled('system_type')) {
            $query->where('system_type', $request->system_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%");
            });
        }

        $profiles = $query->latest()->paginate(15)->withQueryString();

        // Available catalog products without CCTV profiles attached (for profile creation dropdown)
        $availableProducts = Product::whereDoesntHave('cctvProfile')
            ->where('is_active', true)
            ->select('id', 'title', 'sku', 'price')
            ->orderBy('title')
            ->limit(100)
            ->get();

        return Inertia::render('Admin/Cctv/ProductProfiles', [
            'profiles' => $profiles,
            'availableProducts' => $availableProducts,
            'filters' => $request->only(['type', 'system_type', 'search']),
        ]);
    }

    /**
     * Store a new CCTV Product Profile.
     */
    public function storeProfile(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id|unique:cctv_product_profiles,product_id',
            'product_type' => 'required|string',
            'system_type' => 'required|string',
            'resolution_mp' => 'nullable|numeric|min:0',
            'camera_form_factor' => 'nullable|string',
            'lens_mm' => 'nullable|numeric|min:0',
            'ir_distance_meters' => 'nullable|integer|min:0',
            'low_light_tech' => 'nullable|string',
            'audio_type' => 'nullable|string',
            'ai_features' => 'nullable|array',
            'ip_rating' => 'nullable|string',
            'environment' => 'nullable|string',
            'power_source' => 'nullable|string',
            'power_consumption_watts' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            // Device specific
            'channel_count' => 'nullable|integer|min:1',
            'max_camera_resolution_mp' => 'nullable|numeric|min:0',
            'hdd_bay_count' => 'nullable|integer|min:0',
            'poe_port_count' => 'nullable|integer|min:0',
            // Storage specific
            'capacity_tb' => 'nullable|numeric|min:0.5',
            'rpm' => 'nullable|integer',
            // Cable specific
            'cable_type' => 'nullable|string',
            'meters_per_unit' => 'nullable|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $profile = CctvProductProfile::create([
                'product_id' => $validated['product_id'],
                'product_type' => $validated['product_type'],
                'system_type' => $validated['system_type'],
                'resolution_mp' => $validated['resolution_mp'] ?? null,
                'camera_form_factor' => $validated['camera_form_factor'] ?? null,
                'lens_mm' => $validated['lens_mm'] ?? null,
                'ir_distance_meters' => $validated['ir_distance_meters'] ?? null,
                'low_light_tech' => $validated['low_light_tech'] ?? null,
                'audio_type' => $validated['audio_type'] ?? 'none',
                'ai_features' => $validated['ai_features'] ?? null,
                'ip_rating' => $validated['ip_rating'] ?? null,
                'environment' => $validated['environment'] ?? 'both',
                'power_source' => $validated['power_source'] ?? 'poe',
                'power_consumption_watts' => $validated['power_consumption_watts'] ?? null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            // Create auxiliary device profile if recorder
            if (in_array($validated['product_type'], ['dvr', 'nvr', 'xvr'])) {
                CctvDeviceProfile::create([
                    'product_id' => $validated['product_id'],
                    'device_type' => $validated['product_type'],
                    'channel_count' => $validated['channel_count'] ?? 4,
                    'max_camera_resolution_mp' => $validated['max_camera_resolution_mp'] ?? 8.0,
                    'hdd_bay_count' => $validated['hdd_bay_count'] ?? 1,
                    'poe_port_count' => $validated['poe_port_count'] ?? 0,
                ]);
            } elseif ($validated['product_type'] === 'storage' && !empty($validated['capacity_tb'])) {
                CctvStorageProfile::create([
                    'product_id' => $validated['product_id'],
                    'capacity_tb' => $validated['capacity_tb'],
                    'rpm' => $validated['rpm'] ?? 5400,
                    'is_surveillance_optimized' => true,
                ]);
            } elseif ($validated['product_type'] === 'cable' && !empty($validated['cable_type'])) {
                CctvCableProfile::create([
                    'product_id' => $validated['product_id'],
                    'cable_type' => $validated['cable_type'],
                    'meters_per_unit' => $validated['meters_per_unit'] ?? 305.0,
                ]);
            }

            AuditLogger::log('cctv.profile_created', $profile, null, $profile->toArray());
            Cache::flush();
        });

        return back()->with('success', 'CCTV Product Profile attached and saved successfully.');
    }

    /**
     * Delete a CCTV Product Profile.
     */
    public function destroyProfile(int $id): RedirectResponse
    {
        $profile = CctvProductProfile::findOrFail($id);
        AuditLogger::log('cctv.profile_deleted', $profile, $profile->toArray(), null);
        $profile->delete();
        Cache::flush();

        return back()->with('success', 'CCTV Product Profile removed.');
    }

    /**
     * CCTV Rules Management.
     */
    public function rules(Request $request): Response
    {
        $query = CctvRule::query();

        if ($request->filled('rule_type')) {
            $query->where('rule_type', $request->rule_type);
        }

        if ($request->filled('system_type')) {
            $query->where('system_type_scope', $request->system_type);
        }

        $rules = $query->orderBy('priority', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Cctv/Rules', [
            'rules' => $rules,
            'filters' => $request->only(['rule_type', 'system_type']),
        ]);
    }

    /**
     * Store a CCTV Rule.
     */
    public function storeRule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:100|unique:cctv_rules,code',
            'rule_type' => 'required|string',
            'system_type_scope' => 'required|string',
            'description' => 'nullable|string',
            'priority' => 'required|integer',
            'conditions' => 'nullable|array',
            'actions' => 'nullable|array',
            'parameters' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = $request->user()->id;

        $rule = CctvRule::create($validated);
        AuditLogger::log('cctv.rule_created', $rule, null, $rule->toArray());
        Cache::flush();

        return back()->with('success', 'CCTV Rule created successfully.');
    }

    /**
     * Toggle Rule Status.
     */
    public function toggleRuleStatus(int $id): RedirectResponse
    {
        $rule = CctvRule::findOrFail($id);
        $old = $rule->is_active;
        $rule->update(['is_active' => !$old]);

        AuditLogger::log('cctv.rule_status_toggled', $rule, ['is_active' => $old], ['is_active' => !$old]);
        Cache::flush();

        return back()->with('success', 'Rule status updated.');
    }

    /**
     * Delete a CCTV Rule.
     */
    public function destroyRule(int $id): RedirectResponse
    {
        $rule = CctvRule::findOrFail($id);
        AuditLogger::log('cctv.rule_deleted', $rule, $rule->toArray(), null);
        $rule->delete();
        Cache::flush();

        return back()->with('success', 'CCTV Rule deleted.');
    }

    /**
     * CCTV Estimates Listing.
     */
    public function estimates(Request $request): Response
    {
        $query = CctvEstimate::with(['user', 'items.product', 'latestQuote']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('system_type')) {
            $query->where('system_type', $request->system_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('estimate_number', 'LIKE', "%{$search}%")
                  ->orWhere('project_name', 'LIKE', "%{$search}%");
            });
        }

        $estimates = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Cctv/Estimates', [
            'estimates' => $estimates,
            'filters' => $request->only(['status', 'system_type', 'search']),
        ]);
    }

    /**
     * Delete an Estimate.
     */
    public function destroyEstimate(int $id): RedirectResponse
    {
        $estimate = CctvEstimate::findOrFail($id);
        AuditLogger::log('cctv.estimate_deleted', $estimate, $estimate->toArray(), null);
        $estimate->delete();

        return back()->with('success', 'Estimate removed.');
    }

    /**
     * CCTV Quotes Listing.
     */
    public function quotes(Request $request): Response
    {
        $query = CctvQuote::with(['estimate.items.product', 'user', 'convertedOrder']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quote_number', 'LIKE', "%{$search}%")
                  ->orWhere('customer_name', 'LIKE', "%{$search}%")
                  ->orWhere('customer_phone', 'LIKE', "%{$search}%");
            });
        }

        $quotes = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Cctv/Quotes', [
            'quotes' => $quotes,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * CCTV Engine & Calculation Settings.
     */
    public function settings(): Response
    {
        $settings = [
            'cctv_engine_version' => Setting::get('cctv_engine_version', '2.4.0'),
            'cctv_storage_overhead_percent' => Setting::get('cctv_storage_overhead_percent', '10'),
            'cctv_cable_waste_percent' => Setting::get('cctv_cable_waste_percent', '15'),
            'cctv_cable_safety_margin_meters' => Setting::get('cctv_cable_safety_margin_meters', '20'),
            'cctv_default_recording_days' => Setting::get('cctv_default_recording_days', '15'),
            'cctv_default_recording_hours' => Setting::get('cctv_default_recording_hours', '24'),
            'cctv_installation_base_charge' => Setting::get('cctv_installation_base_charge', '1500'),
            'cctv_installation_per_camera_charge' => Setting::get('cctv_installation_per_camera_charge', '500'),
            'cctv_quote_validity_days' => Setting::get('cctv_quote_validity_days', '15'),
            'cctv_storefront_version_enabled' => Setting::get('cctv_storefront_version_enabled', 'v1,v2,v3'),
        ];

        return Inertia::render('Admin/Cctv/Settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update CCTV Settings.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'cctv_engine_version' => 'required|string',
            'cctv_storage_overhead_percent' => 'required|numeric|min:0|max:100',
            'cctv_cable_waste_percent' => 'required|numeric|min:0|max:100',
            'cctv_cable_safety_margin_meters' => 'required|numeric|min:0',
            'cctv_default_recording_days' => 'required|integer|min:1|max:365',
            'cctv_default_recording_hours' => 'required|integer|min:1|max:24',
            'cctv_installation_base_charge' => 'required|numeric|min:0',
            'cctv_installation_per_camera_charge' => 'required|numeric|min:0',
            'cctv_quote_validity_days' => 'required|integer|min:1|max:90',
            'cctv_storefront_version_enabled' => 'required|string',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value);
        }

        AuditLogger::log('cctv.settings_updated', null, null, $validated);
        Cache::flush();

        return back()->with('success', 'CCTV Calculation & Engine Settings updated successfully.');
    }

    /**
     * Live Rule Tester interface.
     */
    public function ruleTester(): Response
    {
        $cameras = CctvProductProfile::with('product')
            ->where('product_type', 'camera')
            ->where('is_active', true)
            ->get();

        $recorders = CctvProductProfile::with('product')
            ->whereIn('product_type', ['dvr', 'nvr', 'xvr'])
            ->where('is_active', true)
            ->get();

        return Inertia::render('Admin/Cctv/RuleTester', [
            'availableCameras' => $cameras,
            'availableRecorders' => $recorders,
        ]);
    }

    /**
     * Execute live Rule Test through actual Laravel Engine.
     */
    public function runRuleTest(Request $request)
    {
        $requirements = CctvRequirementDTO::fromArray($request->input('requirements', []));
        $selectedItems = $request->input('items', []);

        $summary = $this->estimatorService->calculateEstimate($requirements, $selectedItems);

        return response()->json([
            'status' => 'success',
            'data' => $summary->toArray(),
        ]);
    }

    /**
     * List and manage Site Surveys.
     */
    public function surveys(Request $request): Response
    {
        $query = \App\Models\Cctv\CctvSiteSurvey::with(['user', 'technician', 'report']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('survey_number', 'like', "%{$s}%")
                    ->orWhere('customer_name', 'like', "%{$s}%")
                    ->orWhere('customer_phone', 'like', "%{$s}%")
                    ->orWhere('district', 'like', "%{$s}%");
            });
        }

        $surveys = $query->latest()->paginate(15)->withQueryString();
        $technicians = \App\Models\User::where(function ($q) {
            $q->whereIn('role', ['admin', 'staff'])
              ->orWhereHas('roles', function ($r) {
                  $r->whereIn('name', ['Admin', 'Super Admin', 'Staff']);
              });
        })->get(['id', 'name', 'email', 'phone']);

        return Inertia::render('Admin/Cctv/Surveys', [
            'surveys' => $surveys,
            'technicians' => $technicians,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Update Site Survey Status / Assignment.
     */
    public function updateSurveyStatus(Request $request, $id): RedirectResponse
    {
        $survey = \App\Models\Cctv\CctvSiteSurvey::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:requested,pending_review,scheduled,assigned,in_progress,completed,cancelled,rejected',
            'assigned_technician_id' => 'nullable|exists:users,id',
            'scheduled_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $survey->update($validated);

        AuditLogger::log('cctv.survey_updated', $survey, null, $validated);

        return back()->with('success', "Site Survey #{$survey->survey_number} updated successfully.");
    }

    /**
     * Record Site Survey Report and generate estimate.
     */
    public function storeSurveyReport(Request $request, $id): RedirectResponse
    {
        $survey = \App\Models\Cctv\CctvSiteSurvey::findOrFail($id);

        $validated = $request->validate([
            'actual_camera_count' => 'required|integer|min:1',
            'indoor_cameras' => 'required|integer|min:0',
            'outdoor_cameras' => 'required|integer|min:0',
            'ptz_cameras' => 'nullable|integer|min:0',
            'recommended_system_type' => 'required|string|in:ip,analog,hybrid',
            'cable_length_meters' => 'required|numeric|min:1',
            'power_requirement_watts' => 'nullable|numeric',
            'installation_difficulty' => 'required|string|in:easy,standard,complex,hazardous',
            'special_materials' => 'nullable|string',
            'technician_notes' => 'nullable|string',
        ]);

        $report = \App\Models\Cctv\CctvSiteSurveyReport::updateOrCreate(
            ['survey_id' => $survey->id],
            $validated
        );

        $survey->update(['status' => 'completed']);

        AuditLogger::log('cctv.survey_report_created', $report, null, $validated);

        return back()->with('success', "Survey report saved successfully for Survey #{$survey->survey_number}.");
    }

    /**
     * List and manage Installation Jobs.
     */
    public function installations(Request $request): Response
    {
        $query = \App\Models\Cctv\CctvInstallationJob::with(['order', 'quote', 'estimate', 'technician']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('job_number', 'like', "%{$s}%")
                    ->orWhere('customer_name', 'like', "%{$s}%")
                    ->orWhere('customer_phone', 'like', "%{$s}%");
            });
        }

        $jobs = $query->latest()->paginate(15)->withQueryString();
        $technicians = \App\Models\User::where(function ($q) {
            $q->whereIn('role', ['admin', 'staff'])
              ->orWhereHas('roles', function ($r) {
                  $r->whereIn('name', ['Admin', 'Super Admin', 'Staff']);
              });
        })->get(['id', 'name', 'email', 'phone']);

        return Inertia::render('Admin/Cctv/Installations', [
            'jobs' => $jobs,
            'technicians' => $technicians,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Update Installation Job Status and Testing Checklist.
     */
    public function updateInstallationStatus(Request $request, $id): RedirectResponse
    {
        $job = \App\Models\Cctv\CctvInstallationJob::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,scheduled,assigned,in_progress,completed,cancelled,rescheduled',
            'assigned_technician_id' => 'nullable|exists:users,id',
            'scheduled_date' => 'nullable|date',
            'scheduled_time' => 'nullable|string',
            'installed_camera_count' => 'nullable|integer',
            'testing_checklist' => 'nullable|array',
            'technician_notes' => 'nullable|string',
        ]);

        if ($validated['status'] === 'completed' && empty($job->actual_end_at)) {
            $validated['actual_end_at'] = now();
        }

        $job->update($validated);

        AuditLogger::log('cctv.installation_updated', $job, null, $validated);

        return back()->with('success', "Installation Job #{$job->job_number} updated successfully.");
    }

    /**
     * List and manage CCTV Service Types.
     */
    public function services(): Response
    {
        $services = \App\Models\Cctv\CctvServiceType::orderBy('sort_order')->get();

        return Inertia::render('Admin/Cctv/Services', [
            'services' => $services,
        ]);
    }

    /**
     * Store or update CCTV Service Type.
     */
    public function storeServiceType(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:50',
            'pricing_type' => 'required|string|in:fixed,per_camera,per_floor,per_meter,rule_based',
            'base_rate' => 'required|numeric|min:0',
            'unit_rate' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        \App\Models\Cctv\CctvServiceType::updateOrCreate(
            ['code' => $validated['code']],
            $validated
        );

        AuditLogger::log('cctv.service_type_saved', null, null, $validated);

        return back()->with('success', 'CCTV Service Type saved successfully.');
    }

    /**
     * Service Center Dashboard with real metrics.
     */
    public function serviceCenterDashboard(): Response
    {
        $kpis = [
            'open_tickets' => \App\Models\Cctv\CctvServiceRequest::whereNotIn('status', ['completed', 'cancelled', 'resolved'])->count(),
            'urgent_tickets' => \App\Models\Cctv\CctvServiceRequest::where('priority', 'urgent')->whereNotIn('status', ['completed', 'cancelled'])->count(),
            'scheduled_visits' => \App\Models\Cctv\CctvServiceVisit::where('status', 'scheduled')->count(),
            'warranty_claims' => \App\Models\Cctv\CctvWarrantyClaim::whereNotIn('status', ['completed', 'rejected'])->count(),
            'installed_equipment_count' => \App\Models\Cctv\CctvInstalledEquipment::count(),
            'active_warranties' => \App\Models\Cctv\CctvWarranty::where('status', 'active')->where('warranty_end', '>=', now())->count(),
        ];

        $recentTickets = \App\Models\Cctv\CctvServiceRequest::with(['user', 'technician', 'equipment', 'warranty'])
            ->latest()
            ->limit(8)
            ->get();

        return Inertia::render('Admin/Cctv/ServiceCenterDashboard', [
            'kpis' => $kpis,
            'recentTickets' => $recentTickets,
        ]);
    }

    /**
     * List and manage CCTV Service Requests / Tickets.
     */
    public function serviceRequests(Request $request): Response
    {
        $query = \App\Models\Cctv\CctvServiceRequest::with(['user', 'technician', 'equipment', 'warranty']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('ticket_number', 'like', "%{$s}%")
                    ->orWhere('customer_name', 'like', "%{$s}%")
                    ->orWhere('customer_phone', 'like', "%{$s}%");
            });
        }

        $tickets = $query->latest()->paginate(15)->withQueryString();
        $technicians = \App\Models\User::where(function ($q) {
            $q->whereIn('role', ['admin', 'staff'])
              ->orWhereHas('roles', function ($r) {
                  $r->whereIn('name', ['Admin', 'Super Admin', 'Staff']);
              });
        })->get(['id', 'name', 'email', 'phone']);

        return Inertia::render('Admin/Cctv/ServiceRequests', [
            'tickets' => $tickets,
            'technicians' => $technicians,
            'filters' => $request->only(['status', 'priority', 'search']),
        ]);
    }

    /**
     * Update Service Request Status / Assignment.
     */
    public function updateServiceRequestStatus(Request $request, $id): RedirectResponse
    {
        $ticket = \App\Models\Cctv\CctvServiceRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string',
            'assigned_technician_id' => 'nullable|exists:users,id',
            'priority' => 'nullable|string',
            'internal_notes' => 'nullable|string',
            'total_service_cost' => 'nullable|numeric',
        ]);

        $ticket->update($validated);

        AuditLogger::log('cctv.service_request_updated', $ticket, null, $validated);

        return back()->with('success', "Service Ticket #{$ticket->ticket_number} updated successfully.");
    }

    /**
     * List and manage Installed Equipment Register.
     */
    public function installedEquipment(Request $request): Response
    {
        $query = \App\Models\Cctv\CctvInstalledEquipment::with(['user', 'order', 'warranty']);

        if ($request->filled('device_type')) {
            $query->where('device_type', $request->input('device_type'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('serial_number', 'like', "%{$s}%")
                    ->orWhere('camera_name', 'like', "%{$s}%")
                    ->orWhere('product_name_snapshot', 'like', "%{$s}%");
            });
        }

        $equipment = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Cctv/InstalledEquipment', [
            'equipment' => $equipment,
            'filters' => $request->only(['device_type', 'search']),
        ]);
    }

    /**
     * Register Installed Equipment with Serial Number & Warranty.
     */
    public function storeInstalledEquipment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_name_snapshot' => 'required|string|max:255',
            'serial_number' => 'required|string|max:100|unique:cctv_installed_equipment,serial_number',
            'device_type' => 'required|string|in:camera,recorder,storage,psu,switch,accessory',
            'camera_name' => 'nullable|string|max:100',
            'location_floor' => 'nullable|string|max:50',
            'location_room' => 'nullable|string|max:100',
            'ip_address' => 'nullable|string|max:50',
            'installation_date' => 'nullable|date',
            'warranty_months' => 'nullable|integer|min:1|max:60',
        ]);

        $item = \App\Models\Cctv\CctvInstalledEquipment::create([
            'product_name_snapshot' => $validated['product_name_snapshot'],
            'serial_number' => $validated['serial_number'],
            'device_type' => $validated['device_type'],
            'camera_name' => $validated['camera_name'] ?? null,
            'location_floor' => $validated['location_floor'] ?? null,
            'location_room' => $validated['location_room'] ?? null,
            'ip_address' => $validated['ip_address'] ?? null,
            'installation_date' => $validated['installation_date'] ?? now(),
            'status' => 'operational',
        ]);

        // Auto-provision warranty record
        $warrantyMonths = $validated['warranty_months'] ?? 12;
        \App\Models\Cctv\CctvWarranty::create([
            'installed_equipment_id' => $item->id,
            'serial_number' => $item->serial_number,
            'warranty_type' => 'manufacturer',
            'warranty_start' => now(),
            'warranty_end' => now()->addMonths($warrantyMonths),
            'status' => 'active',
            'coverage_terms' => "Standard {$warrantyMonths}-Month Manufacturer Hardware Warranty",
        ]);

        AuditLogger::log('cctv.equipment_registered', $item, null, $validated);

        return back()->with('success', 'Equipment registered and warranty activated.');
    }

    /**
     * List and manage Enterprise CCTV Projects.
     */
    public function projects(Request $request): Response
    {
        $query = \App\Models\Cctv\CctvProject::with(['user', 'projectManager', 'sites']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('project_type')) {
            $query->where('project_type', $request->input('project_type'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('project_number', 'like', "%{$s}%")
                    ->orWhere('name', 'like', "%{$s}%")
                    ->orWhere('organization_name', 'like', "%{$s}%");
            });
        }

        $projects = $query->latest()->paginate(15)->withQueryString();
        $projectManagers = \App\Models\User::where(function ($q) {
            $q->whereIn('role', ['admin', 'staff'])
              ->orWhereHas('roles', function ($r) {
                  $r->whereIn('name', ['Admin', 'Super Admin', 'Staff']);
              });
        })->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Cctv/Projects', [
            'projects' => $projects,
            'projectManagers' => $projectManagers,
            'filters' => $request->only(['status', 'project_type', 'search']),
        ]);
    }

    /**
     * View detailed Enterprise Project.
     */
    public function projectDetails($id): Response
    {
        $project = \App\Models\Cctv\CctvProject::with([
            'user',
            'projectManager',
            'sites.buildings.floors.zones',
            'estimates.items',
            'installedEquipment',
            'changeRequests',
            'handover',
        ])->findOrFail($id);

        return Inertia::render('Admin/Cctv/ProjectDetails', [
            'project' => array_merge($project->toArray(), [
                'aggregated_metrics' => $project->aggregated_metrics,
            ]),
        ]);
    }

    /**
     * Update Enterprise Project Status & Management.
     */
    public function updateProjectStatus(Request $request, $id): RedirectResponse
    {
        $project = \App\Models\Cctv\CctvProject::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string',
            'priority' => 'nullable|string',
            'project_manager_id' => 'nullable|exists:users,id',
            'budget' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $project->update($validated);

        AuditLogger::log('cctv.project_updated', $project, null, $validated);

        return back()->with('success', "Project #{$project->project_number} updated successfully.");
    }
}
