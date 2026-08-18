<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Shipment;
use App\Services\Courier\CourierManager;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourierController extends Controller
{
    public function __construct(
        protected CourierManager $courierManager
    ) {}

    /**
     * Display the Central Shipments Management Ledger.
     */
    public function index(Request $request)
    {
        $query = Shipment::with(['order', 'creator'])->latest();

        if ($request->filled('provider')) {
            $query->where('courier_provider', $request->input('provider'));
        }

        if ($request->filled('status')) {
            $query->where('internal_status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('consignment_id', 'like', "%{$s}%")
                  ->orWhere('tracking_code', 'like', "%{$s}%")
                  ->orWhere('recipient_name', 'like', "%{$s}%")
                  ->orWhere('recipient_phone', 'like', "%{$s}%")
                  ->orWhere('invoice_id', 'like', "%{$s}%");
            });
        }

        $shipments = $query->paginate(15)->withQueryString();

        // High-level shipment metrics
        $allShipments = Shipment::all();
        $totalCount = $allShipments->count();
        $inTransitCount = $allShipments->whereIn('internal_status', ['in_transit', 'booked'])->count();
        $deliveredCount = $allShipments->where('internal_status', 'delivered')->count();
        $returnedCount = $allShipments->where('internal_status', 'returned')->count();
        $cancelledCount = $allShipments->where('internal_status', 'cancelled')->count();

        $steadfastDelivered = $allShipments->where('courier_provider', 'steadfast')->where('internal_status', 'delivered')->count();
        $steadfastTotal = $allShipments->where('courier_provider', 'steadfast')->count();
        $steadfastSuccessRate = $steadfastTotal > 0 ? round(($steadfastDelivered / $steadfastTotal) * 100, 1) : 100.0;

        $pathaoDelivered = $allShipments->where('courier_provider', 'pathao')->where('internal_status', 'delivered')->count();
        $pathaoTotal = $allShipments->where('courier_provider', 'pathao')->count();
        $pathaoSuccessRate = $pathaoTotal > 0 ? round(($pathaoDelivered / $pathaoTotal) * 100, 1) : 100.0;

        return Inertia::render('Admin/Delivery/Shipments', [
            'shipments' => $shipments,
            'filters' => $request->only(['provider', 'status', 'search']),
            'metrics' => [
                'total' => $totalCount,
                'in_transit' => $inTransitCount,
                'delivered' => $deliveredCount,
                'returned' => $returnedCount,
                'cancelled' => $cancelledCount,
                'steadfast_rate' => $steadfastSuccessRate,
                'pathao_rate' => $pathaoSuccessRate,
            ],
            'providers' => $this->courierManager->getAvailableProviders(),
        ]);
    }

    /**
     * Display Courier Integrations Settings page.
     */
    public function settings()
    {
        $settings = [
            // Steadfast Settings
            'steadfast_enabled' => Setting::getBool('steadfast_enabled', false),
            'steadfast_base_url' => Setting::get('steadfast_base_url', 'https://portal.steadfast.com.bd/api/v1'),
            'steadfast_api_key' => Setting::get('steadfast_api_key', ''),
            'steadfast_secret_key_configured' => !empty(Setting::get('steadfast_secret_key') ?: config('services.steadfast.secret_key')),
            'steadfast_default_pickup' => Setting::get('steadfast_default_pickup', 'TechMarket BD Showroom Hub, Multiplan Center, Elephant Road, Dhaka'),

            // Pathao Settings
            'pathao_enabled' => Setting::getBool('pathao_enabled', false),
            'pathao_environment' => Setting::get('pathao_environment', 'live'),
            'pathao_base_url' => Setting::get('pathao_base_url', 'https://api-hermes.pathao.com'),
            'pathao_client_id' => Setting::get('pathao_client_id', ''),
            'pathao_client_secret_configured' => !empty(Setting::get('pathao_client_secret') ?: config('services.pathao.client_secret')),
            'pathao_username' => Setting::get('pathao_username', ''),
            'pathao_password_configured' => !empty(Setting::get('pathao_password') ?: config('services.pathao.password')),
            'pathao_store_id' => Setting::get('pathao_store_id', '1'),
            'pathao_default_pickup' => Setting::get('pathao_default_pickup', 'TechMarket Central Showroom Hub'),
        ];

        return Inertia::render('Admin/Settings/CourierSettings', [
            'settings' => $settings,
            'providers' => $this->courierManager->getAvailableProviders(),
        ]);
    }

    /**
     * Update courier configuration settings.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            // Steadfast
            'steadfast_enabled' => 'boolean',
            'steadfast_base_url' => 'nullable|string|url',
            'steadfast_api_key' => 'nullable|string',
            'steadfast_secret_key' => 'nullable|string',
            'steadfast_default_pickup' => 'nullable|string',

            // Pathao
            'pathao_enabled' => 'boolean',
            'pathao_environment' => 'nullable|string|in:sandbox,live',
            'pathao_base_url' => 'nullable|string|url',
            'pathao_client_id' => 'nullable|string',
            'pathao_client_secret' => 'nullable|string',
            'pathao_username' => 'nullable|string',
            'pathao_password' => 'nullable|string',
            'pathao_store_id' => 'nullable|string',
            'pathao_default_pickup' => 'nullable|string',
        ]);

        $booleanKeys = ['steadfast_enabled', 'pathao_enabled'];
        foreach ($booleanKeys as $bKey) {
            if ($request->has($bKey)) {
                Setting::set($bKey, $request->boolean($bKey) ? '1' : '0', 'courier');
            }
        }

        foreach ($validated as $key => $val) {
            if (in_array($key, $booleanKeys)) {
                continue;
            }
            if ($val !== null && $val !== '') {
                Setting::set($key, $val, 'courier');
            }
        }

        return back()->with('success', 'Courier Integration settings saved successfully!');
    }

    /**
     * Test connection to courier provider API.
     */
    public function testConnection(Request $request)
    {
        $request->validate([
            'provider' => 'required|string|in:steadfast,pathao,redx',
        ]);

        $provider = strtolower($request->input('provider'));
        $result = $this->courierManager->testProvider($provider);

        return response()->json($result);
    }

    /**
     * Dynamic proxy for Pathao stores, cities, zones, and areas.
     */
    public function locations(Request $request)
    {
        $type = $request->input('type', 'stores');
        $courier = $this->courierManager->driver('pathao');

        $data = match ($type) {
            'stores' => $courier->getStores(),
            'cities' => $courier->getCities(),
            'zones' => $courier->getZones($request->input('city_id', 1)),
            'areas' => $courier->getAreas($request->input('zone_id', 1)),
            default => [],
        };

        return response()->json($data);
    }

    /**
     * Book shipment for an order.
     */
    public function book(Request $request, Order $order)
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:steadfast,pathao,redx',
            'parcel_weight' => 'nullable|numeric|min:0.1',
            'cod_amount' => 'nullable|numeric|min:0',
            'delivery_charge' => 'nullable|numeric|min:0',
            'recipient_name' => 'nullable|string|max:255',
            'recipient_phone' => 'nullable|string|max:20',
            'recipient_address' => 'nullable|string|max:500',
            'store_id' => 'nullable|string',
            'recipient_city_id' => 'nullable|integer',
            'recipient_zone_id' => 'nullable|integer',
            'recipient_area_id' => 'nullable|integer',
            'special_instructions' => 'nullable|string|max:500',
        ]);

        $result = $this->courierManager->bookShipment($order, $validated['provider'], $validated);

        if (!($result['success'] ?? false)) {
            // Dispatch Admin Alert for courier booking failure
            \App\Services\Sms\SmsNotificationService::sendEvent('admin.courier_failure', [
                'courier_name' => ucfirst($validated['provider']),
                'error_reason' => $result['message'] ?? 'API connection failure',
            ], null, $order->id, $order->user_id);

            return back()->with('error', $result['message'] ?? 'Failed to book parcel with courier.');
        }

        // Dispatch Customer Notification for courier booking & tracking code
        \App\Services\Sms\SmsNotificationService::sendEvent('courier.booked', [
            'courier_name' => ucfirst($validated['provider']),
            'tracking_number' => $result['tracking_code'],
        ], $order->customer_phone, $order->id, $order->user_id);

        return back()->with('success', "Parcel consignment booked successfully! Tracking Code: {$result['tracking_code']}");
    }

    /**
     * Refresh live tracking status of a shipment.
     */
    public function track(Shipment $shipment)
    {
        $result = $this->courierManager->trackShipment($shipment);

        if (!($result['success'] ?? false)) {
            return back()->with('error', $result['message'] ?? 'Failed to refresh tracking status.');
        }

        return back()->with('success', "Live tracking updated. Status: {$shipment->fresh()->courier_status}");
    }

    /**
     * Cancel a shipment with courier.
     */
    public function cancel(Shipment $shipment)
    {
        $result = $this->courierManager->cancelShipment($shipment);

        if (!($result['success'] ?? false)) {
            return back()->with('error', $result['message'] ?? 'Failed to cancel shipment.');
        }

        return back()->with('success', 'Shipment cancelled successfully.');
    }
}
