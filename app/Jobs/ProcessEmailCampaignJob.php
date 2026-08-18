<?php

namespace App\Jobs;

use App\Models\EmailCampaign;
use App\Models\EmailCampaignRecipient;
use App\Services\Email\EmailManager;
use App\Services\Email\EmailPreferenceService;
use App\Services\Email\EmailTemplateService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessEmailCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $campaignId;
    public int $tries = 2;

    public function __construct(int $campaignId)
    {
        $this->campaignId = $campaignId;
    }

    public function handle(
        EmailManager $emailManager,
        EmailTemplateService $templateService,
        EmailPreferenceService $preferenceService
    ): void {
        $campaign = EmailCampaign::with('template')->find($this->campaignId);
        if (!$campaign || $campaign->status === 'completed') {
            return;
        }

        $template = $campaign->template;
        $recipients = EmailCampaignRecipient::where('campaign_id', $campaign->id)
            ->where('status', 'pending')
            ->take(200)
            ->get();

        $sentCount = $campaign->total_sent;
        $failedCount = $campaign->total_failed;

        foreach ($recipients as $recipient) {
            if (!$preferenceService->canReceiveEmail($recipient->email, 'marketing')) {
                $recipient->update(['status' => 'skipped']);
                continue;
            }

            $placeholders = [
                'customer_email' => $recipient->email,
                'unsubscribe_url' => $preferenceService->getUnsubscribeUrl($recipient->email, 'marketing'),
                'site_name' => config('app.name', 'TechMarket BD'),
                'site_url' => config('app.url', 'http://localhost'),
            ];

            $subject = $templateService->render($campaign->subject, $placeholders);
            $bodyHtml = $template ? $templateService->render($template->html_content, $placeholders) : "<p>{$subject}</p>";
            $fullHtml = $templateService->wrapInLayout($bodyHtml, $subject, $campaign->preheader);

            $log = $emailManager->send(
                toEmail: $recipient->email,
                subject: $subject,
                htmlBody: $fullHtml,
                eventKey: 'campaign.' . $campaign->id,
                templateId: $template?->id,
                relatedType: 'EmailCampaign',
                relatedId: $campaign->id,
                headers: ['X-Campaign-ID' => (string) $campaign->id],
                forceSync: true
            );

            if ($log && $log->status === 'sent') {
                $recipient->update([
                    'status' => 'sent',
                    'provider_message_id' => $log->provider_message_id,
                    'sent_at' => now(),
                ]);
                $sentCount++;
            } else {
                $recipient->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                ]);
                $failedCount++;
            }
        }

        $remaining = EmailCampaignRecipient::where('campaign_id', $campaign->id)->where('status', 'pending')->count();

        $campaign->update([
            'total_sent' => $sentCount,
            'total_failed' => $failedCount,
            'status' => $remaining === 0 ? 'completed' : 'sending',
            'completed_at' => $remaining === 0 ? now() : null,
        ]);

        if ($remaining > 0) {
            self::dispatch($campaign->id)->delay(now()->addSeconds(5));
        }
    }
}
