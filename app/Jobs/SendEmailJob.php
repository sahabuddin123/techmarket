<?php

namespace App\Jobs;

use App\Models\EmailLog;
use App\Services\Email\EmailManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $logId;
    public string $htmlBody;
    public ?string $plainText;
    public array $headers;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(int $logId, string $htmlBody, ?string $plainText = null, array $headers = [])
    {
        $this->logId = $logId;
        $this->htmlBody = $htmlBody;
        $this->plainText = $plainText;
        $this->headers = $headers;
    }

    public function handle(EmailManager $manager): void
    {
        $log = EmailLog::find($this->logId);
        if (!$log || $log->status === 'sent') {
            return; // Idempotency protection against duplicate sending on retry
        }

        $manager->executeSend($log, $this->htmlBody, $this->plainText, $this->headers);
    }
}
