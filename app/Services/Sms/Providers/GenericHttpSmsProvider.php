<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\SmsGatewayInterface;
use App\Services\Sms\SmsMessage;
use App\Services\Sms\SmsResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenericHttpSmsProvider implements SmsGatewayInterface
{
    public function __construct(
        protected array $credentials = [],
        protected array $settings = []
    ) {}

    public function getDriverName(): string
    {
        return 'generic_http';
    }

    public function send(SmsMessage $message): SmsResponse
    {
        $apiUrl = $this->settings['api_url'] ?? '';
        $httpMethod = strtoupper($this->settings['http_method'] ?? 'POST');
        $phoneField = $this->settings['phone_field'] ?? 'to';
        $messageField = $this->settings['message_field'] ?? 'message';
        $senderId = $this->credentials['sender_id'] ?? ($this->settings['sender_id'] ?? '');
        $apiKey = $this->credentials['api_key'] ?? ($this->credentials['token'] ?? '');
        $headers = is_array($this->settings['headers'] ?? null) ? $this->settings['headers'] : [];
        $bodyTemplate = $this->settings['body_template'] ?? '';

        if (empty($apiUrl)) {
            return SmsResponse::failure('Generic HTTP Gateway is not configured. Missing API URL.');
        }

        $normalizedPhone = SmsMessage::normalizePhone($message->recipient, true);

        try {
            $client = Http::timeout(10)->withHeaders($headers);

            if ($httpMethod === 'GET') {
                $params = [
                    $phoneField => $normalizedPhone,
                    $messageField => $message->content,
                ];
                if (!empty($apiKey)) $params['api_key'] = $apiKey;
                if (!empty($senderId)) $params['sender_id'] = $senderId;

                $response = $client->get($apiUrl, $params);
            } else {
                if (!empty($bodyTemplate)) {
                    // Custom JSON body with token replacement
                    $replaced = str_replace(
                        ['{{phone}}', '{{to}}', '{{recipient}}', '{{message}}', '{{text}}', '{{api_key}}', '{{token}}', '{{sender_id}}'],
                        [$normalizedPhone, $normalizedPhone, $normalizedPhone, $message->content, $message->content, $apiKey, $apiKey, $senderId],
                        $bodyTemplate
                    );
                    $payload = json_decode($replaced, true) ?: [];
                    $response = $client->post($apiUrl, $payload);
                } else {
                    $payload = [
                        $phoneField => $normalizedPhone,
                        $messageField => $message->content,
                    ];
                    if (!empty($apiKey)) $payload['api_key'] = $apiKey;
                    if (!empty($senderId)) $payload['sender_id'] = $senderId;

                    $response = $client->post($apiUrl, $payload);
                }
            }

            if ($response->successful()) {
                return SmsResponse::success(
                    messageId: uniqid('gen_'),
                    rawResponse: $response->json() ?? $response->body()
                );
            }

            return SmsResponse::failure('Gateway responded with HTTP ' . $response->status() . ': ' . $response->body(), $response->body(), $response->status());
        } catch (\Throwable $e) {
            Log::error('Generic HTTP SMS Send Exception: ' . $e->getMessage());
            return SmsResponse::failure('Connection exception: ' . $e->getMessage());
        }
    }

    public function testConnection(): array
    {
        $apiUrl = $this->settings['api_url'] ?? '';
        if (empty($apiUrl)) {
            return [
                'success' => false,
                'message' => 'API URL is required for Generic HTTP Gateway.',
            ];
        }

        try {
            $client = Http::timeout(5);
            $response = $client->get($apiUrl);
            return [
                'success' => $response->status() < 500,
                'message' => "Endpoint reachable (HTTP {$response->status()})",
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage(),
            ];
        }
    }

    public function getBalance(): ?float
    {
        return null;
    }
}
