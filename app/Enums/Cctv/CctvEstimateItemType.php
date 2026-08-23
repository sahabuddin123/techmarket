<?php

namespace App\Enums\Cctv;

enum CctvEstimateItemType: string
{
    case SELECTED_CAMERA = 'selected_camera';
    case RECORDING_DEVICE = 'recording_device';
    case STORAGE_HDD = 'storage_hdd';
    case CABLE_ROLL = 'cable_roll';
    case NETWORK_POE = 'network_poe';
    case POWER_SUPPLY = 'power_supply';
    case REQUIRED_ACCESSORY = 'required_accessory';
    case OPTIONAL_ACCESSORY = 'optional_accessory';
    case INSTALLATION_SERVICE = 'installation_service';
    case CUSTOM_LINE_ITEM = 'custom_line_item';

    public function label(): string
    {
        return match ($this) {
            self::SELECTED_CAMERA => 'Primary Surveillance Camera',
            self::RECORDING_DEVICE => 'Recording DVR / NVR / XVR Hub',
            self::STORAGE_HDD => 'Surveillance Storage HDD',
            self::CABLE_ROLL => 'Transmission Cable Roll / Box',
            self::NETWORK_POE => 'PoE Switch / Network Gear',
            self::POWER_SUPPLY => 'Central Power Supply Unit',
            self::REQUIRED_ACCESSORY => 'Mandatory Accessory / Connector',
            self::OPTIONAL_ACCESSORY => 'Optional Hardware Equipment',
            self::INSTALLATION_SERVICE => 'Professional Installation & Setup',
            self::CUSTOM_LINE_ITEM => 'Custom Engineer Line Item',
        };
    }
}
