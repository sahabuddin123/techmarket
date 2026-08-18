<?php

namespace App\Services\Notification;

use App\Models\Notification;
use App\Models\NotificationLog;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Notification\Channels\InAppNotificationChannel;
use App\Services\Notification\Channels\BrowserNotificationChannel;
use App\Services\Notification\Channels\SmsNotificationChannel;
use App\Services\Notification\Channels\EmailNotificationChannel;
use Illuminate\Support\Facades\Cache;

class NotificationManager
{
    protected NotificationRuleEngine $ruleEngine;
    protected NotificationPreferenceService $prefService;
    protected InAppNotificationChannel $inAppChannel;
    protected BrowserNotificationChannel $browserChannel;
    protected SmsNotificationChannel $smsChannel;
    protected EmailNotificationChannel $emailChannel;

    public function __construct(
        ?NotificationRuleEngine $ruleEngine = null,
        ?NotificationPreferenceService $prefService = null,
        ?InAppNotificationChannel $inAppChannel = null,
        ?BrowserNotificationChannel $browserChannel = null,
        ?SmsNotificationChannel $smsChannel = null,
        ?EmailNotificationChannel $emailChannel = null
    ) {
        $this->ruleEngine = $ruleEngine ?? new NotificationRuleEngine();
        $this->prefService = $prefService ?? new NotificationPreferenceService();
        $this->inAppChannel = $inAppChannel ?? new InAppNotificationChannel();
        $this->browserChannel = $browserChannel ?? new BrowserNotificationChannel();
        $this->smsChannel = $smsChannel ?? new SmsNotificationChannel();
        $this->emailChannel = $emailChannel ?? new EmailNotificationChannel();
    }

