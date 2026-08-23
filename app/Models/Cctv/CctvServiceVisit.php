<?php

namespace App\Models\Cctv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CctvServiceVisit extends Model
{
    protected $table = 'cctv_service_visits';

    protected $fillable = [
        'service_request_id',
        'technician_id',
        'visit_number',
        'start_time',
        'end_time',
        'status',
        'diagnosis_notes',
        'work_performed',
        'checklist',
        'photos',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'checklist' => 'array',
        'photos' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($visit) {
            if (empty($visit->visit_number)) {
                $visit->visit_number = 'VST-' . date('Ymd') . '-' . strtoupper(Str::random(5));
            }
        });
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(CctvServiceRequest::class, 'service_request_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(CctvServicePart::class, 'service_visit_id');
    }
}
