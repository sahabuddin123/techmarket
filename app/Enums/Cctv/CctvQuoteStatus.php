<?php

namespace App\Enums\Cctv;

enum CctvQuoteStatus: string
{
    case DRAFT = 'draft';
    case ISSUED = 'issued';
    case ACCEPTED = 'accepted';
    case DECLINED = 'declined';
    case CONVERTED_TO_ORDER = 'converted_to_order';
    case EXPIRED = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft Quote',
            self::ISSUED => 'Issued to Client',
            self::ACCEPTED => 'Accepted by Client',
            self::DECLINED => 'Declined',
            self::CONVERTED_TO_ORDER => 'Converted to Confirmed Order',
            self::EXPIRED => 'Quote Expired',
        };
    }
}
