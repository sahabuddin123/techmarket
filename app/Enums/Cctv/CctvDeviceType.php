<?php

namespace App\Enums\Cctv;

enum CctvDeviceType: string
{
    case DVR = 'dvr';
    case NVR = 'nvr';
    case XVR = 'xvr';

    public function label(): string
    {
        return match ($this) {
            self::DVR => 'Digital Video Recorder (Analog)',
            self::NVR => 'Network Video Recorder (IP)',
            self::XVR => 'Hybrid Video Recorder (Universal)',
        };
    }
}
