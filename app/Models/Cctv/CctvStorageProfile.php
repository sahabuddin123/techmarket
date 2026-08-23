<?php

namespace App\Models\Cctv;

use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvStorageProfile extends Model
{
    protected $table = 'cctv_storage_profiles';

    protected $fillable = [
        'product_id',
        'capacity_tb',
        'form_factor',
        'interface_type',
        'rpm',
        'cache_mb',
        'workload_rating_tb_yr',
        'is_surveillance_optimized',
        'max_drive_bays_supported',
        'recommended_cameras_max',
    ];

    protected $casts = [
        'capacity_tb' => 'decimal:2',
        'rpm' => 'integer',
        'cache_mb' => 'integer',
        'workload_rating_tb_yr' => 'integer',
        'is_surveillance_optimized' => 'boolean',
        'max_drive_bays_supported' => 'integer',
        'recommended_cameras_max' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
