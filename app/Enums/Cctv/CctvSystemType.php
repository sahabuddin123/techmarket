<?php

namespace App\Enums\Cctv;

enum CctvSystemType: string
{
    case ANALOG = 'analog';
    case IP = 'ip';
    case HYBRID = 'hybrid';
    case WIFI = 'wifi';
    case ALL = 'all';

    public function label(): string
    {
        return match ($this) {
            self::ANALOG => 'Analog HD CCTV (Coaxial/BNC)',
            self::IP => 'IP Network CCTV (PoE/Ethernet)',
            self::HYBRID => 'Hybrid CCTV (XVR Analog + IP)',
            self::WIFI => 'Wireless Wi-Fi CCTV',
            self::ALL => 'Universal (All Systems)',
        };
    }
}
