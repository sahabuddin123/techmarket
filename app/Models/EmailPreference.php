<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailPreference extends Model
{
    protected $table = 'email_preferences';

    protected $fillable = [
        'user_id',
        'email',
        'transactional_enabled',
        'promotional_enabled',
        'marketing_enabled',
        'product_updates_enabled',
        'order_updates_enabled',
        'security_alerts_enabled',
        'unsubscribed_at',
    ];

    protected $casts = [
        'transactional_enabled' => 'boolean',
        'promotional_enabled' => 'boolean',
        'marketing_enabled' => 'boolean',
        'product_updates_enabled' => 'boolean',
        'order_updates_enabled' => 'boolean',
        'security_alerts_enabled' => 'boolean',
        'unsubscribed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
