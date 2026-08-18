<?php

namespace App\Jobs;

use App\Models\EmailLog;
use App\Services\Email\EmailManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RetryFailedEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $logId;

    public function __construct(int $logId)
    {
        $this->logId = $logId;
    }

    public function handle(EmailManager $manager): void
    {
        $log = EmailLog::find($this->logId);
        if (!$log || $log->status === 'sent') {
            return;
        }

        $log->increment('attempts');
        $log->update(['status' => 'sending']);

        $template = $log->template;
        $htmlBody = $template ? $template->html_content : "<p>{$log->subject}</p>";

        $manager->executeSend($log, $htmlBody, null, $log->request_data['headers'] ?? []);
    }
}
