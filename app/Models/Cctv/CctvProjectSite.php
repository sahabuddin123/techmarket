<?php

namespace App\Models\Cctv;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CctvProjectSite extends Model
{
    protected $table = 'cctv_project_sites';

    protected $fillable = [
        'project_id',
        'name',
        'site_code',
        'address',
        'district',
        'upazila',
        'contact_person',
        'contact_phone',
        'site_type',
        'status',
        'notes',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(CctvProject::class, 'project_id');
    }

    public function buildings(): HasMany
    {
        return $this->hasMany(CctvProjectBuilding::class, 'site_id');
    }

    public function estimates(): HasMany
    {
        return $this->hasMany(CctvEstimate::class, 'site_id');
    }

    public function installedEquipment(): HasMany
    {
        return $this->hasMany(CctvInstalledEquipment::class, 'site_id');
    }
}
