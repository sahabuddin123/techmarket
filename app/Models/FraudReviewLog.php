<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudReviewLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'fraud_check_id',
        'user_id',
        'action',
        'old_status',
        'new_status',
        'old_score',
        'new_score',
        'notes',
        'created_at',
    ];

    protected $casts = [
        'old_score' => 'integer',
        'new_score' => 'integer',
        'created_at' => 'datetime',
    ];

    public function fraudCheck()
    {
        return $this->belongsTo(FraudCheck::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
