<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\SmsGatewayInterface;
use App\Services\Sms\SmsMessage;
use App\Services\Sms\SmsResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GreenWebProvider implements SmsGatewayInterface
{
    public function __construct(
        protected array $credentials = [],
        protected array $settings = []
    ) {}

    public function getDriverName(): string
    {
        return 'greenweb';
    }

    public function send(SmsMessage $message): SmsResponse
    {
        $token = $this->credentials['token'] ?? ($this->credentials['api_key'] ?? '');
        $baseUrl = $this->settings['base_url'] ?? 'http://api.greenweb.com.bd/api.php';

        if (empty($token)) {
            return SmsResponse::failure('Greenweb SMS is not configured. Missing API Token.');
        }

        $number = SmsMessage::normalizePhone($message->recipient, true);

        try {
            $params = [
                'token' => $token,
                'to' => $number,
                'message' => $message->content,
            ];

            $response = Http::timeout(8)->get($baseUrl, $params);
            $body = $response->body();

            // Greenweb returns "Ok: 1 SMS Sent Successfully" or error string or JSON
            if ($response->successful() && (str_contains(strtolower($body), 'ok') || str_contains(strtolower($body), 'success') || str_contains(strtolower($body), 'sent'))) {
                return SmsResponse::success(
                    messageId: uniqid('gw_'),
                    rawResponse: $body
                );
            }

            return SmsResponse::failure($body ?: 'Greenweb SMS send failed', $body, $response->status());
        } catch (\Throwable $e) {
            Log::error('Greenweb SMS Send Exception: ' . $e->getMessage());
            return SmsResponse::failure('Connection exception: ' . $e->getMessage());
        }
    }

    public function testConnection(): array
    {
        $token = $this->credentials['token'] ?? ($this->credentials['api_key'] ?? '');
        if (empty($token)) {
            return [
                'success' => false,
                'message' => 'API Token is required for Greenweb SMS.',
            ];
        }

        $balance = $this->getBalance();
        if ($balance !== null) {
            return [
                'success' => true,
                'message' => "Connection successful! Remaining SMS Balance: {$balance} SMS",
                'balance' => $balance,
            ];
        }

        return [
            'success' => false,
            'message' => 'Unable to verify account with Greenweb SMS. Please verify your API Token.',
        ];
    }

    public function getBalance(): ?float
    {
        $token = $this->credentials['token'] ?? ($this->credentials['api_key'] ?? '');
        if (empty($token)) {
            return null;
        }

        try {
            $response = Http::timeout(5)->get('http://api.greenweb.com.bd/g_api.php', [
                'token' => $token,
                'balance' => 'true',
            ]);

            if ($response->successful()) {
                $body = trim($response->body());
                if (is_numeric($body)) {
                    return (float)$body;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Greenweb SMS getBalance failed: ' . $e->getMessage());
        }

        return null;
    }
}
