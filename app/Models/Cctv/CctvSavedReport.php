<?php

namespace App\Models\Cctv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvSavedReport extends Model
{
    protected $table = 'cctv_saved_reports';

    protected $fillable = [
        'name',
        'report_type',
        'description',
        'columns',
        'filters',
        'group_by',
        'sort_by',
        'sort_direction',
        'created_by_user_id',
    ];

    protected $casts = [
        'columns' => 'array',
        'filters' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
