<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPageEvent extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'landing_page_id',
        'session_id',
        'event_name',
        'event_id',
        'order_id',
        'value',
        'currency',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'fbclid',
        'gclid',
        'campaign_id',
        'adset_id',
        'ad_id',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'value' => 'float',
        'created_at' => 'datetime',
    ];

    public function landingPage(): BelongsTo
    {
        return $this->belongsTo(LandingPage::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
