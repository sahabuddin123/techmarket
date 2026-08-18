<?php

namespace App\Services\Email\Providers;

use App\Models\EmailGateway;
use Illuminate\Support\Facades\Http;

class BrevoEmailProvider implements EmailProviderInterface
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
                'error' => 'Brevo API key is missing.',
                'raw_response' => null,
            ];
        }

        try {
            $fromEmail = $this->gateway->from_email ?: config('mail.from.address', 'noreply@techmarketbd.com');
            $fromName = $this->gateway->from_name ?: config('mail.from.name', 'TechMarket BD');

            $payload = [
                'sender' => [
                    'email' => $fromEmail,
                    'name' => $fromName,
                ],
                'to' => [
                    ['email' => $toEmail, 'name' => $toName ?: ''],
                ],
                'subject' => $subject,
                'htmlContent' => $htmlBody,
            ];

            if ($this->gateway->reply_to_email) {
                $payload['replyTo'] = ['email' => $this->gateway->reply_to_email];
            }

            if ($plainText) {
                $payload['textContent'] = $plainText;
            }

            if (!empty($headers)) {
                $payload['headers'] = $headers;
            }

            $response = Http::withHeaders([
                'api-key' => $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message_id' => $data['messageId'] ?? ('brevo_' . uniqid()),
                    'error' => null,
                    'raw_response' => $data,
                ];
            }

            return [
                'success' => false,
                'message_id' => null,
                'error' => 'Brevo API Error: ' . $response->body(),
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
            return ['success' => false, 'message' => 'Brevo API Key is missing.'];
        }

        try {
            $res = Http::withHeaders(['api-key' => $apiKey])->get('https://api.brevo.com/v3/account');
            if ($res->successful()) {
                $account = $res->json();
                return [
                    'success' => true,
                    'message' => "Brevo account verified for " . ($account['email'] ?? 'User'),
                ];
            }
            return ['success' => false, 'message' => 'Brevo verification failed: ' . $res->body()];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Brevo connection error: ' . $e->getMessage()];
        }
    }
}
