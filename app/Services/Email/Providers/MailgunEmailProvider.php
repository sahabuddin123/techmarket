<?php

namespace App\Services\Email\Providers;

use App\Models\EmailGateway;
use Illuminate\Support\Facades\Http;

class MailgunEmailProvider implements EmailProviderInterface
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
        $domain = $config['domain'] ?? '';
        $region = $config['region'] ?? 'us'; // us or eu

        if (empty($apiKey) || empty($domain)) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => 'Mailgun API key or Domain is missing.',
                'raw_response' => null,
            ];
        }

        try {
            $endpoint = $region === 'eu' 
                ? "https://api.eu.mailgun.net/v3/{$domain}/messages" 
                : "https://api.mailgun.net/v3/{$domain}/messages";

            $fromEmail = $this->gateway->from_email ?: "noreply@{$domain}";
            $fromName = $this->gateway->from_name ?: config('mail.from.name', 'TechMarket BD');

            $postData = [
                'from' => "{$fromName} <{$fromEmail}>",
                'to' => $toName ? "{$toName} <{$toEmail}>" : $toEmail,
                'subject' => $subject,
                'html' => $htmlBody,
            ];

            if ($this->gateway->reply_to_email) {
                $postData['h:Reply-To'] = $this->gateway->reply_to_email;
            }

            if ($plainText) {
                $postData['text'] = $plainText;
            }

            $response = Http::withBasicAuth('api', $apiKey)->asForm()->post($endpoint, $postData);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message_id' => $data['id'] ?? ('mg_' . uniqid()),
                    'error' => null,
                    'raw_response' => $data,
                ];
            }

            return [
                'success' => false,
                'message_id' => null,
                'error' => 'Mailgun API error: ' . $response->body(),
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
        $domain = $config['domain'] ?? '';
        $region = $config['region'] ?? 'us';

        if (empty($apiKey) || empty($domain)) {
            return ['success' => false, 'message' => 'Mailgun API Key or Domain missing.'];
        }

        try {
            $endpoint = $region === 'eu'
                ? "https://api.eu.mailgun.net/v3/domains/{$domain}"
                : "https://api.mailgun.net/v3/domains/{$domain}";

            $res = Http::withBasicAuth('api', $apiKey)->get($endpoint);
            if ($res->successful()) {
                return ['success' => true, 'message' => "Mailgun domain {$domain} verified."];
            }
            return ['success' => false, 'message' => 'Mailgun domain verification failed: ' . $res->body()];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Mailgun connection error: ' . $e->getMessage()];
        }
    }
}
