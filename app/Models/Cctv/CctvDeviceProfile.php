<?php

namespace App\Models\Cctv;

use App\Models\Product;
use App\Enums\Cctv\CctvDeviceType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvDeviceProfile extends Model
{
    protected $table = 'cctv_device_profiles';

    protected $fillable = [
        'product_id',
        'device_type',
        'channel_count',
        'ip_channels_max',
        'analog_channels_max',
        'max_camera_resolution_mp',
        'max_incoming_bandwidth_mbps',
        'supported_codecs',
        'hdd_bay_count',
        'max_hdd_capacity_tb_per_bay',
        'poe_port_count',
        'poe_budget_watts',
        'network_ports_count',
        'alarm_in_count',
        'alarm_out_count',
        'audio_in_count',
        'audio_out_count',
        'raid_supported',
        'two_way_audio_support',
        'ai_by_device_features',
        'specifications',
    ];

    protected $casts = [
        'device_type' => CctvDeviceType::class,
        'channel_count' => 'integer',
        'ip_channels_max' => 'integer',
        'analog_channels_max' => 'integer',
        'max_camera_resolution_mp' => 'decimal:2',
        'max_incoming_bandwidth_mbps' => 'integer',
        'hdd_bay_count' => 'integer',
        'max_hdd_capacity_tb_per_bay' => 'decimal:2',
        'poe_port_count' => 'integer',
        'poe_budget_watts' => 'decimal:2',
        'network_ports_count' => 'integer',
        'alarm_in_count' => 'integer',
        'alarm_out_count' => 'integer',
        'audio_in_count' => 'integer',
        'audio_out_count' => 'integer',
        'two_way_audio_support' => 'boolean',
        'supported_codecs' => 'array',
        'raid_supported' => 'array',
        'ai_by_device_features' => 'array',
        'specifications' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
