<?php

namespace App\Jobs;

use App\Models\SmsGateway;
use App\Models\SmsLog;
use App\Services\Sms\SmsCalculator;
use App\Services\Sms\SmsManager;
use App\Services\Sms\SmsMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSmsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 15;

    public function __construct(
        public int $smsLogId,
        public ?string $gatewaySlug = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(SmsManager $smsManager): void
    {
        $log = SmsLog::find($this->smsLogId);
        if (!$log) {
            return;
        }

        // If already sent or delivered, skip
        if (in_array($log->status, ['sent', 'delivered'])) {
            return;
        }

        $log->update([
            'status' => 'processing',
            'retry_count' => $this->attempts(),
        ]);

        $message = new SmsMessage(
            recipient: $log->phone,
            content: $log->message,
            eventKey: $log->event_key,
            orderId: $log->order_id,
            userId: $log->user_id,
            idempotencyKey: $log->idempotency_key
        );

        $driver = $smsManager->driver($this->gatewaySlug ?: $log->gateway_slug);
        $response = $driver->send($message);

        if ($response->success) {
            $log->update([
                'status' => 'sent',
                'gateway_slug' => $this->gatewaySlug ?: $driver->getDriverName(),
                'provider_message_id' => $response->messageId,
                'response_payload' => is_array($response->rawResponse) ? $response->rawResponse : ['raw' => (string)$response->rawResponse],
                'error_message' => null,
                'sent_at' => now(),
            ]);
        } else {
            $log->update([
                'status' => 'failed',
                'gateway_slug' => $this->gatewaySlug ?: $driver->getDriverName(),
                'response_payload' => is_array($response->rawResponse) ? $response->rawResponse : ['raw' => (string)$response->rawResponse],
                'error_message' => $response->errorMessage,
            ]);

            Log::warning("SendSmsJob failed for Log #{$log->id}: " . $response->errorMessage);
        }
    }
}