    /**
     * Dispatch an event-based notification.
     *
     * @param string $eventKey E.g. 'order.created', 'fraud.critical_risk', 'inventory.low_stock'
     * @param array $context Context models/arrays e.g. ['order' => $order, 'product' => $product]
     * @param array $overrides Optional title, message, priority, channels overrides
     */
    public function dispatch(string $eventKey, array $context = [], array $overrides = []): array
    {
        // 1. Deduplication Protection (Prevents spamming within time window)
        $dedupeKey = $this->generateDedupeKey($eventKey, $context);
        $dedupeWindow = $overrides['dedupe_seconds'] ?? $this->getDedupeWindow($eventKey);

        if ($dedupeWindow > 0 && Cache::has($dedupeKey)) {
            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'all',
                'recipient_type' => 'system',
                'status' => 'deduplicated',
                'error_message' => "Suppressed duplicate notification within {$dedupeWindow}s window",
            ]);
            return ['status' => 'deduplicated', 'count' => 0];
        }

        if ($dedupeWindow > 0) {
            Cache::put($dedupeKey, true, now()->addSeconds($dedupeWindow));
        }

        // 2. Fetch Rule
        $rule = $this->ruleEngine->getRule($eventKey);
        $placeholders = $this->ruleEngine->buildPlaceholders($context);

        $category = $overrides['category'] ?? ($rule ? $rule->category : 'SYSTEM');
        $priority = strtoupper($overrides['priority'] ?? ($rule ? $rule->default_priority : 'NORMAL'));

        $title = $overrides['title'] ?? ($rule ? $this->ruleEngine->interpolate($rule->template_title, $placeholders) : ucfirst(str_replace('.', ' ', $eventKey)));
        $message = $overrides['message'] ?? ($rule ? $this->ruleEngine->interpolate($rule->template_message, $placeholders) : '');
        $actionUrl = $overrides['action_url'] ?? ($rule && $rule->action_url_template ? $this->ruleEngine->interpolate($rule->action_url_template, $placeholders) : ($placeholders['action_url'] ?? null));
        $actionLabel = $overrides['action_label'] ?? 'View Details';
        $icon = $overrides['icon'] ?? $this->resolveDefaultIcon($category, $priority);

        // 3. Resolve Recipients
        $recipients = isset($overrides['recipients']) 
            ? collect($overrides['recipients']) 
            : ($rule ? $this->ruleEngine->resolveRecipients($rule, $context) : User::where('role', 'admin')->get());

        // 4. Resolve Active Channels
        $channels = $overrides['channels'] ?? ($rule ? $rule->channels : ['in_app', 'browser']);

        $dispatchedNotifications = [];

        foreach ($recipients as $user) {
            if (!($user instanceof User)) {
                $user = User::find($user);
            }
            if (!$user) continue;

            $payload = [
                'type' => $eventKey,
                'category' => $category,
                'priority' => $priority,
                'title' => $title,
                'message' => $message,
                'action_url' => $actionUrl,
                'action_label' => $actionLabel,
                'icon' => $icon,
                'data' => array_merge($placeholders, ['event_key' => $eventKey]),
            ];

            // In-App Channel
            if (in_array('in_app', $channels) && $this->prefService->isChannelEnabled($user->id, $category, 'in_app', $priority)) {
                $notif = $this->inAppChannel->send($user, $payload, $eventKey);
                if ($notif) {
                    $dispatchedNotifications[] = $notif;
                }
            }

            // Browser Notification Channel
            if (in_array('browser', $channels) && $this->prefService->isChannelEnabled($user->id, $category, 'browser', $priority)) {
                $this->browserChannel->send($user, $payload, $eventKey);
            }

            // SMS Notification Channel
            if (in_array('sms', $channels) && $this->prefService->isChannelEnabled($user->id, $category, 'sms', $priority)) {
                $this->smsChannel->send($user, $payload, $eventKey);
            }

            // Email Notification Channel
            if (in_array('email', $channels) && $this->prefService->isChannelEnabled($user->id, $category, 'email', $priority)) {
                $this->emailChannel->send($user, $payload, $eventKey);
            }
        }

        // 5. Audit Logging for Critical/Urgent alerts
        if ($priority === 'CRITICAL' || $priority === 'URGENT') {
            AuditLogger::log(
                action: 'alert.dispatched',
                entity: count($dispatchedNotifications) ? $dispatchedNotifications[0] : null,
                newValues: [
                    'event_key' => $eventKey,
                    'priority' => $priority,
                    'category' => $category,
                    'recipients_count' => count($recipients),
                    'title' => $title,
                ]
            );
        }

        return [
            'status' => 'dispatched',
            'count' => count($dispatchedNotifications),
            'notifications' => $dispatchedNotifications,
        ];
    }

    /**
     * Generate unique deduplication key for event + context entity.
     */
    protected function generateDedupeKey(string $eventKey, array $context): string
    {
        $entityId = '';
        if (isset($context['order'])) $entityId = 'order_' . ($context['order']->id ?? '');
        elseif (isset($context['product'])) $entityId = 'prod_' . ($context['product']->id ?? '');
        elseif (isset($context['shipment'])) $entityId = 'ship_' . ($context['shipment']->id ?? '');
        elseif (isset($context['entity_id'])) $entityId = 'ent_' . $context['entity_id'];

        return 'notif_dedupe:' . md5($eventKey . ':' . $entityId);
    }

    /**
     * Default deduplication suppression window in seconds.
     */
    protected function getDedupeWindow(string $eventKey): int
    {
        return match ($eventKey) {
            'inventory.low_stock', 'inventory.out_of_stock' => 300, // 5 mins
            'sms.gateway_down', 'courier.booking_failed' => 180, // 3 mins
            'order.pending_too_long' => 600, // 10 mins
            default => 0, // No deduplication for unique customer/order events
        };
    }

    /**
     * Default icon per category and priority.
     */
    protected function resolveDefaultIcon(string $category, string $priority): string
    {
        if ($priority === 'CRITICAL') return 'alert-octagon';
        if ($priority === 'URGENT') return 'alert-triangle';

        return match (strtoupper($category)) {
            'ORDER' => 'shopping-bag',
            'PAYMENT' => 'credit-card',
            'COURIER' => 'truck',
            'FRAUD' => 'shield-alert',
            'INVENTORY' => 'warehouse',
            'SMS' => 'message-square',
            'CUSTOMER' => 'users',
            'SECURITY' => 'shield-check',
            'SYSTEM' => 'cpu',
            default => 'bell',
        };
    }
}
