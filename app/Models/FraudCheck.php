<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudCheck extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'customer_id',
        'customer_phone',
        'customer_email',
        'customer_name',
        'shipping_address',
        'risk_score',
        'risk_level',
        'reasons',
        'positive_signals',
        'breakdown',
        'status',
        'is_duplicate',
        'related_order_ids',
        'reviewed_by',
        'reviewed_at',
        'review_action',
        'review_notes',
    ];

    protected $casts = [
        'risk_score' => 'integer',
        'reasons' => 'array',
        'positive_signals' => 'array',
        'breakdown' => 'array',
        'is_duplicate' => 'boolean',
        'related_order_ids' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function signals()
    {
        return $this->hasMany(FraudSignal::class);
    }

    public function logs()
    {
        return $this->hasMany(FraudReviewLog::class)->latest();
    }
}
