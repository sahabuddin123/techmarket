<?php

namespace App\Services\Email;

use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class EmailNotificationService
{
    protected EmailManager $emailManager;
    protected EmailTemplateService $templateService;
    protected EmailPreferenceService $preferenceService;

    public function __construct(
        ?EmailManager $emailManager = null,
        ?EmailTemplateService $templateService = null,
        ?EmailPreferenceService $preferenceService = null
    ) {
        $this->emailManager = $emailManager ?? new EmailManager();
        $this->templateService = $templateService ?? new EmailTemplateService();
        $this->preferenceService = $preferenceService ?? new EmailPreferenceService();
    }

    /**
     * Dispatch event-driven transactional or alert email.
     */
    public function sendEvent(
        string $eventKey,
        string $toEmail,
        array $placeholders = [],
        ?string $toName = null,
        ?string $overrideSubject = null,
        ?string $overrideHtml = null,
        ?string $relatedType = null,
        ?int $relatedId = null,
        bool $forceSync = false
    ): ?EmailLog {
        $toEmail = trim($toEmail);
        if (empty($toEmail) || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        // Check category preferences
        $category = $this->resolveCategory($eventKey);
        if (!$this->preferenceService->canReceiveEmail($toEmail, $category)) {
            return null;
        }

        // Standard dynamic placeholders
        $placeholders['site_name'] = config('app.name', 'TechMarket BD');
        $placeholders['site_url'] = config('app.url', 'http://localhost');
        $placeholders['support_email'] = 'support@techmarketbd.com';
        $placeholders['support_phone'] = '09678-000000';
        $placeholders['unsubscribe_url'] = $this->preferenceService->getUnsubscribeUrl($toEmail, $category);
        $placeholders['customer_name'] = $placeholders['customer_name'] ?? ($toName ?: 'Valued Customer');
        $placeholders['customer_email'] = $toEmail;

        // Find matching template by slug (e.g. order.created -> order-created)
        $slug = str_replace('.', '-', $eventKey);
        $template = EmailTemplate::active()->where('slug', $slug)->first();

        $subject = $overrideSubject ?? ($template ? $this->templateService->render($template->subject, $placeholders) : ucfirst(str_replace('.', ' ', $eventKey)));
        $preheader = $template ? $this->templateService->render($template->preheader ?? '', $placeholders) : null;
        
        $bodyHtml = $overrideHtml ?? ($template ? $this->templateService->render($template->html_content, $placeholders) : "<p>TechMarket BD notification: {$subject}</p>");
        $fullHtml = $this->templateService->wrapInLayout($bodyHtml, $subject, $preheader);
        $plainText = $template && $template->plain_text_content 
            ? $this->templateService->render($template->plain_text_content, $placeholders) 
            : strip_tags($bodyHtml);

        return $this->emailManager->send(
            toEmail: $toEmail,
            subject: $subject,
            htmlBody: $fullHtml,
            toName: $toName,
            plainText: $plainText,
            eventKey: $eventKey,
            templateId: $template?->id,
            relatedType: $relatedType,
            relatedId: $relatedId,
            forceSync: $forceSync
        );
    }

    /**
     * Send Customer Order Created Email.
     */
    public function sendOrderCreated(Order $order, bool $forceSync = false): ?EmailLog
    {
        return $this->sendOrderEvent($order, 'order.created', $forceSync);
    }

    /**
     * Send Customer Order Confirmed Email.
     */
    public function sendOrderConfirmed(Order $order, bool $forceSync = false): ?EmailLog
    {
        return $this->sendOrderEvent($order, 'order.confirmed', $forceSync);
    }

    /**
     * Send Customer Order Processing Email.
     */
    public function sendOrderProcessing(Order $order, bool $forceSync = false): ?EmailLog
    {
        return $this->sendOrderEvent($order, 'order.processing', $forceSync);
    }

    /**
     * Send Customer Order Delivered Email.
     */
    public function sendOrderDelivered(Order $order, bool $forceSync = false): ?EmailLog
    {
        return $this->sendOrderEvent($order, 'order.delivered', $forceSync);
    }

    /**
     * Send Customer Order Cancelled Email.
     */
    public function sendOrderCancelled(Order $order, bool $forceSync = false): ?EmailLog
    {
        return $this->sendOrderEvent($order, 'order.cancelled', $forceSync);
    }

    /**
     * Generic order status email dispatcher.
     */
    public function sendOrderEvent(Order $order, string $eventKey, bool $forceSync = false): ?EmailLog
    {
        if (empty($order->customer_email)) {
            return null;
        }

        $placeholders = [
            'customer_name' => $order->customer_name,
            'customer_email' => $order->customer_email,
            'customer_phone' => $order->customer_phone,
            'order_number' => $order->order_number,
            'order_date' => $order->created_at ? $order->created_at->format('d M, Y') : date('d M, Y'),
            'order_total' => number_format($order->total ?? 0, 2),
            'order_status' => $order->status,
            'payment_method' => $order->payment_method ?? 'Cash on Delivery',
            'delivery_address' => ($order->shipping_address ?? '') . ($order->district ? ', ' . $order->district : ''),
            'invoice_url' => url("/orders/{$order->id}/invoice"),
        ];

        return $this->sendEvent(
            eventKey: $eventKey,
            toEmail: $order->customer_email,
            placeholders: $placeholders,
            toName: $order->customer_name,
            relatedType: 'Order',
            relatedId: $order->id,
            forceSync: $forceSync
        );
    }

    /**
     * Send Courier Dispatch / Tracking Email.
     */
    public function sendCourierDispatched(Order $order, string $courierName, string $trackingNumber, bool $forceSync = false): ?EmailLog
    {
        if (empty($order->customer_email)) {
            return null;
        }

        $placeholders = [
            'customer_name' => $order->customer_name,
            'order_number' => $order->order_number,
            'order_total' => number_format($order->total ?? 0, 2),
            'courier_name' => $courierName,
            'tracking_number' => $trackingNumber,
            'tracking_url' => url("/track/{$trackingNumber}"),
        ];

        return $this->sendEvent(
            eventKey: 'courier.booked',
            toEmail: $order->customer_email,
            placeholders: $placeholders,
            toName: $order->customer_name,
            relatedType: 'Order',
            relatedId: $order->id,
            forceSync: $forceSync
        );
    }

    /**
     * Send Admin Critical Fraud Alert Email.
     */
    public function sendFraudAlert(User $admin, Order $order, int $riskScore, array $signals = [], bool $forceSync = false): ?EmailLog
    {
        $placeholders = [
            'admin_name' => $admin->name,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'order_total' => number_format($order->total ?? 0, 2),
            'fraud_score' => $riskScore,
            'fraud_signals' => !empty($signals) ? implode(', ', $signals) : 'Automated high risk indicator',
            'action_url' => url('/admin/customers/fraud-reviews'),
        ];

        return $this->sendEvent(
            eventKey: 'fraud.critical_risk',
            toEmail: $admin->email,
            placeholders: $placeholders,
            toName: $admin->name,
            relatedType: 'Order',
            relatedId: $order->id,
            forceSync: $forceSync
        );
    }

    /**
     * Send Admin Inventory Low Stock / Out of Stock Email.
     */
    public function sendInventoryAlert(User $admin, Product $product, string $eventKey = 'inventory.low_stock', bool $forceSync = false): ?EmailLog
    {
        $placeholders = [
            'admin_name' => $admin->name,
            'product_name' => $product->title ?? 'Product',
            'product_sku' => $product->sku ?? 'N/A',
            'stock_quantity' => $product->stock ?? 0,
            'product_url' => url("/admin/products/{$product->id}/edit"),
        ];

        return $this->sendEvent(
            eventKey: $eventKey,
            toEmail: $admin->email,
            placeholders: $placeholders,
            toName: $admin->name,
            relatedType: 'Product',
            relatedId: $product->id,
            forceSync: $forceSync
        );
    }

    /**
     * Resolve preference category string from event key.
     */
    public function resolveCategory(string $eventKey): string
    {
        $prefix = explode('.', $eventKey)[0] ?? 'system';
        return match ($prefix) {
            'order', 'payment' => 'order_updates',
            'courier' => 'order_updates',
            'fraud', 'security' => 'security_alerts',
            'inventory' => 'transactional',
            'sms', 'system' => 'security_alerts',
            'promo', 'marketing', 'welcome', 'campaign' => 'marketing',
            'product' => 'product_updates',
            default => 'transactional',
        };
    }
}
