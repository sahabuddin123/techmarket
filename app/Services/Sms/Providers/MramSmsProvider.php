<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\SmsCalculator;
use App\Services\Sms\SmsGatewayInterface;
use App\Services\Sms\SmsMessage;
use App\Services\Sms\SmsResponse;
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
            $result = $this->sendHttpRequest('POST', $baseUrl, $payload);
            $rawBody = trim($result['body']);
            $httpCode = $result['status'];

            // Check if response is a JSON object
            $json = json_decode($rawBody, true);
            if (is_array($json)) {
                $status = strtolower((string)($json['status'] ?? ''));
                $statusCode = (string)($json['status_code'] ?? ($json['response_code'] ?? ''));

                if ($result['ok'] && ($status === 'success' || $statusCode === '100' || $statusCode === '200')) {
                    return SmsResponse::success(
                        messageId: (string)($json['message_id'] ?? ($json['id'] ?? uniqid('mram_'))),
                        rawResponse: $json
                    );
                }

                $errMsg = $json['error_message'] ?? ($json['msg'] ?? ($json['message'] ?? 'M-RAM API error.'));
                return SmsResponse::failure($errMsg, $json, $httpCode);
            }

            // M-RAM plain text / status code response handling
            if (isset(self::STATUS_CODES[$rawBody])) {
                return SmsResponse::failure(
                    self::STATUS_CODES[$rawBody] . " (Code: {$rawBody})",
                    ['code' => $rawBody, 'raw' => $rawBody],
                    $httpCode
                );
            }

            // Check for success responses: "SMS SUBMITTED: ID - ...", numeric message ID, or 200 HTTP code without known errors
            if ($result['ok']) {
                if (stripos($rawBody, 'SUBMITTED') !== false || stripos($rawBody, 'SUCCESS') !== false || !preg_match('/^(100[0-9]|1010|2001)$/', $rawBody)) {
                    $messageId = $rawBody;
                    if (preg_match('/ID\s*[-:]\s*([0-9a-zA-Z_\.\-]+)/i', $rawBody, $matches)) {
                        $messageId = trim($matches[1]);
                    }

                    return SmsResponse::success(
                        messageId: (string)$messageId,
                        rawResponse: ['response' => $rawBody, 'transport' => $result['method']]
                    );
                }
            }

            return SmsResponse::failure(
                "M-RAM error response: " . ($rawBody ?: "HTTP {$httpCode} - Connection failed"),
                ['raw' => $rawBody],
                $httpCode
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

        try {
            $balance = $this->getBalance();
            if ($balance !== null) {
                return [
                    'success' => true,
                    'message' => "M-RAM SMS Gateway Connected Successfully! Account Balance: ৳{$balance}" . (!empty($senderId) ? " (Sender ID: {$senderId})" : ''),
                    'balance' => $balance,
                ];
            }

            // Fallback check via getPrice endpoint if getBalance format differed
            $priceRes = $this->sendHttpRequest('GET', "https://msg.mram.com.bd/miscapi/{$apiKey}/getPrice");

            if ($priceRes['ok']) {
                $decoded = json_decode($priceRes['body'], true);
                if (is_array($decoded) && !empty($decoded)) {
                    return [
                        'success' => true,
                        'message' => "M-RAM SMS Gateway Connected Successfully! (Sender ID: {$senderId})",
                    ];
                }
            }

            $raw = trim($priceRes['body']);
            return [
                'success' => false,
                'message' => 'Unable to verify account with M-RAM SMS Gateway. Response: ' . ($raw ?: 'Connection timeout / No response from msg.mram.com.bd'),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'M-RAM connection error: ' . $e->getMessage(),
            ];
        }
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
            $res = $this->sendHttpRequest('GET', $endpoint);

            if ($res['ok']) {
                $body = trim($res['body']);
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

    /**
     * Resilient HTTP Request Executor with OpenSSL 3 TLS renegotiation protection.
     * Automatically falls back to PHP native SSL stream if cURL drops the connection.
     */
    protected function sendHttpRequest(string $method, string $url, array $payload = []): array
    {
        $isPost = strtoupper($method) === 'POST';
        $content = $isPost ? http_build_query($payload) : '';
        $headers = [
            "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept: */*",
        ];

        if ($isPost) {
            $headers[] = "Content-Type: application/x-www-form-urlencoded";
            $headers[] = "Content-Length: " . strlen($content);
        } else {
            if (!empty($payload)) {
                $url .= (str_contains($url, '?') ? '&' : '?') . http_build_query($payload);
            }
        }

        // 1. Primary: Native PHP cURL with IPv4 & OpenSSL compatibility options
        if (function_exists('curl_init')) {
            $ch = curl_init();
            $opts = [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_SSLVERSION => CURL_SSLVERSION_TLSv1_2,
                CURLOPT_TCP_NODELAY => 1,
                CURLOPT_TIMEOUT => 8,
                CURLOPT_CONNECTTIMEOUT => 4,
                CURLOPT_HTTPHEADER => $headers,
            ];

            if (defined('CURLOPT_SSL_CIPHER_LIST')) {
                $opts[CURLOPT_SSL_CIPHER_LIST] = 'DEFAULT@SECLEVEL=1';
            }

            if ($isPost) {
                $opts[CURLOPT_POST] = true;
                $opts[CURLOPT_POSTFIELDS] = $content;
            }

            curl_setopt_array($ch, $opts);
            $body = curl_exec($ch);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlErrNo = curl_errno($ch);
            curl_close($ch);

            // If cURL succeeded and didn't fail with OpenSSL error 56
            if ($curlErrNo === 0 && !empty($body)) {
                return [
                    'ok' => $httpCode >= 200 && $httpCode < 300,
                    'status' => $httpCode,
                    'body' => $body,
                    'method' => 'curl',
                ];
            }
        }

        // 2. Secondary: PHP Native SSL Stream (Immune to OpenSSL 3 TLS renegotiation drop)
        $ctx = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
                'crypto_method' => STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT,
            ],
            'http' => [
                'method' => strtoupper($method),
                'header' => implode("\r\n", $headers),
                'content' => $isPost ? $content : null,
                'timeout' => 8,
                'ignore_errors' => true,
            ],
        ]);

        $body = @file_get_contents($url, false, $ctx);
        $httpCode = 200;

        if (isset($http_response_header)) {
            foreach ($http_response_header as $line) {
                if (preg_match('/^HTTP\/[0-9\.]+\s+([0-9]+)/', $line, $m)) {
                    $httpCode = (int)$m[1];
                }
            }
        }

        if ($body !== false && strlen($body) > 0) {
            return [
                'ok' => $httpCode >= 200 && $httpCode < 300,
                'status' => $httpCode,
                'body' => $body,
                'method' => 'stream',
            ];
        }

        return [
            'ok' => false,
            'status' => 500,
            'body' => '',
            'method' => 'failed',
        ];
    }
}
