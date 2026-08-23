<?php

namespace App\Models\Cctv;

use App\Models\Product;
use App\Enums\Cctv\CctvCableType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvCableProfile extends Model
{
    protected $table = 'cctv_cable_profiles';

    protected $fillable = [
        'product_id',
        'cable_type',
        'core_material',
        'shielding',
        'is_outdoor_rated',
        'max_recommended_distance_meters',
        'unit_of_measure',
        'meters_per_unit',
        'gauge_awg',
    ];

    protected $casts = [
        'cable_type' => CctvCableType::class,
        'is_outdoor_rated' => 'boolean',
        'max_recommended_distance_meters' => 'integer',
        'meters_per_unit' => 'decimal:2',
        'gauge_awg' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
