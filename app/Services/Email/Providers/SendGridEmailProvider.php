<?php

namespace App\Services\Email\Providers;

use App\Models\EmailGateway;
use Illuminate\Support\Facades\Http;

class SendGridEmailProvider implements EmailProviderInterface
{
    protected EmailGateway $gateway;

    public function setGateway(EmailGateway $gateway): self
    {
        $this->gateway = $gateway;
        return $this;
    }

    public function send(
        string $toEmail,
        ?string $toName,
        string $subject,
        string $htmlBody,
        ?string $plainText = null,
        array $headers = []
    ): array {
        $config = $this->gateway->config ?? [];
        $apiKey = $config['api_key'] ?? '';

        if (empty($apiKey)) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => 'SendGrid API key is missing.',
                'raw_response' => null,
            ];
        }

        try {
            $fromEmail = $this->gateway->from_email ?: config('mail.from.address', 'noreply@techmarketbd.com');
            $fromName = $this->gateway->from_name ?: config('mail.from.name', 'TechMarket BD');

            $payload = [
                'personalizations' => [
                    [
                        'to' => [
                            ['email' => $toEmail, 'name' => $toName ?: ''],
                        ],
                        'subject' => $subject,
                    ],
                ],
                'from' => [
                    'email' => $fromEmail,
                    'name' => $fromName,
                ],
                'content' => [
                    [
                        'type' => 'text/html',
                        'value' => $htmlBody,
                    ],
                ],
            ];

            if ($this->gateway->reply_to_email) {
                $payload['reply_to'] = ['email' => $this->gateway->reply_to_email];
            }

            if ($plainText) {
                $payload['content'][] = [
                    'type' => 'text/plain',
                    'value' => $plainText,
                ];
            }

            $response = Http::withToken($apiKey)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post('https://api.sendgrid.com/v3/mail/send', $payload);

            if ($response->status() >= 200 && $response->status() < 300) {
                $messageId = $response->header('X-Message-Id') ?? ('sg_' . uniqid());
                return [
                    'success' => true,
                    'message_id' => $messageId,
                    'error' => null,
                    'raw_response' => ['status' => $response->status(), 'headers' => $response->headers()],
                ];
            }

            return [
                'success' => false,
                'message_id' => null,
                'error' => 'SendGrid API Error: ' . $response->body(),
                'raw_response' => $response->json() ?? ['body' => $response->body()],
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => $e->getMessage(),
                'raw_response' => ['exception' => get_class($e)],
            ];
        }
    }

    public function testConnection(): array
    {
        $config = $this->gateway->config ?? [];
        $apiKey = $config['api_key'] ?? '';

        if (empty($apiKey)) {
            return ['success' => false, 'message' => 'SendGrid API Key is missing.'];
        }

        try {
            $res = Http::withToken($apiKey)->get('https://api.sendgrid.com/v3/scopes');
            if ($res->successful()) {
                return ['success' => true, 'message' => 'SendGrid API key verified successfully.'];
            }
            return ['success' => false, 'message' => 'SendGrid verification failed: ' . $res->body()];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'SendGrid connection error: ' . $e->getMessage()];
        }
    }
}
