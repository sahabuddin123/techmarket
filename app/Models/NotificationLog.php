<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $table = 'notification_logs';

    protected $fillable = [
        'notification_id',
        'event_key',
        'channel',
        'recipient_type',
        'recipient_id',
        'status',
        'provider_response',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'provider_response' => 'array',
        'sent_at' => 'datetime',
    ];
}
