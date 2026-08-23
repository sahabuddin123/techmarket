<?php

namespace App\Models\Cctv;

use Illuminate\Database\Eloquent\Model;

class CctvServiceType extends Model
{
    protected $table = 'cctv_service_types';

    protected $fillable = [
        'name',
        'code',
        'description',
        'pricing_type',
        'base_rate',
        'unit_rate',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'base_rate' => 'decimal:2',
        'unit_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function calculateServiceFee(int $cameraCount = 1, float $cableMeters = 0, int $floors = 1): float
    {
        return match ($this->pricing_type) {
            'fixed' => (float) $this->base_rate,
            'per_camera' => (float) $this->base_rate + ($this->unit_rate * $cameraCount),
            'per_floor' => (float) $this->base_rate + ($this->unit_rate * $floors),
            'per_meter' => (float) $this->base_rate + ($this->unit_rate * $cableMeters),
            default => (float) $this->base_rate + ($this->unit_rate * $cameraCount),
        };
    }
}
