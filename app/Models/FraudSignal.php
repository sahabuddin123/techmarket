<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudSignal extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'fraud_check_id',
        'signal_type',
        'severity',
        'score_impact',
        'description',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'score_impact' => 'integer',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function fraudCheck()
    {
        return $this->belongsTo(FraudCheck::class);
    }
}
