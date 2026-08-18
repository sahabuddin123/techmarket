<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\ReportExportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        return redirect()->route('admin.reports.sales');
    }

    public function sales(Request $request)
    {
        $period = $request->input('period', 'last_30_days');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = AnalyticsService::getSalesAnalytics($period, $startDate, $endDate);

        return Inertia::render('Admin/Reports/Sales', [
            'reportData' => $data,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function products(Request $request)
    {
        $period = $request->input('period', 'last_30_days');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = AnalyticsService::getProductIntelligence($period, $startDate, $endDate);

        return Inertia::render('Admin/Reports/Products', [
            'reportData' => $data,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function inventory(Request $request)
    {
        $data = AnalyticsService::getInventoryIntelligence();

        return Inertia::render('Admin/Reports/Inventory', [
            'reportData' => $data,
        ]);
    }

    public function customers(Request $request)
    {
        $period = $request->input('period', 'last_30_days');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = AnalyticsService::getCustomerIntelligence($period, $startDate, $endDate);

        return Inertia::render('Admin/Reports/Customers', [
            'reportData' => $data,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function operations(Request $request)
    {
        $period = $request->input('period', 'last_30_days');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = AnalyticsService::getOperationalIntelligence($period, $startDate, $endDate);

        return Inertia::render('Admin/Reports/Operations', [
            'reportData' => $data,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:sales,products,inventory,customers,operations',
            'period' => 'nullable|string|in:today,yesterday,last_7_days,last_30_days,this_month,last_month,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $type = $validated['type'];
        $period = $validated['period'] ?? 'last_30_days';
        $startDate = $validated['start_date'] ?? null;
        $endDate = $validated['end_date'] ?? null;

        return ReportExportService::exportCsv($type, $period, $startDate, $endDate);
    }
}
