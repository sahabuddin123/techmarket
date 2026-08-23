<?php

namespace App\Services\Cctv;

use App\DTOs\Cctv\CableCalculationInputDTO;
use App\DTOs\Cctv\CableCalculationResultDTO;
use App\Enums\Cctv\CctvSystemType;
use App\Models\Setting;
use App\Services\Contracts\Cctv\CctvCableCalculatorInterface;

class CctvCableCalculator implements CctvCableCalculatorInterface
{
    public function calculateCable(CableCalculationInputDTO $input): CableCalculationResultDTO
    {
        $cameraCount = max(1, $input->cameraCount);
        $avgDistance = max(5.0, $input->averageDistancePerCameraMeters);

        // 1. Net camera run distance (horizontal + vertical direct runs)
        $netCameraDistanceMeters = $cameraCount * $avgDistance;

        // 2. Inter-floor backbone riser calculation
        $extraFloors = max(0, $input->floorsCount - 1);
        $interFloorRiserMeters = $extraFloors * max(0.0, $input->interFloorRiserMeters);

        // 3. Waste, corner bends & cable slack allowances
        $wastePercentage = $input->wasteAndSagPercentage;
        $safetyMarginMeters = $input->safetyMarginMeters;
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $wastePercentage = max(0.0, (float) Setting::get('cctv_cable_waste_percent', $input->wasteAndSagPercentage));
                $safetyMarginMeters = max(0.0, (float) Setting::get('cctv_cable_safety_margin_meters', $input->safetyMarginMeters));
            }
        } catch (\Throwable $e) {}

        $subtotalMeters = $netCameraDistanceMeters + $interFloorRiserMeters;
        $wasteMeters = $subtotalMeters * ($wastePercentage / 100.0);
        $grossTotalCableMeters = $subtotalMeters + $wasteMeters + $safetyMarginMeters;

        // 4. Packaging and standard roll conversion
        $metersPerRoll = $this->resolveStandardRollSize($input->systemType);
        $recommendedRollsCount = (int) ceil($grossTotalCableMeters / $metersPerRoll);
        $recommendedRollsCount = max(1, $recommendedRollsCount);

        $packageType = match (true) {
            $metersPerRoll >= 305.0 => '305m Easy-Pull Drum Box',
            $metersPerRoll >= 100.0 => '100m Coil Pack',
            default => 'Per Meter Custom Length',
        };

        $cableTypeName = match ($input->systemType) {
            CctvSystemType::IP => 'Cat6 UTP Solid Copper Network Cable',
            CctvSystemType::ANALOG => 'RG59 / 3C-2V Siamese Coaxial Cable (Video + Power)',
            CctvSystemType::WIFI => 'Power Extension & DC Cabling',
            default => 'Universal Structured Transmission Cable',
        };

        $description = "{$recommendedRollsCount} x {$packageType} (~" . round($grossTotalCableMeters, 1) . "m total coverage for {$cameraCount} cameras across {$input->floorsCount} floors)";

        return new CableCalculationResultDTO(
            netCameraDistanceMeters: round($netCameraDistanceMeters, 2),
            interFloorRiserMeters: round($interFloorRiserMeters, 2),
            wasteAndSlackMeters: round($wasteMeters + $safetyMarginMeters, 2),
            grossTotalCableMeters: round($grossTotalCableMeters, 2),
            recommendedRollsCount: $recommendedRollsCount,
            metersPerRoll: $metersPerRoll,
            recommendedCablePackageType: $packageType,
            recommendedCableDescription: $description,
            breakdown: [
                'camera_count' => $cameraCount,
                'avg_distance_per_camera' => $avgDistance,
                'floors_count' => $input->floorsCount,
                'waste_percentage' => $wastePercentage,
                'safety_margin_meters' => $safetyMarginMeters,
                'cable_type' => $cableTypeName,
            ]
        );
    }

    private function resolveStandardRollSize(CctvSystemType $systemType): float
    {
        return match ($systemType) {
            CctvSystemType::IP => 305.0, // Standard 1000ft / 305m Cat6 box
            CctvSystemType::ANALOG => 100.0, // Standard 100m coaxial roll
            default => 305.0,
        };
    }
}
