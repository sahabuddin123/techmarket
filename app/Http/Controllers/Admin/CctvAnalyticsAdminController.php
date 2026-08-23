<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cctv\CctvSavedReport;
use App\Services\AuditLogger;
use App\Services\Cctv\CctvAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CctvAnalyticsAdminController extends Controller
{
    public function __construct(
        protected CctvAnalyticsService $analyticsService
    ) {}

    /**
     * CCTV Executive Analytics Dashboard.
     */
    public function dashboard(Request $request): Response
    {
        $range = $request->input('range', 'last_30_days');
        $customStart = $request->input('start_date');
        $customEnd = $request->input('end_date');

        [$start, $end] = $this->analyticsService->resolveDateRange($range, $customStart, $customEnd);

        $kpis = $this->analyticsService->getExecutiveKpis($start, $end, $request->all());
        $salesFunnel = $this->analyticsService->getSalesFunnel($start, $end);
        $technicalDemand = $this->analyticsService->getTechnicalDemandAnalytics($start, $end);
        $alerts = $this->analyticsService->getSystemAlerts();

        return Inertia::render('Admin/Cctv/AnalyticsDashboard', [
            'kpis' => $kpis,
            'salesFunnel' => $salesFunnel,
            'technicalDemand' => $technicalDemand,
            'alerts' => $alerts,
            'currentRange' => $range,
            'dateBounds' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
        ]);
    }

    /**
     * Report Builder Interface.
     */
    public function reportBuilder(Request $request): Response
    {
        $savedReports = CctvSavedReport::with('creator')->latest()->get();

        return Inertia::render('Admin/Cctv/ReportBuilder', [
            'savedReports' => $savedReports,
        ]);
    }

    /**
     * Save a Custom Report Definition.
     */
    public function saveReport(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'report_type' => 'required|string|in:sales,estimates,quotes,orders,products,projects,installations,services,warranties',
            'description' => 'nullable|string|max:500',
            'columns' => 'required|array',
            'filters' => 'nullable|array',
            'group_by' => 'nullable|string',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        $report = CctvSavedReport::create(array_merge($validated, [
            'created_by_user_id' => $request->user()->id,
        ]));

        AuditLogger::log('cctv.report_saved', $report, null, $validated);

        return back()->with('success', "Report '{$report->name}' saved successfully.");
    }

    /**
     * CCTV Operational Alert Center.
     */
    public function alertCenter(): Response
    {
        $alerts = $this->analyticsService->getSystemAlerts();

        return Inertia::render('Admin/Cctv/AlertCenter', [
            'alerts' => $alerts,
        ]);
    }
}
