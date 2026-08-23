<?php

namespace App\Models\Cctv;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CctvProjectBuilding extends Model
{
    protected $table = 'cctv_project_buildings';

    protected $fillable = [
        'site_id',
        'name',
        'building_code',
        'floors_count',
        'basements_count',
        'area_sqft',
        'status',
        'notes',
    ];

    protected $casts = [
        'floors_count' => 'integer',
        'basements_count' => 'integer',
        'area_sqft' => 'decimal:2',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(CctvProjectSite::class, 'site_id');
    }

    public function floors(): HasMany
    {
        return $this->hasMany(CctvProjectFloor::class, 'building_id');
    }
}
