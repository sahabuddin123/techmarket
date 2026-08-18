<?php

namespace App\Services\Sms;

use App\Jobs\SendSmsJob;
use App\Models\Order;
use App\Models\Setting;
use App\Models\SmsGateway;
use App\Models\SmsLog;
use App\Models\SmsTemplate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SmsNotificationService
{
    /**
     * Dispatch an event-driven SMS notification.
     */
    public static function sendEvent(
        string $eventKey,
        array $data = [],
        ?string $recipientPhone = null,
        ?int $orderId = null,
        ?int $userId = null
    ): ?SmsLog {
        // 1. Global SMS toggle check
        if (!Setting::getBool('sms_enabled', true)) {
            Log::info("SMS sending skipped: SMS is disabled globally.");
            return null;
        }

        // 2. Fetch active template for event
        $template = SmsTemplate::where('event_key', $eventKey)->where('is_active', true)->first();
        if (!$template) {
            Log::info("SMS sending skipped: No active template for event [{$eventKey}].");
            return null;
        }

        // 3. Category toggles check
        if ($template->category === 'transactional' && !Setting::getBool('sms_transactional_enabled', true)) {
            Log::info("SMS sending skipped: Transactional SMS is disabled.");
            return null;
        }

        if ($template->category === 'promotional') {
            if (!Setting::getBool('sms_promotional_enabled', true)) {
                Log::info("SMS sending skipped: Promotional SMS is disabled.");
                return null;
            }
            if (self::isQuietHours()) {
                Log::info("SMS sending skipped: Promotional SMS quiet hours active.");
                return null;
            }
        }

        // 4. Resolve recipient phone
        $phone = $recipientPhone;
        if (empty($phone)) {
            if ($template->recipient_type === 'admin') {
                $phone = Setting::get('sms_admin_phone') ?: Setting::get('hotline_phone');
            } elseif ($orderId) {
                $order = Order::find($orderId);
                $phone = $order?->customer_phone;
                if (!$userId) $userId = $order?->user_id;
            } elseif ($userId) {
                $user = User::find($userId);
                $phone = $user?->phone;
            }
        }

        if (empty($phone) || !SmsMessage::isValidBdPhone($phone)) {
            Log::warning("SMS sending skipped: Invalid or missing recipient phone for event [{$eventKey}]. Target: " . ($phone ?: 'empty'));
            return null;
        }

        // 5. Check user promotional opt-out preference
        if ($template->category === 'promotional' && $userId) {
            $user = User::find($userId);
            if ($user && isset($user->sms_promotional_enabled) && !$user->sms_promotional_enabled) {
                Log::info("SMS sending skipped: User #{$userId} opted out of promotional SMS.");
                return null;
            }
        }

        // 6. Build global template variables
        $globalData = [
            'store_name' => Setting::get('site_name', 'TechMarket BD'),
            'store_phone' => Setting::get('hotline_phone', '09678-000000'),
            'website_url' => config('app.url', 'https://techmarket.com.bd'),
        ];

        if ($orderId && !isset($data['order_number'])) {
            $order = Order::find($orderId);
            if ($order) {
                $globalData['customer_name'] = $order->customer_name;
                $globalData['customer_phone'] = $order->customer_phone;
                $globalData['order_number'] = $order->order_number;
                $globalData['order_total'] = number_format($order->total, 2);
                $globalData['order_status'] = $order->status;
                $globalData['payment_method'] = $order->payment_method_label ?? $order->payment_method;
                $globalData['payment_status'] = $order->payment_status;
                $globalData['courier_name'] = $order->courier_provider ?: 'Standard Delivery';
                $globalData['tracking_number'] = $order->courier_tracking_code ?: 'Pending';
                $globalData['invoice_url'] = url("/invoice/{$order->order_number}");
            }
        }

        $mergedData = array_merge($globalData, $data);

        // 7. Render dynamic text
        $renderedMessage = $template->render($mergedData);

        // 8. Calculate SMS parts and encoding
        $calc = SmsCalculator::calculate($renderedMessage);

        // 9. Duplicate Prevention Window
        $idempotencyKey = "sms_{$eventKey}_" . ($orderId ? "ord_{$orderId}" : "ph_" . SmsMessage::normalizePhone($phone, false));
        $preventWindowMinutes = (int)Setting::get('sms_duplicate_window_minutes', 5);

        if ($preventWindowMinutes > 0) {
            $lockKey = "sms_lock_{$idempotencyKey}";
            if (Cache::has($lockKey)) {
                Log::info("SMS duplicate prevented for key [{$idempotencyKey}] within {$preventWindowMinutes}m window.");
                return null;
            }
            Cache::put($lockKey, true, $preventWindowMinutes * 60);
        }

        // 10. Record in SMS Log
        $defaultGateway = SmsGateway::where('is_active', true)->where('is_default', true)->first()
            ?: SmsGateway::where('is_active', true)->first();

        $log = SmsLog::create([
            'user_id' => $userId,
            'order_id' => $orderId,
            'phone' => SmsMessage::normalizePhone($phone, true),
            'message' => $renderedMessage,
            'event_key' => $eventKey,
            'gateway_slug' => $defaultGateway?->slug,
            'status' => 'queued',
            'parts' => $calc['parts'],
            'encoding' => $calc['encoding'],
            'character_count' => $calc['length'],
            'idempotency_key' => $idempotencyKey,
            'request_payload' => [
                'event_key' => $eventKey,
                'variables' => $mergedData,
            ],
        ]);

        // 11. Dispatch Queue Job or Synchronous Send
        if (Setting::getBool('sms_queue_enabled', true)) {
            SendSmsJob::dispatch($log->id, $defaultGateway?->slug);
        } else {
            // Synchronous delivery
            $manager = app(SmsManager::class);
            $job = new SendSmsJob($log->id, $defaultGateway?->slug);
            $job->handle($manager);
            $log->refresh();
        }

        return $log;
    }

    /**
     * Send direct manual or custom SMS to a single recipient.
     */
    public static function sendDirect(
        string $phone,
        string $message,
        ?string $gatewaySlug = null,
        ?int $userId = null,
        ?int $orderId = null,
        bool $isPromotional = false
    ): SmsLog {
        $calc = SmsCalculator::calculate($message);
        $normalizedPhone = SmsMessage::normalizePhone($phone, true);

        $log = SmsLog::create([
            'user_id' => $userId,
            'order_id' => $orderId,
            'phone' => $normalizedPhone,
            'message' => $message,
            'event_key' => $isPromotional ? 'manual.promotional' : 'manual.direct',
            'gateway_slug' => $gatewaySlug,
            'status' => 'queued',
            'parts' => $calc['parts'],
            'encoding' => $calc['encoding'],
            'character_count' => $calc['length'],
        ]);

        if (Setting::getBool('sms_queue_enabled', true)) {
            SendSmsJob::dispatch($log->id, $gatewaySlug);
        } else {
            $manager = app(SmsManager::class);
            $job = new SendSmsJob($log->id, $gatewaySlug);
            $job->handle($manager);
            $log->refresh();
        }

        return $log;
    }

    /**
     * Determine if current time falls within promotional SMS quiet hours (e.g. 10:00 PM - 08:00 AM).
     */
    public static function isQuietHours(): bool
    {
        $enabled = Setting::getBool('sms_quiet_hours_enabled', false);
        if (!$enabled) return false;

        $startHour = (int)Setting::get('sms_quiet_hours_start', 22); // 10 PM
        $endHour = (int)Setting::get('sms_quiet_hours_end', 8);     // 8 AM

        $currentHour = (int)Carbon::now()->format('H');

        if ($startHour > $endHour) {
            // Over midnight e.g. 22 to 8
            return $currentHour >= $startHour || $currentHour < $endHour;
        }

        return $currentHour >= $startHour && $currentHour < $endHour;
    }

    /**
     * Seed initial 23 standard SMS Templates.
     */
    public static function seedDefaultTemplates(): void
    {
        $templates = [
            // CUSTOMER EVENTS
            [
                'name' => 'Customer Registration',
                'slug' => 'customer-registration',
                'event_key' => 'customer.registered',
                'category' => 'auth',
                'recipient_type' => 'customer',
                'message' => 'Welcome to {{store_name}}, {{customer_name}}! Your account has been registered successfully. Login at {{website_url}}',
                'variables' => ['customer_name', 'store_name', 'website_url'],
            ],
            [
                'name' => 'Account Welcome',
                'slug' => 'account-welcome',
                'event_key' => 'customer.welcome',
                'category' => 'auth',
                'recipient_type' => 'customer',
                'message' => 'Dear {{customer_name}}, thank you for joining {{store_name}}! Discover the latest genuine hardware and computer gear at {{website_url}}',
                'variables' => ['customer_name', 'store_name', 'website_url'],
            ],
            [
                'name' => 'OTP Verification Code',
                'slug' => 'otp-verification',
                'event_key' => 'customer.otp',
                'category' => 'auth',
                'recipient_type' => 'customer',
                'message' => 'Your {{store_name}} verification code is {{otp_code}}. Valid for 5 minutes. Do not share this code with anyone.',
                'variables' => ['store_name', 'otp_code'],
            ],
            [
                'name' => 'Password Reset Code',
                'slug' => 'password-reset',
                'event_key' => 'customer.password_reset',
                'category' => 'auth',
                'recipient_type' => 'customer',
                'message' => 'Use OTP {{otp_code}} to reset your {{store_name}} account password. If you did not request this, please contact hotline {{store_phone}} immediately.',
                'variables' => ['store_name', 'otp_code', 'store_phone'],
            ],
            [
                'name' => 'Order Placed (Customer)',
                'slug' => 'order-placed',
                'event_key' => 'order.placed',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Dear {{customer_name}}, your order #{{order_number}} of ৳{{order_total}} at {{store_name}} has been placed successfully. Track order: {{invoice_url}}',
                'variables' => ['customer_name', 'order_number', 'order_total', 'store_name', 'invoice_url'],
            ],
            [
                'name' => 'Order Confirmed',
                'slug' => 'order-confirmed',
                'event_key' => 'order.confirmed',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Dear {{customer_name}}, your order #{{order_number}} is confirmed and being prepared for packaging. Thank you for shopping with {{store_name}}!',
                'variables' => ['customer_name', 'order_number', 'store_name'],
            ],
            [
                'name' => 'Order Processing',
                'slug' => 'order-processing',
                'event_key' => 'order.processing',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Your {{store_name}} order #{{order_number}} is now being processed and QC verified at our fulfillment center.',
                'variables' => ['store_name', 'order_number'],
            ],
            [
                'name' => 'Order Shipped / Courier Booked',
                'slug' => 'order-shipped',
                'event_key' => 'order.shipped',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Good news {{customer_name}}! Order #{{order_number}} is dispatched via {{courier_name}}. Tracking ID: {{tracking_number}}. View invoice: {{invoice_url}}',
                'variables' => ['customer_name', 'order_number', 'courier_name', 'tracking_number', 'invoice_url'],
            ],
            [
                'name' => 'Courier Handover',
                'slug' => 'courier-booked',
                'event_key' => 'courier.booked',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Consignment for order #{{order_number}} has been created with {{courier_name}} (Tracking: {{tracking_number}}). Expected arrival in 24-48 hours.',
                'variables' => ['order_number', 'courier_name', 'tracking_number'],
            ],
            [
                'name' => 'Out For Delivery',
                'slug' => 'out-for-delivery',
                'event_key' => 'order.out_for_delivery',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Your order #{{order_number}} is out for delivery today via {{courier_name}} rider. Total payable: ৳{{order_total}} (if COD).',
                'variables' => ['order_number', 'courier_name', 'order_total'],
            ],
            [
                'name' => 'Order Delivered',
                'slug' => 'order-delivered',
                'event_key' => 'order.delivered',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Dear {{customer_name}}, order #{{order_number}} has been delivered. Thank you for choosing {{store_name}}! Claim official warranty using your invoice: {{invoice_url}}',
                'variables' => ['customer_name', 'order_number', 'store_name', 'invoice_url'],
            ],
            [
                'name' => 'Order Cancelled',
                'slug' => 'order-cancelled',
                'event_key' => 'order.cancelled',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Your {{store_name}} order #{{order_number}} has been cancelled. For inquiries or re-ordering assistance, please contact hotline {{store_phone}}.',
                'variables' => ['store_name', 'order_number', 'store_phone'],
            ],
            [
                'name' => 'Payment Pending Alert',
                'slug' => 'payment-pending',
                'event_key' => 'payment.pending',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Your order #{{order_number}} is awaiting payment verification for {{payment_method}}. Complete payment or verify status: {{invoice_url}}',
                'variables' => ['order_number', 'payment_method', 'invoice_url'],
            ],
            [
                'name' => 'Payment Successful',
                'slug' => 'payment-successful',
                'event_key' => 'payment.successful',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Payment of ৳{{order_total}} for order #{{order_number}} via {{payment_method}} was received successfully. Thank you for choosing {{store_name}}!',
                'variables' => ['order_total', 'order_number', 'payment_method', 'store_name'],
            ],
            [
                'name' => 'Payment Failed',
                'slug' => 'payment-failed',
                'event_key' => 'payment.failed',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Payment attempt for order #{{order_number}} was unsuccessful. Please retry payment or contact {{store_name}} support: {{store_phone}}',
                'variables' => ['order_number', 'store_name', 'store_phone'],
            ],
            [
                'name' => 'Refund Initiated',
                'slug' => 'refund-initiated',
                'event_key' => 'refund.initiated',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Refund of ৳{{order_total}} has been initiated for order #{{order_number}}. The amount will credit to your account within 3-7 business days.',
                'variables' => ['order_total', 'order_number'],
            ],
            [
                'name' => 'Refund Completed',
                'slug' => 'refund-completed',
                'event_key' => 'refund.completed',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Refund for order #{{order_number}} has been successfully processed by {{store_name}}. Check your payment account or MFS statement.',
                'variables' => ['order_number', 'store_name'],
            ],
            [
                'name' => 'Fraud Verification Required',
                'slug' => 'fraud-review-required',
                'event_key' => 'fraud.review_required',
                'category' => 'transactional',
                'recipient_type' => 'customer',
                'message' => 'Dear {{customer_name}}, order #{{order_number}} is held for phone verification. Our team will contact you shortly at {{customer_phone}}.',
                'variables' => ['customer_name', 'order_number', 'customer_phone'],
            ],

            // ADMIN ALERTS
            [
                'name' => 'New Order Alert (Admin)',
                'slug' => 'admin-new-order',
                'event_key' => 'admin.new_order',
                'category' => 'admin_alert',
                'recipient_type' => 'admin',
                'message' => '[Admin Alert] New order #{{order_number}} placed by {{customer_name}} ({{customer_phone}}). Total: ৳{{order_total}} ({{payment_method}}).',
                'variables' => ['order_number', 'customer_name', 'customer_phone', 'order_total', 'payment_method'],
            ],
            [
                'name' => 'High Risk Fraud Alert (Admin)',
                'slug' => 'admin-fraud-alert',
                'event_key' => 'admin.fraud_alert',
                'category' => 'admin_alert',
                'recipient_type' => 'admin',
                'message' => '[HIGH RISK ALERT] Order #{{order_number}} flagged with Risk Score {{fraud_score}}%. Customer: {{customer_name}} ({{customer_phone}}). Review immediately.',
                'variables' => ['order_number', 'fraud_score', 'customer_name', 'customer_phone'],
            ],
            [
                'name' => 'Payment Received Alert (Admin)',
                'slug' => 'admin-payment-received',
                'event_key' => 'admin.payment_received',
                'category' => 'admin_alert',
                'recipient_type' => 'admin',
                'message' => '[Payment Received] ৳{{order_total}} collected via {{payment_method}} for order #{{order_number}}.',
                'variables' => ['order_total', 'payment_method', 'order_number'],
            ],
            [
                'name' => 'Courier Booking Failure Alert (Admin)',
                'slug' => 'admin-courier-failure',
                'event_key' => 'admin.courier_failure',
                'category' => 'admin_alert',
                'recipient_type' => 'admin',
                'message' => '[Courier Error] Failed to book shipment with {{courier_name}} for order #{{order_number}}: {{error_reason}}',
                'variables' => ['courier_name', 'order_number', 'error_reason'],
            ],
            [
                'name' => 'Critical SMS Gateway Failure (Admin)',
                'slug' => 'admin-sms-failure',
                'event_key' => 'admin.sms_failure',
                'category' => 'admin_alert',
                'recipient_type' => 'admin',
                'message' => '[CRITICAL SMS] SMS Gateway {{gateway_name}} failed to dispatch messages. Please inspect API credentials or balance immediately.',
                'variables' => ['gateway_name'],
            ],
        ];

        foreach ($templates as $tmpl) {
            SmsTemplate::firstOrCreate(['event_key' => $tmpl['event_key']], $tmpl);
        }
    }
}
