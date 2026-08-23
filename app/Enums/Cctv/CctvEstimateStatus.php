<?php

namespace App\Enums\Cctv;

enum CctvEstimateStatus: string
{
    case DRAFT = 'draft';
    case CALCULATED = 'calculated';
    case SAVED = 'saved';
    case QUOTED = 'quoted';
    case ORDERED = 'ordered';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft Configuration',
            self::CALCULATED => 'Calculated BOM',
            self::SAVED => 'Saved Project Estimate',
            self::QUOTED => 'Quote Issued',
            self::ORDERED => 'Converted to Order',
            self::ARCHIVED => 'Archived',
        };
    }
}
