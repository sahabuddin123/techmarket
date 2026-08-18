<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderHistory;
use App\Models\Coupon;
use App\Models\Setting;
use App\Services\PricingService;
use App\Services\InventoryService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    protected array $allDistricts = [
        'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail',
        'Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira',
        'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Cox\'s Bazar', 'Cumilla', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati',
        'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapainawabganj', 'Pabna', 'Rajshahi', 'Sirajganj',
        'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon',
        'Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet',
        'Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur',
        'Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'
    ];

    public function index(Request $request)
    {
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $user = auth()->user();

        // Calculate authoritative totals
        $cartPayload = array_map(function ($item) {
            return [
                'product_id' => $item['product_id'] ?? $item['id'] ?? null,
                'quantity' => $item['quantity'] ?? 1,
            ];
        }, array_values($cart));

        $couponCode = session()->get('cart_coupon');
        $pricing = PricingService::calculateOrderTotal($cartPayload, $couponCode, 60.00);

        // Format items with regular_price & savings
        $formattedCart = array_map(function ($item) {
            $price = (float)($item['price'] ?? 0);
            $regPrice = (float)($item['regular_price'] ?? $price);
            $qty = max(1, (int)($item['quantity'] ?? 1));
            return array_merge($item, [
                'price' => $price,
                'regular_price' => $regPrice,
                'quantity' => $qty,
                'total' => $price * $qty,
                'savings' => max(0, ($regPrice - $price) * $qty),
            ]);
        }, array_values($cart));

        // Resolve active payment methods dynamically from settings
        $allPaymentMethods = [
            [
                'id' => 'cod',
                'title' => Setting::get('payment_cod_title', 'Cash on Delivery'),
                'description' => Setting::get('payment_cod_description', 'Pay cash when your order is delivered.'),
                'badge' => null,
                'enabled' => Setting::getBool('payment_cod_enabled', true),
                'sort_order' => (int)Setting::get('payment_cod_sort', 1),
            ],
            [
                'id' => 'bkash',
                'title' => Setting::get('payment_bkash_title', 'bKash'),
                'description' => Setting::get('payment_bkash_description', 'Pay securely using bKash.'),
                'badge' => ['text' => 'bKash', 'bg' => '#e2136e'],
                'enabled' => Setting::getBool('payment_bkash_enabled', true),
                'sort_order' => (int)Setting::get('payment_bkash_sort', 2),
            ],
            [
                'id' => 'nagad',
                'title' => Setting::get('payment_nagad_title', 'Nagad'),
                'description' => Setting::get('payment_nagad_description', 'Pay securely using Nagad.'),
                'badge' => ['text' => 'Nagad', 'bg' => '#f7941d'],
                'enabled' => Setting::getBool('payment_nagad_enabled', true),
                'sort_order' => (int)Setting::get('payment_nagad_sort', 3),
            ],
        ];

        $paymentMethods = array_values(array_filter($allPaymentMethods, fn($m) => $m['enabled']));
        usort($paymentMethods, fn($a, $b) => $a['sort_order'] <=> $b['sort_order']);

        return Inertia::render('Checkout', [
            'cart' => $formattedCart,
            'user' => $user,
            'districts' => $this->allDistricts,
            'paymentMethods' => $paymentMethods,
            'summary' => [
                'subtotal' => $pricing['subtotal'],
                'discount' => $pricing['discount'],
                'shipping_cost' => $pricing['shipping_cost'],
                'total' => $pricing['total'],
                'coupon_code' => $couponCode,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        // Dynamically build allowed payment methods
        $allowedPaymentMethods = [];
        if (Setting::getBool('payment_cod_enabled', true)) {
            $allowedPaymentMethods = array_merge($allowedPaymentMethods, ['cod', 'COD']);
        }
        if (Setting::getBool('payment_bkash_enabled', true)) {
            $allowedPaymentMethods = array_merge($allowedPaymentMethods, ['bkash', 'bKash']);
        }
        if (Setting::getBool('payment_nagad_enabled', true)) {
            $allowedPaymentMethods = array_merge($allowedPaymentMethods, ['nagad', 'Nagad']);
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'shipping_address' => 'required|string|max:500',
            'district' => 'required|string',
            'area' => 'nullable|string|max:255',
            'same_billing' => 'nullable|boolean',
            'billing_name' => 'nullable|string|max:255',
            'billing_phone' => 'nullable|string|max:20',
            'billing_address' => 'nullable|string|max:500',
            'payment_method' => ['required', 'string', 'in:' . implode(',', $allowedPaymentMethods)],
            'coupon_code' => 'nullable|string',
            'notes' => 'nullable|string|max:1000',
            'terms' => 'nullable',
        ]);

        // Normalize payment method to standardized machine code: cod, bkash, nagad
        $pmNormalized = strtolower($validated['payment_method']);

        // Fallback email if guest didn't provide one
        $customerEmail = !empty($validated['customer_email'])
            ? $validated['customer_email']
            : (auth()->check() ? auth()->user()->email : $validated['customer_phone'] . '@customer.techlandbd.com');

        $shippingCost = $validated['district'] === 'Dhaka' ? 60.00 : 120.00;

        // Transform cart array for PricingService
        $cartPayload = array_map(function ($item) {
            return [
                'product_id' => $item['product_id'] ?? $item['id'] ?? null,
                'quantity' => $item['quantity'] ?? 1,
            ];
        }, array_values($cart));

        $couponCode = $validated['coupon_code'] ?? session()->get('cart_coupon');

        return DB::transaction(function () use ($validated, $cartPayload, $shippingCost, $pmNormalized, $customerEmail, $couponCode) {
            // Authoritative server calculation
            $pricing = PricingService::calculateOrderTotal($cartPayload, $couponCode, $shippingCost);

            $orderNumber = 'TMB-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);

            $fullShippingAddress = $validated['shipping_address'];
            if (!empty($validated['area'])) {
                $fullShippingAddress .= ' (' . $validated['area'] . ')';
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => auth()->id(),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $customerEmail,
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $fullShippingAddress,
                'district' => $validated['district'],
                'payment_method' => $pmNormalized,
                'payment_status' => 'Pending', // Pending until verified
                'shipping_cost' => $pricing['shipping_cost'],
                'subtotal' => $pricing['subtotal'],
                'discount' => $pricing['discount'],
                'total' => $pricing['total'],
                'status' => 'Pending',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Save immutable item snapshots & deduct inventory with audit trail
            foreach ($pricing['items'] as $itemData) {
                $product = $itemData['product'];
                $qty = $itemData['quantity'];
                $unitPrice = $itemData['unit_price'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->title,
                    'sku_snapshot' => $product->sku,
                    'image_snapshot' => $product->image,
                    'specs_snapshot' => $product->key_specs,
                    'price' => $unitPrice,
                    'quantity' => $qty,
                    'total' => $itemData['subtotal'],
                ]);

                // Atomically reserve/deduct stock with audit movement
                InventoryService::reserveStock($product->id, $qty, $order->id);
            }

            $methodLabel = Order::formatPaymentMethodName($pmNormalized);

            // Create initial Order Status Timeline entry
            OrderHistory::create([
                'order_id' => $order->id,
                'status' => 'Pending',
                'notes' => "Order placed via checkout with {$methodLabel}.",
                'created_by' => auth()->id(),
            ]);

            AuditLogger::log('order.created', $order, null, [
                'order_number' => $order->order_number,
                'total' => $order->total,
                'payment_method' => $order->payment_method
            ]);

            // Execute automated Fraud & Duplicate Risk Analysis
            \App\Services\Fraud\FraudDetectionService::analyzeOrder($order);

            // Dispatch transactional SMS to Customer and Admin Alert SMS
            \App\Services\Sms\SmsNotificationService::sendEvent('order.placed', [], $order->customer_phone, $order->id, $order->user_id);
            \App\Services\Sms\SmsNotificationService::sendEvent('admin.new_order', [], null, $order->id, $order->user_id);

            // Clear session cart and coupons
            session()->forget(['cart', 'cart_coupon', 'cart_points']);

            session()->put('recent_order_id', $order->id);

            if ($pmNormalized === 'bkash') {
                return redirect()->route('payment.bkash.process', $order->order_number);
            }

            if ($pmNormalized === 'nagad') {
                return redirect()->route('payment.nagad.process', $order->order_number);
            }

            return redirect()->route('checkout.invoice', $order->order_number)->with('success', 'Order placed successfully!');
        });
    }

    public function invoice($orderNumber)
    {
        $order = Order::with(['items.product', 'user'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        // Prevent IDOR: If order belongs to an account, ensure requester is the owner or an admin
        if ($order->user_id) {
            if (auth()->check()) {
                if (auth()->id() !== $order->user_id && !auth()->user()->isAdmin()) {
                    abort(403, 'Unauthorized access to this order invoice.');
                }
            } else {
                // If not logged in, check if order was created in current session
                if (session('recent_order_id') !== $order->id) {
                    return redirect()->route('login')->with('info', 'Please log in to view this order invoice.');
                }
            }
        }

        return Inertia::render('Invoice', [
            'order' => $order,
        ]);
    }
}
