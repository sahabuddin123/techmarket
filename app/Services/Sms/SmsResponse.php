<?php

namespace App\Services\Sms;

class SmsResponse
{
    public function __construct(
        public bool $success,
        public ?string $messageId = null,
        public string $status = 'sent',
        public ?int $statusCode = null,
        public mixed $rawResponse = null,
        public ?string $errorMessage = null,
        public ?float $balance = null
    ) {}

    public static function success(?string $messageId = null, mixed $rawResponse = null, ?float $balance = null): self
    {
        return new self(
            success: true,
            messageId: $messageId,
            status: 'sent',
            rawResponse: $rawResponse,
            balance: $balance
        );
    }

    public static function failure(string $errorMessage, mixed $rawResponse = null, ?int $statusCode = null): self
    {
        return new self(
            success: false,
            status: 'failed',
            statusCode: $statusCode,
            rawResponse: $rawResponse,
            errorMessage: $errorMessage
        );
    }
}
