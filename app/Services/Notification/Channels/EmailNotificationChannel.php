<?php

namespace App\Services\Notification\Channels;

use App\Models\NotificationLog;
use App\Models\User;
use App\Services\Email\EmailNotificationService;

class EmailNotificationChannel
{
    protected EmailNotificationService $emailNotificationService;

    public function __construct(?EmailNotificationService $emailNotificationService = null)
    {
        $this->emailNotificationService = $emailNotificationService ?? app(EmailNotificationService::class);
    }

    /**
     * Dispatch email notification to recipient user.
     */
    public function send(User $user, array $payload, string $eventKey): bool
    {
        if (empty($user->email)) {
            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'email',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => 'skipped',
                'error_message' => 'User has no email address configured',
            ]);
            return false;
        }

        try {
            $log = $this->emailNotificationService->sendEvent(
                eventKey: $eventKey,
                toEmail: $user->email,
                placeholders: $payload['data'] ?? [],
                toName: $user->name,
                overrideSubject: $payload['title'] ?? null,
                overrideHtml: $payload['message'] ?? null,
                relatedType: 'User',
                relatedId: $user->id,
                forceSync: false
            );

            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'email',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => $log ? 'sent' : 'failed',
                'provider_response' => $log ? ['email_log_id' => $log->id] : null,
                'sent_at' => now(),
            ]);

            return (bool) $log;
        } catch (\Throwable $e) {
            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'email',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
