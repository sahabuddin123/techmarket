<?php

namespace App\Services\Sms;

class SmsCalculator
{
    /**
     * Standard GSM 03.38 7-bit alphabet characters.
     */
    private const GSM_7BIT_REGEX = '/^[A-Za-z0-9\s\r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#%&\'()*+,\-.\/:;<=>?¡¿üäö]*$/u';

    /**
     * Determine if a given string requires Unicode encoding (e.g. Bangla characters).
     */
    public static function isUnicode(string $text): bool
    {
        return !preg_match(self::GSM_7BIT_REGEX, $text);
    }

    /**
     * Calculate encoding, length, parts count, and remaining characters in the current part.
     */
    public static function calculate(string $text): array
    {
        $length = mb_strlen($text, 'UTF-8');
        $isUnicode = self::isUnicode($text);

        if ($length === 0) {
            return [
                'length' => 0,
                'is_unicode' => false,
                'encoding' => 'gsm0338',
                'parts' => 0,
                'max_per_part' => 160,
                'remaining_in_part' => 160,
            ];
        }

        if ($isUnicode) {
            $encoding = 'unicode';
            $singleLimit = 70;
            $multiLimit = 67;

            if ($length <= $singleLimit) {
                $parts = 1;
                $remaining = $singleLimit - $length;
            } else {
                $parts = (int)ceil($length / $multiLimit);
                $remaining = ($parts * $multiLimit) - $length;
            }
        } else {
            $encoding = 'gsm0338';
            $singleLimit = 160;
            $multiLimit = 153;

            if ($length <= $singleLimit) {
                $parts = 1;
                $remaining = $singleLimit - $length;
            } else {
                $parts = (int)ceil($length / $multiLimit);
                $remaining = ($parts * $multiLimit) - $length;
            }
        }

        return [
            'length' => $length,
            'is_unicode' => $isUnicode,
            'encoding' => $encoding,
            'parts' => $parts,
            'max_per_part' => $parts > 1 ? ($isUnicode ? 67 : 153) : ($isUnicode ? 70 : 160),
            'remaining_in_part' => max(0, $remaining),
        ];
    }
}
