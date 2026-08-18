<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\SmsGatewayInterface;
use App\Services\Sms\SmsMessage;
use App\Services\Sms\SmsResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BulkSmsBdProvider implements SmsGatewayInterface
{
    public function __construct(
        protected array $credentials = [],
        protected array $settings = []
    ) {}

    public function getDriverName(): string
    {
        return 'bulksmsbd';
    }

    public function send(SmsMessage $message): SmsResponse
    {
        $apiKey = $this->credentials['api_key'] ?? '';
        $senderId = $this->credentials['sender_id'] ?? ($this->settings['sender_id'] ?? '');
        $baseUrl = $this->settings['base_url'] ?? 'http://bulksmsbd.net/api/smsapi';

        if (empty($apiKey) || empty($senderId)) {
            return SmsResponse::failure('BulkSMS BD is not configured. Missing API Key or Sender ID.');
        }

        // BulkSMS BD expects comma-separated numbers or single number with 8801...
        $number = SmsMessage::normalizePhone($message->recipient, true);

        try {
            $response = Http::timeout(8)->get($baseUrl, [
                'api_key' => $apiKey,
                'type' => 'text',
                'number' => $number,
                'senderid' => $senderId,
                'message' => $message->content,
            ]);

            $body = $response->json();

            // BulkSMS BD responds with {"response_code": 202, "message_id": 12345, "success_message": "..."}
            $code = $body['response_code'] ?? null;

            if ($response->successful() && ($code == 202 || $code === '202')) {
                return SmsResponse::success(
                    messageId: (string)($body['message_id'] ?? uniqid('bsms_')),
                    rawResponse: $body
                );
            }

            $errMsg = $body['error_message'] ?? ($body['msg'] ?? ('BulkSMS BD Error: ' . $response->body()));
            return SmsResponse::failure($errMsg, $body, $response->status());
        } catch (\Throwable $e) {
            Log::error('BulkSMS BD Send Exception: ' . $e->getMessage());
            return SmsResponse::failure('Connection exception: ' . $e->getMessage());
        }
    }

    public function testConnection(): array
    {
        $apiKey = $this->credentials['api_key'] ?? '';
        if (empty($apiKey)) {
            return [
                'success' => false,
                'message' => 'API Key is missing. Please enter your BulkSMS BD API Key in settings.',
            ];
        }

        $balance = $this->getBalance();
        if ($balance !== null) {
            return [
                'success' => true,
                'message' => "Connection successful! Account balance: ৳{$balance}",
                'balance' => $balance,
            ];
        }

        return [
            'success' => false,
            'message' => 'Unable to verify account with BulkSMS BD. Please verify your API Key and Sender ID.',
        ];
    }

    public function getBalance(): ?float
    {
        $apiKey = $this->credentials['api_key'] ?? '';
        if (empty($apiKey)) {
            return null;
        }

        try {
            $response = Http::timeout(5)->get('http://bulksmsbd.net/api/getBalanceApi', [
                'api_key' => $apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['balance'])) {
                    return (float)$data['balance'];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('BulkSMS BD getBalance failed: ' . $e->getMessage());
        }

        return null;
    }
}
