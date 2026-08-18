<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Shipment;
use App\Models\ShipmentStatusHistory;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CourierManager
{
    /**
     * @var array<string, CourierServiceInterface>
     */
    protected array $drivers = [];

    /**
     * Resolve courier service driver instance.
     */
    public function driver(?string $driver = null): CourierServiceInterface
    {
        $driver = strtolower($driver ?: $this->getDefaultDriver());

        if (!isset($this->drivers[$driver])) {
            $this->drivers[$driver] = $this->createDriver($driver);
        }

        return $this->drivers[$driver];
    }

    public function getDefaultDriver(): string
    {
        return 'steadfast';
    }

    /**
     * Instantiate provider instance.
     */
    protected function createDriver(string $driver): CourierServiceInterface
    {
        return match ($driver) {
            'steadfast' => new SteadfastCourierService(),
            'pathao' => new PathaoCourierService(),
            'redx' => new class extends SteadfastCourierService {
                public function getIdentifier(): string { return 'redx'; }
                public function getName(): string { return 'RedX Logistics'; }
            },
            default => throw new InvalidArgumentException("Unsupported courier provider [{$driver}]."),
        };
    }

    /**
     * Get list of all available courier providers and their configuration status.
     */
    public function getAvailableProviders(): array
    {
        $providers = ['steadfast', 'pathao'];
        $result = [];

        foreach ($providers as $p) {
            $instance = $this->driver($p);
            $result[] = [
                'identifier' => $instance->getIdentifier(),
                'name' => $instance->getName(),
                'configured' => $instance->isConfigured(),
                'enabled' => $instance->isEnabled(),
            ];
        }

        return $result;
    }

    /**
     * Test provider connection.
     */
    public function testProvider(string $provider): array
    {
        return $this->driver($provider)->testConnection();
    }

    /**
     * Book and create a shipment for an order with selected courier provider.
     */
    public function bookShipment(Order $order, string $provider, array $params = []): array
    {
        // Guard 1: Prevent booking for cancelled orders
        if (strtolower($order->status) === 'cancelled') {
            return [
                'success' => false,
                'message' => 'Cannot create courier consignment for a cancelled order.',
            ];
        }

        // Guard 2: Prevent duplicate active shipment for the same order
        $existingActiveShipment = Shipment::where('order_id', $order->id)
            ->whereNotIn('internal_status', ['cancelled'])
            ->first();

        if ($existingActiveShipment) {
            $trackingId = $existingActiveShipment->tracking_code ?: $existingActiveShipment->consignment_id;
            return [
                'success' => false,
                'message' => "An active shipment consignment already exists for this order (Tracking Code: {$trackingId}). Please cancel the existing shipment before booking a new one.",
            ];
        }

        // Guard 3: Validate recipient phone and address
        $phone = trim($params['recipient_phone'] ?? $order->customer_phone ?? '');
        $address = trim($params['recipient_address'] ?? $order->shipping_address ?? '');

        if (empty($phone) || strlen($phone) < 6) {
            return [
                'success' => false,
                'message' => 'A valid recipient customer phone number is required to book a courier consignment.',
            ];
        }

        if (empty($address)) {
            return [
                'success' => false,
                'message' => 'A recipient shipping address is required to book a courier consignment.',
            ];
        }

        $courier = $this->driver($provider);
        $result = $courier->createParcel($order, $params);

        if (!($result['success'] ?? false)) {
            AuditLogger::log('courier.booking_failed', $order, null, [
                'provider' => $provider,
                'error' => $result['message'] ?? 'Unknown error',
            ]);

            return $result;
        }

        return DB::transaction(function () use ($order, $provider, $courier, $result, $params) {
            $consignmentId = $result['consignment_id'] ?? null;
            $trackingCode = $result['tracking_code'] ?? $consignmentId;
            $courierStatus = $result['courier_status'] ?? 'pending';
            $internalStatus = $result['internal_status'] ?? 'booked';

            // Create or update shipment
            $shipment = Shipment::create([
                'order_id' => $order->id,
                'courier_provider' => $provider,
                'consignment_id' => $consignmentId,
                'tracking_code' => $trackingCode,
                'invoice_id' => $order->order_number,
                'recipient_name' => $params['recipient_name'] ?? $order->customer_name,
                'recipient_phone' => $params['recipient_phone'] ?? $order->customer_phone,
                'recipient_address' => $params['recipient_address'] ?? ($order->shipping_address . ', ' . $order->district),
                'recipient_city' => $params['recipient_city'] ?? $order->district,
                'recipient_zone' => $params['recipient_zone'] ?? null,
                'recipient_area' => $params['recipient_area'] ?? null,
                'parcel_weight' => (float)($params['parcel_weight'] ?? 0.5),
                'cod_amount' => isset($params['cod_amount']) ? (float)$params['cod_amount'] : ($order->payment_method === 'cod' ? (float)$order->total : 0.0),
                'delivery_charge' => (float)($params['delivery_charge'] ?? $order->shipping_cost),
                'courier_status' => $courierStatus,
                'internal_status' => $internalStatus,
                'store_id' => $params['store_id'] ?? null,
                'special_instructions' => $params['special_instructions'] ?? $order->notes,
                'request_payload' => $result['request_payload'] ?? null,
                'response_payload' => $result['raw'] ?? null,
                'booked_at' => Carbon::now(),
                'created_by' => auth()->id(),
            ]);

            // Create shipment history
            ShipmentStatusHistory::create([
                'shipment_id' => $shipment->id,
                'courier_status' => $courierStatus,
                'internal_status' => $internalStatus,
                'notes' => "Shipment booked via {$courier->getName()}. Tracking Code: {$trackingCode}",
                'raw_response' => $result['raw'] ?? null,
                'created_by' => auth()->id(),
                'created_at' => Carbon::now(),
            ]);

            // Update order status fields
            $order->update([
                'courier_provider' => $provider,
                'courier_status' => $courierStatus,
                'courier_tracking_code' => $trackingCode,
                'status' => $order->status === 'Pending' ? 'Processing' : $order->status,
            ]);

            OrderHistory::create([
                'order_id' => $order->id,
                'status' => $order->status,
                'notes' => "Parcel booked with {$courier->getName()}. Tracking ID: {$trackingCode}",
                'created_by' => auth()->id(),
            ]);

            AuditLogger::log('courier.shipment_booked', $shipment, null, [
                'order_id' => $order->id,
                'provider' => $provider,
                'tracking_code' => $trackingCode,
                'consignment_id' => $consignmentId,
            ]);

            return [
                'success' => true,
                'shipment' => $shipment,
                'consignment_id' => $consignmentId,
                'tracking_code' => $trackingCode,
                'provider' => $provider,
                'message' => "Shipment successfully booked with {$courier->getName()}!",
            ];
        });
    }

    /**
     * Track and update live shipment status.
     */
    public function trackShipment(Shipment $shipment): array
    {
        $courier = $this->driver($shipment->courier_provider);
        $tracking = $courier->trackParcel($shipment->tracking_code ?: '', $shipment->consignment_id);

        if ($tracking['success'] ?? false) {
            $newCourierStatus = $tracking['courier_status'] ?? $shipment->courier_status;
            $newInternalStatus = $tracking['internal_status'] ?? $shipment->internal_status;

            if ($shipment->courier_status !== $newCourierStatus || $shipment->internal_status !== $newInternalStatus) {
                $shipment->update([
                    'courier_status' => $newCourierStatus,
                    'internal_status' => $newInternalStatus,
                    'delivered_at' => $newInternalStatus === 'delivered' ? Carbon::now() : $shipment->delivered_at,
                ]);

                ShipmentStatusHistory::create([
                    'shipment_id' => $shipment->id,
                    'courier_status' => $newCourierStatus,
                    'internal_status' => $newInternalStatus,
                    'notes' => "Live status sync: {$newCourierStatus}",
                    'raw_response' => $tracking['raw'] ?? null,
                    'created_by' => auth()->id(),
                    'created_at' => Carbon::now(),
                ]);

                if ($shipment->order) {
                    $shipment->order->update([
                        'courier_status' => $newCourierStatus,
                        'status' => $newInternalStatus === 'delivered' ? 'Delivered' : ($newInternalStatus === 'in_transit' ? 'Shipped' : $shipment->order->status),
                    ]);
                }
            }
        }

        return $tracking;
    }

    /**
     * Cancel a shipment.
     */
    public function cancelShipment(Shipment $shipment): array
    {
        $courier = $this->driver($shipment->courier_provider);
        $result = $courier->cancelParcel($shipment->tracking_code ?: '', $shipment->consignment_id);

        if ($result['success'] ?? false) {
            $shipment->update([
                'courier_status' => 'cancelled',
                'internal_status' => 'cancelled',
                'cancelled_at' => Carbon::now(),
            ]);

            ShipmentStatusHistory::create([
                'shipment_id' => $shipment->id,
                'courier_status' => 'cancelled',
                'internal_status' => 'cancelled',
                'notes' => 'Shipment cancelled by Administrator.',
                'created_by' => auth()->id(),
                'created_at' => Carbon::now(),
            ]);

            if ($shipment->order) {
                $shipment->order->update([
                    'courier_status' => 'cancelled',
                ]);
            }
        }

        return $result;
    }
}
