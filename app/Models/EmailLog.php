<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailLog extends Model
{
    protected $table = 'email_logs';

    protected $fillable = [
        'gateway_id',
        'user_id',
        'recipient_email',
        'recipient_name',
        'subject',
        'event_key',
        'template_id',
        'related_type',
        'related_id',
        'status',
        'provider_message_id',
        'attempts',
        'error_message',
        'request_data',
        'response_data',
        'queued_at',
        'sent_at',
        'delivered_at',
        'opened_at',
        'clicked_at',
        'bounced_at',
        'failed_at',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'queued_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
        'bounced_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(EmailGateway::class, 'gateway_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }
}
