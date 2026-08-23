<?php

namespace App\Models\Cctv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvEquipmentReplacement extends Model
{
    protected $table = 'cctv_equipment_replacements';

    protected $fillable = [
        'service_request_id',
        'old_equipment_id',
        'new_equipment_id',
        'old_serial_number',
        'new_serial_number',
        'reason',
        'replaced_by_user_id',
    ];

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(CctvServiceRequest::class, 'service_request_id');
    }

    public function oldEquipment(): BelongsTo
    {
        return $this->belongsTo(CctvInstalledEquipment::class, 'old_equipment_id');
    }

    public function newEquipment(): BelongsTo
    {
        return $this->belongsTo(CctvInstalledEquipment::class, 'new_equipment_id');
    }

    public function replacedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replaced_by_user_id');
    }
}
