<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BulkImport extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_type',
        'file_path',
        'file_name',
        'file_format',
        'mode',
        'status',
        'total_rows',
        'processed_rows',
        'created_rows',
        'updated_rows',
        'skipped_rows',
        'failed_rows',
        'column_mapping',
        'validation_results',
        'error_summary',
        'error_file_path',
        'is_dry_run',
        'user_id',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'total_rows' => 'integer',
        'processed_rows' => 'integer',
        'created_rows' => 'integer',
        'updated_rows' => 'integer',
        'skipped_rows' => 'integer',
        'failed_rows' => 'integer',
        'column_mapping' => 'array',
        'validation_results' => 'array',
        'error_summary' => 'array',
        'is_dry_run' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
