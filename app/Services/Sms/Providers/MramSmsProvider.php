<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\SmsCalculator;
use App\Services\Sms\SmsGatewayInterface;
use App\Services\Sms\SmsMessage;
use App\Services\Sms\SmsResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MramSmsProvider implements SmsGatewayInterface
{
    /**
     * Standard M-RAM Technologies API response & error status codes.
     */
    protected const STATUS_CODES = [
        '1000' => 'Invalid User or Password',
        '1002' => 'Sender Id/Masking Not Found or Not Approved',
        '1003' => 'API Key Not Found or Invalid',
        '1004' => 'SPAM Content Detected',
        '1005' => 'Internal Server Error',
        '1006' => 'Internal Gateway Error',
        '1007' => 'Insufficient Account Balance',
        '1008' => 'Message content is empty or contains invalid characters',
        '1010' => 'Invalid Credentials, Blocked Account, or Prohibited Keywords',
        '2001' => 'Invalid Mobile Number or Contacts empty',
    ];

    public function __construct(
        protected array $credentials = [],
        protected array $settings = []
    ) {}

    public function getDriverName(): string
    {
        return 'mram';
    }

    /**
     * Dispatch SMS message via M-RAM Technologies API (msg.mram.com.bd).
     */
    public function send(SmsMessage $message): SmsResponse
    {
        $apiKey = $this->credentials['api_key'] ?? '';
        $senderId = $this->credentials['sender_id'] ?? ($this->settings['sender_id'] ?? '');
        $baseUrl = $this->settings['base_url'] ?? 'https://msg.mram.com.bd/smsapi';

        if (empty($apiKey) || empty($senderId)) {
            return SmsResponse::failure('M-RAM SMS Gateway is not configured. Missing API Key or Sender ID.');
        }

        // M-RAM expects international 8801XXXXXXXXX recipient number
        $number = SmsMessage::normalizePhone($message->recipient, true);
        $type = SmsCalculator::isUnicode($message->content) ? 'unicode' : 'text';

        $payload = [
            'api_key' => $apiKey,
            'type' => $type,
            'contacts' => $number,
            'senderid' => $senderId,
            'msg' => $message->content,
            'label' => $message->isPromotional ? 'promotional' : 'transactional',
        ];

        try {
            $response = Http::withoutVerifying()
                ->asForm()
                ->timeout(10)
                ->post($baseUrl, $payload);

            $rawBody = trim($response->body());

            // Check if response is a JSON object
            $json = $response->json();
            if (is_array($json)) {
                $status = strtolower((string)($json['status'] ?? ''));
                $statusCode = (string)($json['status_code'] ?? ($json['response_code'] ?? ''));

                if ($response->successful() && ($status === 'success' || $statusCode === '100' || $statusCode === '200')) {
                    return SmsResponse::success(
                        messageId: (string)($json['message_id'] ?? ($json['id'] ?? uniqid('mram_'))),
                        rawResponse: $json
                    );
                }

                $errMsg = $json['error_message'] ?? ($json['msg'] ?? ($json['message'] ?? 'M-RAM API error.'));
                return SmsResponse::failure($errMsg, $json, $response->status());
            }

            // M-RAM plain text / status code response handling
            if (isset(self::STATUS_CODES[$rawBody])) {
                return SmsResponse::failure(
                    self::STATUS_CODES[$rawBody] . " (Code: {$rawBody})",
                    ['code' => $rawBody, 'raw' => $rawBody],
                    $response->status()
                );
            }

            // Check for success responses: "SMS SUBMITTED: ID - ...", numeric message ID, or 200 HTTP code without known errors
            if ($response->successful()) {
                if (stripos($rawBody, 'SUBMITTED') !== false || stripos($rawBody, 'SUCCESS') !== false || !preg_match('/^(100[0-9]|1010|2001)$/', $rawBody)) {
                    $messageId = $rawBody;
                    if (preg_match('/ID\s*[-:]\s*([0-9a-zA-Z]+)/i', $rawBody, $matches)) {
                        $messageId = $matches[1];
                    }

                    return SmsResponse::success(
                        messageId: (string)$messageId,
                        rawResponse: ['response' => $rawBody]
                    );
                }
            }

            return SmsResponse::failure(
                "M-RAM error response: {$rawBody}",
                ['raw' => $rawBody],
                $response->status()
            );
        } catch (\Throwable $e) {
            Log::error('M-RAM SMS Send Exception: ' . $e->getMessage(), [
                'recipient' => $number,
                'sender_id' => $senderId,
            ]);

            return SmsResponse::failure('M-RAM connection exception: ' . $e->getMessage());
        }
    }

    /**
     * Test connectivity and retrieve account balance.
     */
    public function testConnection(): array
    {
        $apiKey = $this->credentials['api_key'] ?? '';
        $senderId = $this->credentials['sender_id'] ?? ($this->settings['sender_id'] ?? '');

        if (empty($apiKey)) {
            return [
                'success' => false,
                'message' => 'API Key is missing. Please enter your M-RAM API Key in settings.',
            ];
        }

        $balance = $this->getBalance();
        if ($balance !== null) {
            return [
                'success' => true,
                'message' => "M-RAM SMS Gateway Connected Successfully! Account Balance: ৳{$balance}" . (!empty($senderId) ? " (Sender ID: {$senderId})" : ''),
                'balance' => $balance,
            ];
        }

        return [
            'success' => false,
            'message' => 'Unable to verify account with M-RAM SMS Gateway. Please verify your API Key and Sender ID.',
        ];
    }

    /**
     * Fetch current credit balance from M-RAM API.
     */
    public function getBalance(): ?float
    {
        $apiKey = $this->credentials['api_key'] ?? '';
        if (empty($apiKey)) {
            return null;
        }

        try {
            $endpoint = "https://msg.mram.com.bd/miscapi/{$apiKey}/getBalance";
            $response = Http::withoutVerifying()->timeout(6)->get($endpoint);

            if ($response->successful()) {
                $body = trim($response->body());
                // Expected format: "Your Balance is:BDT 10.07" or raw numeric float
                if (preg_match('/[0-9]+(?:\.[0-9]+)?/', $body, $matches)) {
                    return (float)$matches[0];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('M-RAM getBalance failed: ' . $e->getMessage());
        }

        return null;
    }
}
