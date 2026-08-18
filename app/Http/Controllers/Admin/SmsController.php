<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Models\SmsGateway;
use App\Models\SmsLog;
use App\Models\SmsTemplate;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Sms\SmsCalculator;
use App\Services\Sms\SmsManager;
use App\Services\Sms\SmsMessage;
use App\Services\Sms\SmsNotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SmsController extends Controller
{
    public function __construct(
        protected SmsManager $smsManager
    ) {}

    /**
     * SMS Analytics & Operations Dashboard.
     */
    public function dashboard()
    {
        $todayStart = Carbon::today()->startOfDay();
        $monthStart = Carbon::now()->startOfMonth()->startOfDay();

        $todaySent = SmsLog::where('created_at', '>=', $todayStart)->whereIn('status', ['sent', 'delivered'])->count();
        $monthSent = SmsLog::where('created_at', '>=', $monthStart)->whereIn('status', ['sent', 'delivered'])->count();
        $totalDelivered = SmsLog::whereIn('status', ['sent', 'delivered'])->count();
        $totalFailed = SmsLog::where('status', 'failed')->count();
        $totalQueued = SmsLog::whereIn('status', ['queued', 'processing'])->count();

        $totalAttempts = $totalDelivered + $totalFailed;
        $successRate = $totalAttempts > 0 ? round(($totalDelivered / $totalAttempts) * 100, 1) : 100.0;

        // Daily volume for last 14 days
        $dailyVolume = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $count = SmsLog::whereDate('created_at', $dateStr)->whereIn('status', ['sent', 'delivered'])->count();
            $failedCount = SmsLog::whereDate('created_at', $dateStr)->where('status', 'failed')->count();

            $dailyVolume[] = [
                'date' => $date->format('M d'),
                'sent' => $count,
                'failed' => $failedCount,
            ];
        }

        // Event distribution breakdown
        $eventStats = SmsLog::select('event_key', DB::raw('COUNT(id) as count'))
            ->groupBy('event_key')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(function ($row) {
                return [
                    'event' => $row->event_key ?: 'Manual / Custom',
                    'count' => $row->count,
                ];
            });

        // Gateway performance breakdown
        $gatewayStats = SmsLog::select('gateway_slug', DB::raw('COUNT(id) as count'))
            ->groupBy('gateway_slug')
            ->orderByDesc('count')
            ->get()
            ->map(function ($row) {
                return [
                    'gateway' => $row->gateway_slug ?: 'Default Gateway',
                    'count' => $row->count,
                ];
            });

        // Gateways with live health
        $gateways = SmsGateway::all()->map(function ($gw) {
            $decrypted = $gw->getDecryptedCredentials();
            $driver = $this->smsManager->createDriver($gw);
            $balance = null;
            if ($gw->is_active) {
                try {
                    $balance = $driver->getBalance();
                } catch (\Throwable $e) {}
            }

            return [
                'id' => $gw->id,
                'name' => $gw->name,
                'slug' => $gw->slug,
                'driver' => $gw->driver,
                'is_active' => $gw->is_active,
                'is_default' => $gw->is_default,
                'last_tested_at' => $gw->last_tested_at ? $gw->last_tested_at->diffForHumans() : null,
                'balance' => $balance,
            ];
        });

        // Recent SMS Activity
        $recentLogs = SmsLog::with(['user', 'order'])->latest()->limit(10)->get();

        return Inertia::render('Admin/Communication/SmsDashboard', [
            'metrics' => [
                'today_sent' => $todaySent,
                'month_sent' => $monthSent,
                'delivered' => $totalDelivered,
                'failed' => $totalFailed,
                'queued' => $totalQueued,
                'success_rate' => $successRate,
            ],
            'dailyVolume' => $dailyVolume,
            'eventStats' => $eventStats,
            'gatewayStats' => $gatewayStats,
            'gateways' => $gateways,
            'recentLogs' => $recentLogs,
        ]);
    }

    /**
     * SMS Gateways Management Workspace.
     */
    public function gateways()
    {
        $gateways = SmsGateway::all()->map(function ($gw) {
            $creds = $gw->getDecryptedCredentials();
            $maskedCreds = [];
            foreach ($creds as $k => $v) {
                $maskedCreds[$k] = !empty($v) ? (strlen($v) > 6 ? substr($v, 0, 3) . '••••' . substr($v, -3) : '••••••') : '';
            }

            return [
                'id' => $gw->id,
                'name' => $gw->name,
                'slug' => $gw->slug,
                'driver' => $gw->driver,
                'is_active' => $gw->is_active,
                'is_default' => $gw->is_default,
                'settings' => $gw->settings,
                'status_notes' => $gw->status_notes,
                'last_tested_at' => $gw->last_tested_at ? $gw->last_tested_at->format('Y-m-d H:i') : null,
                'masked_credentials' => $maskedCreds,
            ];
        });

        return Inertia::render('Admin/Settings/SmsGateways', [
            'gateways' => $gateways,
        ]);
    }

    /**
     * Update an SMS Gateway configuration.
     */
    public function updateGateway(Request $request, SmsGateway $smsGateway)
    {
        $validated = $request->validate([
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'settings' => 'nullable|array',
            'credentials' => 'nullable|array',
        ]);

        $oldValues = [
            'is_active' => $smsGateway->is_active,
            'is_default' => $smsGateway->is_default,
            'settings' => $smsGateway->settings,
        ];

        if ($request->has('is_active')) {
            $smsGateway->is_active = $request->boolean('is_active');
        }

        if ($request->has('is_default') && $request->boolean('is_default')) {
            // Remove default flag from all other gateways
            SmsGateway::where('id', '!=', $smsGateway->id)->update(['is_default' => false]);
            $smsGateway->is_default = true;
            $smsGateway->is_active = true;
        }

        if ($request->has('settings')) {
            $smsGateway->settings = array_merge($smsGateway->settings ?? [], $validated['settings'] ?? []);
        }

        // Merge credentials without overwriting with empty blanks
        if (!empty($validated['credentials'])) {
            $existing = $smsGateway->getDecryptedCredentials();
            $newCreds = $validated['credentials'];

            foreach ($newCreds as $k => $v) {
                if ($v !== null && $v !== '' && !str_contains($v, '••••')) {
                    $existing[$k] = trim((string)$v);
                }
            }

            $smsGateway->setEncryptedCredentials($existing);
        }

        $smsGateway->save();

        AuditLogger::log('sms_gateway.updated', $smsGateway, $oldValues, [
            'is_active' => $smsGateway->is_active,
            'is_default' => $smsGateway->is_default,
        ]);

        return back()->with('success', "Gateway {$smsGateway->name} updated successfully.");
    }

    /**
     * Test connection and optionally send test SMS.
     */
    public function testGateway(Request $request, SmsGateway $smsGateway)
    {
        $testPhone = $request->input('test_phone');
        $driver = $this->smsManager->createDriver($smsGateway);

        if (!empty($testPhone)) {
            if (!SmsMessage::isValidBdPhone($testPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Bangladesh phone number. Please enter a valid 11-digit mobile number.',
                ], 422);
            }

            $testMsg = new SmsMessage(
                recipient: $testPhone,
                content: "Test SMS from " . Setting::get('site_name', 'TechMarket BD') . " via {$smsGateway->name}. Gateway operational!",
                eventKey: 'test.connection'
            );

            $response = $driver->send($testMsg);

            $smsGateway->update(['last_tested_at' => now()]);

            return response()->json([
                'success' => $response->success,
                'message' => $response->success ? "Test SMS sent successfully to {$testPhone}!" : "Test SMS failed: {$response->errorMessage}",
                'details' => $response->rawResponse,
            ]);
        }

        $result = $driver->testConnection();
        $smsGateway->update(['last_tested_at' => now()]);

        return response()->json($result);
    }

    /**
     * SMS Templates Management Workspace.
     */
    public function templates()
    {
        $templates = SmsTemplate::orderBy('category')->orderBy('name')->get();

        return Inertia::render('Admin/Communication/SmsTemplates', [
            'templates' => $templates,
        ]);
    }

    /**
     * Update an SMS Template.
     */
    public function updateTemplate(Request $request, SmsTemplate $smsTemplate)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $oldValues = $smsTemplate->toArray();

        $smsTemplate->update([
            'message' => $validated['message'],
            'is_active' => $request->boolean('is_active'),
        ]);

        AuditLogger::log('sms_template.updated', $smsTemplate, $oldValues, $smsTemplate->toArray());

        return back()->with('success', "Template '{$smsTemplate->name}' saved successfully.");
    }

    /**
     * Preview a rendered SMS Template with mock/live data dictionary.
     */
    public function previewTemplate(Request $request, SmsTemplate $smsTemplate)
    {
        $sampleData = [
            'customer_name' => 'Fahim Hasan',
            'customer_phone' => '01711000000',
            'order_number' => 'TMB-20260818-8842',
            'order_total' => '85,500.00',
            'order_status' => 'Confirmed',
            'payment_method' => 'bKash',
            'payment_status' => 'Paid',
            'courier_name' => 'Steadfast Courier',
            'tracking_number' => 'ST-994821',
            'store_name' => Setting::get('site_name', 'TechMarket BD'),
            'store_phone' => Setting::get('hotline_phone', '09678-000000'),
            'website_url' => config('app.url', 'https://techmarket.com.bd'),
            'invoice_url' => url('/invoice/TMB-20260818-8842'),
            'otp_code' => '584920',
            'fraud_score' => '85',
        ];

        $rendered = $smsTemplate->render($sampleData);
        $calc = SmsCalculator::calculate($rendered);

        return response()->json([
            'rendered_text' => $rendered,
            'calculation' => $calc,
        ]);
    }

    /**
     * SMS Logs Explorer.
     */
    public function logs(Request $request)
    {
        $query = SmsLog::with(['user', 'order'])->latest();

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('phone', 'like', "%{$s}%")
                  ->orWhere('message', 'like', "%{$s}%")
                  ->orWhere('provider_message_id', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('gateway')) {
            $query->where('gateway_slug', $request->input('gateway'));
        }

        if ($request->filled('event_key')) {
            $query->where('event_key', $request->input('event_key'));
        }

        $logs = $query->paginate(20)->withQueryString();
        $gateways = SmsGateway::pluck('name', 'slug')->toArray();
        $eventKeys = SmsTemplate::pluck('name', 'event_key')->toArray();

        return Inertia::render('Admin/Communication/SmsLogs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'status', 'gateway', 'event_key']),
            'gateways' => $gateways,
            'eventKeys' => $eventKeys,
        ]);
    }

    /**
     * Retry sending a failed SMS.
     */
    public function retryLog(SmsLog $smsLog)
    {
        $smsLog->update([
            'status' => 'queued',
            'error_message' => null,
        ]);

        $defaultGateway = SmsGateway::where('is_active', true)->where('is_default', true)->first()
            ?: SmsGateway::where('is_active', true)->first();

        if (Setting::getBool('sms_queue_enabled', true)) {
            \App\Jobs\SendSmsJob::dispatch($smsLog->id, $smsLog->gateway_slug ?: $defaultGateway?->slug);
        } else {
            $job = new \App\Jobs\SendSmsJob($smsLog->id, $smsLog->gateway_slug ?: $defaultGateway?->slug);
            $job->handle($this->smsManager);
            $smsLog->refresh();
        }

        AuditLogger::log('sms_log.retried', $smsLog, ['status' => 'failed'], ['status' => $smsLog->status]);

        return back()->with('success', "SMS Log #{$smsLog->id} queued for retry.");
    }

    /**
     * Export filtered SMS Logs to CSV.
     */
    public function exportLogs(Request $request): StreamedResponse
    {
        $query = SmsLog::with(['order'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('gateway')) {
            $query->where('gateway_slug', $request->input('gateway'));
        }
        if ($request->filled('event_key')) {
            $query->where('event_key', $request->input('event_key'));
        }

        $logs = $query->limit(2000)->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sms_logs_' . date('Y-m-d_H-i') . '.csv"',
        ];

        return response()->stream(function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Date', 'Phone', 'Event', 'Gateway', 'Status', 'Parts', 'Encoding', 'Provider ID', 'Error', 'Message']);

            foreach ($logs as $l) {
                fputcsv($handle, [
                    $l->id,
                    $l->created_at->format('Y-m-d H:i:s'),
                    $l->phone,
                    $l->event_key,
                    $l->gateway_slug,
                    $l->status,
                    $l->parts,
                    $l->encoding,
                    $l->provider_message_id,
                    $l->error_message,
                    $l->message,
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Manual SMS Composer View.
     */
    public function sendView()
    {
        $gateways = SmsGateway::where('is_active', true)->get();
        $templates = SmsTemplate::where('is_active', true)->get();
        $totalCustomers = User::where('role', 'customer')->count();

        return Inertia::render('Admin/Communication/SendSms', [
            'gateways' => $gateways,
            'templates' => $templates,
            'customerCount' => $totalCustomers,
        ]);
    }

    /**
     * Dispatch Manual / Bulk SMS.
     */
    public function sendManual(Request $request)
    {
        $validated = $request->validate([
            'recipient_mode' => 'required|in:single,multiple,all_customers',
            'phone' => 'nullable|string',
            'multiple_phones' => 'nullable|string',
            'message' => 'required|string|max:1000',
            'gateway_slug' => 'nullable|string',
            'is_promotional' => 'boolean',
        ]);

        $message = trim($validated['message']);
        $gatewaySlug = $validated['gateway_slug'] ?? null;
        $isPromotional = $request->boolean('is_promotional', true);

        $recipients = [];

        if ($validated['recipient_mode'] === 'single') {
            if (empty($validated['phone']) || !SmsMessage::isValidBdPhone($validated['phone'])) {
                return back()->withErrors(['phone' => 'Please provide a valid 11-digit Bangladesh phone number.']);
            }
            $recipients[] = SmsMessage::normalizePhone($validated['phone'], true);
        } elseif ($validated['recipient_mode'] === 'multiple') {
            $rawList = explode("\n", str_replace([',', ';', "\r"], "\n", $validated['multiple_phones'] ?? ''));
            foreach ($rawList as $raw) {
                $clean = trim($raw);
                if (!empty($clean) && SmsMessage::isValidBdPhone($clean)) {
                    $recipients[] = SmsMessage::normalizePhone($clean, true);
                }
            }
            $recipients = array_unique($recipients);

            if (empty($recipients)) {
                return back()->withErrors(['multiple_phones' => 'No valid mobile numbers found in the list.']);
            }
        } elseif ($validated['recipient_mode'] === 'all_customers') {
            $query = User::where('role', 'customer')->whereNotNull('phone');
            if ($isPromotional) {
                $query->where('sms_promotional_enabled', true);
            }
            $recipients = $query->pluck('phone')
                ->filter(fn($p) => SmsMessage::isValidBdPhone($p))
                ->map(fn($p) => SmsMessage::normalizePhone($p, true))
                ->unique()
                ->toArray();

            if (empty($recipients)) {
                return back()->withErrors(['recipient_mode' => 'No eligible customers with valid phone numbers found.']);
            }
        }

        $dispatched = 0;
        foreach ($recipients as $targetPhone) {
            SmsNotificationService::sendDirect(
                phone: $targetPhone,
                message: $message,
                gatewaySlug: $gatewaySlug,
                isPromotional: $isPromotional
            );
            $dispatched++;
        }

        AuditLogger::log('sms.bulk_sent', null, null, [
            'recipient_mode' => $validated['recipient_mode'],
            'recipient_count' => $dispatched,
            'is_promotional' => $isPromotional,
        ]);

        return redirect()->route('admin.sms.logs')->with('success', "Dispatched {$dispatched} SMS messages to delivery queue.");
    }

    /**
     * Global SMS Settings Workspace.
     */
    public function settings()
    {
        $settings = [
            'sms_enabled' => Setting::getBool('sms_enabled', true),
            'sms_transactional_enabled' => Setting::getBool('sms_transactional_enabled', true),
            'sms_promotional_enabled' => Setting::getBool('sms_promotional_enabled', true),
            'sms_queue_enabled' => Setting::getBool('sms_queue_enabled', true),
            'sms_admin_phone' => Setting::get('sms_admin_phone', '01711000000'),
            'sms_duplicate_window_minutes' => Setting::get('sms_duplicate_window_minutes', '5'),
            'sms_quiet_hours_enabled' => Setting::getBool('sms_quiet_hours_enabled', false),
            'sms_quiet_hours_start' => Setting::get('sms_quiet_hours_start', '22'),
            'sms_quiet_hours_end' => Setting::get('sms_quiet_hours_end', '8'),
        ];

        return Inertia::render('Admin/Settings/SmsSettings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update Global SMS Settings.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'sms_enabled' => 'boolean',
            'sms_transactional_enabled' => 'boolean',
            'sms_promotional_enabled' => 'boolean',
            'sms_queue_enabled' => 'boolean',
            'sms_admin_phone' => 'nullable|string|max:20',
            'sms_duplicate_window_minutes' => 'nullable|numeric|min:0|max:60',
            'sms_quiet_hours_enabled' => 'boolean',
            'sms_quiet_hours_start' => 'nullable|numeric|min:0|max:23',
            'sms_quiet_hours_end' => 'nullable|numeric|min:0|max:23',
        ]);

        $booleanKeys = ['sms_enabled', 'sms_transactional_enabled', 'sms_promotional_enabled', 'sms_queue_enabled', 'sms_quiet_hours_enabled'];

        foreach ($booleanKeys as $bKey) {
            if ($request->has($bKey)) {
                Setting::set($bKey, $request->boolean($bKey) ? '1' : '0', 'sms');
            }
        }

        foreach ($validated as $key => $val) {
            if (!in_array($key, $booleanKeys)) {
                Setting::set($key, $val ?? '', 'sms');
            }
        }

        AuditLogger::log('sms_settings.updated', null, null, $validated);

        return back()->with('success', 'Global SMS system settings saved successfully.');
    }
}
