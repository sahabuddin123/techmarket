<?php

namespace App\Services\Cctv;

use App\DTOs\Cctv\CctvRequirementDTO;
use App\Enums\Cctv\CctvSystemType;

class CctvPowerAndPoeCalculator
{
    /**
     * Calculate comprehensive power and PoE budget requirements.
     */
    public function calculatePowerRequirements(CctvRequirementDTO $requirements, array $cameraProfiles = []): array
    {
        $totalCameras = $requirements->totalCameras;
        $ptzCameras = $requirements->ptzCameras;
        $standardCameras = max(0, $totalCameras - $ptzCameras);

        // 1. Camera power draw calculation (Watts)
        $standardWattsPerCam = 7.0; // Standard IR/ColorVu camera: 5-8W
        $ptzWattsPerCam = 25.0; // High-power PTZ with optical zoom & heating: 20-30W

        $cameraWattage = ($standardCameras * $standardWattsPerCam) + ($ptzCameras * $ptzWattsPerCam);

        // 2. NVR / DVR device power draw (Watts)
        $recorderWattage = match (true) {
            $totalCameras <= 4 => 15.0,
            $totalCameras <= 8 => 25.0,
            $totalCameras <= 16 => 40.0,
            default => 60.0,
        };

        $totalBaseWattage = $cameraWattage + $recorderWattage;
        $safetyMarginWatts = $totalBaseWattage * 0.25; // 25% electrical headroom
        $recommendedTotalWattage = ceil($totalBaseWattage + $safetyMarginWatts);

        // 3. IP PoE Network Switch Specifics
        $isIpSystem = $requirements->systemType === CctvSystemType::IP || $requirements->systemType === CctvSystemType::HYBRID;
        $poePortsRequired = $isIpSystem ? $totalCameras : 0;
        $poeSwitchPorts = $this->resolveRecommendedSwitchPorts($poePortsRequired);
        $poeBudgetWattsRequired = $isIpSystem ? ceil($cameraWattage * 1.25) : 0;

        // 4. Analog Central Power Supply / SMPS Specifics (12V DC)
        $analogAmperesRequired = !$isIpSystem ? ceil(($cameraWattage / 12.0) * 1.25) : 0;
        $recommendedSmpsCapacity = !$isIpSystem ? "{$analogAmperesRequired}A 12V Central SMPS Power Supply Box" : null;

        // 5. UPS Backup Recommendation (VA / Wattage for ~30-60 min runtime)
        $recommendedUpsVa = match (true) {
            $recommendedTotalWattage <= 80 => '600VA / 360W Offline UPS',
            $recommendedTotalWattage <= 180 => '1200VA / 720W Offline / Line-Interactive UPS',
            default => '2000VA / 1200W Online UPS with External Battery Bank',
        };

        return [
            'camera_wattage' => round($cameraWattage, 2),
            'recorder_wattage' => round($recorderWattage, 2),
            'total_power_watts' => round($recommendedTotalWattage, 2),
            'poe_ports_required' => $poePortsRequired,
            'recommended_poe_switch_ports' => $poeSwitchPorts,
            'recommended_poe_budget_watts' => $poeBudgetWattsRequired,
            'analog_amperes_required' => $analogAmperesRequired,
            'recommended_smps_capacity' => $recommendedSmpsCapacity,
            'recommended_ups_capacity' => $recommendedUpsVa,
        ];
    }

    private function resolveRecommendedSwitchPorts(int $portsRequired): int
    {
        if ($portsRequired <= 0) return 0;
        if ($portsRequired <= 4) return 6;  // 4 PoE + 2 Uplink
        if ($portsRequired <= 8) return 10; // 8 PoE + 2 Gigabit Uplink
        if ($portsRequired <= 16) return 18;// 16 PoE + 2 SFP/Gigabit Uplink
        if ($portsRequired <= 24) return 28;// 24 PoE + 4 SFP Uplink
        return (int) (ceil($portsRequired / 24.0) * 24);
    }
}
