<?php

namespace App\Models\Cctv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CctvProjectChangeRequest extends Model
{
    protected $table = 'cctv_project_change_requests';

    protected $fillable = [
        'project_id',
        'change_number',
        'title',
        'description',
        'scope_changes',
        'cost_impact',
        'status',
        'requested_by_user_id',
        'approved_by_user_id',
    ];

    protected $casts = [
        'scope_changes' => 'array',
        'cost_impact' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($cr) {
            if (empty($cr->change_number)) {
                $cr->change_number = 'CR-' . date('Ymd') . '-' . strtoupper(Str::random(4));
            }
        });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(CctvProject::class, 'project_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}
