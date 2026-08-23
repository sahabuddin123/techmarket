<?php

namespace App\Models\Cctv;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvProjectHandover extends Model
{
    protected $table = 'cctv_project_handovers';

    protected $fillable = [
        'project_id',
        'handover_date',
        'total_cameras_installed',
        'total_recorders_installed',
        'testing_checklist_summary',
        'training_completed',
        'documentation_provided',
        'customer_signoff_name',
        'customer_signature',
        'notes',
    ];

    protected $casts = [
        'handover_date' => 'date',
        'total_cameras_installed' => 'integer',
        'total_recorders_installed' => 'integer',
        'testing_checklist_summary' => 'array',
        'training_completed' => 'boolean',
        'documentation_provided' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(CctvProject::class, 'project_id');
    }
}
