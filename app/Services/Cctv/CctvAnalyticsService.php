<?php

namespace App\Services\Cctv;

use App\Models\Cctv\CctvEstimate;
use App\Models\Cctv\CctvInstalledEquipment;
use App\Models\Cctv\CctvInstallationJob;
use App\Models\Cctv\CctvProject;
use App\Models\Cctv\CctvQuote;
use App\Models\Cctv\CctvServiceRequest;
use App\Models\Cctv\CctvWarranty;
use App\Models\Cctv\CctvWarrantyClaim;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CctvAnalyticsService
{
    /**
     * Resolve Date Range bounds.
     */
    public function resolveDateRange(?string $range, ?string $customStart = null, ?string $customEnd = null): array
    {
        $now = Carbon::now('Asia/Dhaka');

        return match ($range) {
            'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'yesterday' => [$now->copy()->subDay()->startOfDay(), $now->copy()->subDay()->endOfDay()],
            'last_7_days' => [$now->copy()->subDays(7)->startOfDay(), $now->copy()->endOfDay()],
            'last_30_days' => [$now->copy()->subDays(30)->startOfDay(), $now->copy()->endOfDay()],
            'this_month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'last_month' => [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()],
            'this_quarter' => [$now->copy()->firstOfQuarter(), $now->copy()->lastOfQuarter()],
            'this_year' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            'custom' => [
                $customStart ? Carbon::parse($customStart, 'Asia/Dhaka')->startOfDay() : $now->copy()->subDays(30)->startOfDay(),
                $customEnd ? Carbon::parse($customEnd, 'Asia/Dhaka')->endOfDay() : $now->copy()->endOfDay(),
            ],
            default => [$now->copy()->subDays(30)->startOfDay(), $now->copy()->endOfDay()],
        };
    }

    /**
     * Compute Executive KPIs.
     */
    public function getExecutiveKpis(Carbon $start, Carbon $end, array $filters = []): array
    {
        $estimatesQuery = CctvEstimate::whereBetween('created_at', [$start, $end]);
        $quotesQuery = CctvQuote::whereBetween('created_at', [$start, $end]);
        $ordersQuery = Order::whereNotNull('cctv_quote_id')->whereBetween('created_at', [$start, $end]);

        $totalEstimates = (clone $estimatesQuery)->count();
        $finalizedEstimates = (clone $estimatesQuery)->whereIn('status', ['saved', 'quoted', 'ordered'])->count();

        $totalQuotes = (clone $quotesQuery)->count();
        $quoteValue = (float) ((clone $quotesQuery)->sum('grand_total') ?: 0.0);
        $approvedQuoteValue = (float) ((clone $quotesQuery)->whereIn('status', ['accepted', 'converted_to_order'])->sum('grand_total') ?: 0.0);
        $convertedQuotesCount = (clone $quotesQuery)->where('status', 'converted_to_order')->count();

        $cctvOrdersCount = (clone $ordersQuery)->count();
        $cctvRevenue = (float) ((clone $ordersQuery)->whereIn('status', ['paid', 'completed', 'delivered'])->sum('total') ?: 0.0);

        $activeProjects = CctvProject::whereNotIn('status', ['completed', 'cancelled'])->count();
        $completedProjects = CctvProject::where('status', 'completed')->count();

        $installedCameras = CctvInstalledEquipment::where('device_type', 'camera')->count();
        $activeServiceTickets = CctvServiceRequest::whereNotIn('status', ['completed', 'cancelled', 'resolved'])->count();
        $openWarrantyClaims = CctvWarrantyClaim::whereNotIn('status', ['completed', 'rejected'])->count();

        $conversionRate = $totalQuotes > 0 ? round(($convertedQuotesCount / $totalQuotes) * 100, 1) : 0.0;

        return [
            'total_estimates' => $totalEstimates,
            'finalized_estimates' => $finalizedEstimates,
            'total_quotes' => $totalQuotes,
            'quote_value' => $quoteValue,
            'approved_quote_value' => $approvedQuoteValue,
            'converted_quotes_count' => $convertedQuotesCount,
            'quote_conversion_rate' => $conversionRate,
            'cctv_orders_count' => $cctvOrdersCount,
            'cctv_revenue' => $cctvRevenue,
            'active_projects' => $activeProjects,
            'completed_projects' => $completedProjects,
            'installed_cameras' => $installedCameras,
            'active_service_tickets' => $activeServiceTickets,
            'open_warranty_claims' => $openWarrantyClaims,
        ];
    }

    /**
     * Compute Sales Funnel.
     */
    public function getSalesFunnel(Carbon $start, Carbon $end): array
    {
        $estimatesCount = CctvEstimate::whereBetween('created_at', [$start, $end])->count();
        $quotesCreated = CctvQuote::whereBetween('created_at', [$start, $end])->count();
        $quotesViewed = CctvQuote::whereBetween('created_at', [$start, $end])->whereNotNull('viewed_at')->count();
        $quotesApproved = CctvQuote::whereBetween('created_at', [$start, $end])->whereIn('status', ['accepted', 'converted_to_order'])->count();
        $ordersPlaced = Order::whereNotNull('cctv_quote_id')->whereBetween('created_at', [$start, $end])->count();

        return [
            ['stage' => 'Estimates Created', 'count' => $estimatesCount, 'dropoff' => 0],
            ['stage' => 'Quotes Generated', 'count' => $quotesCreated, 'dropoff' => $estimatesCount > 0 ? round((($estimatesCount - $quotesCreated) / $estimatesCount) * 100, 1) : 0],
            ['stage' => 'Quotes Viewed', 'count' => $quotesViewed, 'dropoff' => $quotesCreated > 0 ? round((($quotesCreated - $quotesViewed) / $quotesCreated) * 100, 1) : 0],
            ['stage' => 'Quotes Approved', 'count' => $quotesApproved, 'dropoff' => $quotesViewed > 0 ? round((($quotesViewed - $quotesApproved) / $quotesViewed) * 100, 1) : 0],
            ['stage' => 'Orders Converted', 'count' => $ordersPlaced, 'dropoff' => $quotesApproved > 0 ? round((($quotesApproved - $ordersPlaced) / $quotesApproved) * 100, 1) : 0],
        ];
    }

    /**
     * Technical Demand Analytics (Storage, Cable, System Types).
     */
    public function getTechnicalDemandAnalytics(Carbon $start, Carbon $end): array
    {
        $estimates = CctvEstimate::whereBetween('created_at', [$start, $end])->get();

        $systemTypeCounts = [];
        $totalStorage = 0.0;
        $totalCables = 0.0;
        $count = $estimates->count();

        foreach ($estimates as $est) {
            $type = is_object($est->system_type) ? $est->system_type->value : (string) $est->system_type;
            $typeKey = $type ?: 'ip_poe';
            $systemTypeCounts[$typeKey] = ($systemTypeCounts[$typeKey] ?? 0) + 1;

            $totalStorage += (float) ($est->storage_required_tb ?? 0);
            $totalCables += (float) ($est->cable_length_meters ?? 0);
        }

        return [
            'system_types' => $systemTypeCounts,
            'avg_storage_tb' => $count > 0 ? round($totalStorage / $count, 1) : 0,
            'avg_cable_meters' => $count > 0 ? round($totalCables / $count, 0) : 0,
        ];
    }

    /**
     * Real-Time Alert Center.
     */
    public function getSystemAlerts(): array
    {
        $alerts = [];

        // 1. Expiring Warranties (next 15 days)
        $expiringWarranties = CctvWarranty::where('status', 'active')
            ->whereBetween('warranty_end', [now(), now()->addDays(15)])
            ->count();

        if ($expiringWarranties > 0) {
            $alerts[] = [
                'type' => 'warranty_expiring',
                'priority' => 'warning',
                'title' => "{$expiringWarranties} CCTV Warranties Expiring Soon",
                'message' => 'Client hardware warranties due to expire within 15 days.',
                'action_url' => '/admin/cctv/installed-equipment',
            ];
        }

        // 2. Urgent Service Tickets
        $urgentTickets = CctvServiceRequest::where('priority', 'urgent')
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        if ($urgentTickets > 0) {
            $alerts[] = [
                'type' => 'urgent_tickets',
                'priority' => 'critical',
                'title' => "{$urgentTickets} Urgent Service Tickets Open",
                'message' => 'Critical camera/recording failures requiring immediate technician attention.',
                'action_url' => '/admin/cctv/service-requests',
            ];
        }

        // 3. Unassigned Installation Jobs
        $unassignedJobs = CctvInstallationJob::whereNull('assigned_technician_id')
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        if ($unassignedJobs > 0) {
            $alerts[] = [
                'type' => 'unassigned_installations',
                'priority' => 'high',
                'title' => "{$unassignedJobs} Installation Jobs Unassigned",
                'message' => 'New CCTV orders requiring lead technician assignment.',
                'action_url' => '/admin/cctv/installations',
            ];
        }

        return $alerts;
    }
}
