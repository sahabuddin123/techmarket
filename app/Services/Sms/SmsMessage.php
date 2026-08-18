<?php

namespace App\Services\Sms;

class SmsMessage
{
    public function __construct(
        public string $recipient,
        public string $content,
        public ?string $eventKey = null,
        public ?int $orderId = null,
        public ?int $userId = null,
        public ?string $idempotencyKey = null,
        public bool $isPromotional = false,
        public array $metadata = []
    ) {
        $this->recipient = self::normalizePhone($this->recipient);
    }

    /**
     * Normalize Bangladeshi mobile numbers into international format (8801XXXXXXXXX) or local (01XXXXXXXXX).
     */
    public static function normalizePhone(string $phone, bool $withCountryCode = true): string
    {
        // Strip everything except digits
        $clean = preg_replace('/[^0-9]/', '', $phone);

        // Remove leading 88 or +88
        if (str_starts_with($clean, '8801')) {
            $clean = substr($clean, 2);
        } elseif (str_starts_with($clean, '880')) {
            $clean = substr($clean, 2);
        }

        // Must start with 01
        if (str_starts_with($clean, '1') && strlen($clean) === 10) {
            $clean = '0' . $clean;
        }

        if ($withCountryCode) {
            return str_starts_with($clean, '01') ? '88' . $clean : $clean;
        }

        return $clean;
    }

    /**
     * Validate if number is a valid BD mobile number.
     */
    public static function isValidBdPhone(string $phone): bool
    {
        $normalized = self::normalizePhone($phone, false);
        return (bool)preg_match('/^01[3-9]\d{8}$/', $normalized);
    }
}
