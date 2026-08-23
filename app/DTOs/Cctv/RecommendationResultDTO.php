<?php

namespace App\DTOs\Cctv;

use App\Models\Product;

readonly class RecommendationResultDTO
{
    public function __construct(
        public ?Product $recommendedRecordingDevice = null,
        public int $recommendedChannelCount = 4,
        public ?Product $recommendedStorageHdd = null,
        public float $recommendedStorageTb = 2.0,
        public ?Product $recommendedPoeSwitch = null,
        public int $recommendedPoePortCount = 8,
        public ?Product $recommendedPowerSupply = null,
        public ?Product $recommendedCable = null,
        public int $recommendedCableRolls = 1,
        public array $recommendedAccessories = [], // Array of [product, quantity, reason, is_mandatory]
        public ?Product $recommendedInstallationService = null,
        public array $systemNotes = [],
    ) {}

    public function toArray(): array
    {
        return [
            'recommended_recording_device_id' => $this->recommendedRecordingDevice?->id,
            'recommended_channel_count' => $this->recommendedChannelCount,
            'recommended_storage_hdd_id' => $this->recommendedStorageHdd?->id,
            'recommended_storage_tb' => $this->recommendedStorageTb,
            'recommended_poe_switch_id' => $this->recommendedPoeSwitch?->id,
            'recommended_poe_port_count' => $this->recommendedPoePortCount,
            'recommended_power_supply_id' => $this->recommendedPowerSupply?->id,
            'recommended_cable_id' => $this->recommendedCable?->id,
            'recommended_cable_rolls' => $this->recommendedCableRolls,
            'recommended_accessories' => $this->recommendedAccessories,
            'recommended_installation_service_id' => $this->recommendedInstallationService?->id,
            'system_notes' => $this->systemNotes,
        ];
    }
}
