<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Carbon\Carbon;

class OrderTrackingController extends Controller
{
    /**
     * Storefront Order Tracking Page
     */
    public function index(Request $request)
    {
        $orderNumber = trim((string)($request->query('order') ?: $request->query('order_number') ?: ''));
        $phone = trim((string)$request->query('phone', ''));

        $trackedOrder = null;
        $error = null;

        if ($orderNumber !== '') {
            $formatted = $this->lookupOrder($orderNumber, $phone);
            if ($formatted) {
                $trackedOrder = $formatted;
            } else {
                $error = "No order found matching \"{$orderNumber}\". Please check your invoice number or phone number.";
            }
        }

        return Inertia::render('TrackOrder', [
            'trackedOrder' => $trackedOrder,
            'queryOrder' => $orderNumber,
            'queryPhone' => $phone,
            'initialError' => $error,
        ]);
    }

    /**
     * API endpoint for dynamic asynchronous order tracking
     */
    public function trackApi(Request $request): JsonResponse
    {
        $orderNumber = trim((string)($request->query('order_number') ?: $request->query('order') ?: ''));
        $phone = trim((string)$request->query('phone', ''));

        if ($orderNumber === '') {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid Order Invoice Number.',
            ], 422);
        }

        $formatted = $this->lookupOrder($orderNumber, $phone);

        if ($formatted) {
            return response()->json([
                'success' => true,
                'order' => $formatted,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "Order \"{$orderNumber}\" was not found in our system. Please check your invoice number or contact support.",
        ], 404);
    }

    /**
     * Look up order by number and optional phone number.
     */
    protected function lookupOrder(string $orderNumber, string $phone = ''): ?array
    {
        $cleanNumber = ltrim(trim($orderNumber), '#');

        $query = Order::with(['items.product', 'latestShipment', 'histories'])
            ->where(function ($q) use ($orderNumber, $cleanNumber) {
                $q->where('order_number', $orderNumber)
                  ->orWhere('order_number', $cleanNumber)
                  ->orWhere('order_number', '#' . $cleanNumber)
                  ->orWhere('order_number', 'like', "%{$cleanNumber}%");
            });

        if (!empty($phone)) {
            $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
            $query->where(function ($q) use ($phone, $cleanPhone) {
                $q->where('customer_phone', 'like', "%{$phone}%")
                  ->orWhere('customer_phone', 'like', "%{$cleanPhone}%");
            });
        }

        $order = $query->latest()->first();

        if (!$order) {
            return null;
        }

        $statusRaw = strtolower(trim((string)$order->status));
        $statusStep = 1;
        $statusFormatted = 'Pending';
        $statusColor = '#f59e0b';

        if (in_array($statusRaw, ['pending', 'unpaid', 'placed', 'hold', 'payment_pending'])) {
            $statusStep = 1;
            $statusFormatted = 'Order Placed (Pending)';
            $statusColor = '#f59e0b';
        } elseif (in_array($statusRaw, ['confirmed', 'processing', 'packaging', 'accepted', 'approved'])) {
            $statusStep = 2;
            $statusFormatted = 'Processing';
            $statusColor = '#3b82f6';
        } elseif (in_array($statusRaw, ['shipped', 'in_transit', 'in transit', 'out_for_delivery', 'handover_to_courier'])) {
            $statusStep = 3;
            $statusFormatted = 'In Transit';
            $statusColor = '#6366f1';
        } elseif (in_array($statusRaw, ['delivered', 'completed'])) {
            $statusStep = 4;
            $statusFormatted = 'Delivered';
            $statusColor = '#10b981';
        } elseif (in_array($statusRaw, ['cancelled', 'rejected', 'failed', 'returned', 'refunded'])) {
            $statusStep = -1;
            $statusFormatted = ucfirst($statusRaw);
            $statusColor = '#ef4444';
        } else {
            $statusFormatted = ucfirst($order->status);
        }

        $courierName = $order->courier_provider ?: ($order->latestShipment?->courier_name ?: 'Steadfast / Pathao');
        $trackingCode = $order->courier_tracking_code ?: ($order->latestShipment?->tracking_number ?: 'N/A');

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'date' => $order->created_at ? $order->created_at->format('M d, Y') : Carbon::now()->format('M d, Y'),
            'date_full' => $order->created_at ? $order->created_at->format('M d, Y h:i A') : Carbon::now()->format('M d, Y h:i A'),
            'status' => $statusFormatted,
            'status_raw' => $order->status,
            'status_step' => $statusStep,
            'status_color' => $statusColor,
            'courier' => $courierName,
            'tracking_code' => $trackingCode !== 'N/A' ? $trackingCode : null,
            'customer_name' => $order->customer_name ?: 'Customer',
            'phone' => $order->customer_phone,
            'district' => $order->district ?: 'Dhaka',
            'address' => $order->shipping_address,
            'payment_method' => $order->payment_method_label ?: 'Cash on Delivery (COD)',
            'payment_status' => ucfirst($order->payment_status ?: 'Pending'),
            'estimated_delivery' => str_contains(strtolower($order->district ?? ''), 'dhaka') ? 'Within 24-48 Hours' : 'Within 2-4 Business Days',
            'subtotal' => (float)$order->subtotal,
            'shipping_cost' => (float)$order->shipping_cost,
            'discount' => (float)$order->discount,
            'total' => (float)$order->total,
            'items' => $order->items->map(function ($item) {
                $qty = (int)($item->quantity ?: 1);
                $unitPrice = (float)($item->price ?: ($item->total && $qty ? $item->total / $qty : ($item->product?->price ?: 0)));
                $totalPrice = (float)($item->total ?: ($unitPrice * $qty));

                return [
                    'id' => $item->id,
                    'title' => $item->product_name ?: ($item->product?->title ?: 'Tech Product'),
                    'quantity' => $qty,
                    'price' => $unitPrice,
                    'total' => $totalPrice,
                    'image' => $this->resolveItemImage($item),
                ];
            })->values()->all(),
        ];
    }

    /**
     * Resolve valid absolute/storage URL for product thumbnail.
     */
    protected function resolveItemImage($item): string
    {
        $img = $item->image_snapshot ?: ($item->product?->image ?: null);
        if (!$img && $item->product && is_array($item->product->gallery) && count($item->product->gallery) > 0) {
            $img = $item->product->gallery[0];
        }

        if (!$img) {
            return '';
        }

        if (str_starts_with($img, 'http://') || str_starts_with($img, 'https://') || str_starts_with($img, 'data:')) {
            return $img;
        }

        if (str_starts_with($img, '/storage/')) {
            return $img;
        }

        if (str_starts_with($img, 'storage/')) {
            return '/' . $img;
        }

        if (str_starts_with($img, '/')) {
            return $img;
        }

        return '/storage/' . ltrim($img, '/');
    }
}
