<?php

namespace App\Models\Cctv;

use Illuminate\Database\Eloquent\Model;

class CctvDiagnosticQuestion extends Model
{
    protected $table = 'cctv_diagnostic_questions';

    protected $fillable = [
        'device_type',
        'issue_category',
        'question',
        'options',
        'resolution_hint',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'options' => 'array',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
