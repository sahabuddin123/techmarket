<?php

namespace App\Enums\Cctv;

enum CctvRuleType: string
{
    case COMPATIBILITY = 'compatibility';
    case RECOMMENDATION = 'recommendation';
    case STORAGE_CALCULATION = 'storage_calculation';
    case CABLE_CALCULATION = 'cable_calculation';
    case ACCESSORY_REQUIREMENT = 'accessory_requirement';
    case PRICING_ADJUSTMENT = 'pricing_adjustment';

    public function label(): string
    {
        return match ($this) {
            self::COMPATIBILITY => 'Compatibility Rule',
            self::RECOMMENDATION => 'Recommendation Engine Rule',
            self::STORAGE_CALCULATION => 'Storage Calculation Rule',
            self::CABLE_CALCULATION => 'Cable Calculation Rule',
            self::ACCESSORY_REQUIREMENT => 'Required Accessory Mapping Rule',
            self::PRICING_ADJUSTMENT => 'Pricing & Installation Margin Rule',
        };
    }
}
