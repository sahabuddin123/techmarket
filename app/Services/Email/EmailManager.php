<?php

namespace App\Services\Email;

use App\Models\EmailGateway;
use App\Models\EmailLog;
use App\Services\AuditLogger;
use App\Services\Email\Providers\EmailProviderInterface;
use App\Services\Email\Providers\SmtpEmailProvider;
use App\Services\Email\Providers\SendGridEmailProvider;
use App\Services\Email\Providers\MailgunEmailProvider;
use App\Services\Email\Providers\AmazonSesEmailProvider;
use App\Services\Email\Providers\BrevoEmailProvider;
use App\Services\Email\Providers\GenericSmtpProvider;
use Illuminate\Support\Facades\Cache;

class EmailManager implements EmailServiceInterface
{
    protected EmailTemplateService $templateService;
    protected EmailPreferenceService $preferenceService;

    public function __construct(
        ?EmailTemplateService $templateService = null,
        ?EmailPreferenceService $preferenceService = null
    ) {
        $this->templateService = $templateService ?? new EmailTemplateService();
        $this->preferenceService = $preferenceService ?? new EmailPreferenceService();
    }

    /**
     * Resolve Provider instance for a gateway model.
     */
    public function resolveProvider(EmailGateway $gateway): EmailProviderInterface
    {
        $driver = strtolower($gateway->driver);

        $provider = match ($driver) {
            'sendgrid' => new SendGridEmailProvider(),
            'mailgun' => new MailgunEmailProvider(),
            'ses', 'amazonses' => new AmazonSesEmailProvider(),
            'brevo', 'sendinblue' => new BrevoEmailProvider(),
            'generic_smtp' => new GenericSmtpProvider(),
            default => new SmtpEmailProvider(),
        };

        return $provider->setGateway($gateway);
    }

    /**
     * Get the active primary gateway.
     */
    public function getDefaultGateway(): ?EmailGateway
    {
        return EmailGateway::active()->where('is_default', true)->first()
            ?? EmailGateway::active()->first();
    }

    /**
     * Get active fallback gateway.
     */
    public function getFallbackGateway(): ?EmailGateway
    {
        return EmailGateway::active()->where('is_fallback', true)->first();
    }

    /**
     * Send email directly or queue it.
     */
    public function send(
        string $toEmail,
        string $subject,
        string $htmlBody,
        ?string $toName = null,
        ?string $plainText = null,
        ?string $eventKey = null,
        ?int $templateId = null,
        ?string $relatedType = null,
        ?int $relatedId = null,
        array $headers = [],
        bool $forceSync = false
    ): ?EmailLog {
        $toEmail = trim($toEmail);
        if (empty($toEmail) || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        // Check deduplication (e.g. within 60s for exact event + recipient)
        $dedupeKey = 'email_dedupe:' . md5($toEmail . ':' . $eventKey . ':' . $relatedType . ':' . $relatedId);
        if (Cache::has($dedupeKey)) {
            return null; // Suppress duplicate
        }
        Cache::put($dedupeKey, true, now()->addSeconds(60));

        // Create queued log record
        $log = EmailLog::create([
            'recipient_email' => $toEmail,
            'recipient_name' => $toName,
            'subject' => $subject,
            'event_key' => $eventKey,
            'template_id' => $templateId,
            'related_type' => $relatedType,
            'related_id' => $relatedId,
            'status' => 'sending',
            'attempts' => 1,
            'request_data' => [
                'headers' => $headers,
                'html_length' => strlen($htmlBody),
            ],
            'queued_at' => now(),
        ]);

        if ($forceSync) {
            return $this->executeSend($log, $htmlBody, $plainText, $headers);
        }

        // Asynchronous queue dispatch
        \App\Jobs\SendEmailJob::dispatch($log->id, $htmlBody, $plainText, $headers);

        return $log;
    }

    /**
     * Execute sending with primary and fallback failover.
     */
    public function executeSend(EmailLog $log, string $htmlBody, ?string $plainText = null, array $headers = []): EmailLog
    {
        $gateway = $this->getDefaultGateway();

        if (!$gateway) {
            $log->update([
                'status' => 'failed',
                'error_message' => 'No active Email Gateway configured in system.',
                'failed_at' => now(),
            ]);
            return $log;
        }

        $log->update(['gateway_id' => $gateway->id]);
        $provider = $this->resolveProvider($gateway);

        $result = $provider->send(
            toEmail: $log->recipient_email,
            toName: $log->recipient_name,
            subject: $log->subject,
            htmlBody: $htmlBody,
            plainText: $plainText,
            headers: $headers
        );

        if ($result['success']) {
            $log->update([
                'status' => 'sent',
                'provider_message_id' => $result['message_id'],
                'response_data' => $result['raw_response'],
                'sent_at' => now(),
            ]);
            return $log;
        }

        // Primary failed — Check if Fallback Gateway exists
        $fallback = $this->getFallbackGateway();
        if ($fallback && $fallback->id !== $gateway->id) {
            $fallbackProvider = $this->resolveProvider($fallback);
            $fallbackResult = $fallbackProvider->send(
                toEmail: $log->recipient_email,
                toName: $log->recipient_name,
                subject: $log->subject,
                htmlBody: $htmlBody,
                plainText: $plainText,
                headers: array_merge($headers, ['X-Fallback-Gateway' => 'true'])
            );

            if ($fallbackResult['success']) {
                $log->update([
                    'gateway_id' => $fallback->id,
                    'status' => 'sent',
                    'provider_message_id' => $fallbackResult['message_id'],
                    'response_data' => array_merge(
                        ['primary_error' => $result['error']],
                        $fallbackResult['raw_response'] ?? []
                    ),
                    'sent_at' => now(),
                ]);
                return $log;
            }
        }

        // Mark as failed
        $log->update([
            'status' => 'failed',
            'error_message' => $result['error'] ?? 'Email transmission failed.',
            'response_data' => $result['raw_response'] ?? null,
            'failed_at' => now(),
        ]);

        return $log;
    }
}
