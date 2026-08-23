<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Cctv\CctvProductProfile;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvAdvancedBuilderTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_generates_three_configuration_presets(): void
    {
        $payload = [
            'total_cameras' => 8,
            'system_type' => 'ip',
            'recording_days' => 15,
            'average_cable_distance_meters' => 30,
            'floors_count' => 1,
        ];

        $response = $this->postJson('/api/v1/cctv/presets', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'data' => [
                    'budget' => ['name', 'badge', 'resolution', 'recommendation'],
                    'balanced' => ['name', 'badge', 'resolution', 'recommendation'],
                    'premium' => ['name', 'badge', 'resolution', 'recommendation'],
                ],
            ]);
    }

    public function test_api_evaluates_target_budget_accurately(): void
    {
        $payload = [
            'requirements' => [
                'total_cameras' => 4,
                'system_type' => 'ip',
                'recording_days' => 15,
            ],
            'items' => [
                [
                    'item_type' => 'selected_camera',
                    'unit_price' => 3000,
                    'quantity' => 4,
                ],
                [
                    'item_type' => 'recording_device',
                    'unit_price' => 6000,
                    'quantity' => 1,
                ],
            ],
            'target_budget' => 20000,
        ];

        $response = $this->postJson('/api/v1/cctv/budget-evaluate', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.target_budget', 20000)
            ->assertJsonPath('data.budget_status', 'within_budget')
            ->assertJsonPath('data.is_within_budget', true);
    }
}
