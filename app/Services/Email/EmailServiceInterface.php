<?php

namespace App\Services\Email;

use App\Models\EmailLog;

interface EmailServiceInterface
{
    /**
     * Send an email immediately or queue it.
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
    ): ?EmailLog;
}
