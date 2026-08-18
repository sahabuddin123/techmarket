<?php

namespace App\Services\Email\Providers;

use App\Models\EmailGateway;

interface EmailProviderInterface
{
    public function setGateway(EmailGateway $gateway): self;

    /**
     * Send email through provider.
     *
     * @return array ['success' => bool, 'message_id' => ?string, 'error' => ?string, 'raw_response' => ?array]
     */
    public function send(
        string $toEmail,
        ?string $toName,
        string $subject,
        string $htmlBody,
        ?string $plainText = null,
        array $headers = []
    ): array;

    /**
     * Test provider connectivity & credentials.
     *
     * @return array ['success' => bool, 'message' => string]
     */
    public function testConnection(): array;
}
