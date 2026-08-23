<?php

namespace App\Models\Cctv;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CctvProjectFloor extends Model
{
    protected $table = 'cctv_project_floors';

    protected $fillable = [
        'building_id',
        'name',
        'floor_number',
        'floor_type',
        'floor_plan_image',
        'notes',
    ];

    protected $casts = [
        'floor_number' => 'integer',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(CctvProjectBuilding::class, 'building_id');
    }

    public function zones(): HasMany
    {
        return $this->hasMany(CctvProjectZone::class, 'floor_id');
    }
}
