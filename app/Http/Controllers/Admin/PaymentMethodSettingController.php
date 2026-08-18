<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\BkashPaymentService;
use App\Services\NagadPaymentService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMethodSettingController extends Controller
{
    /**
     * Display Payment Methods Admin Configuration Panel.
     */
    public function index()
    {
        $bkashConfig = BkashPaymentService::getConfig();
        $nagadConfig = NagadPaymentService::getConfig();

        $methods = [
            [
                'code' => 'cod',
                'name' => 'Cash on Delivery',
                'title' => Setting::get('payment_cod_title', 'Cash on Delivery'),
                'description' => Setting::get('payment_cod_description', 'Pay cash when your order is delivered.'),
                'is_enabled' => (bool)Setting::get('payment_cod_enabled', true),
                'sort_order' => (int)Setting::get('payment_cod_sort', 1),
                'mode' => null,
                'status' => 'Configured',
                'health' => 'Ready (Offline / Post-delivery)',
                'badge' => null,
            ],
            [
                'code' => 'bkash',
                'name' => 'bKash Payment Gateway',
                'title' => Setting::get('payment_bkash_title', 'bKash'),
                'description' => Setting::get('payment_bkash_description', 'Pay securely using bKash.'),
                'is_enabled' => (bool)Setting::get('payment_bkash_enabled', true),
                'sort_order' => (int)Setting::get('payment_bkash_sort', 2),
                'mode' => $bkashConfig['mode'],
                'status' => BkashPaymentService::isConfigured() ? 'Configured' : 'Missing Configuration',
                'health' => BkashPaymentService::isConfigured() ? 'Gateway Active' : 'Requires .env / Server Credentials',
                'badge' => ['text' => 'bKash', 'bg' => '#e2136e'],
            ],
            [
                'code' => 'nagad',
                'name' => 'Nagad Payment Gateway',
                'title' => Setting::get('payment_nagad_title', 'Nagad'),
                'description' => Setting::get('payment_nagad_description', 'Pay securely using Nagad.'),
                'is_enabled' => (bool)Setting::get('payment_nagad_enabled', true),
                'sort_order' => (int)Setting::get('payment_nagad_sort', 3),
                'mode' => $nagadConfig['mode'],
                'status' => NagadPaymentService::isConfigured() ? 'Configured' : 'Missing Configuration',
                'health' => NagadPaymentService::isConfigured() ? 'Gateway Active' : 'Requires .env / Server Credentials',
                'badge' => ['text' => 'Nagad', 'bg' => '#f7941d'],
            ],
        ];

        return Inertia::render('Admin/Settings/PaymentMethods', [
            'methods' => $methods,
            'settings' => [
                'payment_cod_enabled' => (bool)Setting::get('payment_cod_enabled', true),
                'payment_cod_title' => Setting::get('payment_cod_title', 'Cash on Delivery'),
                'payment_cod_description' => Setting::get('payment_cod_description', 'Pay cash when your order is delivered.'),
                'payment_cod_sort' => (int)Setting::get('payment_cod_sort', 1),

                'payment_bkash_enabled' => (bool)Setting::get('payment_bkash_enabled', true),
                'payment_bkash_title' => Setting::get('payment_bkash_title', 'bKash'),
                'payment_bkash_description' => Setting::get('payment_bkash_description', 'Pay securely using bKash.'),
                'payment_bkash_sort' => (int)Setting::get('payment_bkash_sort', 2),
                'bkash_mode' => $bkashConfig['mode'],

                'payment_nagad_enabled' => (bool)Setting::get('payment_nagad_enabled', true),
                'payment_nagad_title' => Setting::get('payment_nagad_title', 'Nagad'),
                'payment_nagad_description' => Setting::get('payment_nagad_description', 'Pay securely using Nagad.'),
                'payment_nagad_sort' => (int)Setting::get('payment_nagad_sort', 3),
                'nagad_mode' => $nagadConfig['mode'],
            ],
        ]);
    }

    /**
     * Update Payment Methods Configuration.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'payment_cod_enabled' => 'required|boolean',
            'payment_cod_title' => 'required|string|max:255',
            'payment_cod_description' => 'required|string|max:500',
            'payment_cod_sort' => 'required|integer|min:1',

            'payment_bkash_enabled' => 'required|boolean',
            'payment_bkash_title' => 'required|string|max:255',
            'payment_bkash_description' => 'required|string|max:500',
            'payment_bkash_sort' => 'required|integer|min:1',
            'bkash_mode' => 'required|string|in:sandbox,live',

            'payment_nagad_enabled' => 'required|boolean',
            'payment_nagad_title' => 'required|string|max:255',
            'payment_nagad_description' => 'required|string|max:500',
            'payment_nagad_sort' => 'required|integer|min:1',
            'nagad_mode' => 'required|string|in:sandbox,live',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, is_bool($value) ? ($value ? '1' : '0') : (string)$value, 'payments');
        }

        AuditLogger::log('settings.payment_methods_updated', null, null, ['updated_by' => auth()->id()]);

        return back()->with('success', 'Payment methods configuration updated successfully.');
    }
}
