<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    protected $table = 'email_campaigns';

    protected $fillable = [
        'name',
        'subject',
        'preheader',
        'template_id',
        'audience_type',
        'audience_filters',
        'status',
        'scheduled_at',
        'started_at',
        'completed_at',
        'total_recipients',
        'total_sent',
        'total_delivered',
        'total_failed',
        'total_opened',
        'total_clicked',
        'created_by',
    ];

    protected $casts = [
        'audience_filters' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(EmailCampaignRecipient::class, 'campaign_id');
    }
}
