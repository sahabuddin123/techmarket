<?php

namespace App\Services\Notification\Channels;

use App\Models\NotificationLog;
use App\Models\User;

class BrowserNotificationChannel
{
    /**
     * Prepare browser push / desktop notification payload.
     */
    public function send(User $user, array $payload, string $eventKey): bool
    {
        try {
            // Logs browser notification readiness for frontend consumption
            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'browser',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => 'sent',
                'provider_response' => [
                    'title' => $payload['title'] ?? '',
                    'body' => $payload['message'] ?? '',
                    'icon' => $payload['icon'] ?? '/favicon.ico',
                    'tag' => $eventKey,
                    'action_url' => $payload['action_url'] ?? '',
                ],
                'sent_at' => now(),
            ]);

            return true;
        } catch (\Throwable $e) {
            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'browser',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
