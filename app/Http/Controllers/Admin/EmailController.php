<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailCampaign;
use App\Models\EmailGateway;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Setting;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Email\EmailCampaignService;
use App\Services\Email\EmailManager;
use App\Services\Email\EmailNotificationService;
use App\Services\Email\EmailPreferenceService;
use App\Services\Email\EmailTemplateService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmailController extends Controller
{
    public function __construct(
        protected EmailManager $emailManager,
        protected EmailTemplateService $templateService,
        protected EmailCampaignService $campaignService,
        protected EmailPreferenceService $preferenceService,
        protected EmailNotificationService $notificationService
    ) {}

    /**
     * Email Analytics & Operations Dashboard.
     */
    public function dashboard()
    {
        $todayStart = Carbon::today()->startOfDay();
        $monthStart = Carbon::now()->startOfMonth()->startOfDay();

        $todaySent = EmailLog::where('created_at', '>=', $todayStart)->whereIn('status', ['sent', 'delivered'])->count();
        $monthSent = EmailLog::where('created_at', '>=', $monthStart)->whereIn('status', ['sent', 'delivered'])->count();
        $totalDelivered = EmailLog::whereIn('status', ['sent', 'delivered'])->count();
        $totalFailed = EmailLog::where('status', 'failed')->count();
        $totalQueued = EmailLog::whereIn('status', ['queued', 'sending'])->count();

        $totalOpened = EmailLog::whereNotNull('opened_at')->count();
        $totalClicked = EmailLog::whereNotNull('clicked_at')->count();

        $totalAttempts = $totalDelivered + $totalFailed;
        $deliveryRate = $totalAttempts > 0 ? round(($totalDelivered / $totalAttempts) * 100, 1) : 100.0;
        $openRate = $totalDelivered > 0 ? round(($totalOpened / $totalDelivered) * 100, 1) : 0.0;
        $clickRate = $totalDelivered > 0 ? round(($totalClicked / $totalDelivered) * 100, 1) : 0.0;

        // 14-day daily sending volume
        $dailyVolume = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $sent = EmailLog::whereDate('created_at', $dateStr)->whereIn('status', ['sent', 'delivered'])->count();
            $failed = EmailLog::whereDate('created_at', $dateStr)->where('status', 'failed')->count();

            $dailyVolume[] = [
                'date' => $date->format('M d'),
                'sent' => $sent,
                'failed' => $failed,
            ];
        }

        // Event distribution breakdown
        $eventStats = EmailLog::select('event_key', DB::raw('COUNT(id) as count'))
            ->groupBy('event_key')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(function ($row) {
                return [
                    'event' => $row->event_key ?: 'Custom Broadcast',
                    'count' => $row->count,
                ];
            });

        // Gateways with live health
        $gateways = EmailGateway::all()->map(function ($gw) {
            return [
                'id' => $gw->id,
                'name' => $gw->name,
                'driver' => $gw->driver,
                'is_active' => $gw->is_active,
                'is_default' => $gw->is_default,
                'is_fallback' => $gw->is_fallback,
                'from_email' => $gw->from_email,
                'from_name' => $gw->from_name,
                'last_tested_at' => $gw->last_tested_at ? $gw->last_tested_at->diffForHumans() : 'Never',
                'last_error' => $gw->last_error,
            ];
        });

        // Recent email logs
        $recentLogs = EmailLog::with(['gateway', 'template'])
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Communication/EmailDashboard', [
            'metrics' => [
                'today_sent' => $todaySent,
                'month_sent' => $monthSent,
                'delivered' => $totalDelivered,
                'failed' => $totalFailed,
                'queued' => $totalQueued,
                'delivery_rate' => $deliveryRate,
                'open_rate' => $openRate,
                'click_rate' => $clickRate,
            ],
            'dailyVolume' => $dailyVolume,
            'eventStats' => $eventStats,
            'gateways' => $gateways,
            'recentLogs' => $recentLogs,
        ]);
    }

    /**
     * Email Campaigns Manager.
     */
    public function campaigns()
    {
        $campaigns = EmailCampaign::with(['template', 'creator'])
            ->latest()
            ->paginate(15);

        $templates = EmailTemplate::active()->orderBy('name')->get();
        $totalCustomers = User::where('role', 'customer')->count();

        return Inertia::render('Admin/Communication/EmailCampaigns', [
            'campaigns' => $campaigns,
            'templates' => $templates,
            'totalCustomers' => $totalCustomers,
        ]);
    }

    /**
     * Store new Campaign.
     */
    public function storeCampaign(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'preheader' => 'nullable|string|max:255',
            'template_id' => 'nullable|exists:email_templates,id',
            'audience_type' => 'required|in:all_customers,active_buyers,product_buyers,inactive_customers,custom_filtered',
            'audience_filters' => 'nullable|array',
            'action' => 'required|in:draft,launch,schedule',
            'scheduled_at' => 'nullable|date',
        ]);

        $campaign = EmailCampaign::create([
            'name' => $validated['name'],
            'subject' => $validated['subject'],
            'preheader' => $validated['preheader'] ?? null,
            'template_id' => $validated['template_id'] ?? null,
            'audience_type' => $validated['audience_type'],
            'audience_filters' => $validated['audience_filters'] ?? null,
            'status' => $validated['action'] === 'launch' ? 'sending' : ($validated['action'] === 'schedule' ? 'scheduled' : 'draft'),
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'created_by' => auth()->id(),
        ]);

        if ($validated['action'] === 'launch') {
            $this->campaignService->launchCampaign($campaign);
            AuditLogger::log('email_campaign.launched', $campaign);
            return back()->with('success', "Campaign '{$campaign->name}' launched successfully!");
        }

        AuditLogger::log('email_campaign.created', $campaign);
        return back()->with('success', "Campaign '{$campaign->name}' saved successfully.");
    }

    /**
     * Launch an existing Draft/Scheduled campaign.
     */
    public function launchCampaign(EmailCampaign $emailCampaign)
    {
        if ($emailCampaign->status === 'sending' || $emailCampaign->status === 'completed') {
            return back()->with('error', 'Campaign is already in progress or completed.');
        }

        $this->campaignService->launchCampaign($emailCampaign);
        AuditLogger::log('email_campaign.launched', $emailCampaign);

        return back()->with('success', "Campaign '{$emailCampaign->name}' queued for delivery.");
    }

    /**
     * Delete Campaign.
     */
    public function destroyCampaign(EmailCampaign $emailCampaign)
    {
        $emailCampaign->delete();
        AuditLogger::log('email_campaign.deleted', $emailCampaign);

        return back()->with('success', 'Campaign deleted successfully.');
    }

    /**
     * Preview Audience Count for campaign filters.
     */
    public function previewAudience(Request $request)
    {
        $audienceType = $request->input('audience_type', 'all_customers');
        $filters = $request->input('audience_filters', []);

        $audience = $this->campaignService->resolveAudience($audienceType, $filters);

        return response()->json([
            'count' => $audience->count(),
        ]);
    }

    /**
     * Email Templates Management & Drag-and-Drop Builder Workspace.
     */
    public function templates()
    {
        $templates = EmailTemplate::orderBy('category')->orderBy('name')->get();

        $categories = [
            'ORDER', 'PAYMENT', 'COURIER', 'FRAUD', 'INVENTORY',
            'CUSTOMER', 'MARKETING', 'PROMOTION', 'SECURITY', 'SYSTEM', 'WELCOME', 'PRODUCT'
        ];

        return Inertia::render('Admin/Communication/EmailTemplates', [
            'templates' => $templates,
            'categories' => $categories,
        ]);
    }

    /**
     * Store new template.
     */
    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:64|unique:email_templates,slug',
            'category' => 'required|string|max:32',
            'subject' => 'required|string|max:255',
            'preheader' => 'nullable|string|max:255',
            'html_content' => 'required|string',
            'plain_text_content' => 'nullable|string',
            'editor_schema' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $template = EmailTemplate::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['slug']),
            'category' => strtoupper($validated['category']),
            'subject' => $validated['subject'],
            'preheader' => $validated['preheader'] ?? null,
            'html_content' => $validated['html_content'],
            'plain_text_content' => $validated['plain_text_content'] ?? strip_tags($validated['html_content']),
            'editor_schema' => $validated['editor_schema'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        AuditLogger::log('email_template.created', $template);

        return back()->with('success', "Template '{$template->name}' created successfully.");
    }

    /**
     * Update existing template.
     */
    public function updateTemplate(Request $request, EmailTemplate $emailTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:64|unique:email_templates,slug,' . $emailTemplate->id,
            'category' => 'required|string|max:32',
            'subject' => 'required|string|max:255',
            'preheader' => 'nullable|string|max:255',
            'html_content' => 'required|string',
            'plain_text_content' => 'nullable|string',
            'editor_schema' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $emailTemplate->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['slug']),
            'category' => strtoupper($validated['category']),
            'subject' => $validated['subject'],
            'preheader' => $validated['preheader'] ?? null,
            'html_content' => $validated['html_content'],
            'plain_text_content' => $validated['plain_text_content'] ?? strip_tags($validated['html_content']),
            'editor_schema' => $validated['editor_schema'] ?? $emailTemplate->editor_schema,
            'is_active' => $request->boolean('is_active', true),
        ]);

        AuditLogger::log('email_template.updated', $emailTemplate);

        return back()->with('success', "Template '{$emailTemplate->name}' updated successfully.");
    }

    /**
     * Duplicate an existing template.
     */
    public function duplicateTemplate(EmailTemplate $emailTemplate)
    {
        $newSlug = $emailTemplate->slug . '-copy-' . time();
        $copy = $emailTemplate->replicate();
        $copy->name = $emailTemplate->name . ' (Copy)';
        $copy->slug = $newSlug;
        $copy->save();

        AuditLogger::log('email_template.duplicated', $copy);

        return back()->with('success', "Template duplicated as '{$copy->name}'.");
    }

    /**
     * Delete template.
     */
    public function destroyTemplate(EmailTemplate $emailTemplate)
    {
        $emailTemplate->delete();
        AuditLogger::log('email_template.deleted', $emailTemplate);

        return back()->with('success', 'Template deleted successfully.');
    }

    /**
     * Preview template with sample live placeholders.
     */
    public function previewTemplate(Request $request, EmailTemplate $emailTemplate)
    {
        $sampleData = [
            'customer_name' => 'Fahim Hasan',
            'customer_email' => 'fahim@example.com',
            'customer_phone' => '01711-000000',
            'order_number' => 'TMB-20260818-9921',
            'order_date' => date('d M, Y'),
            'order_total' => '85,450.00',
            'order_status' => 'Confirmed',
            'payment_method' => 'bKash Online',
            'delivery_address' => 'House 42, Road 11, Banani, Dhaka',
            'invoice_url' => url('/orders/9921/invoice'),
            'courier_name' => 'Steadfast Courier',
            'tracking_number' => 'ST-8849102',
            'tracking_url' => url('/track/ST-8849102'),
            'product_name' => 'Intel Core i9-14900K 24-Core Desktop Processor',
            'product_sku' => 'CPU-INT-14900K',
            'stock_quantity' => '3',
            'fraud_score' => '88',
            'fraud_signals' => 'Multiple cards attempted, velocity spike',
            'error_message' => 'Payment webhook timeout on gateway',
            'event_time' => now()->format('Y-m-d H:i:s'),
            'site_name' => Setting::get('site_name', 'TechMarket BD'),
            'site_url' => config('app.url', 'http://localhost'),
            'support_email' => 'support@techmarketbd.com',
            'support_phone' => '09678-000000',
            'ticket_id' => 'TK-48201',
            'ticket_url' => url('/support/TK-48201'),
            'reset_url' => url('/password-reset/sample-token-123'),
            'verification_url' => url('/email/verify/sample-token-123'),
            'unsubscribe_url' => url('/email/unsubscribe/sample-token-123'),
        ];

        $subject = $this->templateService->render($emailTemplate->subject, $sampleData);
        $body = $this->templateService->render($emailTemplate->html_content, $sampleData);
        $preheader = $emailTemplate->preheader ? $this->templateService->render($emailTemplate->preheader, $sampleData) : null;
        $fullHtml = $this->templateService->wrapInLayout($body, $subject, $preheader);

        return response()->json([
            'subject' => $subject,
            'html' => $fullHtml,
            'plain' => $this->templateService->render($emailTemplate->plain_text_content ?? strip_tags($body), $sampleData),
        ]);
    }

    /**
     * Send test email of a template to specified address.
     */
    public function testSendTemplate(Request $request, EmailTemplate $emailTemplate)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $testEmail = $validated['email'];
        $sampleData = [
            'customer_name' => 'Admin Tester',
            'customer_email' => $testEmail,
            'order_number' => 'TEST-ORDER-1234',
            'order_total' => '12,500.00',
            'order_date' => date('d M, Y'),
            'payment_method' => 'Test Payment',
            'delivery_address' => 'Gulshan 2, Dhaka',
            'invoice_url' => url('/'),
            'courier_name' => 'Steadfast Courier',
            'tracking_number' => 'ST-TEST-001',
            'tracking_url' => url('/'),
            'product_name' => 'Sample Tech Product',
            'stock_quantity' => '5',
            'fraud_score' => '90',
            'fraud_signals' => 'Test signal indicator',
            'error_message' => 'Test system error event',
            'event_time' => now()->format('Y-m-d H:i:s'),
            'site_name' => Setting::get('site_name', 'TechMarket BD'),
            'site_url' => config('app.url', 'http://localhost'),
            'support_email' => 'support@techmarketbd.com',
            'support_phone' => '09678-000000',
            'unsubscribe_url' => url('/email/unsubscribe/test-token'),
        ];

        $subject = '[TEST] ' . $this->templateService->render($emailTemplate->subject, $sampleData);
        $body = $this->templateService->render($emailTemplate->html_content, $sampleData);
        $fullHtml = $this->templateService->wrapInLayout($body, $subject, $emailTemplate->preheader);

        $log = $this->emailManager->send(
            toEmail: $testEmail,
            subject: $subject,
            htmlBody: $fullHtml,
            toName: 'Admin Tester',
            eventKey: 'test.template_send',
            templateId: $emailTemplate->id,
            forceSync: true
        );

        if ($log && $log->status === 'sent') {
            return response()->json([
                'success' => true,
                'message' => "Test email dispatched successfully to {$testEmail}!",
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "Failed to send test email: " . ($log?->error_message ?? 'Gateway connection error.'),
        ], 422);
    }

    /**
     * Compile visual builder schema JSON into clean responsive HTML on the fly.
     */
    public function compileBuilderSchema(Request $request)
    {
        $schema = $request->input('schema', []);
        $html = $this->templateService->compileEditorSchema($schema);

        return response()->json([
            'html' => $html,
        ]);
    }

    /**
     * Email Logs Explorer.
     */
    public function logs(Request $request)
    {
        $query = EmailLog::with(['gateway', 'template', 'user'])->latest();

        if ($request->filled('search')) {
            $s = trim($request->input('search'));
            $query->where(function ($q) use ($s) {
                $q->where('recipient_email', 'like', "%{$s}%")
                  ->orWhere('recipient_name', 'like', "%{$s}%")
                  ->orWhere('subject', 'like', "%{$s}%")
                  ->orWhere('provider_message_id', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('gateway_id')) {
            $query->where('gateway_id', $request->input('gateway_id'));
        }

        if ($request->filled('event_key')) {
            $query->where('event_key', $request->input('event_key'));
        }

        $logs = $query->paginate(20)->withQueryString();
        $gateways = EmailGateway::pluck('name', 'id')->toArray();
        $eventKeys = EmailTemplate::pluck('name', 'slug')->toArray();

        return Inertia::render('Admin/Communication/EmailLogs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'status', 'gateway_id', 'event_key']),
            'gateways' => $gateways,
            'eventKeys' => $eventKeys,
        ]);
    }

    /**
     * Retry a failed Email Log.
     */
    public function retryLog(EmailLog $emailLog)
    {
        $emailLog->update([
            'status' => 'queued',
            'error_message' => null,
            'attempts' => $emailLog->attempts + 1,
        ]);

        \App\Jobs\RetryFailedEmailJob::dispatch($emailLog->id);

        AuditLogger::log('email_log.retried', $emailLog);

        return back()->with('success', "Email #{$emailLog->id} queued for retry.");
    }

    /**
     * Export Email Logs to CSV.
     */
    public function exportLogs(Request $request): StreamedResponse
    {
        $query = EmailLog::with(['gateway', 'template'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('gateway_id')) {
            $query->where('gateway_id', $request->input('gateway_id'));
        }

        $logs = $query->limit(2000)->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="email_logs_' . date('Y-m-d_H-i') . '.csv"',
        ];

        return response()->stream(function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Date', 'Recipient Email', 'Recipient Name', 'Subject', 'Event', 'Gateway', 'Status', 'Attempts', 'Provider ID', 'Error']);

            foreach ($logs as $l) {
                fputcsv($handle, [
                    $l->id,
                    $l->created_at->format('Y-m-d H:i:s'),
                    $l->recipient_email,
                    $l->recipient_name,
                    $l->subject,
                    $l->event_key,
                    $l->gateway?->name ?? 'Default',
                    $l->status,
                    $l->attempts,
                    $l->provider_message_id,
                    $l->error_message,
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Global Email Settings & Gateway Management Workspace.
     */
    public function settings()
    {
        $gateways = EmailGateway::all()->map(function ($gw) {
            return [
                'id' => $gw->id,
                'name' => $gw->name,
                'driver' => $gw->driver,
                'is_active' => $gw->is_active,
                'is_default' => $gw->is_default,
                'is_fallback' => $gw->is_fallback,
                'from_name' => $gw->from_name,
                'from_email' => $gw->from_email,
                'reply_to_email' => $gw->reply_to_email,
                'config' => $gw->masked_config,
                'last_tested_at' => $gw->last_tested_at ? $gw->last_tested_at->format('Y-m-d H:i') : null,
                'last_error' => $gw->last_error,
            ];
        });

        $settings = [
            'email_enabled' => Setting::getBool('email_enabled', true),
            'email_transactional_enabled' => Setting::getBool('email_transactional_enabled', true),
            'email_promotional_enabled' => Setting::getBool('email_promotional_enabled', true),
            'email_admin_alerts_enabled' => Setting::getBool('email_admin_alerts_enabled', true),
            'email_queue_enabled' => Setting::getBool('email_queue_enabled', true),
            'email_fallback_enabled' => Setting::getBool('email_fallback_enabled', true),
            'email_default_from_name' => Setting::get('email_default_from_name', 'TechMarket BD'),
            'email_default_from_email' => Setting::get('email_default_from_email', 'noreply@techmarketbd.com'),
            'email_reply_to' => Setting::get('email_reply_to', 'support@techmarketbd.com'),
            'email_daily_limit' => Setting::get('email_daily_limit', '10000'),
            'email_per_minute_limit' => Setting::get('email_per_minute_limit', '60'),
            'email_batch_size' => Setting::get('email_batch_size', '50'),
            'email_max_retries' => Setting::get('email_max_retries', '3'),
            'email_retry_delay' => Setting::get('email_retry_delay', '30'),
        ];

        return Inertia::render('Admin/Settings/EmailSettings', [
            'gateways' => $gateways,
            'settings' => $settings,
        ]);
    }

    /**
     * Update Global Email System Settings.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'email_enabled' => 'boolean',
            'email_transactional_enabled' => 'boolean',
            'email_promotional_enabled' => 'boolean',
            'email_admin_alerts_enabled' => 'boolean',
            'email_queue_enabled' => 'boolean',
            'email_fallback_enabled' => 'boolean',
            'email_default_from_name' => 'required|string|max:100',
            'email_default_from_email' => 'required|email',
            'email_reply_to' => 'nullable|email',
            'email_daily_limit' => 'nullable|numeric|min:1',
            'email_per_minute_limit' => 'nullable|numeric|min:1',
            'email_batch_size' => 'nullable|numeric|min:1',
            'email_max_retries' => 'nullable|numeric|min:1|max:10',
            'email_retry_delay' => 'nullable|numeric|min:5|max:300',
        ]);

        $booleanKeys = [
            'email_enabled', 'email_transactional_enabled', 'email_promotional_enabled',
            'email_admin_alerts_enabled', 'email_queue_enabled', 'email_fallback_enabled'
        ];

        foreach ($booleanKeys as $bKey) {
            if ($request->has($bKey)) {
                Setting::set($bKey, $request->boolean($bKey) ? '1' : '0', 'email');
            }
        }

        foreach ($validated as $key => $val) {
            if (!in_array($key, $booleanKeys)) {
                Setting::set($key, (string) ($val ?? ''), 'email');
            }
        }

        AuditLogger::log('email_settings.updated', null, null, $validated);

        return back()->with('success', 'Global email settings saved successfully.');
    }

    /**
     * Update / Save Email Gateway.
     */
    public function updateGateway(Request $request, ?EmailGateway $emailGateway = null)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'driver' => 'required|string|in:smtp,sendgrid,mailgun,ses,brevo,generic_smtp',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'is_fallback' => 'boolean',
            'from_name' => 'required|string|max:100',
            'from_email' => 'required|email',
            'reply_to_email' => 'nullable|email',
            'config' => 'nullable|array',
        ]);

        $gw = $emailGateway ?? new EmailGateway();
        $gw->name = $validated['name'];
        $gw->driver = $validated['driver'];
        $gw->is_active = $request->boolean('is_active', true);
        $gw->from_name = $validated['from_name'];
        $gw->from_email = $validated['from_email'];
        $gw->reply_to_email = $validated['reply_to_email'] ?? null;

        if ($request->boolean('is_default')) {
            EmailGateway::where('id', '!=', $gw->id ?? 0)->update(['is_default' => false]);
            $gw->is_default = true;
            $gw->is_active = true;
        } else {
            $gw->is_default = false;
        }

        if ($request->boolean('is_fallback')) {
            EmailGateway::where('id', '!=', $gw->id ?? 0)->update(['is_fallback' => false]);
            $gw->is_fallback = true;
            $gw->is_active = true;
        } else {
            $gw->is_fallback = false;
        }

        // Handle encrypted config preserving unsubmitted secrets
        if (!empty($validated['config'])) {
            $gw->config = $validated['config'];
        }

        $gw->save();

        AuditLogger::log('email_gateway.saved', $gw);

        return back()->with('success', "Gateway '{$gw->name}' saved successfully.");
    }

    /**
     * Test Gateway connection and optionally send a test email.
     */
    public function testGateway(Request $request, EmailGateway $emailGateway)
    {
        $testEmail = $request->input('test_email');
        $provider = $this->emailManager->resolveProvider($emailGateway);

        if (!empty($testEmail)) {
            if (!filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
                return response()->json(['success' => false, 'message' => 'Invalid test email address.'], 422);
            }

            $siteName = Setting::get('site_name', 'TechMarket BD');
            $testSubject = "{$siteName} Gateway Test — {$emailGateway->name}";
            $bodyHtml = "<p>This is a live test email sent via <strong>{$emailGateway->name}</strong> ({$emailGateway->driver}) on " . date('Y-m-d H:i:s') . ".</p><p>If you received this message, your gateway configuration is working properly.</p>";
            $fullHtml = $this->templateService->wrapInLayout($bodyHtml, $testSubject);

            $result = $provider->send(
                toEmail: $testEmail,
                toName: 'TechMarket Admin',
                subject: $testSubject,
                htmlBody: $fullHtml,
                plainText: strip_tags($bodyHtml),
                headers: ['X-Test-Gateway' => $emailGateway->driver]
            );

            $emailGateway->update([
                'last_tested_at' => now(),
                'last_error' => $result['success'] ? null : $result['error'],
                'verified_at' => $result['success'] ? now() : $emailGateway->verified_at,
            ]);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['success'] ? "Test email sent successfully to {$testEmail}!" : "Test email failed: {$result['error']}",
                'details' => $result['raw_response'] ?? null,
            ]);
        }

        $res = $provider->testConnection();
        $emailGateway->update([
            'last_tested_at' => now(),
            'last_error' => $res['success'] ? null : $res['message'],
            'verified_at' => $res['success'] ? now() : $emailGateway->verified_at,
        ]);

        return response()->json($res);
    }
}
