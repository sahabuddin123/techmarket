<?php

namespace App\Models\Cctv;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CctvInstalledEquipment extends Model
{
    protected $table = 'cctv_installed_equipment';

    protected $fillable = [
        'user_id',
        'order_id',
        'order_item_id',
        'product_id',
        'product_name_snapshot',
        'sku_snapshot',
        'serial_number',
        'mac_address',
        'device_type',
        'camera_name',
        'location_floor',
        'location_room',
        'coverage_area',
        'ip_address',
        'channel_number',
        'installation_date',
        'status',
        'notes',
        'photos',
    ];

    protected $casts = [
        'installation_date' => 'date',
        'photos' => 'array',
        'channel_number' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warranty(): HasOne
    {
        return $this->hasOne(CctvWarranty::class, 'installed_equipment_id');
    }

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(CctvServiceRequest::class, 'installed_equipment_id');
    }
}
