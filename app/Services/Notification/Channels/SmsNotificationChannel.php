<?php

namespace App\Services\Notification\Channels;

use App\Models\NotificationLog;
use App\Models\User;
use App\Services\Sms\SmsNotificationService;

class SmsNotificationChannel
{
    protected SmsNotificationService $smsService;

    public function __construct(?SmsNotificationService $smsService = null)
    {
        $this->smsService = $smsService ?? app(SmsNotificationService::class);
    }

    /**
     * Dispatch SMS alert to user's phone via central SmsNotificationService.
     */
    public function send(User $user, array $payload, string $eventKey): bool
    {
        if (empty($user->phone)) {
            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'sms',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => 'skipped',
                'error_message' => 'User has no phone number configured for SMS delivery',
            ]);
            return false;
        }

        try {
            $message = ($payload['title'] ? $payload['title'] . ": " : "") . ($payload['message'] ?? '');
            
            $log = $this->smsService->sendEvent(
                eventKey: $eventKey,
                phone: $user->phone,
                placeholders: $payload['data'] ?? [],
                overrideMessage: $message
            );

            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'sms',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => $log && $log->status === 'sent' ? 'sent' : 'failed',
                'provider_response' => $log ? ['sms_log_id' => $log->id, 'gateway' => $log->gateway] : null,
                'sent_at' => now(),
            ]);

            return true;
        } catch (\Throwable $e) {
            NotificationLog::create([
                'event_key' => $eventKey,
                'channel' => 'sms',
                'recipient_type' => 'user',
                'recipient_id' => $user->id,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
