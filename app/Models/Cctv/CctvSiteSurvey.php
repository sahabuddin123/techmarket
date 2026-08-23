<?php

namespace App\Models\Cctv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class CctvSiteSurvey extends Model
{
    protected $table = 'cctv_site_surveys';

    protected $fillable = [
        'survey_number',
        'user_id',
        'estimate_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'project_name',
        'project_address',
        'district',
        'upazila_area',
        'preferred_date',
        'preferred_time',
        'floors_count',
        'project_type',
        'estimated_camera_count',
        'status',
        'assigned_technician_id',
        'scheduled_at',
        'notes',
        'site_photos',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'scheduled_at' => 'datetime',
        'site_photos' => 'array',
        'floors_count' => 'integer',
        'estimated_camera_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($survey) {
            if (empty($survey->survey_number)) {
                $survey->survey_number = 'SRV-' . date('Ymd') . '-' . strtoupper(Str::random(5));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    public function estimate(): BelongsTo
    {
        return $this->belongsTo(CctvEstimate::class, 'estimate_id');
    }

    public function report(): HasOne
    {
        return $this->hasOne(CctvSiteSurveyReport::class, 'survey_id');
    }
}
