<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\SmsGatewayInterface;
use App\Services\Sms\SmsMessage;
use App\Services\Sms\SmsResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MimsmsProvider implements SmsGatewayInterface
{
    public function __construct(
        protected array $credentials = [],
        protected array $settings = []
    ) {}

    public function getDriverName(): string
    {
        return 'mimsms';
    }

    public function send(SmsMessage $message): SmsResponse
    {
        $username = $this->credentials['username'] ?? '';
        $apiKey = $this->credentials['api_key'] ?? '';
        $senderId = $this->credentials['sender_id'] ?? ($this->settings['sender_id'] ?? '');
        $baseUrl = $this->settings['base_url'] ?? 'https://api.mimsms.com/api/SmsSending/SMS';

        if (empty($username) || empty($apiKey) || empty($senderId)) {
            return SmsResponse::failure('MIM SMS is not configured. Missing Username, API Key, or Sender ID.');
        }

        $number = SmsMessage::normalizePhone($message->recipient, true);

        try {
            $payload = [
                'UserName' => $username,
                'Apikey' => $apiKey,
                'MobileNumber' => $number,
                'SenderId' => $senderId,
                'Message' => $message->content,
                'TransactionType' => $message->isPromotional ? 'P' : 'T',
            ];

            $response = Http::timeout(8)->post($baseUrl, $payload);
            $body = $response->json();

            // MIM SMS responses e.g. {"StatusCode": "200", "StatusName": "Successful", "TransactionId": "12345"}
            $statusName = strtolower($body['StatusName'] ?? ($body['status'] ?? ''));
            $statusCode = (string)($body['StatusCode'] ?? ($body['code'] ?? ''));

            if ($response->successful() && ($statusName === 'successful' || $statusCode === '200' || $statusCode === '0')) {
                return SmsResponse::success(
                    messageId: (string)($body['TransactionId'] ?? ($body['MessageId'] ?? uniqid('mim_'))),
                    rawResponse: $body
                );
            }

            $errMsg = $body['StatusName'] ?? ($body['ErrorMessage'] ?? ('MIM SMS Error: ' . $response->body()));
            return SmsResponse::failure($errMsg, $body, $response->status());
        } catch (\Throwable $e) {
            Log::error('MIM SMS Send Exception: ' . $e->getMessage());
            return SmsResponse::failure('Connection exception: ' . $e->getMessage());
        }
    }

    public function testConnection(): array
    {
        $username = $this->credentials['username'] ?? '';
        $apiKey = $this->credentials['api_key'] ?? '';

        if (empty($username) || empty($apiKey)) {
            return [
                'success' => false,
                'message' => 'Username and API Key are required for MIM SMS.',
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
            'message' => 'Unable to verify account with MIM SMS. Please verify your Username and API Key.',
        ];
    }

    public function getBalance(): ?float
    {
        $username = $this->credentials['username'] ?? '';
        $apiKey = $this->credentials['api_key'] ?? '';

        if (empty($username) || empty($apiKey)) {
            return null;
        }

        try {
            $response = Http::timeout(5)->get('https://api.mimsms.com/api/SmsSending/Balance', [
                'UserName' => $username,
                'Apikey' => $apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['Balance'])) {
                    return (float)$data['Balance'];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('MIM SMS getBalance failed: ' . $e->getMessage());
        }

        return null;
    }
}
