<?php

namespace App\Http\Controllers;

use App\Models\LandingPage;
use App\Models\LandingPageEvent;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderHistory;
use App\Models\Product;
use App\Models\Setting;
use App\Services\PricingService;
use App\Services\InventoryService;
use App\Services\AuditLogger;
use App\Services\Fraud\FraudDetectionService;
use App\Services\Sms\SmsNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class LandingPageController extends Controller
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

    /**
     * Render the customer-facing high-converting landing page.
     */
    public function show(Request $request, string $slug)
    {
        $landingPage = LandingPage::with(['sections', 'product.brand', 'product.category'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Check active / scheduled / expired state (Admins can preview any state)
        if (!$landingPage->isPubliclyAccessible() && (!auth()->check() || !auth()->user()->isAdmin())) {
            abort(404, 'This promotional campaign is currently not available.');
        }

        // Increment total page views
        $landingPage->increment('view_count');

        // Log page_view event for funnel tracking
        $this->recordEvent($landingPage->id, 'page_view', [
            'value' => 0,
            'utm_source' => $request->query('utm_source'),
            'utm_medium' => $request->query('utm_medium'),
            'utm_campaign' => $request->query('utm_campaign'),
            'utm_content' => $request->query('utm_content'),
            'utm_term' => $request->query('utm_term'),
            'fbclid' => $request->query('fbclid'),
            'gclid' => $request->query('gclid'),
            'campaign_id' => $request->query('campaign_id'),
            'adset_id' => $request->query('adset_id'),
            'ad_id' => $request->query('ad_id'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
        ]);

        $product = $landingPage->product;
        $pricing = null;
        if ($product) {
            $pricing = PricingService::resolveProductPrice($product);
            
            // Apply landing page custom discount override if configured
            if ($landingPage->custom_discount_amount > 0) {
                $pricing['final_price'] = max(1, $pricing['final_price'] - (float)$landingPage->custom_discount_amount);
                $pricing['savings'] += (float)$landingPage->custom_discount_amount;
            }
        }

        // Gather reviews if product exists
        $reviews = [];
        $ratingSummary = ['average' => 5.0, 'count' => 0];
        if ($product) {
            $productReviews = \App\Models\ProductReview::where('product_id', $product->id)
                ->where('status', 'Approved')
                ->latest()
                ->take(10)
                ->get();

            $reviews = $productReviews->map(fn($r) => [
                'id' => $r->id,
                'user_name' => $r->user?->name ?: 'Verified Customer',
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at->format('d M, Y'),
                'is_verified' => true,
            ]);

            $avgRating = \App\Models\ProductReview::where('product_id', $product->id)->where('status', 'Approved')->avg('rating');
            $countRating = \App\Models\ProductReview::where('product_id', $product->id)->where('status', 'Approved')->count();
            $ratingSummary = [
                'average' => $avgRating ? round($avgRating, 1) : 5.0,
                'count' => $countRating ?: 8,
            ];
        }

        // Resolve active payment methods
        $configuredMethods = $landingPage->payment_methods ?: ['cod', 'bkash', 'nagad'];
        $globalCod = Setting::getBool('payment_cod_enabled', true);
        $globalBkash = Setting::getBool('payment_bkash_enabled', true);
        $globalNagad = Setting::getBool('payment_nagad_enabled', true);

        $availablePaymentMethods = [];
        if (in_array('cod', $configuredMethods) && $globalCod) {
            $availablePaymentMethods[] = [
                'id' => 'cod',
                'title' => 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
                'subtitle' => 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন',
                'badge' => 'COD',
            ];
        }
        if (in_array('bkash', $configuredMethods) && $globalBkash) {
            $availablePaymentMethods[] = [
                'id' => 'bkash',
                'title' => 'বিকাশ অনলাইন পেমেন্ট (bKash)',
                'subtitle' => 'ইনস্ট্যান্ট পেমেন্ট গেটওয়ে',
                'badge' => 'bKash',
            ];
        }
        if (in_array('nagad', $configuredMethods) && $globalNagad) {
            $availablePaymentMethods[] = [
                'id' => 'nagad',
                'title' => 'নগদ অনলাইন পেমেন্ট (Nagad)',
                'subtitle' => 'ইনস্ট্যান্ট পেমেন্ট গেটওয়ে',
                'badge' => 'Nagad',
            ];
        }
        if (empty($availablePaymentMethods)) {
            $availablePaymentMethods[] = [
                'id' => 'cod',
                'title' => 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
                'subtitle' => 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন',
                'badge' => 'COD',
            ];
        }

        // Dynamic Delivery Rates
        $insideDhakaCost = $landingPage->is_free_delivery ? 0.00 : ($landingPage->inside_dhaka_charge !== null ? (float)$landingPage->inside_dhaka_charge : 60.00);
        $outsideDhakaCost = $landingPage->is_free_delivery ? 0.00 : ($landingPage->outside_dhaka_charge !== null ? (float)$landingPage->outside_dhaka_charge : 120.00);

        // Tracking configuration (combines global and page overrides)
        $trackingConfig = [
            'meta_pixel_enabled' => Setting::getBool('meta_pixel_enabled', true),
            'meta_pixel_id' => $landingPage->meta_pixel_id ?: Setting::get('meta_pixel_id', ''),
            'ga4_enabled' => Setting::getBool('ga4_enabled', true),
            'ga4_measurement_id' => $landingPage->ga4_measurement_id ?: Setting::get('ga4_measurement_id', ''),
            'gtm_enabled' => Setting::getBool('gtm_enabled', false),
            'gtm_container_id' => $landingPage->gtm_container_id ?: Setting::get('gtm_container_id', ''),
        ];

        // Authoritative JSON-LD structured schemas
        $schemas = [];
        if ($product) {
            $schemas['product'] = [
                '@context' => 'https://schema.org/',
                '@type' => 'Product',
                'name' => $product->title,
                'image' => $product->image ? url($product->image) : null,
                'description' => strip_tags($product->short_description ?: $product->description ?: $product->title),
                'sku' => $product->sku ?: 'PROD-' . $product->id,
                'brand' => [
                    '@type' => 'Brand',
                    'name' => $product->brand?->name ?: 'TechMarket BD',
                ],
                'offers' => [
                    '@type' => 'Offer',
                    'url' => $landingPage->public_url,
                    'priceCurrency' => 'BDT',
                    'price' => $pricing['final_price'] ?? $product->price,
                    'availability' => $product->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    'itemCondition' => 'https://schema.org/NewCondition',
                ],
            ];
        }

        return Inertia::render('LandingPages/Show', [
            'landingPage' => $landingPage,
            'product' => $product,
            'pricing' => $pricing,
            'sections' => $landingPage->sections,
            'reviews' => $reviews,
            'ratingSummary' => $ratingSummary,
            'paymentMethods' => $availablePaymentMethods,
            'districts' => $this->allDistricts,
            'deliveryRates' => [
                'inside_dhaka' => $insideDhakaCost,
                'outside_dhaka' => $outsideDhakaCost,
                'is_free' => $landingPage->is_free_delivery,
            ],
            'trackingConfig' => $trackingConfig,
            'structuredSchemas' => $schemas,
            'campaignParams' => [
                'utm_source' => $request->query('utm_source', ''),
                'utm_medium' => $request->query('utm_medium', ''),
                'utm_campaign' => $request->query('utm_campaign', $landingPage->campaign_name ?: ''),
                'utm_content' => $request->query('utm_content', ''),
                'utm_term' => $request->query('utm_term', ''),
                'fbclid' => $request->query('fbclid', ''),
                'gclid' => $request->query('gclid', ''),
                'campaign_id' => $request->query('campaign_id', $landingPage->campaign_code ?: ''),
                'adset_id' => $request->query('adset_id', ''),
                'ad_id' => $request->query('ad_id', ''),
            ]
        ]);
    }

    /**
     * Non-blocking funnel interaction event tracking.
     */
    public function trackEvent(Request $request, string $slug)
    {
        $landingPage = LandingPage::where('slug', $slug)->first();
        if (!$landingPage) {
            return response()->json(['success' => false, 'message' => 'Landing page not found'], 404);
        }

        $validated = $request->validate([
            'event_name' => 'required|string|max:50',
            'event_id' => 'nullable|string|max:100',
            'value' => 'nullable|numeric',
            'currency' => 'nullable|string|max:10',
            'utm_source' => 'nullable|string',
            'utm_medium' => 'nullable|string',
            'utm_campaign' => 'nullable|string',
            'utm_content' => 'nullable|string',
            'utm_term' => 'nullable|string',
            'fbclid' => 'nullable|string',
            'gclid' => 'nullable|string',
            'campaign_id' => 'nullable|string',
            'adset_id' => 'nullable|string',
            'ad_id' => 'nullable|string',
        ]);

        $this->recordEvent($landingPage->id, $validated['event_name'], [
            'event_id' => $validated['event_id'] ?? null,
            'value' => $validated['value'] ?? 0,
            'currency' => $validated['currency'] ?? 'BDT',
            'utm_source' => $validated['utm_source'] ?? $request->query('utm_source'),
            'utm_medium' => $validated['utm_medium'] ?? $request->query('utm_medium'),
            'utm_campaign' => $validated['utm_campaign'] ?? $request->query('utm_campaign'),
            'utm_content' => $validated['utm_content'] ?? $request->query('utm_content'),
            'utm_term' => $validated['utm_term'] ?? $request->query('utm_term'),
            'fbclid' => $validated['fbclid'] ?? $request->query('fbclid'),
            'gclid' => $validated['gclid'] ?? $request->query('gclid'),
            'campaign_id' => $validated['campaign_id'] ?? $request->query('campaign_id'),
            'adset_id' => $validated['adset_id'] ?? $request->query('adset_id'),
            'ad_id' => $validated['ad_id'] ?? $request->query('ad_id'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Process 1-Click Quick Order directly from the Landing Page.
     */
    public function quickOrder(Request $request, string $slug)
    {
        $landingPage = LandingPage::with(['product'])->where('slug', $slug)->firstOrFail();

        // 1. Anti-bot honeypot check
        if (!empty($request->input('website_url_hp'))) {
            Log::warning("Bot detected on landing page quick order [{$slug}]. Request rejected.");
            return response()->json(['success' => false, 'message' => 'Spam verification triggered.'], 422);
        }

        // 2. Validate Order Information
        $allowedPaymentMethods = $landingPage->payment_methods ?: ['cod', 'bkash', 'nagad'];
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'shipping_address' => 'required|string|max:500',
            'district' => 'required|string|max:100',
            'area' => 'nullable|string|max:255',
            'payment_method' => ['required', 'string', 'in:' . implode(',', $allowedPaymentMethods)],
            'quantity' => 'nullable|integer|min:1|max:50',
            'variant' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            
            // Attribution
            'utm_source' => 'nullable|string',
            'utm_medium' => 'nullable|string',
            'utm_campaign' => 'nullable|string',
            'utm_content' => 'nullable|string',
            'utm_term' => 'nullable|string',
            'fbclid' => 'nullable|string',
            'gclid' => 'nullable|string',
            'campaign_id' => 'nullable|string',
            'adset_id' => 'nullable|string',
            'ad_id' => 'nullable|string',
            'event_id' => 'nullable|string',
        ]);

        $product = $landingPage->product;
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Primary product not found for this landing page.'], 422);
        }

        $qty = max(1, (int)($validated['quantity'] ?? 1));

        // 3. Authoritative Stock Verification
        if ($product->stock < $qty) {
            return response()->json([
                'success' => false,
                'message' => 'দুঃখিত, এই পণ্যটি পর্যাপ্ত পরিমাণে স্টকে নেই (Out of Stock).'
            ], 422);
        }

        // 4. Authoritative Pricing Resolution
        $priceInfo = PricingService::resolveProductPrice($product);
        $unitPrice = $priceInfo['final_price'];

        // Apply landing page custom discount
        if ($landingPage->custom_discount_amount > 0) {
            $unitPrice = max(1, $unitPrice - (float)$landingPage->custom_discount_amount);
        }

        $subtotal = $unitPrice * $qty;

        // Authoritative Shipping Rate
        $shippingCost = 0.00;
        if (!$landingPage->is_free_delivery) {
            $isDhaka = strtolower(trim($validated['district'])) === 'dhaka';
            if ($isDhaka) {
                $shippingCost = $landingPage->inside_dhaka_charge !== null ? (float)$landingPage->inside_dhaka_charge : 60.00;
            } else {
                $shippingCost = $landingPage->outside_dhaka_charge !== null ? (float)$landingPage->outside_dhaka_charge : 120.00;
            }
        }

        $totalPayable = $subtotal + $shippingCost;
        $pmNormalized = strtolower($validated['payment_method']);

        // Auto fallback email for guests
        $customerEmail = !empty($validated['customer_email'])
            ? $validated['customer_email']
            : (auth()->check() ? auth()->user()->email : $validated['customer_phone'] . '@customer.techlandbd.com');

        return DB::transaction(function () use (
            $landingPage, $product, $validated, $qty, $unitPrice, $subtotal, $shippingCost, $totalPayable, $pmNormalized, $customerEmail, $request
        ) {
            // Generate unique Order Number
            $orderNumber = 'TMB-' . Carbon::now()->format('Ymd') . '-' . str_pad((string)mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);

            $fullShippingAddress = $validated['shipping_address'];
            if (!empty($validated['area'])) {
                $fullShippingAddress .= ' (' . $validated['area'] . ')';
            }

            // Create Order with campaign attribution
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => auth()->id(),
                'landing_page_id' => $landingPage->id,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $customerEmail,
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $fullShippingAddress,
                'district' => $validated['district'],
                'payment_method' => $pmNormalized,
                'payment_status' => 'Pending',
                'shipping_cost' => $shippingCost,
                'subtotal' => $subtotal,
                'discount' => 0.00,
                'total' => $totalPayable,
                'status' => 'Pending',
                'source_type' => 'landing_page',
                'notes' => (!empty($validated['variant']) ? "[Variant: {$validated['variant']}] " : '') . ($validated['notes'] ?? ''),
                
                // Campaign Attribution
                'utm_source' => $validated['utm_source'] ?? $landingPage->campaign_name,
                'utm_medium' => $validated['utm_medium'] ?? 'landing_page',
                'utm_campaign' => $validated['utm_campaign'] ?? $landingPage->campaign_name,
                'utm_content' => $validated['utm_content'] ?? null,
                'utm_term' => $validated['utm_term'] ?? null,
                'fbclid' => $validated['fbclid'] ?? null,
                'gclid' => $validated['gclid'] ?? null,
                'campaign_id' => $validated['campaign_id'] ?? $landingPage->campaign_code,
                'adset_id' => $validated['adset_id'] ?? null,
                'ad_id' => $validated['ad_id'] ?? null,
            ]);

            // Save immutable Order Item snapshot
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->title . (!empty($validated['variant']) ? " ({$validated['variant']})" : ''),
                'sku_snapshot' => $product->sku,
                'image_snapshot' => $product->image,
                'specs_snapshot' => $product->key_specs,
                'price' => $unitPrice,
                'quantity' => $qty,
                'total' => $subtotal,
            ]);

            // Atomically reserve stock in inventory
            InventoryService::reserveStock($product->id, $qty, $order->id);

            // Create Order status history timeline entry
            $methodLabel = Order::formatPaymentMethodName($pmNormalized);
            OrderHistory::create([
                'order_id' => $order->id,
                'status' => 'Pending',
                'notes' => "Quick Order placed via Landing Page [{$landingPage->name}] with {$methodLabel}.",
                'created_by' => auth()->id(),
            ]);

            // Audit Trail Log
            AuditLogger::log('order.created_from_landing_page', $order, null, [
                'order_number' => $order->order_number,
                'landing_page_id' => $landingPage->id,
                'total' => $order->total,
                'payment_method' => $order->payment_method
            ]);

            // Automated Fraud Risk Analysis
            FraudDetectionService::analyzeOrder($order);

            // Dispatch transactional SMS notifications
            SmsNotificationService::sendEvent('order.placed', [], $order->customer_phone, $order->id, $order->user_id);
            SmsNotificationService::sendEvent('admin.new_order', [], null, $order->id, $order->user_id);

            // Dispatch in-app and browser notifications to Admin Notification Center
            try {
                $notifManager = app(\App\Services\Notification\NotificationManager::class);
                $notifManager->dispatch('order.created', ['order' => $order]);
                if ((float)$order->total >= 50000) {
                    $notifManager->dispatch('order.high_value', ['order' => $order]);
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Failed to dispatch landing page order notification: ' . $e->getMessage());
            }

            // Increment Landing Page performance counters
            $landingPage->increment('order_count');
            $landingPage->increment('revenue_total', $order->total);

            // Record Purchase event in Landing Page Funnel logs
            $purchaseEventId = (!empty($validated['event_id']) ? $validated['event_id'] : null) ?: ('PURCHASE_' . $order->order_number);
            $this->recordEvent($landingPage->id, 'purchase', [
                'event_id' => $purchaseEventId,
                'order_id' => $order->id,
                'value' => $order->total,
                'currency' => 'BDT',
                'utm_source' => $order->utm_source,
                'utm_medium' => $order->utm_medium,
                'utm_campaign' => $order->utm_campaign,
                'utm_content' => $order->utm_content,
                'utm_term' => $order->utm_term,
                'fbclid' => $order->fbclid,
                'gclid' => $order->gclid,
                'campaign_id' => $order->campaign_id,
                'adset_id' => $order->adset_id,
                'ad_id' => $order->ad_id,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_id' => session()->getId(),
            ]);

            session()->put('recent_order_id', $order->id);

            // Handle payment redirects or success return
            if ($pmNormalized === 'bkash') {
                return response()->json([
                    'success' => true,
                    'order_number' => $order->order_number,
                    'redirect_url' => route('payment.bkash.process', $order->order_number),
                    'event_id' => $purchaseEventId,
                    'total' => $order->total,
                ]);
            }

            if ($pmNormalized === 'nagad') {
                return response()->json([
                    'success' => true,
                    'order_number' => $order->order_number,
                    'redirect_url' => route('payment.nagad.process', $order->order_number),
                    'event_id' => $purchaseEventId,
                    'total' => $order->total,
                ]);
            }

            return response()->json([
                'success' => true,
                'order_number' => $order->order_number,
                'redirect_url' => route('checkout.invoice', $order->order_number),
                'event_id' => $purchaseEventId,
                'total' => $order->total,
                'message' => 'আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!'
            ]);
        });
    }

    /**
     * Helper to write structured landing page analytics event.
     */
    protected function recordEvent(int $landingPageId, string $eventName, array $data): void
    {
        try {
            LandingPageEvent::create([
                'landing_page_id' => $landingPageId,
                'session_id' => $data['session_id'] ?? session()->getId(),
                'event_name' => $eventName,
                'event_id' => $data['event_id'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'value' => $data['value'] ?? 0,
                'currency' => $data['currency'] ?? 'BDT',
                'utm_source' => $data['utm_source'] ?? null,
                'utm_medium' => $data['utm_medium'] ?? null,
                'utm_campaign' => $data['utm_campaign'] ?? null,
                'utm_content' => $data['utm_content'] ?? null,
                'utm_term' => $data['utm_term'] ?? null,
                'fbclid' => $data['fbclid'] ?? null,
                'gclid' => $data['gclid'] ?? null,
                'campaign_id' => $data['campaign_id'] ?? null,
                'adset_id' => $data['adset_id'] ?? null,
                'ad_id' => $data['ad_id'] ?? null,
                'ip_address' => $data['ip'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
                'created_at' => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to record landing page event [{$eventName}]: " . $e->getMessage());
        }
    }
}
