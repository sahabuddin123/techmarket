<?php

namespace App\Enums\Cctv;

enum CctvProductType: string
{
    case CAMERA = 'camera';
    case DVR = 'dvr';
    case NVR = 'nvr';
    case XVR = 'xvr';
    case STORAGE = 'storage';
    case POE_SWITCH = 'poe_switch';
    case NETWORK_SWITCH = 'network_switch';
    case ROUTER = 'router';
    case MONITOR = 'monitor';
    case UPS = 'ups';
    case POWER_SUPPLY = 'power_supply';
    case SMPS = 'smps';
    case CABLE = 'cable';
    case CONNECTOR = 'connector';
    case JUNCTION_BOX = 'junction_box';
    case BRACKET = 'bracket';
    case RACK = 'rack';
    case PATCH_PANEL = 'patch_panel';
    case BALUN = 'balun';
    case CONDUIT = 'conduit';
    case ADAPTER = 'adapter';
    case ACCESSORIES = 'accessories';
    case INSTALLATION_MATERIAL = 'installation_material';
    case SERVICE = 'service';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::CAMERA => 'Security Camera',
            self::DVR => 'Digital Video Recorder (DVR)',
            self::NVR => 'Network Video Recorder (NVR)',
            self::XVR => 'Hybrid Video Recorder (XVR)',
            self::STORAGE => 'Surveillance Hard Drive (HDD)',
            self::POE_SWITCH => 'PoE Switch',
            self::NETWORK_SWITCH => 'Network Switch',
            self::ROUTER => 'Network Router',
            self::MONITOR => 'Surveillance Display Monitor',
            self::UPS => 'Uninterruptible Power Supply (UPS)',
            self::POWER_SUPPLY => 'Central Power Supply (Adapter/SMPS)',
            self::SMPS => 'Switched-Mode Power Supply (SMPS)',
            self::CABLE => 'Surveillance Cable Roll / Box',
            self::CONNECTOR => 'BNC / RJ45 / DC Connector',
            self::JUNCTION_BOX => 'Waterproof Camera Junction Box',
            self::BRACKET => 'Wall / Pole Mount Bracket',
            self::RACK => 'Server / DVR Wall Rack',
            self::PATCH_PANEL => 'Network Patch Panel',
            self::BALUN => 'Video Balun',
            self::CONDUIT => 'PVC Pipe / Conduit Channel',
            self::ADAPTER => 'Dedicated Power Adapter',
            self::ACCESSORIES => 'CCTV Accessory',
            self::INSTALLATION_MATERIAL => 'Installation Consumables',
            self::SERVICE => 'Professional Installation Service',
            self::OTHER => 'Other Hardware',
        };
    }
}
