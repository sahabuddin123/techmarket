<?php

namespace App\Services\Notification;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class NotificationPreferenceService
{
    /**
     * Check if a specific channel is enabled for a user and category/event.
     */
    public function isChannelEnabled(int $userId, string $category, string $channel, string $priority = 'NORMAL'): bool
    {
        // Critical alerts always bypass preferences for in-app unless explicitly disabled system-wide
        if ($priority === 'CRITICAL' && $channel === 'in_app') {
            return true;
        }

        $preference = NotificationPreference::where('user_id', $userId)
            ->where(function ($q) use ($category) {
                $q->where('notification_type', $category)
                  ->orWhere('notification_type', 'GLOBAL');
            })
            ->first();

        if (!$preference) {
            // Defaults: In-app & browser enabled, SMS & Email enabled for critical/order alerts
            return match ($channel) {
                'in_app' => true,
                'browser' => true,
                'sms' => ($priority === 'CRITICAL' || $priority === 'URGENT'),
                'email' => ($priority === 'CRITICAL' || $priority === 'URGENT' || in_array($category, ['ORDER', 'FRAUD', 'SECURITY', 'SYSTEM'])),
                default => false,
            };
        }

        return match ($channel) {
            'in_app' => $preference->in_app_enabled,
            'browser' => $preference->browser_enabled,
            'sms' => $preference->sms_enabled,
            'email' => $preference->email_enabled,
            default => false,
        };
    }

    /**
     * Get all preferences matrix for a user.
     */
    public function getUserPreferences(int $userId): array
    {
        $categories = [
            'ORDER' => 'Customer Orders & Payments',
            'COURIER' => 'Shipments & Dispatch',
            'FRAUD' => 'Anti-Fraud & Risk Alerts',
            'INVENTORY' => 'Stock Levels & Warehouse',
            'SMS' => 'SMS Gateway & Balance',
            'SYSTEM' => 'System Health & Jobs',
            'CUSTOMER' => 'Customer & Support Inquiries',
            'SECURITY' => 'Security & Auth Alerts',
            'MARKETING' => 'Promotions & Campaigns'
        ];

        $savedPrefs = NotificationPreference::where('user_id', $userId)->get()->keyBy('notification_type');

        $result = [];
        foreach ($categories as $catKey => $catLabel) {
            $pref = $savedPrefs->get($catKey);
            $result[$catKey] = [
                'category' => $catKey,
                'label' => $catLabel,
                'in_app_enabled' => $pref ? $pref->in_app_enabled : true,
                'browser_enabled' => $pref ? $pref->browser_enabled : true,
                'sms_enabled' => $pref ? $pref->sms_enabled : ($catKey === 'FRAUD' || $catKey === 'SYSTEM'),
                'email_enabled' => $pref ? $pref->email_enabled : false,
            ];
        }

        return $result;
    }

    /**
     * Save user preferences matrix.
     */
    public function saveUserPreferences(int $userId, array $preferences): void
    {
        foreach ($preferences as $category => $channels) {
            NotificationPreference::updateOrCreate(
                [
                    'user_id' => $userId,
                    'notification_type' => strtoupper($category),
                ],
                [
                    'in_app_enabled' => (bool) ($channels['in_app_enabled'] ?? true),
                    'browser_enabled' => (bool) ($channels['browser_enabled'] ?? true),
                    'sms_enabled' => (bool) ($channels['sms_enabled'] ?? false),
                    'email_enabled' => (bool) ($channels['email_enabled'] ?? false),
                ]
            );
        }
    }
}
