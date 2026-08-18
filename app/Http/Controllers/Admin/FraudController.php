<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FraudCheck;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use App\Services\Fraud\FraudDetectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FraudController extends Controller
{
    /**
     * Display Customer Fraud Checker & Risk Intelligence Workspace.
     */
    public function checker(Request $request)
    {
        $search = trim($request->input('search', $request->input('phone', '')));
        $customerProfile = null;
        $matchedOrder = null;

        if ($search !== '') {
            $resolvedPhone = null;
            $user = null;

            // 1. Try finding by Order Number
            $matchedOrder = Order::where('order_number', $search)
                ->orWhere('id', is_numeric($search) ? (int)$search : 0)
                ->first();

            if ($matchedOrder) {
                $resolvedPhone = $matchedOrder->customer_phone;
                $user = $matchedOrder->user ?: ($matchedOrder->user_id ? User::find($matchedOrder->user_id) : null);
            }

            // 2. Try finding by direct Phone Number
            if (!$resolvedPhone) {
                $cleanPhone = preg_replace('/[^0-9]/', '', $search);
                if (strlen($cleanPhone) >= 6) {
                    $resolvedPhone = $search;
                    $user = User::where('phone', $search)->orWhere('phone', $cleanPhone)->first();
                }
            }

            // 3. Try finding by Customer Name or Email
            if (!$resolvedPhone) {
                $user = User::where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->first();
                if ($user && $user->phone) {
                    $resolvedPhone = $user->phone;
                } else {
                    $namedOrder = Order::where('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%")
                        ->latest()
                        ->first();
                    if ($namedOrder) {
                        $resolvedPhone = $namedOrder->customer_phone;
                    }
                }
            }

            if ($resolvedPhone) {
                $customerProfile = FraudDetectionService::analyzeCustomer($resolvedPhone, $user);
            }
        }

        // Recent fraud checks list
        $recentChecks = FraudCheck::with(['order', 'customer', 'reviewer'])
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('Admin/Customers/FraudChecker', [
            'searchQuery' => $search,
            'searchPhone' => $search,
            'matchedOrder' => $matchedOrder,
            'customerProfile' => $customerProfile,
            'recentChecks' => $recentChecks,
        ]);
    }

    /**
     * Display Fraud Review & Hold Queue.
     */
    public function reviews(Request $request)
    {
        $statusFilter = $request->input('status', 'all');

        $query = FraudCheck::with(['order.items', 'customer', 'signals', 'reviewer'])->latest();

        if ($statusFilter === 'on_hold') {
            $query->where('status', 'on_hold');
        } elseif ($statusFilter === 'review_required') {
            $query->where('status', 'review_required');
        } elseif ($statusFilter === 'high_critical') {
            $query->whereIn('risk_level', ['high', 'critical']);
        } elseif ($statusFilter === 'approved') {
            $query->where('status', 'approved');
        } elseif ($statusFilter === 'rejected') {
            $query->where('status', 'rejected');
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('customer_phone', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('customer_email', 'like', "%{$s}%");
            });
        }

        $fraudChecks = $query->paginate(15)->withQueryString();

        // Metrics for Review Queue
        $allChecks = FraudCheck::all();
        $totalAnalyzed = $allChecks->count();
        $lowCount = $allChecks->where('risk_level', 'low')->count();
        $mediumCount = $allChecks->where('risk_level', 'medium')->count();
        $highCount = $allChecks->where('risk_level', 'high')->count();
        $criticalCount = $allChecks->where('risk_level', 'critical')->count();
        $onHoldCount = $allChecks->where('status', 'on_hold')->count();
        $reviewRequiredCount = $allChecks->where('status', 'review_required')->count();

        return Inertia::render('Admin/Customers/FraudReviews', [
            'fraudChecks' => $fraudChecks,
            'filters' => $request->only(['status', 'search']),
            'metrics' => [
                'total_analyzed' => $totalAnalyzed,
                'low' => $lowCount,
                'medium' => $mediumCount,
                'high' => $highCount,
                'critical' => $criticalCount,
                'on_hold' => $onHoldCount,
                'review_required' => $reviewRequiredCount,
            ],
        ]);
    }

    /**
     * Run on-demand fraud check on an order.
     */
    public function runCheck(Request $request, Order $order)
    {
        $fraudCheck = FraudDetectionService::analyzeOrder($order);

        return back()->with('success', "Fraud check executed. Risk Score: {$fraudCheck->risk_score}/100 ({$fraudCheck->risk_level})");
    }

    /**
     * Submit Admin Review Action (Approve, Reject, Hold, Override Score).
     */
    public function reviewOrder(Request $request, Order $order)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:approve,reject,hold,override',
            'override_score' => 'nullable|integer|min:0|max:100',
            'notes' => 'required|string|max:1000',
        ]);

        FraudDetectionService::reviewOrder(
            $order,
            $validated['action'],
            $validated['override_score'] ?? null,
            $validated['notes'],
            auth()->user()
        );

        return back()->with('success', "Fraud review action [{$validated['action']}] applied successfully.");
    }

    /**
     * Display Fraud Detection Weights & Threshold Settings.
     */
    public function settings()
    {
        $settings = [
            'fraud_detection_enabled' => Setting::getBool('fraud_detection_enabled', true),
            'fraud_return_rate_weight' => (int)Setting::get('fraud_return_rate_weight', 35),
            'fraud_cancel_rate_weight' => (int)Setting::get('fraud_cancel_rate_weight', 20),
            'fraud_failed_delivery_weight' => (int)Setting::get('fraud_failed_delivery_weight', 25),
            'fraud_duplicate_order_weight' => (int)Setting::get('fraud_duplicate_order_weight', 25),
            'fraud_high_value_cod_threshold' => (float)Setting::get('fraud_high_value_cod_threshold', 40000),
            'fraud_high_value_cod_weight' => (int)Setting::get('fraud_high_value_cod_weight', 20),
            'fraud_rapid_orders_window_mins' => (int)Setting::get('fraud_rapid_orders_window_mins', 15),
            'fraud_rapid_orders_threshold' => (int)Setting::get('fraud_rapid_orders_threshold', 2),
            'fraud_rapid_orders_weight' => (int)Setting::get('fraud_rapid_orders_weight', 25),
            'fraud_suspicious_phone_weight' => (int)Setting::get('fraud_suspicious_phone_weight', 30),
            'fraud_suspicious_address_weight' => (int)Setting::get('fraud_suspicious_address_weight', 20),
            'fraud_manual_review_threshold' => (int)Setting::get('fraud_manual_review_threshold', 50),
            'fraud_auto_hold_threshold' => (int)Setting::get('fraud_auto_hold_threshold', 75),
            'fraud_duplicate_window_hours' => (int)Setting::get('fraud_duplicate_window_hours', 24),
        ];

        return Inertia::render('Admin/Settings/FraudSettings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update Fraud Detection Weights & Threshold Settings.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'fraud_detection_enabled' => 'boolean',
            'fraud_return_rate_weight' => 'required|integer|min:0|max:100',
            'fraud_cancel_rate_weight' => 'required|integer|min:0|max:100',
            'fraud_failed_delivery_weight' => 'required|integer|min:0|max:100',
            'fraud_duplicate_order_weight' => 'required|integer|min:0|max:100',
            'fraud_high_value_cod_threshold' => 'required|numeric|min:0',
            'fraud_high_value_cod_weight' => 'required|integer|min:0|max:100',
            'fraud_rapid_orders_window_mins' => 'required|integer|min:1|max:120',
            'fraud_rapid_orders_threshold' => 'required|integer|min:1|max:20',
            'fraud_rapid_orders_weight' => 'required|integer|min:0|max:100',
            'fraud_suspicious_phone_weight' => 'required|integer|min:0|max:100',
            'fraud_suspicious_address_weight' => 'required|integer|min:0|max:100',
            'fraud_manual_review_threshold' => 'required|integer|min:1|max:100',
            'fraud_auto_hold_threshold' => 'required|integer|min:1|max:100',
            'fraud_duplicate_window_hours' => 'required|integer|min:1|max:168',
        ]);

        if ($request->has('fraud_detection_enabled')) {
            Setting::set('fraud_detection_enabled', $request->boolean('fraud_detection_enabled') ? '1' : '0', 'fraud');
        }

        foreach ($validated as $key => $val) {
            if ($key === 'fraud_detection_enabled') continue;
            Setting::set($key, $val, 'fraud');
        }

        return back()->with('success', 'Fraud Detection weights and threshold rules updated successfully!');
    }
}
