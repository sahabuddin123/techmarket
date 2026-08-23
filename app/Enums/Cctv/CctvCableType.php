<?php

namespace App\Enums\Cctv;

enum CctvCableType: string
{
    case CAT5E = 'cat5e';
    case CAT6 = 'cat6';
    case CAT6A = 'cat6a';
    case COAXIAL_RG59 = 'coaxial_rg59';
    case COAXIAL_SIAMESE_3C2V = 'coaxial_siamese_3c2v';
    case COAXIAL_SIAMESE_RG6 = 'coaxial_siamese_rg6';
    case OUTDOOR_SHIELDED_CAT6 = 'outdoor_shielded_cat6';
    case FIBER_OPTIC = 'fiber_optic';

    public function label(): string
    {
        return match ($this) {
            self::CAT5E => 'Cat5e UTP Ethernet Cable',
            self::CAT6 => 'Cat6 UTP Gigabit Cable',
            self::CAT6A => 'Cat6A 10G Shielded Cable',
            self::COAXIAL_RG59 => 'RG59 Coaxial Cable',
            self::COAXIAL_SIAMESE_3C2V => '3C-2V Siamese (Video + Power) Cable',
            self::COAXIAL_SIAMESE_RG6 => 'RG6 Heavy Duty Siamese Cable',
            self::OUTDOOR_SHIELDED_CAT6 => 'Outdoor Direct Burial Shielded Cat6 (UV Resistant)',
            self::FIBER_OPTIC => 'Fiber Optic Cable (Long Range)',
        };
    }
}
