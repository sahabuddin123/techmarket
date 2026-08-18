<?php

namespace App\Services\Notification\Channels;

use App\Models\Notification;
use App\Models\NotificationLog;
use App\Models\User;
use Illuminate\Support\Str;

class InAppNotificationChannel
{
    /**
     * Send in-app notification to a user.
     */
    public function send(User $user, array $payload, string $eventKey): ?Notification
    {
        try {
            $notification = Notification::create([
                'id' => (string) Str::uuid(),
                'type' => $payload['type'] ?? $eventKey,
                'notifiable_type' => User::class,
                'notifiable_id' => $user->id,
                'user_id' => $user->id,
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'category' => $payload['category'] ?? 'SYSTEM',
                'priority' => $payload['priority'] ?? 'NORMAL',
                'title' => $payload['title'] ?? 'Notification',
                'message' => $payload['message'] ?? '',
                'icon' => $payload['icon'] ?? 'bell',
                'image' => $payload['image'] ?? null,
                'action_url' => $payload['action_url'] ?? null,
                'action_label' => $payload['action_label'] ?? 'View Details',
                'data' => $payload['data'] ?? [],
            ]);

            NotificationLog::create([
                'notification_id' => $notification->id,
                'event_key' => $eventKey,
                'channel' => 'in_app',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return $notification;
        } catch (\Throwable $e) {
            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'in_app',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
