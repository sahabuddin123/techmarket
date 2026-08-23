<?php

namespace App\Models\Cctv;

use App\Models\Product;
use App\Enums\Cctv\CctvProductType;
use App\Enums\Cctv\CctvSystemType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CctvProductProfile extends Model
{
    protected $table = 'cctv_product_profiles';

    protected $fillable = [
        'product_id',
        'product_type',
        'system_type',
        'camera_form_factor',
        'resolution_mp',
        'resolution_label',
        'lens_mm',
        'lens_type',
        'ir_distance_meters',
        'low_light_tech',
        'audio_type',
        'ai_features',
        'ip_rating',
        'environment',
        'power_source',
        'power_consumption_watts',
        'poe_standard',
        'supported_codecs',
        'specifications',
        'is_active',
    ];

    protected $casts = [
        'product_type' => CctvProductType::class,
        'system_type' => CctvSystemType::class,
        'resolution_mp' => 'decimal:2',
        'lens_mm' => 'decimal:2',
        'power_consumption_watts' => 'decimal:2',
        'ir_distance_meters' => 'integer',
        'ai_features' => 'array',
        'supported_codecs' => 'array',
        'specifications' => 'array',
        'is_active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function deviceProfile(): HasOne
    {
        return $this->hasOne(CctvDeviceProfile::class, 'product_id', 'product_id');
    }

    public function storageProfile(): HasOne
    {
        return $this->hasOne(CctvStorageProfile::class, 'product_id', 'product_id');
    }

    public function cableProfile(): HasOne
    {
        return $this->hasOne(CctvCableProfile::class, 'product_id', 'product_id');
    }
}
