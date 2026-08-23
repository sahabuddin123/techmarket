<?php

namespace App\Models\Cctv;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvProjectZone extends Model
{
    protected $table = 'cctv_project_zones';

    protected $fillable = [
        'floor_id',
        'name',
        'zone_code',
        'area_type',
        'notes',
    ];

    public function floor(): BelongsTo
    {
        return $this->belongsTo(CctvProjectFloor::class, 'floor_id');
    }
}
