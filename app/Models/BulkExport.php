<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BulkExport extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_type',
        'file_path',
        'file_name',
        'file_format',
        'filter_criteria',
        'selected_columns',
        'total_rows',
        'status',
        'user_id',
        'completed_at',
    ];

    protected $casts = [
        'filter_criteria' => 'array',
        'selected_columns' => 'array',
        'total_rows' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
