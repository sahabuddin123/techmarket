<?php

namespace App\Models\Cctv;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvSiteSurveyReport extends Model
{
    protected $table = 'cctv_site_survey_reports';

    protected $fillable = [
        'survey_id',
        'actual_camera_count',
        'indoor_cameras',
        'outdoor_cameras',
        'ptz_cameras',
        'recommended_system_type',
        'cable_length_meters',
        'power_requirement_watts',
        'installation_difficulty',
        'special_materials',
        'technician_notes',
        'photos',
        'converted_estimate_id',
    ];

    protected $casts = [
        'actual_camera_count' => 'integer',
        'indoor_cameras' => 'integer',
        'outdoor_cameras' => 'integer',
        'ptz_cameras' => 'integer',
        'cable_length_meters' => 'decimal:2',
        'power_requirement_watts' => 'decimal:2',
        'photos' => 'array',
    ];

    public function survey(): BelongsTo
    {
        return $this->belongsTo(CctvSiteSurvey::class, 'survey_id');
    }

    public function convertedEstimate(): BelongsTo
    {
        return $this->belongsTo(CctvEstimate::class, 'converted_estimate_id');
    }
}
