<?php

namespace App\Models\Cctv;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CctvWarranty extends Model
{
    protected $table = 'cctv_warranties';

    protected $fillable = [
        'installed_equipment_id',
        'user_id',
        'order_id',
        'serial_number',
        'warranty_type',
        'warranty_start',
        'warranty_end',
        'status',
        'coverage_terms',
        'exclusions',
    ];

    protected $casts = [
        'warranty_start' => 'date',
        'warranty_end' => 'date',
    ];

    public function installedEquipment(): BelongsTo
    {
        return $this->belongsTo(CctvInstalledEquipment::class, 'installed_equipment_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(CctvWarrantyClaim::class, 'warranty_id');
    }

    public function isCovered(): bool
    {
        return $this->status === 'active' && $this->warranty_end->isFuture();
    }
}
