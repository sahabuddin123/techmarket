<?php

namespace Tests\Feature;

use App\DTOs\Cctv\CableCalculationInputDTO;
use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\EstimateBOMItemDTO;
use App\DTOs\Cctv\StorageCalculationInputDTO;
use App\Enums\Cctv\CctvEstimateItemType;
use App\Enums\Cctv\CctvProjectType;
use App\Enums\Cctv\CctvSystemType;
use App\Services\Cctv\CctvCableCalculator;
use App\Services\Cctv\CctvCompatibilityService;
use App\Services\Cctv\CctvPowerAndPoeCalculator;
use App\Services\Cctv\CctvStorageCalculator;
use App\Services\Contracts\Cctv\CctvEstimatorServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvEstimatorTest extends TestCase
{
    use RefreshDatabase;

    public function test_storage_calculator_computes_h265_plus_compression_efficiency(): void
    {
        $calculator = new CctvStorageCalculator();

        // 8 Cameras, 4MP, H.264 vs H.265+
        $inputH264 = new StorageCalculationInputDTO(
            cameraCount: 8,
            resolutionMp: 4.0,
            fps: 25,
            codec: 'H.264',
            recordingHoursPerDay: 24,
            retentionDays: 15
        );
        $resultH264 = $calculator->calculateStorage($inputH264);

        $inputH265Plus = new StorageCalculationInputDTO(
            cameraCount: 8,
            resolutionMp: 4.0,
            fps: 25,
            codec: 'H.265+',
            recordingHoursPerDay: 24,
            retentionDays: 15
        );
        $resultH265Plus = $calculator->calculateStorage($inputH265Plus);

        // H.265+ should achieve ~70% storage reduction compared to baseline H.264
        $this->assertLessThan($resultH264->netRequiredStorageTb, $resultH265Plus->netRequiredStorageTb);
        $this->assertEquals(0.30, round($resultH265Plus->bitratePerCameraKbps / $resultH264->bitratePerCameraKbps, 2));
        $this->assertGreaterThan(0, $resultH265Plus->recommendedHddCapacityTb);
    }

    public function test_cable_calculator_includes_waste_and_floor_risers(): void
    {
        $calculator = new CctvCableCalculator();

        // 8 cameras, 30m avg, 3 floors, 15% waste, 20m safety
        $input = new CableCalculationInputDTO(
            cameraCount: 8,
            systemType: CctvSystemType::IP,
            averageDistancePerCameraMeters: 30.0,
            wasteAndSagPercentage: 15.0,
            safetyMarginMeters: 20.0,
            floorsCount: 3,
            interFloorRiserMeters: 15.0
        );

        $result = $calculator->calculateCable($input);

        // Net = 8 * 30 = 240m. Risers = (3 - 1) * 15 = 30m. Subtotal = 270m.
        // Waste = 270 * 0.15 = 40.5m. Gross = 270 + 40.5 + 20 = 330.5m
        $this->assertEquals(240.0, $result->netCameraDistanceMeters);
        $this->assertEquals(30.0, $result->interFloorRiserMeters);
        $this->assertEquals(330.5, $result->grossTotalCableMeters);
        $this->assertEquals(2, $result->recommendedRollsCount); // 330.5m requires 2x 305m drum boxes
    }

    public function test_power_and_poe_calculator_computes_wattage_and_ups_capacity(): void
    {
        $calculator = new CctvPowerAndPoeCalculator();

        $requirements = new CctvRequirementDTO(
            projectName: 'Test Plant',
            projectType: CctvProjectType::WAREHOUSE_FACTORY,
            systemType: CctvSystemType::IP,
            totalCameras: 12,
            ptzCameras: 2 // 10 standard (7W) + 2 PTZ (25W)
        );

        $result = $calculator->calculatePowerRequirements($requirements);

        // Standard: 10 * 7 = 70W. PTZ: 2 * 25 = 50W. Camera total = 120W.
        $this->assertEquals(120.0, $result['camera_wattage']);
        $this->assertEquals(12, $result['poe_ports_required']);
        $this->assertEquals(18, $result['recommended_poe_switch_ports']); // 16 PoE + 2 Gigabit Uplink
        $this->assertStringContainsString('UPS', $result['recommended_ups_capacity']);
    }

    public function test_compatibility_service_flags_channel_capacity_exceeded(): void
    {
        $compatibilityService = app(\App\Services\Contracts\Cctv\CctvCompatibilityEngineInterface::class);

        $requirements = new CctvRequirementDTO(
            projectName: 'Office Build',
            projectType: CctvProjectType::COMMERCIAL_OFFICE,
            systemType: CctvSystemType::IP,
            totalCameras: 10
        );

        // Selected 10 cameras and a 4-channel NVR
        $items = [
            new EstimateBOMItemDTO(
                productId: 1,
                itemType: CctvEstimateItemType::SELECTED_CAMERA,
                productSkuSnapshot: 'CAM-4MP',
                productNameSnapshot: '4MP IP Camera',
                productType: 'camera',
                systemType: 'ip',
                unitPriceSnapshot: 3500.0,
                quantity: 10.0
            ),
            new EstimateBOMItemDTO(
                productId: 2,
                itemType: CctvEstimateItemType::RECORDING_DEVICE,
                productSkuSnapshot: 'NVR-4CH',
                productNameSnapshot: '4-Channel NVR',
                productType: 'nvr',
                systemType: 'ip',
                unitPriceSnapshot: 5500.0,
                quantity: 1.0,
                metadata: [
                    'channel_count' => 4,
                    'max_camera_resolution_mp' => 8.0,
                ]
            )
        ];

        $validation = $compatibilityService->validateSystemCompatibility($requirements, $items);

        $this->assertFalse($validation->isCompatible);
        $this->assertNotEmpty($validation->errors);
        $this->assertStringContainsString('Channel Capacity Exceeded', $validation->errors[0]);
    }

    public function test_api_stateless_preview_calculation_endpoint(): void
    {
        $payload = [
            'requirements' => [
                'project_name' => 'Villa Security System',
                'project_type' => 'residential_home',
                'system_type' => 'ip',
                'total_cameras' => 4,
                'recording_days' => 30,
                'recording_hours_per_day' => 24,
                'preferred_codec' => 'H.265+',
                'average_cable_distance_meters' => 25.0,
            ],
            'items' => [
                [
                    'product_sku_snapshot' => 'CAM-TEST',
                    'product_name_snapshot' => '2MP IP Dome Camera',
                    'unit_price' => 2500.0,
                    'quantity' => 4,
                    'item_type' => 'selected_camera',
                    'product_type' => 'camera',
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/cctv/estimates/calculate', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'project_name',
                    'subtotal_amount',
                    'grand_total',
                    'storage_metrics' => [
                        'gross_required_storage_tb_with_overhead',
                        'recommended_hdd_capacity_tb',
                    ],
                    'cable_metrics' => [
                        'gross_total_cable_meters',
                        'recommended_rolls_count',
                    ],
                    'validation' => [
                        'is_compatible',
                    ]
                ]
            ]);
    }
}
