<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Setting;
use App\Models\Shipment;
use App\Models\ShipmentStatusHistory;
use App\Services\AuditLogger;
use App\Services\Courier\SteadfastCourierService;
use App\Services\Sms\SmsNotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SteadfastWebhookController extends Controller
{
    /**
     * Handle incoming webhook requests from Steadfast Courier.
     * Documentation: https://steadfast.com.bd/user/webhook/add
     */
    public function handle(Request $request): JsonResponse
    {
        Log::info('Steadfast Webhook incoming payload', [
            'headers' => [
                'authorization' => $request->header('Authorization') ? 'Bearer ****' : 'None',
                'content_type' => $request->header('Content-Type'),
            ],
            'body' => $request->all(),
        ]);

        // 1. Verify Bearer Token if configured in DB settings
        $configuredToken = trim((string)Setting::get('steadfast_webhook_token', ''));
        if (!empty($configuredToken)) {
            $bearerToken = trim((string)$request->bearerToken());
            if (empty($bearerToken) || !hash_equals($configuredToken, $bearerToken)) {
                Log::warning('Steadfast Webhook: Unauthorized bearer token attempt.');
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: Invalid or missing Bearer token.',
                ], 401);
            }
        }

        $notificationType = strtolower(trim((string)$request->input('notification_type', '')));
        $consignmentId = $request->input('consignment_id');
        $invoice = $request->input('invoice');
        $trackingMessage = trim((string)$request->input('tracking_message', ''));
        $updatedAt = $request->input('updated_at');

        // 2. Find matching Shipment
        $shipment = null;

        if (!empty($consignmentId)) {
            $shipment = Shipment::where(function ($q) use ($consignmentId) {
                $q->where('consignment_id', (string)$consignmentId)
                  ->orWhere('tracking_code', (string)$consignmentId);
            })->latest()->first();
        }

        if (!$shipment && !empty($invoice)) {
            $shipment = Shipment::where('invoice_id', (string)$invoice)->latest()->first();
        }

        if (!$shipment && !empty($invoice)) {
            $order = Order::where('order_number', (string)$invoice)->latest()->first();
            if ($order) {
                $shipment = Shipment::where('order_id', $order->id)->latest()->first();
            }
        }

        if (!$shipment) {
            Log::warning('Steadfast Webhook: Consignment not found for ID: ' . $consignmentId . ', Invoice: ' . $invoice);
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid consignment ID.',
            ], 200);
        }

        $timestamp = $updatedAt ? Carbon::parse($updatedAt) : Carbon::now();

        // 3. Process according to notification_type
        if ($notificationType === 'delivery_status') {
            $rawStatus = (string)$request->input('status', 'in_review');
            $steadfastService = new SteadfastCourierService();
            $internalStatus = $steadfastService->normalizeStatus($rawStatus);

            $shipment->courier_status = $rawStatus;
            $shipment->internal_status = $internalStatus;

            if ($request->filled('cod_amount')) {
                $shipment->cod_amount = (float)$request->input('cod_amount');
            }

            if ($request->filled('delivery_charge')) {
                $shipment->delivery_charge = (float)$request->input('delivery_charge');
            }

            if ($internalStatus === 'delivered') {
                $shipment->delivered_at = $timestamp;
            } elseif (in_array($internalStatus, ['cancelled', 'returned'])) {
                $shipment->cancelled_at = $timestamp;
            }

            $currentPayload = is_array($shipment->response_payload) ? $shipment->response_payload : [];
            $currentPayload['last_webhook'] = $request->all();
            $shipment->response_payload = $currentPayload;
            $shipment->save();

            // Record status history
            ShipmentStatusHistory::create([
                'shipment_id' => $shipment->id,
                'courier_status' => $rawStatus,
                'internal_status' => $internalStatus,
                'notes' => $trackingMessage ?: "Steadfast Webhook Status: {$rawStatus}",
                'raw_response' => $request->all(),
                'created_by' => null,
                'created_at' => $timestamp,
            ]);

            // Synchronize Order status
            if ($shipment->order) {
                $order = $shipment->order;
                $orderUpdates = [
                    'courier_status' => $rawStatus,
                ];

                if ($internalStatus === 'delivered') {
                    $orderUpdates['status'] = 'Delivered';
                    if (strtolower((string)$order->payment_method) === 'cod') {
                        $orderUpdates['payment_status'] = 'Paid';
                    }
                } elseif ($internalStatus === 'in_transit') {
                    if (in_array(strtolower((string)$order->status), ['pending', 'processing', 'booked'])) {
                        $orderUpdates['status'] = 'Shipped';
                    }
                } elseif ($internalStatus === 'returned') {
                    $orderUpdates['status'] = 'Returned';
                }

                $order->update($orderUpdates);

                OrderHistory::create([
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'notes' => "Steadfast Webhook: {$rawStatus}. " . ($trackingMessage ? "Message: {$trackingMessage}" : ''),
                    'created_by' => null,
                    'created_at' => $timestamp,
                ]);

                // Send customer SMS notification upon successful delivery
                if ($internalStatus === 'delivered' && !empty($order->customer_phone)) {
                    try {
                        SmsNotificationService::sendEvent('order.delivered', [
                            'courier_name' => 'Steadfast',
                            'tracking_number' => $shipment->tracking_code ?: (string)$shipment->consignment_id,
                        ], $order->customer_phone, $order->id, $order->user_id);
                    } catch (\Throwable $e) {
                        Log::error('Steadfast Webhook SMS dispatch failed: ' . $e->getMessage());
                    }
                }
            }

            try {
                AuditLogger::log('courier.webhook_delivery_status', $shipment, null, $request->all());
            } catch (\Throwable $e) {
                // Ignore audit logger failure
            }

        } elseif ($notificationType === 'tracking_update') {
            // Record tracking update event
            ShipmentStatusHistory::create([
                'shipment_id' => $shipment->id,
                'courier_status' => $shipment->courier_status,
                'internal_status' => $shipment->internal_status,
                'notes' => "Steadfast Tracking: " . ($trackingMessage ?: 'Hub scan update'),
                'raw_response' => $request->all(),
                'created_by' => null,
                'created_at' => $timestamp,
            ]);

            if ($shipment->order && $trackingMessage) {
                OrderHistory::create([
                    'order_id' => $shipment->order_id,
                    'status' => $shipment->order->status,
                    'notes' => "Steadfast Tracking: {$trackingMessage}",
                    'created_by' => null,
                    'created_at' => $timestamp,
                ]);
            }

            try {
                AuditLogger::log('courier.webhook_tracking_update', $shipment, null, $request->all());
            } catch (\Throwable $e) {
                // Ignore audit logger failure
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Webhook received successfully.',
        ], 200);
    }
}
